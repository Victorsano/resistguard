import 'server-only';
export class GroqError extends Error {constructor(public readonly reason:'not_configured'|'spending_limit'|'rate_limit'|'authentication'|'model_unavailable'|'timeout'|'connection'|'invalid_response'){super(reason);}}
export async function groq(model:string,messages:unknown[],json=false) {
 if(!process.env.GROQ_API_KEY || process.env.DISABLE_AI==='1') throw new GroqError('not_configured');
 let response:Response;
 try{response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
 method:'POST',headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
 body:JSON.stringify({model,messages,max_completion_tokens:1500,...(model.startsWith('qwen/')?{reasoning_effort:'none',temperature:.1}:model.startsWith('openai/gpt-oss-')?{reasoning_effort:'low'}:{}),...(json?{response_format:{type:'json_object'}}:{})}),signal:AbortSignal.timeout(18_000),cache:'no-store'});}catch(e){throw new GroqError(e instanceof Error&&e.name==='TimeoutError'?'timeout':'connection');}
 if(!response.ok){
  if(response.status===400){const error=await response.json().catch(()=>null);if(error?.error?.code==='blocked_api_access')throw new GroqError('spending_limit');}
  throw new GroqError(response.status===429?'rate_limit':[401,403].includes(response.status)?'authentication':[400,404].includes(response.status)?'model_unavailable':'connection');
 }
 const data=await response.json();const content=data.choices?.[0]?.message?.content;
 if(data.choices?.[0]?.finish_reason!=='stop')throw new GroqError('invalid_response');
 if(typeof content!=='string' || content.length>6000) throw new GroqError('invalid_response');
 return content;
}
