'use client';
import {useMemo,useRef,useState} from 'react';
import {FlaskConical,TriangleAlert,ListChecks,Info,Camera,ImageUp,Download,Plus,ListOrdered} from 'lucide-react';
import {antibiogramCsv,antibiotics,labCopy as t,levelRank,organisms,sampleAntibiograms,summariseAntibiograms,type AntibiogramScan,type AntibioticId,type Antibiogram,type Flag,type OrganismId,type Result} from '@/lib/antibiogram';
import {prepareImage} from '@/lib/image';
import Wordmark from './Wordmark';
import Emphasis from './Emphasis';
import './check-app.css';
import './lab-check.css';
const choices:(Result|null)[]=['S','I','R',null];
type Isolate={id:number;label:string;source:'photo'|'typed'|'sample';antibiogram:Antibiogram};
type Note={kind:'done'|'warn';text:string};
function LevelChip({level}:{level:Flag['level']}){return <span className={`lab-check-level is-${level}`}>{level==='review'?<TriangleAlert size={16} aria-hidden="true"/>:null}{t.levels[level]}</span>;}
// The lab-side antibiogram check: paper screen under the night bar, like /check. Many antibiograms, ranked by what needs action first.
export default function LabCheck(){
 const [isolates,setIsolates]=useState<Isolate[]>([]);
 const [selected,setSelected]=useState<number|null>(null);
 const [sample,setSample]=useState('');
 const [photos,setPhotos]=useState<string[]>([]);
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState('');
 const [notes,setNotes]=useState<Note[]>([]);
 const nextId=useRef(1);
 const typedCount=useRef(0);
 const upload=useRef<HTMLInputElement>(null);
 const camera=useRef<HTMLInputElement>(null);
 const ownData=isolates.some(item=>item.source!=='sample');
 const filled=isolates.filter(item=>Object.values(item.antibiogram.results).some(Boolean));
 const summary=useMemo(()=>summariseAntibiograms(filled.map(({label,antibiogram})=>({label,antibiogram}))),[filled]);
 const current=isolates.find(item=>item.id===selected)??null;
 const make=(label:string,source:Isolate['source'],antibiogram:Antibiogram):Isolate=>({id:nextId.current++,label,source,antibiogram});
 function update(id:number,change:(a:Antibiogram)=>Antibiogram){setIsolates(list=>list.map(item=>item.id===id?{...item,antibiogram:change(item.antibiogram)}:item));}
 function setResult(id:number,drug:AntibioticId,value:Result|null){update(id,a=>{const results={...a.results};if(value)results[drug]=value;else delete results[drug];return {...a,results};});}
 function loadSample(value:string){
  setSample(value);setNotes([]);
  const chosen=value==='all'?sampleAntibiograms:sampleAntibiograms.filter(item=>item.id===value);
  const list=chosen.map(item=>make(item.label,'sample',{organism:item.antibiogram.organism,results:{...item.antibiogram.results}}));
  setIsolates(list);setSelected(list.length?list[summariseAntibiograms(list).ranked[0].index].id:null);
 }
 function addTyped(){typedCount.current++;const item=make(t.typedLabel(typedCount.current),'typed',{organism:'escherichia-coli',results:{}});setIsolates(list=>[...list.filter(i=>i.source!=='sample'),item]);setSelected(item.id);setSample('');}
 function remove(id:number){setIsolates(list=>{const rest=list.filter(item=>item.id!==id);setSelected(rest[0]?.id??null);return rest;});}
 async function choosePhotos(files:File[]){
  setNotes([]);setConsent(false);setBusy('…');
  const prepared:string[]=[];const failed:string[]=[];
  for(const file of files.slice(0,6)){try{prepared.push(await prepareImage(file));}catch(error){failed.push(error instanceof Error?error.message:t.scanFailed(1));}}
  setPhotos(prepared);setBusy('');
  if(failed.length)setNotes([{kind:'warn',text:failed[0]}]);
 }
 async function readPhotos(){
  if(!photos.length||!consent||busy)return;
  const found:Isolate[]=[];let skipped=0,failed=0,partial=false,severalPhotos=0,severalReports=0;
  for(const [index,image] of photos.entries()){
   setBusy(t.reading(index+1,photos.length));
   try{
    // The AI provider limits requests per minute. On a rate limit, wait and try again twice before giving up on this photo.
    let scan:AntibiogramScan|undefined;
    for(let attempt=0;attempt<3&&!scan;attempt++){
     if(attempt){setBusy(t.waiting(index+1,photos.length));await new Promise(resolve=>setTimeout(resolve,20_000));setBusy(t.reading(index+1,photos.length));}
     const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30_000);
     try{
      const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'antibiogram',image}),signal:controller.signal});
      const body=await response.json() as {antibiogram?:AntibiogramScan;reason?:string};
      scan=body.antibiogram;
      if(!scan&&body.reason!=='rate_limit'&&body.reason!=='request_limit'&&response.status!==429)break;
     }finally{clearTimeout(timeout);}
    }
    if(!scan){failed++;continue;}
    if(scan.status==='several'){severalPhotos++;severalReports+=scan.reports;continue;}
    skipped+=scan.skipped;
    if(scan.status==='read'){
     const photoNumber=index+1;const many=scan.isolates.length>1;
     for(const item of scan.isolates){partial||=item.partial;found.push(make(t.photoLabel(photoNumber,item.position,many),'photo',item.antibiogram));}
    }
   }catch{failed++;}
  }
  setBusy('');
  const next:Note[]=[];
  if(found.length){
   setIsolates(list=>[...list.filter(item=>item.source!=='sample'),...found]);setSample('');
   setSelected(found[summariseAntibiograms(found.map(({label,antibiogram})=>({label,antibiogram}))).ranked[0]?.index??0].id);
   next.push({kind:partial?'warn':'done',text:partial?`${t.readDone(found.length)} ${t.readPartial}`:t.readDone(found.length)});
  }else if(!failed&&!severalPhotos)next.push({kind:'warn',text:t.unreadable});
  if(severalPhotos)next.push({kind:'warn',text:t.several(severalPhotos,severalReports)});
  if(skipped)next.push({kind:'warn',text:t.skipped(skipped)});
  if(failed)next.push({kind:'warn',text:t.scanFailed(failed)});
  setNotes(next);
 }
 function downloadCsv(){const url=URL.createObjectURL(new Blob([antibiogramCsv(filled.map(({label,antibiogram})=>({label,antibiogram})))],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download='resistguard-antibiograms.csv';link.click();URL.revokeObjectURL(url);}
 const detail=current?summary.ranked.find(r=>r.index===filled.indexOf(current))??null:null;
 const panel=current?[...organisms[current.antibiogram.organism].panel,...(Object.keys(current.antibiogram.results) as AntibioticId[]).filter(id=>!organisms[current.antibiogram.organism].panel.includes(id))]:[];
 return <>
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header className="tool-bar on-night"><Wordmark/></header>
 <main id="main-content" className="tool lab-check">
  <section className="lab-check-intro"><span className="eyebrow">{t.eyebrow}</span><h1><Emphasis text={`${t.title} ${t.titleEm}`} word={t.titleEm}/></h1><p>{t.lead}</p></section>
  <div className="lab-check-layout">
   <div className="lab-check-column">
    <section className="lab-check-photo" aria-labelledby="lab-photo-title">
     <h2 id="lab-photo-title"><Camera size={22} aria-hidden="true"/> {t.photoTitle}</h2>
     <p>{t.photoLead}</p>
     <input ref={upload} className="lab-check-file" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>{const files=[...(e.target.files??[])];e.target.value='';if(files.length)void choosePhotos(files);}}/>
     <input ref={camera} className="lab-check-file" type="file" accept="image/*" capture="environment" onChange={e=>{const files=[...(e.target.files??[])];e.target.value='';if(files.length)void choosePhotos(files);}}/>
     <div className="button-row"><button type="button" className="secondary" disabled={!!busy} onClick={()=>camera.current?.click()}><Camera size={18} aria-hidden="true"/> {t.takePhoto}</button><button type="button" className="secondary" disabled={!!busy} onClick={()=>upload.current?.click()}><ImageUp size={18} aria-hidden="true"/> {t.uploadPhoto}</button></div>
     {photos.length>0&&<><div className="lab-check-previews">{photos.map((src,index)=><img key={index} className="lab-check-preview" src={src} alt={`Photo ${index+1} to read`}/>)}</div><label className="lab-check-consent" htmlFor="lab-consent"><input id="lab-consent" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t.consent}</span></label><button type="button" className="primary" disabled={!consent||!!busy} onClick={()=>void readPhotos()}>{busy||t.read(photos.length)}</button></>}
     {notes.map(note=><p key={note.text} className={`lab-check-photo-note is-${note.kind}`} role={note.kind==='warn'?'alert':'status'}>{note.text}</p>)}
    </section>
    <section className="lab-check-entry" aria-labelledby="lab-results-title">
     {!ownData&&<label className="lab-check-field" htmlFor="lab-sample"><span>{t.sample}</span><select id="lab-sample" value={sample} onChange={e=>loadSample(e.target.value)}><option value="">{t.samplePlaceholder}</option><option value="all">{t.sampleAll}</option>{sampleAntibiograms.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
     <div className="lab-check-results-head"><h2 id="lab-results-title">{t.isolates}</h2><button type="button" className="text-button" onClick={addTyped}><Plus size={18} aria-hidden="true"/> {t.addTyped}</button></div>
     {isolates.length>0&&<div className="lab-check-pills" role="tablist" aria-label={t.isolates}>{isolates.map(item=><button key={item.id} type="button" role="tab" aria-selected={item.id===selected} className={`lab-check-pill${item.id===selected?' is-active':''}`} onClick={()=>setSelected(item.id)}>{item.label}</button>)}</div>}
     {current&&<>
      <h3 className="lab-check-edit-title">{t.edit}</h3>
      <label className="lab-check-field" htmlFor="lab-organism"><span>{t.organism}</span><select id="lab-organism" value={current.antibiogram.organism} onChange={e=>update(current.id,()=>({organism:e.target.value as OrganismId,results:{}}))}>{(Object.keys(organisms) as OrganismId[]).map(id=><option key={id} value={id}>{organisms[id].name}</option>)}</select></label>
      <ul className="lab-check-rows">{panel.map(id=><li key={id} className="lab-check-row"><span className="lab-check-drug">{antibiotics[id].name}</span><div className="lab-check-choices" role="radiogroup" aria-label={antibiotics[id].name}>{choices.map(choice=>{const active=(current.antibiogram.results[id]??null)===choice;return <button key={choice??'none'} type="button" role="radio" aria-checked={active} className={`lab-check-choice${active?' is-active':''}${choice?'':' is-none'}`} onClick={()=>setResult(current.id,id,choice)}>{choice??t.notTested}</button>;})}</div></li>)}</ul>
      <button type="button" className="text-button" onClick={()=>remove(current.id)}>{t.clear}</button>
     </>}
    </section>
   </div>
   <section className="lab-check-report" aria-live="polite" aria-labelledby="lab-findings-title">
    <h2 id="lab-findings-title"><FlaskConical size={22} aria-hidden="true"/> {t.findings}</h2>
    {!filled.length?<p className="lab-check-empty">{t.empty}</p>:<>
     {filled.length>1&&<div className="lab-check-summary">
      <h3>{t.summaryTitle(summary.counts.total)}</h3>
      <p className="lab-check-headline">{t.summaryHeadline(summary.counts.action,summary.counts.total)}</p>
      <dl className="lab-check-counts">{(['whoCritical','whoHigh','multidrug','recheck','clear'] as const).map(key=><div key={key} className={`is-${key}`}><dt>{t.summaryCounts[key]}</dt><dd>{summary.counts[key]}</dd></div>)}</dl>
      <h3><ListOrdered size={20} aria-hidden="true"/> {t.rankTitle}</h3>
      <ol className="lab-check-rank">{summary.ranked.map(row=>{const item=filled[row.index];return <li key={item.id}><button type="button" className={`lab-check-rank-item${item.id===selected?' is-active':''}`} onClick={()=>setSelected(item.id)}><span className="lab-check-rank-label">{row.label} · <em>{organisms[row.antibiogram.organism].name}</em></span>{row.top?<><LevelChip level={row.top.level}/><strong>{row.top.title}</strong></>:<span className="lab-check-rank-none">{t.noFinding}</span>}</button></li>;})}</ol>
     </div>}
     {detail&&<div className="lab-check-detail">
      <h3>{filled.length>1?t.detailTitle(detail.label):detail.label}</h3>
      <p className="lab-check-organism"><em>{organisms[detail.antibiogram.organism].name}</em> · {t.classes(detail.check.resistantClasses.length,detail.check.testedClasses)}</p>
      {detail.check.flags.length>0&&<ul className="lab-check-flags">{[...detail.check.flags].sort((a,b)=>levelRank[b.level]-levelRank[a.level]).map(flag=><li key={flag.title} className={`lab-check-flag is-${flag.level}`}><LevelChip level={flag.level}/><strong>{flag.title}</strong><p>{flag.detail}</p></li>)}</ul>}
      <div className="lab-check-steps"><h4><ListChecks size={20} aria-hidden="true"/> {t.next}</h4><ul>{detail.check.steps.map(step=><li key={step}>{step}</li>)}</ul></div>
     </div>}
     <div className="lab-check-download"><button type="button" className="secondary" onClick={downloadCsv}><Download size={18} aria-hidden="true"/> {t.download}</button><p>{t.downloadNote}</p></div>
    </>}
    <p className="lab-check-limits"><Info size={18} aria-hidden="true"/><span>{t.limits}</span></p>
   </section>
  </div>
 </main>
 </>;
}
