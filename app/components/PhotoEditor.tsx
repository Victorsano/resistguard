'use client';

import {useEffect,useRef,useState,type KeyboardEvent,type PointerEvent} from 'react';
import {adjustPhotoCrop,fullPhotoCrop,zoomPhotoCrop,type CropHandle,type PhotoCrop} from '@/lib/image';
import {copy} from '@/lib/screen-copy';
import './photo-editor.css';

const corners=['nw','ne','sw','se'] as const;
const arrows:Record<string,[number,number]>={
 ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]
};

export default function PhotoEditor({image,initialCrop,onApply,onClose}:{
 image:string;
 initialCrop:PhotoCrop;
 onApply:(crop:PhotoCrop)=>void;
 onClose:()=>void;
}){
 const t=copy.photo;
 const modal=useRef<HTMLDialogElement>(null);
 const stage=useRef<HTMLDivElement>(null);
 const drag=useRef<{id:number;handle:CropHandle;crop:PhotoCrop;x:number;y:number;width:number;height:number}|null>(null);
 const [crop,setCrop]=useState(initialCrop);
 const [aspect,setAspect]=useState(4/3);

 useEffect(()=>{
  const dialog=modal.current;
  dialog?.showModal();
  return ()=>dialog?.close();
 },[]);

 function startDrag(event:PointerEvent<HTMLButtonElement>,handle:CropHandle){
  const bounds=stage.current?.getBoundingClientRect();
  if(drag.current||event.button!==0||!bounds?.width||!bounds.height)return;
  event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={id:event.pointerId,handle,crop,x:event.clientX,y:event.clientY,width:bounds.width,height:bounds.height};
 }
 function moveDrag(event:PointerEvent<HTMLButtonElement>){
  const start=drag.current;
  if(start?.id!==event.pointerId)return;
  setCrop(adjustPhotoCrop(start.crop,start.handle,(event.clientX-start.x)/start.width,(event.clientY-start.y)/start.height));
 }
 function endDrag(event:PointerEvent<HTMLButtonElement>){
  if(drag.current?.id===event.pointerId)drag.current=null;
 }
 function keyboard(event:KeyboardEvent<HTMLButtonElement>,handle:CropHandle){
  const direction=Object.hasOwn(arrows,event.key)?arrows[event.key]:null;
  if(!direction)return;
  event.preventDefault();
  const step=event.shiftKey ? .075 : .025;
  setCrop(previous=>adjustPhotoCrop(previous,handle,direction[0]*step,direction[1]*step));
 }

 const zoom=Number((1/Math.max(crop.width,crop.height)).toFixed(1));
 const previewAspect=aspect*crop.width/crop.height;
 const cropStyle={left:crop.x*100+'%',top:crop.y*100+'%',width:crop.width*100+'%',height:crop.height*100+'%'};

 return <dialog ref={modal} className="photo-editor" aria-labelledby="photo-editor-title" onCancel={event=>{event.preventDefault();onClose();}}>
  <h2 id="photo-editor-title">{t.cropTitle}</h2>
  <p>{t.cropHint}</p>
  <div className="photo-editor-stage" ref={stage} style={{aspectRatio:aspect,width:`min(100%, ${aspect*37}dvh)`}}>
   <img src={image} alt="" draggable={false} onLoad={event=>setAspect(event.currentTarget.naturalWidth/event.currentTarget.naturalHeight)}/>
   <button type="button" className="photo-editor-frame" style={cropStyle} aria-label={t.cropMove}
    onPointerDown={event=>startDrag(event,'move')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
    onLostPointerCapture={endDrag} onKeyDown={event=>keyboard(event,'move')}/>
   {corners.map(corner=>{
    const x=crop.x+(corner.endsWith('e')?crop.width:0);
    const y=crop.y+(corner.startsWith('s')?crop.height:0);
    return <button key={corner} type="button" className={`photo-editor-handle photo-editor-handle-${corner}`} aria-label={t.cropCorner[corner]}
     style={{left:`clamp(1rem, ${x*100}%, calc(100% - 1rem))`,top:`clamp(1rem, ${y*100}%, calc(100% - 1rem))`}}
     onPointerDown={event=>startDrag(event,corner)} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
     onLostPointerCapture={endDrag} onKeyDown={event=>keyboard(event,corner)}/>;
   })}
  </div>
  <label className="photo-editor-zoom">
   <span>{t.cropZoom} <output>{zoom}×</output></span>
   <input type="range" min={1} max={8} step={.1} value={zoom} aria-label={t.cropZoom} aria-valuetext={zoom+'×'}
    onChange={event=>{const value=event.currentTarget.valueAsNumber;setCrop(previous=>zoomPhotoCrop(previous,value));}}/>
  </label>
  <figure className="photo-editor-figure">
   <figcaption>{t.cropPreview}</figcaption>
   <div className="photo-editor-preview" style={{aspectRatio:previewAspect,width:`min(100%, ${previewAspect*20}dvh)`}}>
    <img src={image} alt="" draggable={false} style={{width:100/crop.width+'%',height:100/crop.height+'%',left:-crop.x*100/crop.width+'%',top:-crop.y*100/crop.height+'%'}}/>
   </div>
  </figure>
  <div className="photo-editor-actions">
   <button type="button" className="primary" data-motion="press" onClick={()=>onApply(crop)}>{t.cropApply}</button>
   <button type="button" className="secondary" data-motion="press" onClick={()=>setCrop(fullPhotoCrop)}>{t.cropReset}</button>
   <button type="button" className="text-button" data-motion="press" onClick={onClose}>{t.cropCancel}</button>
  </div>
 </dialog>;
}
