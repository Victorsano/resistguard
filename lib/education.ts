import {assess,questions} from './safety';
export function educationFor(id:unknown,scenario:unknown){
 const result=assess(id,scenario);if(!result)return null;
 const paragraphs:Record<string,string>={
 identity:result.medicine.summary,
 caution:result.medicine.caution,
 boundary:'A scan reads a label; it cannot check authenticity, diagnose illness, or decide which treatment you need.',
 ...(result.medicine.antibiotic?{
 target:'Antibiotics act on bacteria. They do not treat viral colds or flu. A symptom alone cannot tell you which kind of germ is responsible.',
 resistance:'Unnecessary antibiotic use can help resistant bacteria survive and spread. It is the bacteria that become resistant, not your body.',
 prescription:'Use antibiotics only as prescribed for you. Ask your pharmacist or prescriber before changing the plan.',
 leftovers:'Sharing or reusing leftover antibiotics may delay the right care and cause harm. Ask a pharmacist about safe disposal.'
 }:{
 distinction:'This ingredient is not an antibiotic. Symptom relief and treatment of an infection are different things.',
 leaflet:'Read the leaflet for this exact product. Ask a pharmacist to check its ingredients and whether it is suitable for you.'
 })};
 return {result,paragraphs,questions};
}
export function validateSelection(raw:string,paragraphs:Record<string,string>){
 const value:unknown=JSON.parse(raw);
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid explanation');
 const v=value as Record<string,unknown>;
 if(Object.keys(v).sort().join(',')!=='paragraphIds,questionIds')throw new Error('Invalid explanation fields');
 function ids(list:unknown,allowed:object,min:number,max:number):string[]{if(!Array.isArray(list)||list.length<min||list.length>max||!list.every(i=>typeof i==='string'&&Object.hasOwn(allowed,i))||new Set(list).size!==list.length)throw new Error('Invalid selected passages');return list as string[];}
 return {paragraphIds:ids(v.paragraphIds,paragraphs,2,4),questionIds:ids(v.questionIds,questions,2,3)};
}
