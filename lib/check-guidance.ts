import {matchIngredient,matchIngredients,medicines,nigeriaProducts,scenarios,sources,type Medicine} from '@/lib/safety';
import {suggestReasons,type OtherMedicine} from '@/lib/flow';
import {getPassage,type PassageId} from '@/lib/use-check';
import interactions from '@/data/check-interactions.json';
import type {FollowUpQuestion} from '@/lib/check-follow-ups';

export type GuidanceContext = {
  medicineId: string;
  reason: string;
  prescribed: boolean;
  otherMedicines: OtherMedicine[];
  namesIncomplete: boolean;
};

type Evidence = {id: string; title: string; text: string; source: {name: string; url: string}};
export type MatchSuggestions = {index: number; ids: string[]}[];
export type CheckGuidance = {
  passages: Evidence[];
  interactions: Evidence[];
  needsInteractionReview: boolean;
  corrections: {index: number; id: string}[];
  suggestions: MatchSuggestions;
  source: 'groq' | 'sources';
  fallback?: 'rate_limit' | 'unavailable';
  questions?: FollowUpQuestion[];
  synthesis?: {takeaway:string; questionForPharmacist:string};
};

const knownMedicines = [
  ...medicines.map(({id,name,ingredients}) => ({id,name,ingredients})),
  ...interactions.companions
];
const genericById = new Map(knownMedicines.map(medicine => [medicine.id,medicine]));
export const guidanceMedicine = (id: string | null) => id ? genericById.get(id) : undefined;

function key(name: string) {return name.trim().toLowerCase().replace(/\s+/g,' ');}

export function matchTypedMedicine(input: string): string | null {
  const name=key(input);
  const record=knownMedicines.find(medicine=>key(medicine.name)===name);
  if(record)return record.id;
  const ingredients=name.split(/\s*\+\s*|\s+and\s+/);
  if(ingredients.length>1)return matchIngredients(ingredients)?.id??null;
  const ingredient=matchIngredient(name);
  if(ingredient)return ingredient.id;
  const products=nigeriaProducts.filter(product=>[key(product.name),key(product.number),key(product.name.split(' ')[0])].includes(name));
  const productIds=[...new Set(products.map(product=>product.medicineId))];
  return productIds.length===1?productIds[0]:null;
}

function editDistance(left: string, right: string) {
  let previous=Array.from({length:right.length+1},(_,index)=>index);
  for(let i=1;i<=left.length;i++){
    const current=[i];
    for(let j=1;j<=right.length;j++){
      current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+Number(left[i-1]!==right[j-1]));
    }
    previous=current;
  }
  return previous[right.length];
}

export function spellingCandidates(input: string) {
  const name=key(input);
  if(!/^[a-z]{5,40}$/.test(name))return [];
  const candidates=new Map<string,number>();
  const labels=[
    ...knownMedicines.filter(medicine=>medicine.ingredients.length===1).map(({id,name})=>({id,name})),
    ...nigeriaProducts.map(product=>({id:product.medicineId,name:product.name.split(' ')[0]}))
  ];
  for(const label of labels){
    const distance=editDistance(name,key(label.name));
    if(distance>0&&distance<=(name.length>=8?2:1))candidates.set(label.id,Math.min(candidates.get(label.id)??Infinity,distance));
  }
  return [...candidates].sort((a,b)=>a[1]-b[1]).slice(0,5).map(([id,distance])=>({id,distance}));
}

export function parseGuidanceContext(body: unknown): GuidanceContext | null {
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const {medicineId,reason,prescribed,otherMedicines,namesIncomplete}=body as Record<string,unknown>;
  if(typeof medicineId!=='string'||!medicines.some(medicine=>medicine.id===medicineId)||
    typeof reason!=='string'||reason.length>500||typeof prescribed!=='boolean'||typeof namesIncomplete!=='boolean'||
    !Array.isArray(otherMedicines)||otherMedicines.length>24)return null;
  const entries:OtherMedicine[]=[];
  for(const entry of otherMedicines){
    if(!entry||typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>100||
      (entry.choice!==null&&(typeof entry.choice!=='string'||!guidanceMedicine(entry.choice))))return null;
    entries.push({name:entry.name.trim(),choice:entry.choice??matchTypedMedicine(entry.name)});
  }
  return {medicineId,reason:reason.trim(),prescribed,otherMedicines:entries,namesIncomplete};
}

function passage(id: PassageId): Evidence {
  const item=getPassage(id);
  return {id,title:item.title,text:item.text,source:item.reference};
}

const reasonEvidence: Partial<Record<ReturnType<typeof suggestReasons>[number],PassageId>>={
  throat:'tonsillitis_assessment', typhoid:'typhoid_assessment', urine:'uti_assessment', skin:'wound_assessment'
};
const whoSafety={name:'WHO · 5 Moments for Medication Safety',url:'https://www.who.int/publications/i/item/WHO-HIS-SDS-2019.6'};

