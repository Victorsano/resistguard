'use client';

import {useState} from 'react';
import {Pill,TriangleAlert,Info,ChevronDown,RotateCcw,BadgeInfo} from 'lucide-react';
import {assess,type Medicine} from '@/lib/safety';
import {answerCards} from '@/lib/flow';
import {copy} from '@/lib/screen-copy';
import NextSteps from './NextSteps';
import './answer.css';

export default function Answer({medicine,onAnother}:{medicine:Medicine;onAnother:()=>void}){
 const [open,setOpen]=useState<string|null>(null);
 const base=assess(medicine.id,'general')!;
 const t=copy.answer;
 return <section className="answer" aria-labelledby="answer-verdict">
  <div data-motion="verdict" className={`answer-verdict ${medicine.antibiotic?'answer-verdict-antibiotic':'answer-verdict-other'}`}><span className="answer-verdict-icon" aria-hidden="true">{medicine.antibiotic?<><Pill size={30}/><TriangleAlert size={18} className="answer-verdict-alert"/></>:<Info size={30}/>}</span><div><h1 id="answer-verdict" tabIndex={-1} data-screen-heading>{medicine.antibiotic?t.antibiotic:t.notAntibiotic}</h1><p className="answer-name">{medicine.name} · {medicine.category}</p></div></div>
  <p className="answer-review"><BadgeInfo size={18} aria-hidden="true"/>{t.review}</p>
  <p className="answer-summary">{medicine.summary}</p>
  <div className="caution answer-caution"><Info size={20} aria-hidden="true"/><p>{medicine.caution}</p></div>
  <p className="answer-boundary">{t.boundary}</p>
  <h2 className="answer-heading">{t.before}</h2>
  <div className="answer-cards">{answerCards(medicine).map(card=><div key={card.id} className="answer-card"><button data-motion="press" type="button" aria-expanded={open===card.id} aria-controls={`answer-card-${card.id}`} onClick={()=>setOpen(open===card.id?null:card.id)}><span>{t.cards[card.id]}</span><ChevronDown size={22} aria-hidden="true" className="answer-chevron"/></button>{open===card.id&&<div className="answer-card-body" id={`answer-card-${card.id}`}>{card.rules.map(rule=><div key={rule.title}><h3>{rule.title}</h3><p>{rule.text}</p></div>)}</div>}</div>)}</div>
  <h2 className="answer-heading">{t.next}</h2>
  <NextSteps medicine={medicine}/>
  <button data-motion="press" type="button" className="secondary answer-another" onClick={onAnother}><RotateCcw size={20} aria-hidden="true"/>{t.another}</button>
  <details className="answer-sources"><summary>{t.sources}<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary><div className="source-links"><a href={medicine.source} target="_blank" rel="noreferrer">{medicine.sourceLabel} · {medicine.name} ↗</a>{'ingredientSource' in medicine&&typeof medicine.ingredientSource==='string'&&<a href={medicine.ingredientSource} target="_blank" rel="noreferrer">Manufacturer ingredient leaflet ↗</a>}{base.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a>)}<p>{t.checked(medicine.checked)}</p></div></details>
 </section>;
}
