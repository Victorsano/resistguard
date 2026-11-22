import {groq,GroqError} from '@/lib/groq';
import {allow,readBody,sameOrigin} from '@/lib/guard';
import {authorizeAI,gateMessage,operationalEvent} from '@/lib/availability';
import {parseObservation,classifyObservation,scanPrompt,unavailableScan} from '@/lib/scan';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request) {
 const fallback=(message:string,status=200)=>Response.json(unavailableScan(message),{status,headers:{'Cache-Control':'no-store',...(status===429?{'Retry-After':'60'}:{})}});
 if(!sameOrigin(request))return fallback('Request origin rejected.',403);
 if(!allow(request.headers.get('x-forwarded-for')?.split(',')[0]??'local'))return fallback('Request limit reached. Use the manual catalogue.',429);
 let body;try{body=await readBody(request);}catch{return fallback('Use a JPEG or PNG under 2 MB.',400);}
 const image=body?.image;
 if(typeof image!=='string'||!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(image)||image.length>2_800_000)return fallback('Use a JPEG or PNG under 2 MB.',400);
 const bytes=Buffer.from(image.split(',')[1],'base64');
 const valid=image.startsWith('data:image/png')?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(!valid)return fallback('The file does not match its image type.',400);
 const gate=await authorizeAI(request);
 if(!gate.ok){operationalEvent('scan','fallback',gate.reason);return Response.json({...unavailableScan(gateMessage(gate.reason)),reason:gate.reason},{status:gate.reason==='request_limit'?429:200,headers:{'Cache-Control':'no-store',...(gate.reason==='request_limit'?{'Retry-After':'60'}:{})}});}
 try{
 const raw=await groq(process.env.GROQ_VISION_MODEL||'qwen/qwen3.8-27b',[
 {role:'system',content:scanPrompt},
 {role:'user',content:[{type:'text',text:'Observe the product and transcribe its complete active-ingredient label. Report uncertainty honestly.'},{type:'image_url',image_url:{url:image}}]}],true);
 const result=classifyObservation(parseObservation(raw));operationalEvent('scan','success','ready');
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(e){
 const reason=e instanceof GroqError?e.reason:'invalid_response';
 operationalEvent('scan','fallback',reason==='spending_limit'?'provider_spending_limit':reason==='rate_limit'?'provider_rate_limit':reason==='timeout'?'provider_timeout':reason==='invalid_response'?'invalid_response':'provider_connection');
 const messages:Record<string,string>={spending_limit:'The provider spending limit has stopped AI access. Use the source-linked catalogue.',not_configured:'AI is not enabled on this server. Use the manual catalogue.',rate_limit:'The AI provider request limit was reached. Try again later or use the manual catalogue.',authentication:'The AI provider could not authenticate this server. Use the manual catalogue while the connection is checked.',model_unavailable:'The configured vision model is unavailable. Use the manual catalogue.',timeout:'The AI provider took too long to respond. Try again or use the manual catalogue.',connection:'The AI provider could not be reached. Try again or use the manual catalogue.',invalid_response:'The AI response was incomplete or could not be validated. No medicine has been selected. Try another photo or use the manual catalogue.'};
 return Response.json({...unavailableScan(messages[reason]),reason},{headers:{'Cache-Control':'no-store'}});
 }
}
