'use client';

import {useEffect,useRef,useState} from 'react';
import {ChevronDown,Search} from 'lucide-react';
import {compareRegisteredIngredients,registrationNumber,type GreenbookLookup} from '@/lib/greenbook';
import PackPhoto from './PackPhoto';

export default function GreenbookCheck({ingredients,suggestedNumber,aiAvailable}:{
 ingredients:readonly string[];
 suggestedNumber?:string|null;
 aiAvailable:boolean;
}){
 const [input,setInput]=useState(suggestedNumber??'');
 const [lookup,setLookup]=useState<GreenbookLookup|null>(null);
 const [busy,setBusy]=useState(false);
 const [photo,setPhoto]=useState(false);
 const current=useRef<AbortController|null>(null);
 const number=registrationNumber(input);
 useEffect(()=>()=>current.current?.abort(),[]);

 function changeNumber(value:string){
  current.current?.abort();current.current=null;
  setBusy(false);setLookup(null);setInput(value);
 }
 async function check(){
  if(!number||busy)return;
  const controller=new AbortController();
  current.current=controller;
  const timeout=setTimeout(()=>controller.abort(),14_000);
  setBusy(true);setLookup(null);
  try{
   const response=await fetch('/api/greenbook',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({number}),signal:controller.signal
   });
   const result=await response.json() as GreenbookLookup;
   if(current.current===controller)setLookup(response.ok?result:{status:'unavailable'});
  }catch{
   if(current.current===controller)setLookup({status:'unavailable'});
  }finally{
   clearTimeout(timeout);
   if(current.current===controller){current.current=null;setBusy(false);}
  }
 }
 const record=lookup?.status==='found'?lookup.record:null;
 const comparison=record?compareRegisteredIngredients(ingredients,record.ingredients):null;

 return <details className="answer-sources" id="registration-check">
  <summary>Check NAFDAC registration<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
  <div className="answer-expanded registration-check">
   {suggestedNumber&&<p>Check that the number read from the photo matches the one on your pack.</p>}
   <form onSubmit={event=>{event.preventDefault();void check();}}>
    <label className="check-questions-field"><span>NAFDAC registration number</span>
     <input value={input} maxLength={40} placeholder="For example, A4-8312" autoComplete="off" autoCapitalize="characters"
      onChange={event=>changeNumber(event.target.value)}/>
    </label>
    <button type="submit" className="primary" disabled={!number||busy}><Search size={18} aria-hidden="true"/> Look up registration</button>
   </form>
   {aiAvailable&&!photo&&<button type="button" className="text-button" onClick={()=>setPhoto(true)}>Scan the number on the pack</button>}
   {photo&&<PackPhoto mode="registration" onClose={()=>setPhoto(false)} onRead={value=>{changeNumber(value);setPhoto(false);}}/>}
   {busy&&<p role="status">Looking in the NAFDAC Greenbook…</p>}
   {record&&<div aria-live="polite">
    <h3>{record.name}</h3>
    <dl className="answer-medicine-record">
     <dt>NAFDAC number</dt><dd>{record.number}</dd>
     <dt>Registration status</dt><dd>{record.status}</dd>
     {record.ingredients&&<><dt>Active ingredients</dt><dd>{record.ingredients}</dd></>}
     {record.strength&&<><dt>Strength</dt><dd>{record.strength}</dd></>}
     {record.manufacturer&&<><dt>Manufacturer</dt><dd>{record.manufacturer}</dd></>}
    </dl>
    <p>{comparison==='match'?'The listed ingredients match those you confirmed. Compare the name and strength with your pack.':
     comparison==='mismatch'?'The listed ingredients differ from those you confirmed. Recheck the number and the pack with a pharmacist.':
     'Compare the ingredients, name, and strength with your pack.'}</p>
    <a href={record.url} target="_blank" rel="noreferrer">Source · NAFDAC Greenbook ↗</a>
   </div>}
   {lookup?.status==='not_found'&&<p role="status">The Greenbook search returned no exact match. Check the number on the pack. Some records may be missing from the search.</p>}
   {lookup?.status==='ambiguous'&&<p role="status">The Greenbook returned more than one possible record. Ask a pharmacist to compare the pack.</p>}
   {lookup?.status==='unavailable'&&<p role="status">The Greenbook lookup is unavailable right now. You can try again.</p>}
   <p className="next-steps-note">The Greenbook checks product registration. Confirming an individual pack requires a separate check.</p>
  </div>
 </details>;
}
