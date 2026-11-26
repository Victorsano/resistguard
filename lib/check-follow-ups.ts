import type {GuidanceContext} from '@/lib/check-guidance';
import type {Medicine} from '@/lib/safety';

export type FollowUpAnswer='yes'|'no'|'unsure';
export type FollowUpAnswers=Record<string,FollowUpAnswer>;
export type FollowUpQuestion={
 id:string;
 text:string;
 mandatory:boolean;
 source:{name:string;url:string};
};

const who={name:'WHO · 5 Moments for Medication Safety',url:'https://www.who.int/publications/i/item/WHO-HIS-SDS-2019.6'};
const euroclox={
 name:'NAFDAC Greenbook · Euroclox-500, section 4.3',
 url:'https://admin.greenbook.nafdac.gov.ng/uploadImage/smpc_files/2023/10/02/2023100254627596-886a-56ef-84c2-4303afc55ae6.pdf'
};
const ibuprofen={name:'NHS · Who can and cannot take ibuprofen',url:'https://www.nhs.uk/medicines/ibuprofen-for-adults/'};
const paracetamol={name:'NHS · Taking paracetamol with other medicines',url:'https://www.nhs.uk/medicines/paracetamol-for-adults/taking-paracetamol-for-adults-with-other-medicines-and-herbal-supplements/'};
const penicillins=['amoxicillin','ampicillin','cloxacillin','flucloxacillin','phenoxymethylpenicillin'];

export function availableFollowUps(medicine:Medicine,context:GuidanceContext):FollowUpQuestion[]{
 const penicillin=medicine.ingredients.some(ingredient=>penicillins.includes(ingredient));
 const ibuprofenCheck=medicine.id==='ibuprofen';
 return [
  penicillin?{
   id:'penicillin-reaction',text:'Have you ever had an allergic reaction to penicillin or a penicillin-type antibiotic?',
   mandatory:true,source:euroclox
  }:{
   id:'prior-reaction',text:'Have you ever had an allergic reaction to this medicine or one of its ingredients?',
   mandatory:true,source:who
  },
  ...(ibuprofenCheck?[
   {id:'stomach-ulcer',text:'Have you ever had a stomach ulcer?',mandatory:true,source:ibuprofen},
   {id:'asthma',text:'Do you have asthma?',mandatory:false,source:ibuprofen}
  ]:[]),
  ...(medicine.id==='paracetamol'&&(context.otherMedicines.length||context.namesIncomplete)?[
   {id:'paracetamol-overlap',text:'Does any other medicine you take also contain paracetamol?',mandatory:true,source:paracetamol}
  ]:[]),
  {id:'long-term-condition',text:'Do you have a long-term health condition a pharmacist should know about?',mandatory:false,source:who},
  ...(ibuprofenCheck?[
   {id:'pregnancy',text:'Are you pregnant or trying to get pregnant?',mandatory:false,source:ibuprofen}
  ]:[]),
  ...(!context.prescribed&&context.reason?[{
   id:'reason-assessed',text:'Has a doctor or pharmacist already checked the reason you want to take this medicine?',
   mandatory:false,source:who
  }]:[])
 ];
}

export function selectFollowUps(available:FollowUpQuestion[],ids:unknown):FollowUpQuestion[]{
 if(!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length||
  !ids.every(id=>available.some(question=>!question.mandatory&&question.id===id)))throw new Error('Invalid follow-up selection');
 return [...available.filter(question=>question.mandatory),...ids.map(id=>available.find(question=>question.id===id)!)];
}

export function parseFollowUpAnswers(input:unknown,available:FollowUpQuestion[]):FollowUpAnswers|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const entries=Object.entries(input);
 if(!entries.every(([id,value])=>available.some(question=>question.id===id)&&(value==='yes'||value==='no'||value==='unsure'))||
  available.some(question=>question.mandatory&&!Object.hasOwn(input,question.id)))return null;
 return Object.fromEntries(entries);
}
