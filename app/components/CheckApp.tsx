'use client';
import {useState} from 'react';
import {ArrowLeft,ScanLine,BookOpen,ChartNoAxesCombined,Info,TriangleAlert} from 'lucide-react';
import dashboard from '@/data/dashboard.json';
import {copy} from '@/lib/screen-copy';
import UseCheck from './UseCheck';
import MedicineCheck from './MedicineCheck';
import Learning from './Learning';
import Pilot from './Pilot';
import HowItWorks from './HowItWorks';
import Sources from './Sources';
import Wordmark from './Wordmark';
import './check-app.css';
// 'use', 'learn' and 'dashboard' are hidden: no control opens them, but the code stays.
type View='flow'|'how'|'pilot'|'sources'|'use'|'learn'|'dashboard';
// The checker at /check: night top bar, paper screens, the emergency strip in normal flow at the bottom of every screen.
export default function CheckApp({aiPaused,example}:{aiPaused:boolean;example:boolean}){
 const [view,setView]=useState<View>('flow');
 const [command,setCommand]=useState<{screen:'home'|'find';n:number}>({screen:'home',n:0});
 function open(next:View){setView(next);window.scrollTo({top:0});requestAnimationFrame(()=>{const heading=document.querySelector<HTMLElement>('[data-view] h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}});}
 function toFlow(screen:'home'|'find'){setView('flow');setCommand(c=>({screen,n:c.n+1}));}
 return <>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header className="tool-bar on-night"><Wordmark/></header>
 <main id="main-content" className="tool">
  <div hidden={view!=='flow'}><MedicineCheck command={command} aiPaused={aiPaused} example={example}/></div>
  {view!=='flow'&&<div data-view data-motion="screen" className="tool-view"><button type="button" className="text-button page-back" data-motion="press" onClick={()=>toFlow('home')}><ArrowLeft size={20} aria-hidden="true"/>{copy.back}</button>
  {view==='how'?<HowItWorks onCatalogue={()=>toFlow('find')}/>:view==='pilot'?<Pilot/>:view==='sources'?<Sources/>:view==='use'?<UseCheck/>:view==='learn'?<Learning onSample={()=>toFlow('home')}/>:<section className="content-view"><div className="eyebrow">DEMO INSIGHTS</div><h1>Example dashboard</h1><p>{dashboard.label}. These fixed numbers never include your scans or interactions.</p><div className="stats">{[['240','Synthetic sessions'],['186','Catalogue matches'],['154','Learning checks']].map(([n,l],i)=><article key={l}><span className="stat-icon">{i===0?<ChartNoAxesCombined size={20}/>:i===1?<ScanLine size={20}/>:<BookOpen size={20}/>}</span><span>{l}</span><strong>{n}</strong><small>Illustrative only · synthetic data</small></article>)}</div><div className="dashboard-grid"><article><div className="eyebrow">A WEEK IN THE DEMO</div><h2>Synthetic learning activity</h2><div className="bars" role="img" aria-label="Synthetic daily sessions: Mon 28, Tue 35, Wed 30, Thu 42, Fri 31, Sat 39, Sun 35">{dashboard.weekly.map((n,i)=><div key={i}><span>{n}</span><div style={{height:n*3}}/><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></article><article><div className="eyebrow">ILLUSTRATIVE TOPICS</div><h2>What people might ask</h2>{dashboard.scenarios.map(s=><div className="topic" key={s.name}><div><span>{s.name}</span><b>{s.value}</b></div><div className="track"><span style={{width:`${s.value/240*100}%`}}/></div></div>)}</article></div><div className="small-note"><Info size={20}/><p>No tracking, analytics service, database or saved session history is implemented. This dashboard demonstrates a possible educational reporting view; it is not AMR surveillance or evidence of clinical impact.</p></div></section>}</div>}
  <p className="tool-emergency" role="note"><TriangleAlert size={22} aria-hidden="true"/><span>{copy.emergency}</span></p>
  <footer className="page-footer"><nav aria-label="More information">{([['how',copy.footer.how],['pilot',copy.footer.pilot],['sources',copy.footer.sources]] as const).map(([id,label])=><button key={id} type="button" className="text-button page-footer-link" data-motion="press" aria-current={view===id?'page':undefined} onClick={()=>open(id)}>{label}</button>)}</nav></footer>
 </main>
 </>;
}
