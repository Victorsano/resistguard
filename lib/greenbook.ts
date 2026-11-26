import {normalizeIngredient} from '@/lib/safety';

export type GreenbookRecord={
 name:string;
 number:string;
 ingredients:string;
 strength:string;
 manufacturer:string;
 status:string;
 url:string;
};
export type GreenbookLookup=
 |{status:'found';record:GreenbookRecord}
 |{status:'not_found'|'unavailable'|'ambiguous'};

export function registrationNumber(input:unknown):string|null{
 if(typeof input!=='string'||input.length>40)return null;
 const value=input.trim().toUpperCase().replace(/[‐‑–—]/g,'-').replace(/\s*-\s*/g,'-');
 return /^(?=(?:.*\d){3})[A-Z0-9]{2,12}(?:-[A-Z0-9]{2,12}){0,2}$/.test(value)?value:null;
}

export function compareRegisteredIngredients(confirmed:readonly string[],registered:string){
 const parts=registered.replace(/\([^()]*\)/g,'').trim().split(/\s*[;+]\s*/).map(normalizeIngredient);
 // A comma or compound wording can conceal a longer list. Require a readable full list for comparison.
 if(!confirmed.length||!parts.length||parts.some(part=>!/^[a-z][a-z -]*$/i.test(part)||/\b(?:and|with)\b/i.test(part))||
   new Set(parts).size!==parts.length)return 'unconfirmed';
 return parts.length===confirmed.length&&parts.every(part=>confirmed.includes(part))?'match':'mismatch';
}
