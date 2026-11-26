'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Camera,ImageUp,ScanLine,Check,ArrowLeft,ArrowRight,Search,LoaderCircle,Clock,PauseCircle,Keyboard,RotateCcw} from 'lucide-react';
import {medicines} from '@/lib/safety';
import {unavailableScan,type ScanResult} from '@/lib/scan';
import {prepareImage} from '@/lib/image';
import {scanRecovery} from '@/lib/scan-guide';
import {scanOutcome,staysOnPhoto,capitalise,emptyCheckDetails,type Screen,type Route} from '@/lib/flow';
import {unlistedWhatsAppLink} from '@/lib/next-steps';
import {copy} from '@/lib/screen-copy';
import CameraCapture from './CameraCapture';
import Catalogue from './Catalogue';
import FindByName from './FindByName';
import Answer from './Answer';
import CheckQuestions from './CheckQuestions';
import {PharmacistButton} from './NextSteps';
import Emphasis from './Emphasis';
import './medicine-check.css';
type Scan=ScanResult&{reason?:string};
const nextQuestionScreen={reason:'prescription',prescription:'other-medicines','other-medicines':'answer'} as const;
export default function MedicineCheck({command,aiPaused=false,example=false}:{command:{screen:'home'|'find';n:number};aiPaused?:boolean;example?:boolean}){
 const [screen,setScreen]=useState<Screen>('home');const [route,setRoute]=useState<Route>('scan');const [query,setQuery]=useState('');
 const [selected,setSelected]=useState('');const [declined,setDeclined]=useState(false);
 const [details,setDetails]=useState(emptyCheckDetails);
 const [medicineName,setMedicineName]=useState('');
 const [photo,setPhoto]=useState<string|null>(null);const [consent,setConsent]=useState(false);const [busy,setBusy]=useState<'preparing'|'scan'|null>(null);const [error,setError]=useState('');const [scan,setScan]=useState<Scan|null>(null);const [timedOut,setTimedOut]=useState(false);const [camera,setCamera]=useState(false);
 const [readiness,setReadiness]=useState<'checking'|'available'|'unavailable'>(aiPaused?'unavailable':'checking');
 const file=useRef<HTMLInputElement>(null);const native=useRef<HTMLInputElement>(null);const abort=useRef<AbortController|null>(null);const revision=useRef(0);const root=useRef<HTMLDivElement>(null);const focusNext=useRef(false);
 const candidate=medicines.find(m=>m.id===selected);const outcome=scan?scanOutcome(scan,timedOut):null;const t=copy;const paused=readiness==='unavailable';
 const askingQuestions=screen==='reason'||screen==='prescription'||screen==='other-medicines';
 useEffect(()=>{
   const controller=new AbortController();
   let current=true;
   const timeout=setTimeout(()=>controller.abort(),8000);
   fetch('/api/readiness',{signal:controller.signal}).then(r=>r.ok?r.json():null)
     .then(data=>{if(current)setReadiness(data?.ai==='available'?'available':'unavailable');})
     .catch(()=>{if(current)setReadiness('unavailable');})
     .finally(()=>clearTimeout(timeout));
   return ()=>{current=false;clearTimeout(timeout);controller.abort();};
 },[]);
 useEffect(()=>()=>{abort.current?.abort();revision.current++;},[]);
 // /check?example=1 from the landing page starts the same sample as the "See an example" button.
 useEffect(()=>{if(example)loadSample('amoxicillin.png');},[example]);
 // Each screen starts at the top, and keyboard and screen-reader focus moves to its heading.
 useEffect(()=>{window.scrollTo({top:0});if(!focusNext.current)return;focusNext.current=false;const heading=root.current?.querySelector<HTMLElement>('[data-screen-heading], h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}},[screen,declined]);
 useEffect(()=>{if(command.n)go(command.screen);},[command]);
 const closeCamera=useCallback(()=>setCamera(false),[]);
 function go(next:Screen){
  focusNext.current=true;
  if(next==='home'||next==='find'){setQuery('');clearDetails();}
  setScreen(next);
 }
 function cancel(){abort.current?.abort();abort.current=null;revision.current++;setBusy(null);}
 function clearDetails(){setDetails(emptyCheckDetails);setMedicineName('');}
 function clearScan(){setScan(null);setTimedOut(false);setDeclined(false);setSelected('');clearDetails();}
 function reset(){cancel();clearScan();setPhoto(null);setConsent(false);setError('');go('home');}
 function back(){
  cancel();
  switch(screen){
   case 'answer': go('other-medicines'); break;
   case 'other-medicines': go('prescription'); break;
   case 'prescription': go('reason'); break;
   case 'reason': go('confirm'); break;
   case 'confirm': go(route==='scan'?'photo':route==='catalogue'?'catalogue':'find'); break;
   case 'catalogue': go('find'); break;
   default: go('home');
  }
 }
 function chooseMedicine(id:string,from:Route){cancel();clearScan();setSelected(id);setRoute(from);go('confirm');}
 function typeName(){cancel();go('find');}
 function decline(){focusNext.current=true;setDeclined(true);clearDetails();}
 async function choosePhoto(value:File|undefined){if(!value)return;cancel();clearScan();setRoute('scan');const token=revision.current;setBusy('preparing');setError('');setConsent(false);setPhoto(null);go('photo');
 try{const image=await prepareImage(value);if(token===revision.current)setPhoto(image);}catch(e){if(token===revision.current)setError(e instanceof Error?e.message:'Could not prepare the image.');}finally{if(token===revision.current)setBusy(null);if(file.current)file.current.value='';if(native.current)native.current.value='';}}
 function loadSample(name:string){fetch(`/test-labels/${encodeURIComponent(name)}`).then(r=>{if(!r.ok)throw new Error();return r.blob();}).then(blob=>void choosePhoto(new File([blob],name,{type:'image/png'}))).catch(()=>setError('Could not load the sample. Upload a photo instead.'));}
 async function readLabel(){if(!photo||!consent||readiness!=='available')return;cancel();const token=revision.current;const controller=new AbortController();abort.current=controller;let expired=false;const timeout=setTimeout(()=>{expired=true;controller.abort();},25_000);setBusy('scan');setError('');clearScan();setRoute('scan');
 try{const response=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:photo}),signal:controller.signal});const data:Scan=await response.json();if(token!==revision.current)return;if(!data.status||!data.title)throw new Error();setScan(data);if(data.id&&medicines.some(m=>m.id===data.id))setSelected(data.id);if(!staysOnPhoto(scanOutcome(data)))go('confirm');}
 catch{if(token===revision.current){setTimedOut(expired);setScan(unavailableScan('The scan could not finish. Check your connection or try again.'));}}finally{clearTimeout(timeout);if(token===revision.current)setBusy(null);}}
 const backButton=<button type="button" data-motion="press" className="text-button medicine-check-back" onClick={back}><ArrowLeft size={20} aria-hidden="true"/>{t.back}</button>;
 const chips=(names:readonly string[])=><ul className="medicine-check-chips" aria-label="Ingredients">{names.map(n=><li key={n}>{capitalise(n)}</li>)}</ul>;
 const retakeRow=<div className="medicine-check-actions"><button type="button" data-motion="press" className="primary" onClick={()=>setCamera(true)}><Camera size={22} aria-hidden="true"/>{t.confirm.retake}</button><button type="button" data-motion="press" className="secondary" onClick={typeName}><Keyboard size={22} aria-hidden="true"/>{t.confirm.typeName}</button></div>;
 return <div className="medicine-check" ref={root}>
 <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Upload a medicine photo" onChange={e=>choosePhoto(e.target.files?.[0])}/><input ref={native} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Use phone camera" onChange={e=>choosePhoto(e.target.files?.[0])}/>
 {(screen==='home'||screen==='find')&&<section data-motion="screen" className={`medicine-check-screen medicine-check-start medicine-check-${screen}${paused?' medicine-check-paused':''}`}>
  {screen==='find'&&backButton}
  {screen==='home'?<div className="medicine-check-intro"><h1><Emphasis text={t.home.title} word={t.home.titleEm}/></h1><p className="medicine-check-lead">{t.home.subline}</p>{paused?<p className="note medicine-check-paused-note" role="status"><PauseCircle size={22} aria-hidden="true"/>{t.photo.paused}</p>:<div className="medicine-check-actions"><button type="button" data-motion="press" className="primary" onClick={()=>setCamera(true)}><Camera size={22} aria-hidden="true"/>{t.home.scan}</button><button type="button" data-motion="press" className="secondary" onClick={()=>file.current?.click()}><ImageUp size={22} aria-hidden="true"/>{t.home.upload}</button></div>}</div>:<h1>{t.find.title}</h1>}
  <label className="medicine-check-search-label"><span>{screen==='home'?t.home.search:t.find.search}</span><span className="medicine-check-search"><Search size={22} aria-hidden="true"/><input type="search" enterKeyHint="search" autoComplete="off" value={query} onChange={e=>{setQuery(e.target.value);if(screen==='home'&&e.target.value.trim())setScreen('find');}}/></span></label>
  {screen==='home'?<div className="medicine-check-home-foot">{!paused&&<button type="button" data-motion="press" className="text-button medicine-check-example" onClick={()=>loadSample('amoxicillin.png')}><ScanLine size={20} aria-hidden="true"/>{t.home.example}</button>}{error&&<p className="status" role="alert">{error}</p>}{!paused&&<p className="medicine-check-trust">{t.home.trust}</p>}</div>:<FindByName query={query} onChoose={id=>chooseMedicine(id,'name')} onAll={()=>go('catalogue')}/>}
 </section>}
 {screen==='catalogue'&&<section data-motion="screen" className="medicine-check-screen medicine-check-catalogue">{backButton}<Catalogue onChoose={id=>chooseMedicine(id,'catalogue')}/></section>}
 {screen==='photo'&&<section data-motion="screen" className="medicine-check-screen medicine-check-photo">{backButton}<h1>{t.photo.title}</h1>
  <div className="medicine-check-preview">{photo?<img src={photo} alt="Your medicine label photo"/>:<p role="status">{busy==='preparing'?t.photo.preparing:error}</p>}</div>
  <div className="medicine-check-actions medicine-check-pair"><button type="button" data-motion="press" className="secondary" disabled={busy==='scan'} onClick={()=>setCamera(true)}><Camera size={20} aria-hidden="true"/>{t.photo.retake}</button><button type="button" data-motion="press" className="secondary" disabled={busy==='scan'} onClick={()=>file.current?.click()}><ImageUp size={20} aria-hidden="true"/>{t.photo.another}</button></div>
  {photo&&error&&<p className="status" role="alert">{error}</p>}
  <ul className="medicine-check-tips">{t.photo.tips.map(tip=><li key={tip}><Check size={20} aria-hidden="true"/>{tip}</li>)}</ul>
  <div className="medicine-check-scan-state" data-motion="scan-state">{readiness==='unavailable'||outcome==='paused'?<div className="medicine-check-state note" role="status"><p><PauseCircle size={22} aria-hidden="true"/>{t.photo.paused}</p><button type="button" data-motion="press" className="primary" onClick={typeName}><Keyboard size={22} aria-hidden="true"/>{t.photo.typeName}</button></div>
  :outcome==='timeout'||outcome==='failed'?<div className="medicine-check-state note" role="alert"><p><Clock size={22} aria-hidden="true"/>{outcome==='timeout'?t.photo.timeout:scan?.message}</p><div className="medicine-check-actions"><button type="button" data-motion="press" className="primary" onClick={readLabel}><RotateCcw size={22} aria-hidden="true"/>{t.photo.tryAgain}</button><button type="button" data-motion="press" className="secondary" onClick={typeName}><Keyboard size={22} aria-hidden="true"/>{t.photo.typeInstead}</button></div></div>
  :<><label className="medicine-check-consent"><input type="checkbox" checked={consent} disabled={busy==='scan'||!photo} onChange={e=>setConsent(e.target.checked)}/><span>{t.photo.consent} <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">{t.photo.consentLink} ↗</a></span></label>
   <button type="button" data-motion="press" className="primary medicine-check-read" disabled={readiness!=='available'||!consent||!photo||!!busy} onClick={readLabel}>{busy==='scan'?<LoaderCircle size={22} className="spinner" aria-hidden="true"/>:<ScanLine size={22} aria-hidden="true"/>}{busy==='scan'?t.photo.loading:t.photo.read}{busy!=='scan'&&<ArrowRight size={20} aria-hidden="true"/>}</button>
   <p className="medicine-check-help" role="status">{busy==='scan'?t.photo.loadingNote:readiness==='checking'?t.photo.checking:''}</p></>}</div>
 </section>}
 {screen==='confirm'&&<section data-motion="screen" className="medicine-check-screen medicine-check-confirm">{backButton}
  {declined?<div className="medicine-check-state"><h1>{t.confirm.exitTitle}</h1><p className="medicine-check-lead">{t.confirm.exitBody}</p>{retakeRow}</div>
  :route!=='scan'&&candidate?<><h1>{t.confirm.chosen(candidate.name)}</h1>{chips(candidate.ingredients)}<p className="medicine-check-lead">{t.confirm.instruction}</p><ConfirmButtons onYes={()=>go('reason')} onNo={decline}/></>
  :outcome==='match'&&candidate?<><h1>{t.confirm.title}</h1>{chips(candidate.ingredients)}<p className="medicine-check-lead">{t.confirm.instruction}</p><p className="medicine-check-note">{t.confirm.note}</p><ConfirmButtons onYes={()=>go('reason')} onNo={decline}/></>
  :outcome==='not_listed'?<><h1>{t.confirm.notListed}</h1>{scan?.observation?.ingredients.length?chips(scan.observation.ingredients):null}<p className="medicine-check-lead">{t.confirm.notListedNote}</p><div className="medicine-check-actions"><PharmacistButton href={unlistedWhatsAppLink(scan?.observation?.ingredients??[],process.env.NEXT_PUBLIC_PHARMACIST_WHATSAPP)}/><button type="button" data-motion="press" className="secondary" onClick={()=>setCamera(true)}><Camera size={22} aria-hidden="true"/>{t.confirm.retake}</button></div></>
  :outcome==='not_medicine'?<><h1>{t.confirm.notMedicineTitle}</h1><p className="medicine-check-lead">{t.confirm.notMedicineBody}</p>{retakeRow}</>
  :outcome==='brand_only'?<><h1>{t.confirm.brandTitle}</h1><p className="medicine-check-lead">{t.confirm.brandBody}</p>{retakeRow}</>
  :<><h1>{t.confirm.unreadable}</h1><div className="medicine-check-tip"><strong>{scanRecovery(scan?.observation).title}</strong><p>{scanRecovery(scan?.observation).tip}</p></div>{retakeRow}</>}
 </section>}
 {askingQuestions&&candidate&&<section data-motion="screen" className="medicine-check-screen">
  {backButton}
  <CheckQuestions step={screen} details={details} medicineName={medicineName} onChange={setDetails} onMedicineName={setMedicineName} onContinue={()=>go(nextQuestionScreen[screen])}/>
 </section>}
 {screen==='answer'&&candidate&&<div data-motion="screen" className="medicine-check-screen medicine-check-answer">{backButton}<Answer medicine={candidate} details={details} onAnother={reset}/></div>}
 {camera&&<CameraCapture onClose={closeCamera} onCapture={choosePhoto} onNative={()=>native.current?.click()}/>}
 </div>;
}
function ConfirmButtons({onYes,onNo}:{onYes:()=>void;onNo:()=>void}){
 return <div className="medicine-check-actions"><button type="button" data-motion="press" className="primary" onClick={onYes}><Check size={22} aria-hidden="true"/>{copy.confirm.yes}</button><button type="button" data-motion="press" className="secondary" onClick={onNo}>{copy.confirm.no}</button></div>;
}
