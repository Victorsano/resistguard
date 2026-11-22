import {createHmac} from 'node:crypto';
import manifest from '@/data/content-manifest.json';
export type GateReason='ready'|'pilot_closed'|'review_pending'|'disabled'|'not_configured'|'controls_missing'|'controls_unavailable'|'request_limit';
export type Gate={ok:boolean;reason:GateReason};
export const quotaScript=`
for i=1,#KEYS do
 local n=tonumber(redis.call('GET',KEYS[i]) or '0')
 if n>=tonumber(ARGV[(i-1)*2+1]) then return 0 end
end
for i=1,#KEYS do
 local n=redis.call('INCR',KEYS[i])
 if n==1 then redis.call('EXPIRE',KEYS[i],tonumber(ARGV[(i-1)*2+2])) end
end
return 1`;
export type RedisCommand=(command:(string|number)[])=>Promise<unknown>;
export function limits(){
 const number=(name:string,fallback:number,max:number)=>{const n=Number(process.env[name]);return Number.isInteger(n)&&n>0?Math.min(n,max):fallback;};
 return [number('AI_CLIENT_MINUTE_LIMIT',6,20),number('AI_GLOBAL_MINUTE_LIMIT',30,100),number('AI_DAILY_REQUEST_LIMIT',100,10000),number('AI_MONTHLY_REQUEST_LIMIT',1000,100000)];
}
export function readiness(now=Date.now()):Gate{
 if(process.env.DISABLE_AI==='1')return {ok:false,reason:'disabled'};
 if(!process.env.GROQ_API_KEY)return {ok:false,reason:'not_configured'};
 // Optional supervised-pilot policy. Public educational AI is enabled by default.
 // Review status remains pending; availability must not imply clinical approval.
 if(process.env.VERCEL_ENV==='production'&&process.env.ENFORCE_PILOT_GATES==='1'){
  const opening=Date.parse(process.env.PILOT_NOT_BEFORE||'2026-11-22T00:00:00Z');
  if(process.env.PILOT_AI_ENABLED!=='1'||!Number.isFinite(opening)||now<opening)return {ok:false,reason:'pilot_closed'};
  if(process.env.REVIEWED_CONTENT_SHA256!==manifest.contentSha256)return {ok:false,reason:'review_pending'};
 }
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(process.env.REQUIRE_DURABLE_LIMITS==='1'&&(!url||!token||(process.env.RATE_LIMIT_SECRET?.length||0)<32))return {ok:false,reason:'controls_missing'};
 return {ok:true,reason:'ready'};
}
export async function redisCommand(command:(string|number)[]):Promise<unknown>{
 const url=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL;
 const token=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
 if(!url||!token||!url.startsWith('https://'))throw new Error('Redis unavailable');
 const r=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store',signal:AbortSignal.timeout(2500)});
 if(!r.ok)throw new Error('Redis unavailable');const v=await r.json();if(v.error)throw new Error('Redis command failed');return v.result;
}
export async function reserveQuota(command:RedisCommand,ip:string,secret:string,now=Date.now()):Promise<boolean>{
 const day=new Date(now).toISOString().slice(0,10),month=day.slice(0,7),minute=Math.floor(now/60000);
 const client=createHmac('sha256',secret).update(day+':'+ip).digest('hex');
 const keys=[`rg:v1:client:${minute}:${client}`,`rg:v1:minute:${minute}`,`rg:v1:day:${day}`,`rg:v1:month:${month}`];
 const caps=limits();const ttl=[120,120,172800,3024000];
 const args=caps.flatMap((cap,i)=>[cap,ttl[i]]);
 return await command(['EVAL',quotaScript,4,...keys,...args])===1;
}
const localBudget={day:'',month:'',daily:0,monthly:0};
export function reserveLocalBudget(now=Date.now()){
 const day=new Date(now).toISOString().slice(0,10),month=day.slice(0,7);
 if(localBudget.day!==day){localBudget.day=day;localBudget.daily=0;}
 if(localBudget.month!==month){localBudget.month=month;localBudget.monthly=0;}
 const caps=limits();if(localBudget.daily>=caps[2]||localBudget.monthly>=caps[3])return false;
 localBudget.daily++;localBudget.monthly++;return true;
}
export async function authorizeAI(request:Request):Promise<Gate>{
 const gate=readiness();if(!gate.ok)return gate;
 const ip=(request.headers.get('x-forwarded-for')?.split(',')[0]||'local').trim().slice(0,80);
 const configured=Boolean(process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL);
 if(!configured)return reserveLocalBudget()?gate:{ok:false,reason:'request_limit'};
 try{if((process.env.RATE_LIMIT_SECRET?.length||0)<32)return {ok:false,reason:'controls_missing'};return await reserveQuota(redisCommand,ip,process.env.RATE_LIMIT_SECRET!)?gate:{ok:false,reason:'request_limit'};}
 catch{return {ok:false,reason:'controls_unavailable'};}
}
export function gateMessage(reason:GateReason){
 const messages:Record<GateReason,string>={ready:'AI scanning is available.',pilot_closed:'AI scanning is paused before the supervised pilot. The catalogue and learning tools remain available.',review_pending:'AI scanning is paused pending pharmacist review of this content version.',disabled:'AI scanning is paused. Use the source-linked catalogue.',not_configured:'AI is not configured. Use the source-linked catalogue.',controls_missing:'AI scanning is paused while shared usage controls are connected. Use the catalogue.',controls_unavailable:'AI scanning is paused because usage controls could not be reached. Use the catalogue.',request_limit:'The shared AI request budget has been reached. Try later or use the catalogue.'};return messages[reason];
}
// Fixed operational codes only. Never pass errors, IPs, labels, images or medicine IDs here.
export function operationalEvent(route:'scan'|'explain',outcome:'success'|'fallback',code:GateReason|'provider_failure'|'provider_spending_limit'|'invalid_response'|'provider_rate_limit'|'provider_timeout'|'provider_connection'){
 console.info(JSON.stringify({service:'resistguard',route,outcome,code}));
}
