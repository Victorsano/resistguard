export const platforms=['android','iphone','desktop','emulated'] as const;
export const browsers=['chrome','safari','edge','firefox','other'] as const;
export const conditions=['clear','glare','blur','small_print','cropped','permission_denied'] as const;
export const decisions=['accepted','did_not_confirm','not_observed'] as const;
type Decision=typeof decisions[number];
export type PilotRow={decision?:Decision;platform:string;browser:string;condition:string;expected:string;observed:string;result:'candidate'|'uncertain'|'unavailable';understoodBoundary:boolean;knowsNextStep:boolean};
export function pilotOutcome(row:PilotRow){return row.result==='unavailable'?'unavailable':row.result==='uncertain'?'uncertain':row.expected===row.observed?'correct_candidate':'incorrect_candidate';}
export function validatePilotRow(value:unknown,ids:string[]):value is PilotRow{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const v=value as Record<string,unknown>;
 const keys=['platform','browser','condition','expected','observed','result','understoodBoundary','knowsNextStep'];
 const decisionValid=v.decision===undefined || (decisions.includes(v.decision as Decision) && (v.result==='candidate' || v.decision==='not_observed'));
 return decisionValid && Object.keys(v).every(k=>keys.includes(k)||k==='decision')&&keys.every(k=>Object.hasOwn(v,k))&&platforms.includes(v.platform as typeof platforms[number])&&browsers.includes(v.browser as typeof browsers[number])&&conditions.includes(v.condition as typeof conditions[number])&&[...ids,'unsupported','non_medicine','unreadable'].includes(v.expected as string)&&[...ids,'none'].includes(v.observed as string)&&['candidate','uncertain','unavailable'].includes(v.result as string)&&typeof v.understoodBoundary==='boolean'&&typeof v.knowsNextStep==='boolean'&&(v.result!=='candidate'||ids.includes(v.observed as string))&&(v.result==='candidate'||v.observed==='none');
}
export function pilotSummary(rows:PilotRow[]){
 const wrongWithDecision=rows.filter(r=>pilotOutcome(r)==='incorrect_candidate' && (r.decision==='accepted'||r.decision==='did_not_confirm'));
 return {wrongWithDecision:wrongWithDecision.length,wrongAccepted:wrongWithDecision.filter(r=>r.decision==='accepted').length,total:rows.length,correct:rows.filter(r=>pilotOutcome(r)==='correct_candidate').length,incorrect:rows.filter(r=>pilotOutcome(r)==='incorrect_candidate').length,uncertain:rows.filter(r=>pilotOutcome(r)==='uncertain').length,unavailable:rows.filter(r=>pilotOutcome(r)==='unavailable').length,physicalPhoneReports:rows.filter(r=>['android','iphone'].includes(r.platform)).length,boundaryUnderstood:rows.filter(r=>r.understoodBoundary).length,nextStepUnderstood:rows.filter(r=>r.knowsNextStep).length};}
