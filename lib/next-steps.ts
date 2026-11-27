import type {checkResult} from './check-result';
import type {YesNo} from './flow';

// Next steps after a confirmed match: hand the user to NAFDAC checks and to a pharmacist.
// Plain functions only. Uses the confirmed record, never the scan, photo or product name.
type ConfirmedMedicine={ingredients:readonly string[];antibiotic:boolean};
export const greenbookUrl='https://greenbook.nafdac.gov.ng/';
export const genuineCheck={
 title:'Check the pack is genuine',
 steps:[
  {text:'Does your pack have a silver scratch panel? Scratch it and text the PIN to the number printed beside it. The text is free. The reply tells you if the pack is genuine.'},
  {text:'Find the NAFDAC (Nigeria\'s drug regulator) number on the box. Look it up in the ',link:{label:'NAFDAC Greenbook',url:greenbookUrl},after:'.'},
  {text:'If the reply says fake, or the box has no NAFDAC number, do not take it. Show it to a pharmacist and report it to NAFDAC.'}
 ],
 disclaimer:'ResistGuard cannot tell if a medicine is genuine. These checks come from NAFDAC.'
} as const;
export const pharmacistSection={
 title:'Send your questions to a pharmacist',
 text:'WhatsApp opens with three questions already typed. You choose who to send it to. No photo or name is included.',
 button:'Ask a pharmacist on WhatsApp'
} as const;
export function joinIngredients(names:readonly string[]){
 if(names.length<2)return names.join('');
 return `${names.slice(0,-1).join(', ')} and ${names[names.length-1]}`;
}
export function whatsAppMessage(medicine:ConfirmedMedicine){
 return [
  `Hello, I have a medicine that contains ${joinIngredients(medicine.ingredients)}. ResistGuard says it is ${medicine.antibiotic?'an antibiotic':'not an antibiotic'}.`,
  '',
  '1. Do I need this medicine for my illness?',
  '2. Is it safe with my other medicines, allergies or conditions?',
  '3. How should I take it, and for how long?'
 ].join('\n');
}
// Digits only, country code first, no leading zero. Anything else means "let the user pick a contact".
export function pharmacistNumber(raw:string|undefined){
 const digits=(raw??'').replace(/[\s+\-()]/g,'');
 return /^[1-9]\d{7,14}$/.test(digits)?digits:null;
}
export function whatsAppLink(medicine:ConfirmedMedicine,phone?:string){
 const number=pharmacistNumber(phone);
 return `https://wa.me/${number??''}?text=${encodeURIComponent(whatsAppMessage(medicine))}`;
}
// Not in our list: name only the ingredients the AI read. Never the product name, the photo or typed text.
export function unlistedWhatsAppMessage(ingredients:readonly string[]){
 return [
  `Hello, I have a medicine. The label lists ${joinIngredients(ingredients.map(i=>i.toLowerCase()))}. ResistGuard doesn't have this medicine in its list, so it could not tell me if it is an antibiotic.`,
  '',
  '1. Do I need this medicine for my illness?',
  '2. Is it safe with my other medicines, allergies or conditions?',
  '3. How should I take it, and for how long?'
 ].join('\n');
}
export function unlistedWhatsAppLink(ingredients:readonly string[],phone?:string){
 const number=pharmacistNumber(phone);
 return `https://wa.me/${number??''}?text=${encodeURIComponent(unlistedWhatsAppMessage(ingredients))}`;
}

export type CheckClinician=ReturnType<typeof checkResult>['clinician'];

const clinicianQuestions:Record<CheckClinician,string>={
 prescriber:'What was this medicine prescribed to treat, and do the details I shared affect my treatment plan?',
 previous_clinician:'Does this medicine fit the plan you gave me when you assessed my symptoms?',
 doctor:'Could you review my symptoms and tell me whether this medicine is appropriate?',
 pharmacist:'Could you check whether this medicine interacts with anything else I take?'
};

export function clinicianMessage(medicine:ConfirmedMedicine,prescribed:YesNo|null,clinician:CheckClinician,reason:string,otherMedicines:readonly string[],flagged:readonly string[]){
 return [
  'Hello, could you help me check a medicine that contains '+joinIngredients(medicine.ingredients)+'?',
  ...(prescribed===null?[]:[prescribed==='yes'?'A doctor prescribed it for this illness.':'A doctor did not prescribe it for this illness.']),
  ...(reason?['Reason: '+reason]:[]),
  ...(otherMedicines.length?['Other products I reported: '+otherMedicines.join(', ')]:[]),
  ...(flagged.length?['Things I reported:',...flagged.map(item=>'- '+item)]:[]),
  clinicianQuestions[clinician]
 ].join('\n');
}

export function clinicianWhatsAppLink(message:string,phone?:string){
 return 'https://wa.me/'+(pharmacistNumber(phone)??'')+'?text='+encodeURIComponent(message);
}
