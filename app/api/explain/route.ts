import {groq} from '@/lib/groq';
import {allow,readBody,sameOrigin} from '@/lib/guard';
import {authorizeAI,gateMessage,operationalEvent} from '@/lib/availability';
import {assess} from '@/lib/safety';
import {educationFor,validateSelection} from '@/lib/education';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Origin rejected'},{status:403});
 let body;try{body=await readBody(request);}catch{return Response.json({error:'Invalid request'},{status:400});}
 const result=assess(body?.id,body?.scenario);if(!result)return Response.json({error:'Choose a catalogue medicine and listed scenario.'},{status:400});
 const education=educationFor(body?.id,body?.scenario)!;
 const fallback={mode:'source-based',text:result.rule.text,paragraphs:[result.medicine.summary,result.medicine.caution],questions:[education.questions.need,education.questions.interactions],sources:[{name:`${result.medicine.sourceLabel} · ${result.medicine.name}`,url:result.medicine.source},...result.sources]};
 const headers={'Cache-Control':'no-store'};
 if(!allow(request.headers.get('x-forwarded-for')?.split(',')[0]??'local'))return Response.json({...fallback,notice:'Request limit reached. Source-based guidance remains available.'},{headers});
 const gate=await authorizeAI(request);if(!gate.ok){operationalEvent('explain','fallback',gate.reason);return Response.json({...fallback,notice:gateMessage(gate.reason)},{headers});}
 try{
 // Model selects relevant approved passages. It cannot author clinical advice or override rules.
 const raw=await groq(process.env.GROQ_TEXT_MODEL||'openai/gpt-oss-120b',[
 {role:'system',content:'Select the most relevant approved educational passages and pharmacist questions for this topic. Never write or change advice. Return JSON with exactly {"paragraphIds":[2 to 4 unique approved paragraph IDs],"questionIds":[2 to 3 unique approved question IDs]}. No other keys. Use only IDs provided in the supplied maps.'},
 {role:'user',content:JSON.stringify({topic:result.rule.title,guidance:result.rule.text,paragraphs:education.paragraphs,questions:education.questions})}],true);
 const selection=validateSelection(raw,education.paragraphs);
 operationalEvent('explain','success','ready');
 return Response.json({...fallback,mode:'AI-selected source-based explanation',paragraphs:selection.paragraphIds.map(id=>education.paragraphs[id]),questions:selection.questionIds.map(id=>education.questions[id as keyof typeof education.questions])},{headers});
 }catch{operationalEvent('explain','fallback','provider_failure');return Response.json({...fallback,notice:'AI unavailable. Showing the source-based explanation.'},{headers});}
}
