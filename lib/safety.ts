import aliases from '@/data/ingredient-aliases.json';
import medicines from '@/data/medicines.json';
export { medicines };
export type Medicine = typeof medicines[number];
export const scenarios = {
  general: {label:'Understand this medicine',title:'Recognition is the beginning, not approval',text:'A label can help identify an ingredient. It cannot establish which illness you have, whether the medicine is genuine or whether it is appropriate for you. Read the leaflet and ask a qualified pharmacist or prescriber.'},
  cold: {label:'A cold or flu',title:'Antibiotics do not treat viruses',text:'Colds and flu are caused by viruses. Antibiotics target bacteria, so they do not treat these illnesses. Symptoms alone cannot identify the cause of an infection. Ask a healthcare professional if symptoms worsen or concern you.'},
  sharing: {label:'Sharing a medicine',title:'A prescription belongs to one person',text:'Do not share antibiotics or take someone else’s prescription. The wrong medicine can delay appropriate care and cause harm. Speak with a pharmacist or qualified prescriber.'},
  leftovers: {label:'Using leftovers',title:'Leftovers are not a treatment plan',text:'Do not use leftover antibiotics for a new illness. Ask a pharmacist about safe disposal and seek assessment for the current illness.'},
  prescribed: {label:'My own prescription',title:'Follow your prescriber’s instructions',text:'Take antibiotics exactly as prescribed. Do not change the dose, duration or stop treatment based on this app. Ask your prescriber or pharmacist about side effects or uncertainty.'},
  missed: {label:'A missed dose',title:'Check your own leaflet',text:'Missed-dose instructions depend on the medicine and schedule. Check the patient leaflet and ask a pharmacist if you are unsure. Do not use this app to calculate a replacement dose.'},
  effects: {label:'Side effects or other medicines',title:'Get a medicine-specific check',text:'A scan cannot assess allergies, side effects or interactions. Ask a pharmacist or prescriber about your symptoms, health conditions and all medicines you take. Seek immediate help for emergency symptoms.'}
} as const;
export type Scenario = keyof typeof scenarios;
export const sources = [
 {name:'CDC · Using antibiotics appropriately',url:'https://www.cdc.gov/antibiotic-use/about/index.html'},
 {name:'NHS · Antibiotics and emergency reactions',url:'https://www.nhs.uk/medicines/antibiotics/'}
];
export const emergency = 'Trouble breathing, swelling of the mouth or throat, or collapse may be an emergency. Seek immediate emergency medical help. Do not wait for this app.';
export const questions = {
 need:'What is this medicine intended to treat, and do I need a professional assessment?',
 plan:'How should I follow my own prescription, and what should I do if I miss a dose?',
 interactions:'Could this interact with my medicines, supplements or health conditions?',
 effects:'Which side effects should I watch for, and when should I seek help?',
 disposal:'How can I safely dispose of unused or expired medicine?'
};
export function assess(id:unknown, scenario:unknown) {
 const medicine=medicines.find(m=>m.id===id);
 if(!medicine || typeof scenario!=='string' || !Object.hasOwn(scenarios,scenario)) return null;
 let rule:{label:string;title:string;text:string}=scenarios[scenario as Scenario];
 if(!medicine.antibiotic && ['cold','sharing','leftovers','prescribed'].includes(scenario))rule={label:rule.label,title:'This ingredient is not an antibiotic',text:`${medicine.name} is not an antibiotic. A medicine used for symptoms does not establish the cause of an illness. Check the leaflet for this product and ask a pharmacist about appropriate use. Do not use this recognition as a treatment recommendation.`};
 return {medicine,rule,emergency,sources,questions};
}
// Exact ingredient only: no fuzzy brand matching, strength inference or combination substitution.
const equivalents:Record<string,string>=aliases;
export function normalizeIngredient(input:string){const key=input.toLowerCase().trim().replace(/\s+/g,' ');return Object.hasOwn(equivalents,key)?equivalents[key]:key;}
export function matchIngredient(input:unknown) {
 if(typeof input!=='string') return null;
 const key=normalizeIngredient(input);
 return medicines.find(m=>m.ingredients.length===1 && m.ingredients[0]===key) ?? null;
}
export function matchIngredients(input:string[]) {
 const names=input.map(normalizeIngredient);
 if(new Set(names).size!==names.length)return null;
 return medicines.find(m=>m.ingredients.length===names.length && m.ingredients.every(i=>names.includes(i)))??null;
}
export function parseScan(raw:string) {
 const value:unknown=JSON.parse(raw);
 if(!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).length!==1 || !Object.hasOwn(value,'ingredient'))return null;
 return matchIngredient((value as {ingredient:unknown}).ingredient);
}
