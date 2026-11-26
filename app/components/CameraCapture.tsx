'use client';
import {useEffect,useRef,useState} from 'react';
import {copy} from '@/lib/screen-copy';
import './camera-capture.css';
import {Camera,RefreshCw,X,ImageUp} from 'lucide-react';
export default function CameraCapture({onCapture,onClose,onNative}:{onCapture:(file:File)=>void;onClose:()=>void;onNative:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const video=useRef<HTMLVideoElement>(null);const stream=useRef<MediaStream|null>(null);const generation=useRef(0);
 const [facing,setFacing]=useState<'environment'|'user'>('environment');const [ready,setReady]=useState(false);const [error,setError]=useState('');
 function stop(){generation.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;}
 useEffect(()=>{const focus=document.activeElement as HTMLElement|null;const modal=dialog.current;modal?.showModal();const hidden=()=>{if(document.hidden){stop();onClose();}};document.addEventListener('visibilitychange',hidden);return()=>{stop();modal?.close();document.removeEventListener('visibilitychange',hidden);focus?.focus();};},[onClose]);
 useEffect(()=>{
 let disposed=false;stop();const token=generation.current;setReady(false);setError('');
 async function start(){
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
 if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access needs HTTPS or localhost and a supported browser.');
 timer=setTimeout(()=>{if(!disposed)setError('Still waiting for the camera. Check the browser permission prompt, or use the photo picker below.');},15_000);
 const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1600},height:{ideal:1200}},audio:false});
 if(disposed||token!==generation.current){next.getTracks().forEach(t=>t.stop());return;}
 stream.current=next;next.getVideoTracks().forEach(t=>{t.onended=()=>{if(!disposed){setReady(false);setError('The camera stopped. Close this window and open it again, or upload a photo.');}};});if(video.current){video.current.srcObject=next;await video.current.play();if(disposed||token!==generation.current)return;setError('');setReady(true);}
 }catch(e){if(disposed)return;stop();setReady(false);const name=e instanceof DOMException?e.name:'';setError(name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser, use your phone camera, or upload a photo.':name==='NotFoundError'?'No camera was found. Connect a camera or upload a photo.':name==='NotReadableError'?'Your camera is busy in another app. Close that app or upload a photo.':e instanceof Error?e.message:'Could not open the camera. Upload a photo instead.');}finally{clearTimeout(timer);}
 }void start();return()=>{disposed=true;stop();};
 },[facing]);
 async function capture(){
 const v=video.current;if(!v?.videoWidth)return;
 const canvas=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(v.videoWidth,v.videoHeight));canvas.width=Math.round(v.videoWidth*scale);canvas.height=Math.round(v.videoHeight*scale);canvas.getContext('2d')?.drawImage(v,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob){setError('Could not capture this frame. Please try again.');return;}
 stop();onCapture(new File([blob],'camera-label.jpg',{type:'image/jpeg'}));onClose();
 }
 return <dialog ref={dialog} className="camera-dialog" onCancel={e=>{e.preventDefault();stop();onClose();}} aria-labelledby="camera-title"><div className="camera-heading"><div><h2 id="camera-title">Frame the ingredient label</h2></div><button data-motion="press" className="icon-button" onClick={()=>{stop();onClose();}} aria-label="Close camera"><X size={22} aria-hidden="true"/>{copy.camera.close}</button></div><p>Keep the full label in focus. Nothing is sent until you check the photo and choose Read the label.</p><div className="camera-view"><video ref={video} playsInline muted autoPlay aria-label="Live camera preview"/>{!ready&&!error&&<span className="camera-overlay">Opening camera…</span>}{error&&<div className="camera-error" role="alert"><Camera size={32}/><p>{error}</p></div>}{ready&&<div className="camera-frame" aria-hidden="true"/>}</div><div className="button-row"><button data-motion="press" className="secondary" disabled={!ready} onClick={()=>setFacing(f=>f==='environment'?'user':'environment')}><RefreshCw size={16}/>Switch camera</button><button data-motion="press" className="primary" disabled={!ready} onClick={capture}><Camera size={17}/>Take photo</button></div><button data-motion="press" className="text-button" onClick={()=>{stop();onClose();onNative();}}><ImageUp size={16}/>Use phone camera / photo picker instead</button><small>Camera access stops when you close this window, take a photo or leave the tab.</small></dialog>;
}
