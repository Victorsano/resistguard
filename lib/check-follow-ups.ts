import type {GuidanceContext} from '@/lib/check-guidance';
import type {Medicine} from '@/lib/safety';

export type FollowUpAnswer='yes'|'no'|'unsure';
export type FollowUpAnswers=Record<string,FollowUpAnswer>;
export type FollowUpDetails=Record<string,string>;
export const followUpDetailLimit=240;
export type FollowUpQuestion={
 id:string;
 text:string;
 mandatory:boolean;
 detailPrompt?:string;
 concernOnYes?:boolean;
 source:{name:string;url:string};
};

const who={name:'WHO · 5 Moments for Medication Safety',url:'https://www.who.int/publications/i/item/WHO-HIS-SDS-2019.6'};
const euroclox={
 name:'NAFDAC Greenbook · Euroclox-500, section 4.3',
 url:'https://admin.greenbook.nafdac.gov.ng/uploadImage/smpc_files/2023/10/02/2023100254627596-886a-56ef-84c2-4303afc55ae6.pdf'
};
const ciprovam={name:'NAFDAC Greenbook · Ciprovam product information, section 4.4',url:'https://admin.greenbook.nafdac.gov.ng/uploadImage/smpc_files/2025/01/07/2025010755c585d3-8351-5f2f-ba64-dcad70462399.pdf'};
const ibuprofen={name:'NHS · Who can and cannot take ibuprofen',url:'https://www.nhs.uk/medicines/ibuprofen-for-adults/'};
const paracetamol={name:'NHS · Taking paracetamol with other medicines',url:'https://www.nhs.uk/medicines/paracetamol-for-adults/taking-paracetamol-for-adults-with-other-medicines-and-herbal-supplements/'};
const penicillins=['amoxicillin','ampicillin','cloxacillin','flucloxacillin','phenoxymethylpenicillin'];

export function availableFollowUps(medicine:Medicine,context:GuidanceContext):FollowUpQuestion[]{
 const penicillin=medicine.ingredients.some(ingredient=>penicillins.includes(ingredient));
 const ibuprofenCheck=medicine.id==='ibuprofen';
 return [
  penicillin?{
   id:'penicillin-reaction',text:'Have you ever had an allergic reaction to penicillin or a penicillin-type antibiotic?',
   mandatory:true,detailPrompt:'What happened?',concernOnYes:true,source:euroclox
  }:{
   id:'prior-reaction',text:'Have you ever had an allergic reaction to this medicine or one of its ingredients?',
   mandatory:true,detailPrompt:'What happened?',concernOnYes:true,source:who
  },
  ...(medicine.id==='co-amoxiclav'?[{
   id:'co-amoxiclav-liver-reaction',text:'After taking co-amoxiclav, did your skin or eyes turn yellow, or were you told it caused liver problems?',
   mandatory:true,concernOnYes:true,source:{name:'NAFDAC Greenbook · Co-amoxiclav product information, section 4.3',url:'https://admin.greenbook.nafdac.gov.ng/uploadImage/smpc_files/2024/09/16/202409168dbda631-b788-59cd-b794-17c96b430497.pdf'}
  }]:[]),
  ...(medicine.id==='ciprofloxacin'?[
   {id:'cipro-child',text:'Is this medicine for someone under 18?',mandatory:true,concernOnYes:true,source:ciprovam},
   {id:'cipro-tendon',text:'Have you had a tendon problem after taking ciprofloxacin or a similar antibiotic?',mandatory:true,concernOnYes:true,source:ciprovam}
  ]:[]),
  ...(ibuprofenCheck?[
   {id:'stomach-ulcer',text:'Have you ever had a stomach ulcer?',mandatory:true,concernOnYes:true,source:ibuprofen},
   {id:'asthma',text:'Do you have asthma?',mandatory:false,concernOnYes:true,source:ibuprofen},
   {id:'kidney-or-liver',text:'Do you have a kidney or liver condition?',mandatory:false,detailPrompt:'What condition do you have?',concernOnYes:true,source:ibuprofen}
  ]:[]),
  ...(medicine.id==='paracetamol'&&(context.otherMedicines.length||context.namesIncomplete)?[
   {id:'paracetamol-overlap',text:'Does any other medicine you take also contain paracetamol?',mandatory:true,detailPrompt:'What is the name on that pack?',concernOnYes:true,source:paracetamol}
  ]:[]),
  {id:'long-term-condition',text:'Do you have a long-term health condition?',mandatory:false,detailPrompt:'What condition do you have?',source:who},
  ...(ibuprofenCheck?[
   {id:'pregnancy',text:'Are you pregnant or trying to get pregnant?',mandatory:false,concernOnYes:true,source:ibuprofen}
  ]:[]),
  ...(!context.prescribed&&context.reason?[{
   id:'reason-assessed',text:'Has a doctor or pharmacist already checked the reason you want to take this medicine?',
   mandatory:false,source:who
  }]:[])
 ];
}

export function modelFollowUps(available:FollowUpQuestion[]){
 return available.filter(question=>!question.mandatory&&question.id!=='reason-assessed');
}

export function selectFollowUps(available:FollowUpQuestion[],ids:unknown):FollowUpQuestion[]{
 const choices=modelFollowUps(available);
 if(!Array.isArray(ids)||ids.length>2||new Set(ids).size!==ids.length||
  !ids.every(id=>choices.some(question=>question.id===id)))throw new Error('Invalid follow-up selection');
 return [...available.filter(question=>question.mandatory||question.id==='reason-assessed'),
  ...ids.map(id=>choices.find(question=>question.id===id)!)];
}

export function parseFollowUpAnswers(input:unknown,available:FollowUpQuestion[]):FollowUpAnswers|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const entries=Object.entries(input);
 if(!entries.every(([id,value])=>available.some(question=>question.id===id)&&(value==='yes'||value==='no'||value==='unsure'))||
  available.some(question=>question.mandatory&&!Object.hasOwn(input,question.id)))return null;
 return Object.fromEntries(entries);
}

export function parseFollowUpDetails(input:unknown,available:FollowUpQuestion[],answers:FollowUpAnswers):FollowUpDetails|null{
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const entries=Object.entries(input);
 if(!entries.every(([id,value])=>answers[id]==='yes'&&available.some(question=>question.id===id&&question.detailPrompt)&&
  typeof value==='string'&&value.length<=followUpDetailLimit))return null;
 return Object.fromEntries(entries.map(([id,value])=>[id,(value as string).trim()]).filter(([,value])=>value));
}
