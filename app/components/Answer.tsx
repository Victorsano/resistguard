'use client';

import {useState} from 'react';
import {CircleCheck,Info,ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {assess,medicines,type Medicine} from '@/lib/safety';
import {answerCards,keepTyped,type CheckDetails} from '@/lib/flow';
import {copy,reasonLabels} from '@/lib/screen-copy';
import NextSteps from './NextSteps';
import './answer.css';

export default function Answer({medicine,details,onAnother}:{medicine:Medicine;details:CheckDetails;onAnother:()=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const base=assess(medicine.id,'general')!;
 const t=copy.answer;
 const reason=details.reasonChoice&&details.reasonChoice!==keepTyped?reasonLabels[details.reasonChoice]:details.reason.trim();
 return <section className="answer" aria-labelledby="answer-verdict">
  <div data-motion="verdict" className={`answer-verdict ${medicine.antibiotic?'answer-verdict-antibiotic':'answer-verdict-other'}`}><span className="answer-verdict-icon" aria-hidden="true"><CircleCheck size={32} strokeWidth={2.25}/></span><div><h1 id="answer-verdict" tabIndex={-1} data-screen-heading>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</h1><p className="answer-name">{medicine.name} · {medicine.category}</p></div></div>
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <p className="answer-summary">{medicine.summary}</p>
  <div className="caution answer-caution"><Info size={20} aria-hidden="true"/><p>{medicine.caution}</p></div>
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
      const match=medicines.find(other=>other.id===entry.choice);
      return <li key={entry.name}>{match?.name??entry.name}{!match&&<small className="answer-as-typed">{t.asTyped}</small>}</li>;
     })}</ul>}
     {details.unsureAboutNames&&<p>{t.unsureAboutNames}</p>}
    </dd>
   </dl>
   {details.otherMedicines==='yes'&&<p>{t.interactionNote}</p>}
  </div>
  <h2 className="answer-heading">{t.before}</h2>
  <div className="answer-cards">{answerCards(medicine).map(card=><div key={card.id} className="answer-card"><button data-motion="press" type="button" aria-expanded={open===card.id} aria-controls={`answer-card-${card.id}`} onClick={()=>setOpen(open===card.id?null:card.id)}><span>{t.cards[card.id]}</span><ChevronDown size={22} aria-hidden="true" className="answer-chevron"/></button>{open===card.id&&<div className="answer-card-body" id={`answer-card-${card.id}`}>{card.rules.map(rule=><div key={rule.title}><h3>{rule.title}</h3><p>{rule.text}</p></div>)}</div>}</div>)}</div>
  <h2 className="answer-heading">{t.next}</h2>
  <NextSteps medicine={medicine}/>
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
  <details className="answer-sources"><summary>{t.sources}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary><div className="source-links"><a href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel} · {medicine.name} ↗</a>{'ingredientSource' in medicine&&typeof medicine.ingredientSource==='string'&&<a href={medicine.ingredientSource} target="_blank" rel="noreferrer">Manufacturer ingredient leaflet ↗</a>}{base.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>)}<p>{t.checked(medicine.checked)}</p></div></details>
 </section>;
}
