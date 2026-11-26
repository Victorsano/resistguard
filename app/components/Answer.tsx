'use client';

import {ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {type Medicine} from '@/lib/safety';
import {type CheckDetails} from '@/lib/flow';
import {guidanceMedicine,type CheckGuidance} from '@/lib/check-guidance';
import type {FollowUpQuestion,FollowUpAnswers} from '@/lib/check-follow-ups';
import {copy} from '@/lib/screen-copy';
import NextSteps from './NextSteps';
import './answer.css';

export default function Answer({medicine,details,guidance,pending,followUps,followUpAnswers,onAnother,onRetry,onMatch}:{
 medicine:Medicine;
 details:CheckDetails;
 guidance:CheckGuidance;
 pending:boolean;
 followUps:FollowUpQuestion[];
 followUpAnswers:FollowUpAnswers;
 onAnother:()=>void;
 onRetry:()=>void;
 onMatch:(index:number,id:string)=>void;
}){
 const t=copy.answer;
 const reason=details.reason.trim();
 return <section className="answer" aria-labelledby="answer-guidance">
  <div className="answer-context"><span>{medicine.name}</span><span>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</span></div>
  <div className="answer-lead" data-motion="verdict">
   <h1 id="answer-guidance" tabIndex={-1} data-screen-heading>{t.guidance}</h1>
   <div aria-live="polite">
    {pending?<p role="status">{t.guidancePending}</p>:guidance.synthesis?<>
     <p className="answer-takeaway">{guidance.synthesis.takeaway}</p>
     <div className="answer-action">
      <h2>{t.askNext}</h2>
      <p>{guidance.synthesis.questionForPharmacist}</p>
     </div>
    </>:<>
     <p>{guidance.fallback==='rate_limit'?t.guidanceBusy:guidance.fallback?t.guidanceFallback:t.guidanceUnavailable}</p>
     {guidance.fallback&&<button type="button" className="text-button answer-guidance-retry" onClick={onRetry}>{t.guidanceRetry}</button>}
    </>}
   </div>
  </div>
  {!pending&&guidance.needsInteractionReview&&<p className="note answer-coverage">{t.interactionNote}</p>}
  <NextSteps medicine={medicine}/>
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <details className="answer-sources">
   <summary>{t.catalogue}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
   <div className="answer-expanded">
    <p className="answer-classification-source">{t.catalogueClassification} · {medicine.category}</p>
    <p className="answer-summary">{medicine.summary}</p>
    <p className="answer-boundary">{t.boundary}</p>
    <div className="source-links"><a href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel} · {medicine.name} ↗</a>{'ingredientSource' in medicine&&typeof medicine.ingredientSource==='string'&&<a href={medicine.ingredientSource} target="_blank" rel="noreferrer">Manufacturer ingredient leaflet ↗</a>}<p>{t.checked(medicine.checked)}</p></div>
   </div>
  </details>
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
     <dt>{text}</dt><dd>{copy.followUp[followUpAnswers[id]]}</dd>
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
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
 </section>;
}
