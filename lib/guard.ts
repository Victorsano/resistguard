import { createHash } from 'node:crypto';
const buckets = new Map<string,{count:number,until:number}>();
let total={count:0,until:0};
export function allow(key:string,now=Date.now()) {
 for(const [k,v] of buckets) if(v.until<=now) buckets.delete(k);
 if(total.until<=now) total={count:0,until:now+60_000};
 const hashed=createHash('sha256').update(key).digest('hex');
 const b=buckets.get(hashed)??{count:0,until:now+60_000};
 if(b.count>=6 || total.count>=30 || buckets.size>=2000) return false;
 b.count++;total.count++;buckets.set(hashed,b);return true;
}
export async function readBody(request:Request) {
 if(!request.headers.get('content-type')?.includes('application/json')) throw new Error('Use JSON');
 const reader=request.body?.getReader(); if(!reader) throw new Error('Empty body');
 let bytes=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>2_900_000){await reader.cancel();throw new Error('Request too large');}chunks.push(value);}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export function sameOrigin(request:Request) {
 const origin=request.headers.get('origin');
 if(!origin)return true;
 const url=new URL(request.url);
 // Next may normalize a loopback URL to localhost; Host retains the browser authority.
 const host=request.headers.get('host')||url.host;
 const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()||url.protocol.slice(0,-1);
 return ['http','https'].includes(protocol)&&origin===`${protocol}://${host}`;
}
