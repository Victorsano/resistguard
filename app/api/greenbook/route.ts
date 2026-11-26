import {allow,readBody,sameOrigin} from '@/lib/guard';
import {registrationNumber} from '@/lib/greenbook';
import {lookUpGreenbook} from '@/lib/greenbook-source';

export const runtime='nodejs';
export const maxDuration=15;

const headers={'Cache-Control':'no-store'};

export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({status:'unavailable'},{status:403,headers});
 const caller=request.headers.get('x-forwarded-for')?.split(',')[0]??'local';
 if(!allow('greenbook:'+caller))return Response.json({status:'unavailable'},{status:429,headers});
 const body=await readBody(request).catch(()=>null);
 const number=registrationNumber(body?.number);
 if(!number)return Response.json({status:'invalid'},{status:400,headers});
 return Response.json(await lookUpGreenbook(number),{headers});
}
