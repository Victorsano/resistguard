import saved from '@/data/greenbook-records.json';
import {nigeriaProducts} from '@/lib/safety';
import {registrationNumber,type GreenbookLookup,type GreenbookRecord} from '@/lib/greenbook';

const origin='https://greenbook.nafdac.gov.ng';
const columns=['product_name','ingredient.ingredient_name','product_category.name','product_category_id','ingredient.synonym','NAFDAC','form.name','route.name','strength','applicant.name','approval_date','status'];

export function greenbookSearch(number:string){
 const url=new URL('/',origin);
 const query=new URLSearchParams({draw:'1',start:'0',length:'12','search[value]':number,'search[regex]':'false',
  'order[0][column]':'0','order[0][dir]':'asc',search_ingredient:''});
 columns.forEach((name,index)=>{
  const column='columns['+index+']';
  query.set(column+'[data]',name);
  query.set(column+'[name]',name);
  query.set(column+'[searchable]','true');
  query.set(column+'[orderable]',String(index!==2));
  query.set(column+'[search][value]','');
  query.set(column+'[search][regex]','false');
 });
 url.search=query.toString();
 return url;
}

const entities:Record<string,string>={amp:'&',nbsp:' ',quot:'"',apos:"'",lt:'<',gt:'>'};
function plain(value:unknown){
 if(typeof value!=='string')return '';
 return value.replace(/<[^>]*>/g,' ').replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi,(_entity,key:string)=>{
  if(!key.startsWith('#'))return entities[key.toLowerCase()]??' ';
  const code=key[1]?.toLowerCase()==='x'?Number.parseInt(key.slice(2),16):Number(key.slice(1));
  return code>0&&code<=0x10ffff?String.fromCodePoint(code):' ';
 }).replace(/\s+/g,' ').replace(/[*#]/g,'').trim().slice(0,300);
}

export function parseGreenbookDetails(html:string,expected:string,url:string):GreenbookRecord|null{
 const heading=html.match(/<div class="card-body"[^>]*>\s*<h1>([^<]+)<\/h1>\s*<span>(.*?)<\/span>\s*<br\s*\/?>\s*<span>(.*?)<\/span>/is);
 const field=(label:string)=>plain(html.match(new RegExp('<h1[^>]*>\\s*'+label+'\\s*</h1>\\s*<p[^>]*>(.*?)</p>','is'))?.[1]);
 const number=registrationNumber(field('NRN'));
 const status=field('Status');
 const name=plain(heading?.[1]);
 if(number!==expected||!name||!status)return null;
 return {number,name,status,url,ingredients:plain(heading?.[2]),strength:plain(heading?.[3]),manufacturer:field('Manufacturer Name')};
}

async function requestGreenbook(url:string,accept:string,signal:AbortSignal,ajax=false){
 const headers:Record<string,string>={Accept:accept,'Cache-Control':'no-cache'};
 if(ajax)headers['X-Requested-With']='XMLHttpRequest';
 let target=new URL(url,origin);
 for(let redirects=0;redirects<=2;redirects++){
  if(target.origin!==origin||target.username||target.password)throw new Error('registry_redirect');
  const response=await fetch(target.href,{headers,redirect:'manual',signal});
  if(![301,302,303,307,308].includes(response.status))return response;
  const location=response.headers.get('location');
  if(!location)throw new Error('registry_redirect');
  await response.body?.cancel();
  target=new URL(location,target);
 }
 throw new Error('registry_redirect');
}

function registryFailure(error:unknown){
 if(!(error instanceof Error))return 'unknown_error';
 const message=error.message;
 if(error.name==='TimeoutError'||error.name==='AbortError')return 'timeout';
 if(message==='registry_redirect')return message;
 if(/certificate|ssl|tls/i.test(message))return 'tls';
 if(/dns|resolv/i.test(message))return 'dns';
 if(/egress|allowlist|disallow|restricted|prohibited|not allowed|blocked/i.test(message))return 'egress';
 if(/unsupported|not implemented|unrecognized|invalid option/i.test(message))return 'request_options';
 return error.name;
}

async function details(url:string,number:string,signal:AbortSignal){
 try{
  const response=await requestGreenbook(url,'text/html',signal);
  if(!response.ok){
   console.warn('Greenbook record request returned HTTP '+response.status);
   return null;
  }
  return parseGreenbookDetails(await response.text(),number,url);
 }catch(error){
  console.warn('Greenbook record request failed:',registryFailure(error));
  return null;
 }
}

async function liveGreenbookLookup(number:string):Promise<GreenbookLookup>{
 const signal=AbortSignal.timeout(9_000);
 const known=nigeriaProducts.find(product=>product.number===number);
 if(known){
  const record=await details(known.url,number,signal);
  if(record)return {status:'found',record};
 }
 try{
  const response=await requestGreenbook(greenbookSearch(number).href,'application/json',signal,true);
  if(!response.ok){
   console.warn('Greenbook search returned HTTP '+response.status);
   return {status:'unavailable'};
  }
  const payload=await response.json();
  if(!Array.isArray(payload?.data)||!Number.isInteger(payload.recordsFiltered)||payload.error)return {status:'unavailable'};
  const matches=payload.data.filter((row:Record<string,unknown>)=>row&&registrationNumber(row.NAFDAC)===number);
  if(matches.length===0)return {status:known?'unavailable':'not_found'};
  if(matches.length!==1||payload.recordsFiltered>payload.data.length)return {status:'ambiguous'};
  const row=matches[0];
  const id=String(row.product_id);
  const name=plain(row.product_name);
  const status=plain(row.status);
  if(!/^\d{1,12}$/.test(id)||!name||!status)return {status:'unavailable'};
  const url=origin+'/products/details/'+id;
  const record=await details(url,number,signal);
  return {status:'found',record:record??{
   name,number,status,url,ingredients:plain(row.ingredient?.ingredient_name),strength:plain(row.strength),manufacturer:''
  }};
 }catch(error){
  console.warn('Greenbook search failed:',registryFailure(error));
  return {status:'unavailable'};
 }
}

export async function lookUpGreenbook(number:string):Promise<GreenbookLookup>{
 const live=await liveGreenbookLookup(number);
 if(live.status==='found'||live.status==='ambiguous')return live;
 const record=saved.products.find(item=>item.number===number);
 return record?{status:'found',record,checked:saved.checked}:live;
}
