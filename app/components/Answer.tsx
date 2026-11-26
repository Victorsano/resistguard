'use client';

import {ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {type Medicine} from '@/lib/safety';
import {type CheckDetails} from '@/lib/flow';
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
 const reason=details.reason.trim();
 const {status,clinician}=checkResult({
  reason,prescribed:details.prescribed==='yes',questions:followUps,answers:followUpAnswers,
  interactions:guidance.interactions.length>0,needsInteractionReview:guidance.needsInteractionReview,needsReasonReview:guidance.needsReasonReview
 });
 return <section className="answer" aria-labelledby="answer-guidance">
  <div className="answer-context"><span>{medicine.name}</span><span>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</span></div>
  <div className="answer-lead" data-outcome={pending?undefined:status} data-motion="verdict">
   <h1 id="answer-guidance" tabIndex={-1} data-screen-heading>{pending?t.guidance:t.status[status]}</h1>
   <div aria-live="polite">
    {pending?<p role="status">{t.guidancePending}</p>:<>
     <p className="answer-takeaway">{guidance.synthesis?.takeaway??t.statusNote[status]}</p>
     <div className="answer-action">
      <h2>{t.nextAction[clinician]}</h2>
      <p>{guidance.synthesis?.nextAction??t.nextActionFallback[clinician]}</p>
     </div>
     {guidance.fallback&&<p className="answer-provider-note">{guidance.fallback==='rate_limit'?t.guidanceBusy:t.guidanceFallback}{' '}
      <button type="button" className="text-button answer-guidance-retry" onClick={onRetry}>{t.guidanceRetry}</button>
     </p>}
    </>}
   </div>
  </div>
  {!pending&&guidance.needsInteractionReview&&<p className="note answer-coverage">{t.interactionNote}</p>}
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <details className="answer-sources">
   <summary>{t.catalogue}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <div className="answer-expanded">
    <p className="answer-classification-source">{t.catalogueClassification} · {medicine.category}</p>
    <dl className="answer-medicine-record"><dt>{t.activeIngredients}</dt><dd>{medicine.ingredients.join(' + ')}</dd></dl>
    <p className="answer-summary">{medicine.summary}</p>
    <p className="answer-boundary">{t.boundary}</p>
    <div className="source-links"><a href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel} · {medicine.name} ↗</a>{'ingredientSource' in medicine&&typeof medicine.ingredientSource==='string'&&<a href={medicine.ingredientSource} target="_blank" rel="noreferrer">Manufacturer ingredient leaflet ↗</a>}<p>{t.checked(medicine.checked)}</p></div>
   </div>
  </details>
  <GreenbookCheck ingredients={medicine.ingredients} suggestedNumber={suggestedRegistration} aiAvailable={aiAvailable}/>
  {!pending&&<details className="answer-sources">
   <summary>{t.supporting}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <div className="answer-expanded answer-guidance">
    {[...guidance.interactions,...guidance.passages].map(item=><article className="answer-guidance-item" key={item.id}>
     <h3>{item.title}</h3><p>{item.text}</p>
     <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.name} ↗</a>
    </article>)}
    {[...new Map(followUps.filter(question=>Object.hasOwn(followUpAnswers,question.id)).map(({source})=>[source.url,source])).values()].map(source=>
     <a href={source.url} key={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>
    )}
   </div>
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
  <NextSteps medicine={medicine} clinician={clinician} reason={reason} prescribed={details.prescribed==='yes'}
   flagged={followUps.flatMap(question=>{
    const answer=followUpAnswers[question.id];
    return answer==='yes'||answer==='unsure'?[question.text+' '+copy.followUp[answer]+
      (followUpDetails[question.id]?.trim()?' · '+followUpDetails[question.id].trim():'')]:[];
   })}/>
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
 </section>;
}
