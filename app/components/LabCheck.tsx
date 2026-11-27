'use client';
import {useMemo,useRef,useState} from 'react';
import {FlaskConical,TriangleAlert,ListChecks,Info,Camera,ImageUp,Download} from 'lucide-react';
import {antibiogramCsv,antibiotics,checkAntibiogram,labCopy as t,organisms,sampleAntibiograms,type AntibiogramScan,type AntibioticId,type Antibiogram,type OrganismId,type Result} from '@/lib/antibiogram';
import {prepareImage} from '@/lib/image';
import Wordmark from './Wordmark';
import Emphasis from './Emphasis';
import './check-app.css';
import './lab-check.css';
const choices:(Result|null)[]=['S','I','R',null];
// The lab-side antibiogram check: paper screen under the night bar, like /check.
export default function LabCheck(){
 const [antibiogram,setAntibiogram]=useState<Antibiogram>({organism:'escherichia-coli',results:{}});
 const [sample,setSample]=useState('');
 const [photo,setPhoto]=useState('');
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [photoNote,setPhotoNote]=useState<{kind:'done'|'warn';text:string}|null>(null);
 const upload=useRef<HTMLInputElement>(null);
 const camera=useRef<HTMLInputElement>(null);
 const organism=organisms[antibiogram.organism];
 const entered=Object.values(antibiogram.results).some(Boolean);
 const check=useMemo(()=>checkAntibiogram(antibiogram),[antibiogram]);
 function setResult(id:AntibioticId,value:Result|null){setSample('');setAntibiogram(a=>{const results={...a.results};if(value)results[id]=value;else delete results[id];return {...a,results};});}
 function loadSample(id:string){setSample(id);const found=sampleAntibiograms.find(item=>item.id===id);if(found)setAntibiogram({organism:found.antibiogram.organism,results:{...found.antibiogram.results}});}
 async function choosePhoto(file:File){setPhotoNote(null);setConsent(false);setBusy(true);try{setPhoto(await prepareImage(file));}catch(error){setPhoto('');setPhotoNote({kind:'warn',text:error instanceof Error?error.message:t.scanFailed});}finally{setBusy(false);}}
 async function readPhoto(){
  if(!photo||!consent||busy)return;
  setBusy(true);setPhotoNote(null);
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30_000);
  try{
   const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'antibiogram',image:photo}),signal:controller.signal});
   const scan=(await response.json() as {antibiogram?:AntibiogramScan}).antibiogram;
   if(!scan)setPhotoNote({kind:'warn',text:t.scanFailed});
   else if(scan.status==='unreadable')setPhotoNote({kind:'warn',text:t.unreadable});
   else{setSample('');setAntibiogram(scan.antibiogram);setPhotoNote({kind:scan.partial?'warn':'done',text:scan.partial?t.readPartial:t.readDone});}
  }catch{setPhotoNote({kind:'warn',text:t.scanFailed});}
  finally{clearTimeout(timeout);setBusy(false);}
 }
 function downloadCsv(){const url=URL.createObjectURL(new Blob([antibiogramCsv(antibiogram)],{type:'text/csv'}));const link=document.createElement('a');link.href=url;link.download=`antibiogram-${antibiogram.organism}.csv`;link.click();URL.revokeObjectURL(url);}
 const panel=[...organism.panel,...(Object.keys(antibiogram.results) as AntibioticId[]).filter(id=>!organism.panel.includes(id))];
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
     <input ref={upload} className="lab-check-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void choosePhoto(file);}}/>
     <input ref={camera} className="lab-check-file" type="file" accept="image/*" capture="environment" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void choosePhoto(file);}}/>
     <div className="button-row"><button type="button" className="secondary" disabled={busy} onClick={()=>camera.current?.click()}><Camera size={18} aria-hidden="true"/> {t.takePhoto}</button><button type="button" className="secondary" disabled={busy} onClick={()=>upload.current?.click()}><ImageUp size={18} aria-hidden="true"/> {t.uploadPhoto}</button></div>
     {photo&&<><img className="lab-check-preview" src={photo} alt="Antibiogram photo to read"/><label className="lab-check-consent" htmlFor="lab-consent"><input id="lab-consent" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t.consent}</span></label><button type="button" className="primary" disabled={!consent||busy} onClick={()=>void readPhoto()}>{busy?t.reading:t.read}</button></>}
     {photoNote&&<p className={`lab-check-photo-note is-${photoNote.kind}`} role={photoNote.kind==='warn'?'alert':'status'}>{photoNote.text}</p>}
    </section>
    <section className="lab-check-entry" aria-labelledby="lab-results-title">
     <label className="lab-check-field" htmlFor="lab-sample"><span>{t.sample}</span><select id="lab-sample" value={sample} onChange={e=>loadSample(e.target.value)}><option value="">{t.samplePlaceholder}</option>{sampleAntibiograms.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
     <label className="lab-check-field" htmlFor="lab-organism"><span>{t.organism}</span><select id="lab-organism" value={antibiogram.organism} onChange={e=>{setSample('');setPhotoNote(null);setAntibiogram({organism:e.target.value as OrganismId,results:{}});}}>{(Object.keys(organisms) as OrganismId[]).map(id=><option key={id} value={id}>{organisms[id].name}</option>)}</select></label>
     <div className="lab-check-results-head"><h2 id="lab-results-title">{t.results}</h2>{entered&&<button type="button" className="text-button" onClick={()=>{setSample('');setPhotoNote(null);setAntibiogram(a=>({...a,results:{}}));}}>{t.clear}</button>}</div>
     <ul className="lab-check-rows">{panel.map(id=><li key={id} className="lab-check-row"><span className="lab-check-drug">{antibiotics[id].name}</span><div className="lab-check-choices" role="radiogroup" aria-label={antibiotics[id].name}>{choices.map(choice=>{const active=(antibiogram.results[id]??null)===choice;return <button key={choice??'none'} type="button" role="radio" aria-checked={active} className={`lab-check-choice${active?' is-active':''}${choice?'':' is-none'}`} onClick={()=>setResult(id,choice)}>{choice??t.notTested}</button>;})}</div></li>)}</ul>
    </section>
   </div>
   <section className="lab-check-report" aria-live="polite" aria-labelledby="lab-findings-title">
    <h2 id="lab-findings-title"><FlaskConical size={22} aria-hidden="true"/> {t.findings}</h2>
    {!entered?<p className="lab-check-empty">{t.empty}</p>:<>
     <p className="lab-check-organism"><em>{organism.name}</em> · {t.classes(check.resistantClasses.length,check.testedClasses)}</p>
     {check.flags.length>0&&<ul className="lab-check-flags">{check.flags.map(flag=><li key={flag.title} className={`lab-check-flag is-${flag.level}`}><span className="lab-check-level">{flag.level==='review'?<TriangleAlert size={16} aria-hidden="true"/>:null}{t.levels[flag.level]}</span><strong>{flag.title}</strong><p>{flag.detail}</p></li>)}</ul>}
     <div className="lab-check-steps"><h3><ListChecks size={20} aria-hidden="true"/> {t.next}</h3><ul>{check.steps.map(step=><li key={step}>{step}</li>)}</ul></div>
     <div className="lab-check-download"><button type="button" className="secondary" onClick={downloadCsv}><Download size={18} aria-hidden="true"/> {t.download}</button><p>{t.downloadNote}</p></div>
    </>}
    <p className="lab-check-limits"><Info size={18} aria-hidden="true"/><span>{t.limits}</span></p>
   </section>
  </div>
 </main>
 </>;
}
