'use client';
import {useState} from 'react';
import {ShieldCheck,ScanLine,ArrowRight,BookOpen,ChartNoAxesCombined,Info,LockKeyhole} from 'lucide-react';
import {emergency} from '@/lib/safety';
import dashboard from '@/data/dashboard.json';
import UseCheck from './components/UseCheck';
import MedicineCheck from './components/MedicineCheck';
import Catalogue from './components/Catalogue';
import Learning from './components/Learning';
import Pilot from './components/Pilot';
import HowItWorks from './components/HowItWorks';
type Tab='check'|'use'|'catalogue'|'learn'|'dashboard'|'pilot'|'how';
export default function Home(){
 const [tab,setTab]=useState<Tab>('check');
 const [seed,setSeed]=useState<{id?:string;sample?:string;key:number}>({key:0});
 function navigate(next:Tab){setTab(next);window.scrollTo({top:0});}
 function chooseMedicine(id:string){setSeed({id,key:Date.now()});setTab('check');setTimeout(()=>document.querySelector('.workspace')?.scrollIntoView({block:'start'}),50);}
 function chooseSample(sample:string){setSeed({sample,key:Date.now()});setTab('check');setTimeout(()=>document.querySelector('.workspace')?.scrollIntoView({block:'start'}),50);}
 function startCheck(){
  requestAnimationFrame(()=>{
   document.querySelector('.workspace')?.scrollIntoView({block:'start'});
   document.querySelector<HTMLButtonElement>('.intake-actions button, .photo-review button')?.focus({preventScroll:true});
  });
 }
 return <>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header>
  <a className="brand" href="/" aria-label="ResistGuard home"><span className="brand-icon" aria-hidden="true">R/G</span>Resist<span>Guard</span><span className="demo">DEMO</span></a>
 </header>
 <main id="main-content">
  {tab==='use'?<UseCheck/>:tab==='check'?<>
   <section className="hero">
    <div className="hero-copy"><h1>What’s in<br/>that medicine<span className="headline-dot">?</span></h1><p>Photograph the ingredient list on a medicine package. Compare the reading with the small print, then see what to ask a pharmacist.</p>
     <div className="hero-actions"><button className="primary" onClick={startCheck}>Read a label <ArrowRight size={17}/></button></div>
    </div>
   </section>
   <MedicineCheck key={seed.key} initialId={seed.id} initialSample={seed.sample} showTour={false} onTourEnd={()=>{}} onTourSample={()=>chooseSample('amoxicillin.png')} onCatalogue={()=>navigate('catalogue')}/>
  </>:tab==='catalogue'?<Catalogue onChoose={chooseMedicine}/>:tab==='learn'?<Learning onSample={chooseSample}/>:tab==='pilot'?<Pilot/>:tab==='how'?<HowItWorks onCatalogue={()=>navigate('catalogue')}/>:<section className="content-view"><div className="eyebrow">DEMO INSIGHTS</div><h1>Example dashboard</h1><p>{dashboard.label}. These fixed numbers never include your scans or interactions.</p><div className="stats">{[['240','Synthetic sessions'],['186','Catalogue matches'],['154','Learning checks']].map(([n,l],i)=><article key={l}><span className="stat-icon">{i===0?<ChartNoAxesCombined size={20}/>:i===1?<ScanLine size={20}/>:<BookOpen size={20}/>}</span><span>{l}</span><strong>{n}</strong><small>Illustrative only · synthetic data</small></article>)}</div><div className="dashboard-grid"><article><div className="eyebrow">A WEEK IN THE DEMO</div><h2>Synthetic learning activity</h2><div className="bars" role="img" aria-label="Synthetic daily sessions: Mon 28, Tue 35, Wed 30, Thu 42, Fri 31, Sat 39, Sun 35">{dashboard.weekly.map((n,i)=><div key={i}><span>{n}</span><div style={{height:n*3}}/><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></article><article><div className="eyebrow">ILLUSTRATIVE TOPICS</div><h2>What people might ask</h2>{dashboard.scenarios.map(s=><div className="topic" key={s.name}><div><span>{s.name}</span><b>{s.value}</b></div><div className="track"><span style={{width:`${s.value/240*100}%`}}/></div></div>)}</article></div><div className="small-note"><Info size={20}/><p>No tracking, analytics service, database or saved session history is implemented. This dashboard demonstrates a possible educational reporting view; it is not AMR surveillance or evidence of clinical impact.</p></div></section>}
  <aside className="safety-banner"><ShieldCheck size={25}/><div><strong>Education, with a clear boundary.</strong><p>ResistGuard cannot diagnose, prescribe, recommend doses or confirm a medicine is safe for you. A package match is not medical approval. Speak to a qualified healthcare professional.</p><p className="emergency">{emergency}</p></div></aside>
  <footer><a className="brand" href="/">Resist<span>Guard</span><span className="demo">DEMO</span></a><span>Read carefully. Ask better questions.</span><button type="button" className="how-it-works-footer-link" aria-current={tab==='how'?'page':undefined} onClick={()=>navigate('how')}>How it works</button><button type="button" className="how-it-works-footer-link" aria-current={tab==='pilot'?'page':undefined} onClick={()=>navigate('pilot')}>For pharmacists and testers</button><span><LockKeyhole size={12}/> No account · No saved uploads · No tracking</span></footer>
 </main>
 </>;
}
