// The check flow: plain functions only, so node:test can import them.
import {medicines,nigeriaCatalogueDetails,nigeriaSources,sources as guidanceSources,assess,type Medicine,type Scenario} from '@/lib/safety';
import type {ScanResult} from '@/lib/scan';
import evidence from '@/data/use-evidence.json';

export type CheckQuestion='reason'|'prescription'|'other-medicines';
export type Screen='home'|'find'|'catalogue'|'photo'|'confirm'|CheckQuestion|'follow-up'|'answer';
export type Route='scan'|'name'|'catalogue';
export type YesNo='yes'|'no';
export type OtherMedicine={name:string;choice:string|null};
export type CheckDetails={
 reason:string;
 prescribed:YesNo|null;
 otherMedicines:YesNo|null;
 medicines:OtherMedicine[];
 unsureAboutNames:boolean;
};

export const emptyCheckDetails:CheckDetails={
 reason:'',
 prescribed:null,
 otherMedicines:null,
 medicines:[],
 unsureAboutNames:false
};

export function addMedicineName(entries:OtherMedicine[],input:string){
 const name=input.trim();
 if(!name||entries.length>=24||entries.some(entry=>entry.name.toLowerCase()===name.toLowerCase()))return entries;
 return [...entries,{name,choice:null}];
}

const reasonPhrases={
 cold:['cold','flu','runny nose'],
 throat:['sore throat','throat pain','tonsillitis'],
 cough:['cough','coughing'],
 fever:['fever','high temperature'],
 typhoid:['typhoid'],
 diarrhoea:['diarrhoea','diarrhea','loose stools','watery stool'],
 urine:['pain when passing urine','pain when i pee','burning when i pee','painful urination'],
 skin:['wound','wounds','infected cut','skin cut','cut on my skin','cut in my skin'],
 boil:['boil','boils'],
 dental:['tooth pain','toothache','tooth ache','dental pain'],
 headache:['headache','headaches'],
 pain:['backache','back pain','body aches','joint pain','other pain']
} as const;
type ReasonId=keyof typeof reasonPhrases;

export function normaliseCheckReason(reason:string){
 return reason.replace(/\bheadace(s)?\b/gi,(word,plural)=>(
  (word[0]==='H'?'Headache':'headache')+(plural?'s':'')
 ));
}

export function suggestReasons(input:string):ReasonId[]{
 input=normaliseCheckReason(input);
 // Keep negated descriptions for the user to classify. These are text matches, never diagnoses.
 if(/\b(?:no|not|without|never)\b|n['’]t\b/i.test(input))return [];
 const words=` ${input.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()} `;
 const ids=Object.keys(reasonPhrases) as ReasonId[];
 return ids.filter(id=>reasonPhrases[id].some(phrase=>words.includes(` ${phrase} `))||
  (id==='skin'&&words.includes(' cut ')&&words.includes(' pus ')));
}

// Same fields the Catalogue searches: name, category, ingredients, product names and NAFDAC numbers.
export function findMedicines(query:string){
 const term=query.trim().toLowerCase();
 if(!term)return [];
 return medicines.filter(m=>{
  const {products}=nigeriaCatalogueDetails(m.id);
  return [m.name,m.category,...m.ingredients,...products.flatMap(p=>[p.name,p.number])].join(' ').toLowerCase().includes(term);
 });
}

export type ScanOutcome='match'|'unreadable'|'brand_only'|'not_listed'|'not_medicine'|'timeout'|'paused'|'failed';
// Server reasons that mean photo reading is switched off or out of budget, not a bad photo.
const pausedReasons=['pilot_closed','review_pending','disabled','not_configured','controls_missing','controls_unavailable','spending_limit','authentication','model_unavailable'];
export function scanOutcome(scan:ScanResult&{reason?:string},timedOut=false):ScanOutcome{
 if(timedOut||scan.reason==='timeout')return 'timeout';
 if(scan.status==='unavailable')return scan.reason&&pausedReasons.includes(scan.reason)?'paused':'failed';
 if(scan.id&&medicines.some(m=>m.id===scan.id))return 'match';
 if(scan.status==='non_medicine')return 'not_medicine';
 if(scan.status==='unsupported'||scan.status==='combination')return 'not_listed';
 const o=scan.observation;
 if(o&&o.legibility==='clear'&&!o.ingredients.length)return 'brand_only';
 return 'unreadable';
}
// Outcomes that stay on the photo screen instead of moving to "Is this what your pack says?".
export function staysOnPhoto(outcome:ScanOutcome){return outcome==='timeout'||outcome==='paused'||outcome==='failed';}

export function capitalise(name:string){return name.charAt(0).toUpperCase()+name.slice(1);}

// Every public source the app links to, without duplicates, for the "Sources" page.
export function allSources(){
 const unique=(list:{name:string;url:string}[])=>list.filter((s,i)=>list.findIndex(x=>x.url===s.url)===i);
 const medicineSources=unique(medicines.flatMap(m=>[{name:m.sourceLabel,url:m.source},...('ingredientSource' in m&&typeof m.ingredientSource==='string'?[{name:`${m.name} · manufacturer ingredient leaflet`,url:m.ingredientSource}]:[])]));
 const nigeria=Object.values(nigeriaSources).map(s=>({name:s.name,url:s.url}));
 const guidance=unique([...guidanceSources,...Object.values(evidence.sources).map(s=>({name:s.name,url:s.url}))]);
 return {medicines:unique([...nigeria,...medicineSources]),guidance};
}
