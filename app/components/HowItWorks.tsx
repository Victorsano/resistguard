'use client';

import {howItWorks} from '@/lib/how-it-works';
import './how-it-works.css';

export default function HowItWorks({onCatalogue}:{onCatalogue:()=>void}){
 return <section className="content-view how-it-works" aria-labelledby="how-it-works-title">
  <h1 id="how-it-works-title">{howItWorks.title}</h1>
  <p>{howItWorks.intro}</p>
  {howItWorks.answers.map(answer=><section className="pharmacist-plan how-it-works-answer" key={answer.id}><h2>{answer.question}</h2><p>{answer.text}</p>{answer.sources.length?<div className="source-links">{answer.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}</div>:null}{'catalogue' in answer&&<button className="secondary how-it-works-catalogue" onClick={onCatalogue}>Search a NAFDAC number</button>}</section>)}
  <p className="how-it-works-footer">{howItWorks.footer}</p>
 </section>;
}
