'use client';

import {CircleCheck,ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {type Medicine} from '@/lib/safety';
import {type CheckDetails} from '@/lib/flow';
import {guidanceMedicine,type CheckGuidance} from '@/lib/check-guidance';
import {copy} from '@/lib/screen-copy';
import NextSteps from './NextSteps';
import './answer.css';

export default function Answer({medicine,details,guidance,pending,onAnother,onMatch}:{
 medicine:Medicine;
 details:CheckDetails;
 guidance:CheckGuidance;
 pending:boolean;
 onAnother:()=>void;
 onMatch:(index:number,id:string)=>void;
}){
 const t=copy.answer;
 const reason=details.reason.trim();
 return <section className="answer" aria-labelledby="answer-verdict">
  <div data-motion="verdict" className="answer-verdict">
   <span className="answer-verdict-icon" aria-hidden="true"><CircleCheck size={32} strokeWidth={2.25}/></span>
   <div><h1 id="answer-verdict" tabIndex={-1} data-screen-heading>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</h1><p className="answer-name">{medicine.name} · {medicine.category}</p></div>
  </div>
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <p className="answer-summary">{medicine.summary}</p>
  <p className="answer-boundary">{t.boundary}</p>
  <div className="answer-details">
   <h2 className="answer-heading">{t.yourAnswers}</h2>
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
   </dl>
  </div>
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
  <h2 className="answer-heading">{t.guidance}</h2>
  {pending?<p role="status">{t.guidancePending}</p>:<div className="answer-guidance" aria-live="polite">
   {[...guidance.interactions,...guidance.passages].map(item=><article className="answer-guidance-item" key={item.id}>
    <h3>{item.title}</h3><p>{item.text}</p>
    <a href={item.source.url} target="_blank" rel="noreferrer">{item.source.name} ↗</a>
   </article>)}
   {guidance.needsInteractionReview&&<p className="note">{t.interactionNote}</p>}
   <p className="answer-guidance-source">{guidance.source==='groq'?t.aiGuidance:t.sourceGuidance}</p>
  </div>}
  <h2 className="answer-heading">{t.next}</h2>
  <NextSteps medicine={medicine}/>
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
  <details className="answer-sources"><summary>{t.sources}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary><div className="source-links"><a href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel} · {medicine.name} ↗</a>{'ingredientSource' in medicine&&typeof medicine.ingredientSource==='string'&&<a href={medicine.ingredientSource} target="_blank" rel="noreferrer">Manufacturer ingredient leaflet ↗</a>}<p>{t.checked(medicine.checked)}</p></div></details>
 </section>;
}
