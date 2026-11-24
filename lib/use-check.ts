import evidence from '@/data/use-evidence.json';

export type PassageId = keyof typeof evidence.passages;
export type SourceId = keyof typeof evidence.sources;
export const useTopics = {
  general: {kind:'antibiotic',title:'General antibiotic use', example:'Someone is unsure whether they need an antibiotic for an illness.', passages:['need','prescription','leftovers','amr']},
  eczema: {kind:'antibiotic',title:'Antibiotics for eczema', example:'Someone has an eczema flare and is considering starting an antibiotic on their own.', passages:['eczema','eczema_review','need','amr']},
  boil: {kind:'antibiotic',title:'Antibiotics for a boil', example:'Someone has a boil and is thinking of using antibiotics left over from a previous illness.', passages:['boil','boil_review','leftovers','amr']},
  safety: {kind:'medicine-safety',title:'Medicine interaction example', example:'In a fictional case, an adult considering sildenafil already takes a nitrate medicine. Both medicines are confirmed from their labels.', passages:['interaction']},
  ulcer: {kind:'medicine-safety',title:'Medicine and ulcer history', example:'In a fictional case, an adult with a history of stomach ulcers is considering oral diclofenac, an anti-inflammatory pain medicine.', passages:['ulcer']}
} as const satisfies Record<string,{kind:'antibiotic'|'medicine-safety';title:string;example:string;passages:readonly PassageId[]}>;
export type UseTopic = keyof typeof useTopics;

export const usePlans = {
  prescribed: {label:'A current prescription for the person', title:'Check the instructions', passage:'prescription'},
  self_start: {label:'Starting on their own for symptoms', title:'Ask whether an antibiotic is needed', passage:'need'},
  leftover: {label:'Antibiotics left over from a past illness', title:'Ask before reusing a medicine', passage:'leftovers'},
  shared: {label:'Someone else’s antibiotic', title:'Ask about the appropriate care', passage:'leftovers'},
  uncertain: {label:'Unsure about the reason or instructions', title:'Clarify with the pharmacist', passage:'need'}
} as const satisfies Record<string,{label:string;title:string;passage:PassageId}>;
export type UsePlan = keyof typeof usePlans;

export const conversationTopics = {
  age:'Is this for a child or an adult? What age-related checks are needed?',
  allergy:'Could a previous allergy or reaction affect the medicine choice?',
  medicines:'Could any other medicine or supplement interact with this one?',
  pregnancy:'Do pregnancy or breastfeeding affect the advice for this medicine?',
  conditions:'Could an existing health condition affect the medicine choice?'
} as const;

export function isUseTopic(input:unknown): input is UseTopic {
  return typeof input==='string' && Object.hasOwn(useTopics,input);
}

export function getPassage(id:PassageId) {
  const passage=evidence.passages[id];
  return {id,...passage,reference:evidence.sources[passage.source as SourceId],checked:evidence.checked,reviewStatus:evidence.reviewStatus};
}

export function retrieveUseEvidence(topic:UseTopic) {
  return useTopics[topic].passages.map(getPassage);
}

// A model may only reorder the retrieved passages. Every passage is retained.
export function validateEvidenceOrder(raw:string,allowed:readonly PassageId[]): PassageId[] {
  const parsed:unknown=JSON.parse(raw);
  if(!parsed || typeof parsed!=='object' || Array.isArray(parsed) || Object.keys(parsed).join(',')!=='passageIds') throw new Error('Invalid selection');
  const ids=(parsed as {passageIds:unknown}).passageIds;
  if(!Array.isArray(ids) || ids.length!==allowed.length || new Set(ids).size!==allowed.length || ids.some(id=>!allowed.includes(id))) throw new Error('Invalid passage IDs');
  return ids as PassageId[];
}

export function parseEvidenceRequest(body:unknown): UseTopic|null {
  if(!body || typeof body!=='object' || Array.isArray(body) || Object.keys(body).join(',')!=='topic') return null;
  const topic=(body as {topic:unknown}).topic;
  return isUseTopic(topic)?topic:null;
}
