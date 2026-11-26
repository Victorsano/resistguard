'use client';
// Replaceable hero media. Sits behind the hero on the side opposite --hero-side; knows nothing about the hero's layout.
import {useEffect,useState} from 'react';
import {heroMode,type HeroMedia as Media,type HeroMode} from '@/lib/hero-media';
import './hero-media.css';
type Connection={saveData?:boolean;effectiveType?:string};
export default function HeroMedia({webm,mp4,poster}:Media){
 const [mode,setMode]=useState<HeroMode>('glow');
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection=(navigator as Navigator&{connection?:Connection}).connection;
  const update=()=>setMode(heroMode({webm,mp4,poster},{enabled:process.env.NEXT_PUBLIC_HERO_VIDEO==='1',reducedMotion:motion.matches,saveData:connection?.saveData,effectiveType:connection?.effectiveType}));
  update();motion.addEventListener('change',update);
  return ()=>motion.removeEventListener('change',update);
 },[webm,mp4,poster]);
 return <div className="hero-media" aria-hidden="true">
  <div className="hero-media-glow"/><div className="hero-media-floor"/>
  {mode==='video'&&<video className="hero-media-asset" autoPlay muted loop playsInline preload="metadata" poster={poster} ref={v=>{if(v){v.muted=true;void v.play().catch(()=>{});}}}>{webm&&<source src={webm} type="video/webm"/>}{mp4&&<source src={mp4} type="video/mp4"/>}</video>}
  {mode==='poster'&&poster&&<img className="hero-media-asset" src={poster} alt=""/>}
 </div>;
}
