'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {Camera,ImageUp} from 'lucide-react';
import {fullPhotoCrop,prepareImage,type PhotoCrop} from '@/lib/image';
import {registrationNumber} from '@/lib/greenbook';
import type {ScanResult} from '@/lib/scan';
import CameraCapture from './CameraCapture';
import PhotoEditor from './PhotoEditor';

type Props={onClose:()=>void}&(
 {mode:'registration';onRead:(number:string)=>void}|
 {mode:'companion';onRead:(ingredients:string[])=>void}
);
type Photo={file:File;original:string;prepared:string;crop:PhotoCrop};

export default function PackPhoto(props:Props){
 const {mode,onClose}=props;
 const registration=mode==='registration';
 const [camera,setCamera]=useState(false);
 const closeCamera=useCallback(()=>setCamera(false),[]);
 const [photo,setPhoto]=useState<Photo|null>(null);
 const [cropOpen,setCropOpen]=useState(false);
 const [ingredients,setIngredients]=useState<string[]>([]);
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const revision=useRef(0);
 const request=useRef<AbortController|null>(null);
 const photoInput=useRef<HTMLInputElement>(null);
 const cameraInput=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{
  revision.current++;
  request.current?.abort();
 },[]);

 async function prepare(file:File,crop:PhotoCrop=fullPhotoCrop){
  request.current?.abort();
  const id=++revision.current;
  setBusy(true);setConsent(false);setError('');setIngredients([]);
  try{
   const prepared=await prepareImage(file,crop);
   if(id===revision.current)setPhoto({file,prepared,crop,original:photo?.file===file?photo.original:prepared});
  }catch(err){
   if(id===revision.current)setError(err instanceof Error?err.message:'We could not open this photo.');
  }finally{
   if(id===revision.current)setBusy(false);
  }
 }
 async function read(){
  if(!photo||!consent||busy)return;
  const controller=new AbortController();
  request.current=controller;
  const timeout=setTimeout(()=>controller.abort(),24_000);
  const id=++revision.current;
  setBusy(true);setError('');setIngredients([]);
  try{
   const response=await fetch('/api/scan',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,image:photo.prepared}),signal:controller.signal
   });
   const result=await response.json() as ScanResult&{registrationNumber?:string|null};
   if(id!==revision.current)return;
   if(registration&&props.mode==='registration'){
    const number=registrationNumber(result.registrationNumber);
    if(number){props.onRead(number);return;}
    setError('We could not read a full NAFDAC number. Try another photo or type the number.');
   }else if(result.observation?.complete&&result.observation.legibility==='clear'&&
     result.observation.productType==='medicine'&&result.observation.ingredients.length){
    setIngredients(result.observation.ingredients);
   }else setError('We could not read the full ingredient list. Try another photo or type the name on the pack.');
  }catch{
   if(id===revision.current)setError('The scan could not finish. Try again or type the details.');
  }finally{
   clearTimeout(timeout);
   if(id===revision.current)setBusy(false);
  }
 }
 return <div className="pack-photo">
  <input ref={photoInput} className="hidden" type="file" accept="image/jpeg,image/png,image/webp"
   onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void prepare(file);}}/>
  <input ref={cameraInput} className="hidden" type="file" accept="image/*" capture="environment"
   onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void prepare(file);}}/>
  <p>{registration?'Photograph the number marked NAFDAC or NRN.':'Photograph the full active ingredient list on the other pack.'}</p>
  {photo&&<img className="pack-photo-preview" src={photo.prepared} alt="Photo to scan"/>}
  {ingredients.length>0&&props.mode==='companion'?<div>
   <p>Does this match the full active ingredient list on your pack?</p>
   <ul>{ingredients.map(item=><li key={item}>{item}</li>)}</ul>
   <button type="button" className="primary" onClick={()=>props.onRead(ingredients)}>Use these ingredients</button>
  </div>:<>
   <div className="pack-photo-controls">
    <button type="button" disabled={busy} className="secondary" onClick={()=>setCamera(true)}><Camera size={18} aria-hidden="true"/> Take photo</button>
    <button type="button" disabled={busy} className="secondary" onClick={()=>photoInput.current?.click()}><ImageUp size={18} aria-hidden="true"/> Upload photo</button>
    {photo&&<button type="button" disabled={busy} className="secondary" onClick={()=>setCropOpen(true)}>Crop and zoom</button>}
   </div>
   {photo&&<><label className="medicine-check-consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/>
    <span>I agree to send this photo to Groq to read the label.</span>
   </label><button type="button" className="primary" disabled={!consent||busy} onClick={()=>void read()}>{registration?'Read the number':'Read the ingredients'}</button></>}
  </>}
  {busy&&<p role="status">Getting the photo ready or reading it…</p>}
  {error&&<p role="alert">{error}</p>}
  <button type="button" className="text-button" onClick={onClose}>Cancel scan</button>
  {camera&&<CameraCapture registration={registration} onClose={closeCamera} onCapture={file=>void prepare(file)} onNative={()=>cameraInput.current?.click()}/>}
  {photo&&cropOpen&&<PhotoEditor image={photo.original} initialCrop={photo.crop} onClose={()=>setCropOpen(false)}
   onApply={crop=>{setCropOpen(false);void prepare(photo.file,crop);}}/>}
 </div>;
}
