'use client';
import {useState} from 'react';
import {ShieldCheck,ScanLine,ArrowUpRight,ArrowRight,BookOpen,ChartNoAxesCombined,Check,Plus,Leaf,Info,Library,LockKeyhole,ClipboardCheck} from 'lucide-react';
import {emergency} from '@/lib/safety';
import dashboard from '@/data/dashboard.json';
import MedicineCheck from './components/MedicineCheck';
import Catalogue from './components/Catalogue';
import Learning from './components/Learning';
import Pilot from './components/Pilot';
type Tab='check'|'catalogue'|'learn'|'dashboard'|'pilot';
export default function Home(){
 const [tab,setTab]=useState<Tab>('check');
 const [seed,setSeed]=useState<{id?:string;sample?:string;key:number}>({key:0});
 function navigate(next:Tab){setTab(next);window.scrollTo({top:0});}
 function chooseMedicine(id:string){setSeed({id,key:Date.now()});setTab('check');setTimeout(()=>document.querySelector('.workspace')?.scrollIntoView({block:'start'}),50);}
 function chooseSample(sample:string){setSeed({sample,key:Date.now()});setTab('check');setTimeout(()=>document.querySelector('.workspace')?.scrollIntoView({block:'start'}),50);}
 function startCheck(){document.querySelector('.workspace')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelector<HTMLButtonElement>('.intake-actions button')?.focus({preventScroll:true});}
 return <>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header>
  <a className="brand" href="/" aria-label="ResistGuard home"><span className="brand-icon" aria-hidden="true">R/G</span>Resist<span>Guard</span><span className="demo">DEMO</span></a>
  <nav aria-label="Main navigation">{([['check','Medicine check',ScanLine],['catalogue','Catalogue',Library],['learn','Learn & try',BookOpen],['dashboard','Demo insights',ChartNoAxesCombined],['pilot','Pilot & review',ClipboardCheck]] as const).map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} className={tab===id?'active':''} onClick={()=>navigate(id)}><Icon size={17}/>{label}</button>)}</nav>
  <span className="header-note"><span className="green-dot"/> A medicine literacy project</span>
 </header>
 <main id="main-content">
  <div className="topline"><span>MEDICINE LITERACY / ANTIBIOTIC AWARENESS</span><span className="privacy"><LockKeyhole size={13}/> No account. No saved health data.</span></div>
  {tab==='check'?<>
   <section className="hero">
    <div className="hero-copy"><div className="eyebrow"><span/> 01 / THE LABEL COMES FIRST</div><h1>What’s in<br/>that medicine<span className="headline-dot">?</span></h1><p>A name on a box is only the beginning. Read the active ingredients, understand the antibiotic question, and know what to ask a pharmacist.</p>
     <div className="hero-actions"><button className="primary" onClick={startCheck}>Read a label <ArrowRight size={17}/></button><button className="hero-link" onClick={()=>navigate('learn')}>Visit the field guide <ArrowUpRight size={16}/></button></div>
     <div className="hero-tags"><span><Check size={14}/> Source-linked guidance</span><span><ShieldCheck size={14}/> Education first</span></div>
    </div>
    <div className="label-specimen" aria-hidden="true"><div className="specimen-top"><span>RESISTGUARD / LABEL NOTES</span><span>NO. 001</span></div><div className="specimen-body"><span className="specimen-kicker">LOOK PAST THE BRAND.</span><strong>Read the<br/>small print.</strong><div className="specimen-focus"><span>ACTIVE INGREDIENTS</span><div className="specimen-lines"><i/><i/><i/></div><ScanLine size={34}/></div><div className="specimen-note"><span>↳</span><p>One package.<br/>Every active ingredient.</p></div></div><div className="specimen-bottom"><div className="barcode"/><span>AN ILLUSTRATION.<br/>NOT A MEDICINE LABEL.</span></div></div>
   </section>
   <section className="journey" aria-label="How the medicine check works">{[[ScanLine,'01','Start with a label','Upload a photo or open your camera.'],[Check,'02','Confirm the ingredients','Check the complete list before continuing.'],[BookOpen,'03','Build your understanding','Read sourced guidance and useful questions.']].map(([Icon,n,title,detail])=>{const StepIcon=Icon as typeof ScanLine;return <div className="journey-step" key={String(n)}><span className="journey-icon"><StepIcon size={20}/></span><div><span className="journey-number">STEP {String(n)}</span><h2>{String(title)}</h2><p>{String(detail)}</p></div></div>;})}</section>
   <MedicineCheck key={seed.key} initialId={seed.id} initialSample={seed.sample} onCatalogue={()=>navigate('catalogue')}/>
   <div className="section-intro"><div><span className="eyebrow">02 / KEEP THE CONTEXT</span><h2>The scan is a starting point.</h2></div><p>Follow the evidence. Ask a professional.</p></div>
   <section className="bottom-cards"><article><span className="mini-icon"><Leaf size={23}/></span><h3>Why antibiotics need care</h3><p>Responsible antibiotic use helps preserve effective treatments for everyone.</p><button onClick={()=>navigate('learn')}>Understand resistance <ArrowUpRight size={15}/></button></article><article><span className="mini-icon"><BookOpen size={23}/></span><h3>Go straight to the source</h3><p>Browse our medicine catalogue and follow the links to public NHS information.</p><button onClick={()=>navigate('catalogue')}>Explore the catalogue <ArrowUpRight size={15}/></button></article><article className="dark-card"><span className="eyebrow">THE IMPORTANT PART</span><h3>Recognition<br/>isn’t approval.</h3><p>A label match cannot tell you whether a medicine is right for you.</p></article></section>
  </>:tab==='catalogue'?<Catalogue onChoose={chooseMedicine}/>:tab==='learn'?<Learning onSample={chooseSample}/>:tab==='pilot'?<Pilot/>:<section className="content-view"><div className="eyebrow">DEMO INSIGHTS</div><h1>See the potential.<br/><em>Understand the limits.</em></h1><p>{dashboard.label}. These fixed numbers never include your scans or interactions.</p><div className="stats">{[['240','Synthetic sessions'],['186','Catalogue matches'],['154','Learning checks']].map(([n,l],i)=><article key={l}><span className="stat-icon">{i===0?<ChartNoAxesCombined size={20}/>:i===1?<ScanLine size={20}/>:<BookOpen size={20}/>}</span><span>{l}</span><strong>{n}</strong><small>Illustrative only · synthetic data</small></article>)}</div><div className="dashboard-grid"><article><div className="eyebrow">A WEEK IN THE DEMO</div><h2>Synthetic learning activity</h2><div className="bars" role="img" aria-label="Synthetic daily sessions: Mon 28, Tue 35, Wed 30, Thu 42, Fri 31, Sat 39, Sun 35">{dashboard.weekly.map((n,i)=><div key={i}><span>{n}</span><div style={{height:n*3}}/><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></article><article><div className="eyebrow">ILLUSTRATIVE TOPICS</div><h2>What people might ask</h2>{dashboard.scenarios.map(s=><div className="topic" key={s.name}><div><span>{s.name}</span><b>{s.value}</b></div><div className="track"><span style={{width:`${s.value/240*100}%`}}/></div></div>)}</article></div><div className="small-note"><Info size={20}/><p>No tracking, analytics service, database or saved session history is implemented. This dashboard demonstrates a possible educational reporting view; it is not AMR surveillance or evidence of clinical impact.</p></div></section>}
  <aside className="safety-banner"><ShieldCheck size={25}/><div><strong>Education, with a clear boundary.</strong><p>ResistGuard cannot diagnose, prescribe, recommend doses or confirm a medicine is safe for you. A package match is not medical approval. Speak to a qualified healthcare professional.</p><p className="emergency">{emergency}</p></div></aside>
  <footer><a className="brand" href="/">Resist<span>Guard</span><span className="demo">DEMO</span></a><span>Read carefully. Ask better questions.</span><span><LockKeyhole size={12}/> No account · No saved uploads · No tracking</span></footer>
 </main></>;
}
