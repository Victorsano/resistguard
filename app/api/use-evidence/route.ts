import {groq} from '@/lib/groq';
import {allow,readBody,sameOrigin} from '@/lib/guard';
import {authorizeAI,operationalEvent} from '@/lib/availability';
import {parseEvidenceRequest,retrieveUseEvidence,validateEvidenceOrder,useTopics} from '@/lib/use-check';

export const runtime='nodejs';
export const maxDuration=30;

export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store'};
  if(!sameOrigin(request)) return Response.json({error:'Origin rejected'},{status:403,headers});
  let body:unknown;
  try {body=await readBody(request);} catch {return Response.json({error:'Invalid request'},{status:400,headers});}
  const topic=parseEvidenceRequest(body);
  if(!topic) return Response.json({error:'Choose a listed education topic.'},{status:400,headers});
  const passages=retrieveUseEvidence(topic);
  const ids=passages.map(p=>p.id);
  const fallback=(notice:string)=>Response.json({mode:'source-based',passageIds:ids,notice},{headers});
  if(ids.length===1) return fallback('The source passage is available directly.');
  if(!allow(request.headers.get('x-forwarded-for')?.split(',')[0]??'local')) return fallback('Request limit reached.');
  const gate=await authorizeAI(request);
  if(!gate.ok) return fallback('AI is temporarily unavailable. All source passages remain available.');
  try {
    const raw=await groq(process.env.GROQ_TEXT_MODEL||'openai/gpt-oss-120b',[
      {role:'system',content:'Order the supplied public education passage IDs by relevance to the fictional learning topic. Return JSON with exactly {"passageIds":[all supplied unique IDs]}. Include every ID. Never write medical advice or new text.'},
      {role:'user',content:JSON.stringify({topic:useTopics[topic].example,passages:passages.map(({id,title,text})=>({id,title,text}))})}
    ],true);
    const passageIds=validateEvidenceOrder(raw,ids);
    operationalEvent('explain','success','ready');
    return Response.json({mode:'AI-organised source-based education',passageIds},{headers});
  } catch {
    operationalEvent('explain','fallback','provider_failure');
    return fallback('AI unavailable. All source passages remain visible.');
  }
}
