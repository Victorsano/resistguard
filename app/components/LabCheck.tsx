'use client';
import {useMemo,useState} from 'react';
import {FlaskConical,TriangleAlert,ListChecks,Info} from 'lucide-react';
import {antibiotics,checkAntibiogram,labCopy as t,organisms,sampleAntibiograms,type AntibioticId,type Antibiogram,type OrganismId,type Result} from '@/lib/antibiogram';
import Wordmark from './Wordmark';
import Emphasis from './Emphasis';
import './check-app.css';
import './lab-check.css';
const choices:(Result|null)[]=['S','I','R',null];
// The lab-side antibiogram check: paper screen under the night bar, like /check.
export default function LabCheck(){
 const [antibiogram,setAntibiogram]=useState<Antibiogram>({organism:'escherichia-coli',results:{}});
 const [sample,setSample]=useState('');
 const organism=organisms[antibiogram.organism];
 const entered=Object.values(antibiogram.results).some(Boolean);
 const check=useMemo(()=>checkAntibiogram(antibiogram),[antibiogram]);
 function setResult(id:AntibioticId,value:Result|null){setSample('');setAntibiogram(a=>{const results={...a.results};if(value)results[id]=value;else delete results[id];return {...a,results};});}
 function loadSample(id:string){setSample(id);const found=sampleAntibiograms.find(item=>item.id===id);if(found)setAntibiogram({organism:found.antibiogram.organism,results:{...found.antibiogram.results}});}
 const panel=[...organism.panel,...(Object.keys(antibiogram.results) as AntibioticId[]).filter(id=>!organism.panel.includes(id))];
 return <>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header className="tool-bar on-night"><Wordmark/></header>
 <main id="main-content" className="tool lab-check">
  <section className="lab-check-intro"><span className="eyebrow">{t.eyebrow}</span><h1><Emphasis text={`${t.title} ${t.titleEm}`} word={t.titleEm}/></h1><p>{t.lead}</p></section>
  <div className="lab-check-layout">
   <section className="lab-check-entry" aria-labelledby="lab-results-title">
    <label className="lab-check-field" htmlFor="lab-sample"><span>{t.sample}</span><select id="lab-sample" value={sample} onChange={e=>loadSample(e.target.value)}><option value="">{t.samplePlaceholder}</option>{sampleAntibiograms.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    <label className="lab-check-field" htmlFor="lab-organism"><span>{t.organism}</span><select id="lab-organism" value={antibiogram.organism} onChange={e=>{setSample('');setAntibiogram({organism:e.target.value as OrganismId,results:{}});}}>{(Object.keys(organisms) as OrganismId[]).map(id=><option key={id} value={id}>{organisms[id].name}</option>)}</select></label>
    <div className="lab-check-results-head"><h2 id="lab-results-title">{t.results}</h2>{entered&&<button type="button" className="text-button" onClick={()=>{setSample('');setAntibiogram(a=>({...a,results:{}}));}}>{t.clear}</button>}</div>
    <ul className="lab-check-rows">{panel.map(id=><li key={id} className="lab-check-row"><span className="lab-check-drug">{antibiotics[id].name}</span><div className="lab-check-choices" role="radiogroup" aria-label={antibiotics[id].name}>{choices.map(choice=>{const active=(antibiogram.results[id]??null)===choice;return <button key={choice??'none'} type="button" role="radio" aria-checked={active} className={`lab-check-choice${active?' is-active':''}${choice?'':' is-none'}`} onClick={()=>setResult(id,choice)}>{choice??t.notTested}</button>;})}</div></li>)}</ul>
   </section>
   <section className="lab-check-report" aria-live="polite" aria-labelledby="lab-findings-title">
    <h2 id="lab-findings-title"><FlaskConical size={22} aria-hidden="true"/> {t.findings}</h2>
    {!entered?<p className="lab-check-empty">{t.empty}</p>:<>
     <p className="lab-check-organism"><em>{organism.name}</em> · {t.classes(check.resistantClasses.length,check.testedClasses)}</p>
     {check.flags.length>0&&<ul className="lab-check-flags">{check.flags.map(flag=><li key={flag.title} className={`lab-check-flag is-${flag.level}`}><span className="lab-check-level">{flag.level==='review'?<TriangleAlert size={16} aria-hidden="true"/>:null}{t.levels[flag.level]}</span><strong>{flag.title}</strong><p>{flag.detail}</p></li>)}</ul>}
     <div className="lab-check-steps"><h3><ListChecks size={20} aria-hidden="true"/> {t.next}</h3><ul>{check.steps.map(step=><li key={step}>{step}</li>)}</ul></div>
    </>}
    <p className="lab-check-limits"><Info size={18} aria-hidden="true"/><span>{t.limits}</span></p>
   </section>
  </div>
 </main>
 </>;
}
