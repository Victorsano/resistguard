'use client';

import {ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {type Medicine} from '@/lib/safety';
import {normaliseCheckReason,suggestReasons,type CheckDetails} from '@/lib/flow';
import {guidanceMedicine,type CheckGuidance} from '@/lib/check-guidance';
import type {FollowUpQuestion,FollowUpAnswers,FollowUpDetails} from '@/lib/check-follow-ups';
import {checkResult} from '@/lib/check-result';
import {copy} from '@/lib/screen-copy';
import NextSteps from './NextSteps';
import GreenbookCheck from './GreenbookCheck';
import './answer.css';

export default function Answer({medicine,details,guidance,pending,followUps,followUpAnswers,followUpDetails,suggestedRegistration,aiAvailable,onAnother,onRetry,onMatch}:{
 medicine:Medicine;
 details:CheckDetails;
 guidance:CheckGuidance;
 pending:boolean;
 followUps:FollowUpQuestion[];
 followUpAnswers:FollowUpAnswers;
 followUpDetails:FollowUpDetails;
 suggestedRegistration?:string|null;
 aiAvailable:boolean;
 onAnother:()=>void;
 onRetry:()=>void;
 onMatch:(index:number,id:string)=>void;
}){
 const t=copy.answer;
 const reason=normaliseCheckReason(details.reason.trim());
 const {status,clinician,assessment,gaps}=checkResult({
  reason,prescribed:details.prescribed==='yes',questions:followUps,answers:followUpAnswers,
  interactions:guidance.interactions.length>0,needsInteractionReview:guidance.needsInteractionReview,needsReasonReview:guidance.needsReasonReview
 });
 const sourceUses=new Map<string,{name:string;uses:Set<string>}>();
 function addSource(url:string,name:string,use:string){
  const existing=sourceUses.get(url);
  if(existing)existing.uses.add(use);
  else sourceUses.set(url,{name,uses:new Set([use])});
 }
 addSource(medicine.source,medicine.sourceLabel,
  medicine.id==='ampicillin-cloxacillin'?'Medicine record: ingredients (sections 1–3) and uses (section 4.1)':'Medicine record');
 if('ingredientSource' in medicine&&typeof medicine.ingredientSource==='string')
  addSource(medicine.ingredientSource,'Manufacturer ingredient leaflet','Medicine record ingredients');
 for(const item of guidance.interactions)addSource(item.source.url,item.source.name,'Interaction check: '+item.title);
 for(const item of guidance.passages){
  const use=guidance.citedPassageIds?.includes(item.id)?'AI explanation: ':'Guidance: ';
  addSource(item.source.url,item.source.name,use+item.title);
 }
 for(const question of followUps)
  addSource(question.source.url,question.source.name,'Follow-up question: '+question.text);
 const uncovered=guidance.uncoveredReasons??[];
 const format=new Intl.ListFormat('en');
 const sourceGap=uncovered.length?t.reasonCoverage(format.format(uncovered)):reason?t.reasonNotCovered(reason):t.gap.reason_evidence;
 const conditions=followUpAnswers['long-term-condition']==='yes'?followUpDetails['long-term-condition']?.trim():'';
 const namedConditions=conditions?.replace(/\s+([,;])/g,'$1');
 const checks=followUps.flatMap(({id})=>followUpAnswers[id]&&Object.hasOwn(t.checks,id)?[t.checks[id]]:[]);
 if(details.otherMedicines)checks.push(t.checks.other);
 const reported=[details.prescribed?t.reportedPrescription[details.prescribed]:'',assessment?t.reportedAssessment[assessment]:''].filter(Boolean);
 const antibioticForHeadache=medicine.antibiotic&&suggestReasons(reason).includes('headache');
 const visibleGaps=guidance.synthesis?gaps.filter(gap=>gap.kind!=='reason_evidence'&&gap.kind!=='assessment'):gaps;
 const usualAction=clinician==='prescriber'&&namedConditions?t.prescriberConditions:
  clinician==='prescriber'&&status==='concern'?t.prescriberConcern:t.nextActionFallback[clinician];
 const action=antibioticForHeadache
  ? t.headacheAction(medicine.name,details.prescribed==='yes')+(namedConditions?' '+t.shareConditions:'')
  : guidance.citedPassageIds?.includes('wound_assessment')
    ? t.woundAction(details.prescribed==='yes')
    : usualAction;
 return <section className="answer" aria-labelledby="answer-guidance">
  <div className="answer-context"><span>{medicine.name}</span><span>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</span></div>
  <div className="answer-lead" data-outcome={pending?undefined:status} data-motion="verdict">
   <h1 id="answer-guidance" tabIndex={-1} data-screen-heading>{pending?t.guidance:t.status[status]}</h1>
   <div aria-live="polite">
    {pending?<p role="status">{t.guidancePending}</p>:<>
     {medicine.antibiotic&&<p className="answer-takeaway">{t.antibioticPurpose(medicine.name,antibioticForHeadache,t.antibioticExamples[medicine.id])}</p>}
     {!guidance.synthesis&&reported.length>0&&<p className="answer-reported">{reported.join(' ')}</p>}
     {namedConditions&&<p className="answer-source-gap"><strong>{t.reportedConditions}</strong><br/>{namedConditions}</p>}
     {status==='no_concern'&&checks.length>0&&<p className="answer-source-gap">{t.scope(format.format(checks))}</p>}
     {visibleGaps.length>0&&<ul className="answer-gaps">
      {visibleGaps.map((gap,index)=><li key={index}>{'question' in gap?t.gap[gap.kind](gap.question):
       gap.kind==='reason_evidence'?sourceGap:t.gap[gap.kind]}</li>)}
     </ul>}
     {!guidance.synthesis&&uncovered.length>0&&!gaps.some(gap=>gap.kind==='reason_evidence')&&<p className="answer-source-gap">{sourceGap}</p>}
     {guidance.synthesis?<p className="answer-takeaway">{guidance.synthesis.takeaway}</p>:
      (status==='concern'||(status==='no_concern'&&!checks.length))&&<p className="answer-takeaway">{t.statusNote[status]}</p>}
     {guidance.interactions.length>0&&<ul className="answer-gaps" aria-label="Documented medicine interactions">
      {guidance.interactions.map(item=><li key={item.id}>{item.text}</li>)}
     </ul>}
     <div className="answer-action">
      <h2>{clinician==='prescriber'&&status!=='no_concern'?t.prescriberAction:t.nextAction[clinician]}</h2>
      <p>{guidance.synthesis?.nextAction||action}</p>
     </div>
     {guidance.fallback&&<p className="answer-provider-note">{guidance.fallback==='rate_limit'?t.guidanceBusy:t.guidanceFallback}{' '}
      <button type="button" className="text-button answer-guidance-retry" onClick={onRetry}>{t.guidanceRetry}</button>
     </p>}
    </>}
   </div>
  </div>
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <details className="answer-sources">
   <summary>{t.catalogue}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <div className="answer-expanded">
    <p className="answer-classification-source">{t.catalogueClassification} · {medicine.category}</p>
    <dl className="answer-medicine-record"><dt>{t.activeIngredients}</dt><dd>{medicine.ingredients.join(' + ')}</dd></dl>
    <p className="answer-summary">{medicine.summary}</p>
    <p>{t.checked(medicine.checked)}</p>
   </div>
  </details>
  <GreenbookCheck ingredients={medicine.ingredients} suggestedNumber={suggestedRegistration} aiAvailable={aiAvailable}/>
  {!pending&&<details className="answer-sources">
   <summary>{t.supporting}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <ul className="answer-expanded answer-guidance">
    {[...sourceUses].map(([url,{name,uses}])=><li key={url}>
     <a href={url} target="_blank" rel="noreferrer">{name} ↗</a>
     <ul>{[...uses].map(use=><li key={use}>{use}</li>)}</ul>
    </li>)}
   </ul>
  </details>}
  <details className="answer-sources answer-details">
   <summary>{t.yourAnswers}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <dl>
    {reason&&<><dt>{t.reason}</dt><dd>{reason}</dd></>}
    {details.prescribed&&<><dt>{t.prescription}</dt><dd>{copy.questions[details.prescribed]}</dd></>}
    <dt>{t.otherMedicines}</dt>
    <dd>
     {details.otherMedicines==='no'&&t.noOtherMedicines}
     {details.medicines.length>0&&<ul>{details.medicines.map(entry=>{
      const match=guidanceMedicine(entry.choice);
      return <li key={entry.name}>
       {match?.name??entry.name}
       {match&&match.name.toLowerCase()!==entry.name.toLowerCase()&&<small className="answer-as-typed">{t.matchedFrom(entry.name)}</small>}
       {!match&&<small className="answer-as-typed">{t.asTyped}</small>}
      </li>;
     })}</ul>}
     {details.unsureAboutNames&&<p>{t.unsureAboutNames}</p>}
    </dd>
    {followUps.map(({id,text})=>followUpAnswers[id]&&<div key={id}>
     <dt>{text}</dt><dd>{copy.followUp[followUpAnswers[id]]}{followUpDetails[id]?.trim()&&<p>{followUpDetails[id].trim()}</p>}</dd>
    </div>)}
   </dl>
  </details>
  {guidance.suggestions.map(({index,ids})=><section key={index} className="answer-details">
   <h2 className="answer-heading">{details.medicines[index]?.name}</h2>
   <p>{t.checkMatch}</p>
   {ids.map(id=>{
    const match=guidanceMedicine(id);
    return match&&<div key={id} className="answer-match">
     <span>{match.ingredients.join(' + ')}</span>
     <button type="button" className="secondary" data-motion="press" onClick={()=>onMatch(index,id)}>{t.useMatch(match.name)}</button>
    </div>;
   })}
  </section>)}
  <NextSteps medicine={medicine} clinician={clinician} reason={reason} prescribed={details.prescribed}
   otherMedicines={details.medicines.map(entry=>guidanceMedicine(entry.choice)?.name??entry.name)}
   flagged={followUps.flatMap(question=>{
    const answer=followUpAnswers[question.id];
    if(question.id==='reason-assessed'&&answer==='yes')return ['A doctor or pharmacist already checked my symptoms.'];
    return answer==='yes'||answer==='unsure'?[question.text+' '+copy.followUp[answer]+
      (followUpDetails[question.id]?.trim()?' · '+followUpDetails[question.id].trim():'')]:[];
   })}/>
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
 </section>;
}