export function evidenceForCheck(medicine: Medicine, context: GuidanceContext) {
  const productSource={name:medicine.sourceLabel,url:medicine.source};
  const relevant=suggestReasons(context.reason).flatMap((reason):Evidence[]=>{
    if(reason==='cold'&&medicine.antibiotic)return [{id:'cold-use',title:scenarios.cold.title,text:scenarios.cold.text,source:sources[0]}];
    const id=reasonEvidence[reason];
    return id&&medicine.antibiotic?[passage(id)]:[];
  });
  const selection=[
    ...relevant,
    {id:'label-caution',title:'What to check on the label',text:medicine.caution,source:productSource},
    ...(context.otherMedicines.length||context.namesIncomplete?[{
      id:'other-medicines',title:'Ask about your other medicines',
      text:'Show your medicine list to a pharmacist. Ask what could change if you add this medicine.',source:whoSafety
    }]:[]),
    ...(medicine.antibiotic?[passage(context.prescribed?'prescription':'need'),passage('amr'),passage('nigeria_amr')]:[])
  ];
  if(!medicine.antibiotic&&context.reason)selection.push({
    id:'reason-to-discuss',title:'Discuss why you want to take it',
    text:'Tell a pharmacist why you want to take this medicine. Ask what it is meant to help with.',source:whoSafety
  });
  if(!medicine.antibiotic&&context.prescribed)selection.push({
    id:'prescription-to-discuss',title:'Check the prescription instructions',
    text:'Ask your prescriber or pharmacist to explain any instructions you are unsure about.',source:whoSafety
  });
  return {candidates:selection,fallback:selection.slice(0,3),reasonPassages:relevant.filter(item=>item.id!=='cold-use')};
}

export function interactionEvidence(medicine: Medicine, entries: readonly OtherMedicine[], namesIncomplete: boolean) {
  const pairs=new Set<string>();
  const findings:Evidence[]=[];
  let uncovered=namesIncomplete;
  for(const entry of entries){
    const companion=guidanceMedicine(entry.choice);
    const documents=companion?interactions.pairs.filter(({ingredients:[first,second]})=>
      (first.every(name=>medicine.ingredients.includes(name))&&second.every(name=>companion.ingredients.includes(name)))||
      (second.every(name=>medicine.ingredients.includes(name))&&first.every(name=>companion.ingredients.includes(name)))
    ):[];
    if(!documents.length)uncovered=true;
    for(const item of documents){
      if(pairs.has(item.id))continue;
      pairs.add(item.id);
      findings.push({id:item.id,title:item.title,text:item.text,source:item.source});
    }
  }
  return {interactions:findings,needsInteractionReview:uncovered};
}

export function localGuidance(medicine: Medicine, context: GuidanceContext): CheckGuidance {
  return {passages:evidenceForCheck(medicine,context).fallback,...interactionEvidence(medicine,context.otherMedicines,context.namesIncomplete),
    corrections:[],suggestions:[],source:'sources'};
}

export function validateGuidanceSelection(raw: string, passageIds: readonly string[], options: MatchSuggestions) {
  const response=JSON.parse(raw);
  if(!response||Array.isArray(response)||Object.keys(response).sort().join(',')!=='matches,passageIds'||
    !Array.isArray(response.passageIds)||response.passageIds.length<1||response.passageIds.length>3||
    new Set(response.passageIds).size!==response.passageIds.length||
    !response.passageIds.every((id:unknown)=>typeof id==='string'&&passageIds.includes(id))||
    !Array.isArray(response.matches))throw new Error('Invalid guidance selection');
  return {passageIds:response.passageIds as string[],matches:validateMedicineMatches(response.matches,options)};
}

export function validateMedicineMatches(input:unknown,options:MatchSuggestions) {
  if(!Array.isArray(input)||input.length>options.length)throw new Error('Invalid medicine matches');
  const matches=new Map<number,string>();
  for(const match of input){
    if(!match||Object.keys(match).sort().join(',')!=='id,index'||!Number.isInteger(match.index)||
      matches.has(match.index)||!options.find(option=>option.index===match.index)?.ids.includes(match.id))throw new Error('Invalid medicine match');
    matches.set(match.index,match.id);
  }
  return matches;
}

export function validateCheckSynthesis(takeaway:unknown,questionForPharmacist:unknown):NonNullable<CheckGuidance['synthesis']>{
  const prohibited=/\b(?:\d+\s*(?:mg|ml|grams?|tablets?|capsules?|times?)|dosage|safe to (?:take|use)|(?:you|we) (?:can|should|must) (?:take|start|stop|switch|double|skip))\b|(?:^|[.!?] )\s*(?:take|start|stop|switch|double|skip)\b|https?:|[<>\r\n]/i;
  if(typeof takeaway!=='string'||typeof questionForPharmacist!=='string')throw new Error('Invalid synthesis');
  const summary=takeaway.trim();
  const question=questionForPharmacist.trim();
  if(summary.length<20||summary.length>360||question.length<12||question.length>180||
    !question.endsWith('?')||prohibited.test(summary)||prohibited.test(question))throw new Error('Invalid synthesis');
  return {takeaway:summary,questionForPharmacist:question};
}
