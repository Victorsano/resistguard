import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {ArrowRight,ScanLine,MessageCircle,ShieldCheck,LockKeyhole,BadgeInfo,ArrowUpRight} from 'lucide-react';
import {landing as t} from '@/lib/landing-copy';
import {availableHeroMedia} from '@/lib/hero-media';
import HeroMedia from './components/HeroMedia';
import Wordmark from './components/Wordmark';
import Emphasis from './components/Emphasis';
import './landing.css';
const featureIcons={label:ScanLine,pharmacist:MessageCircle,pack:ShieldCheck,privacy:LockKeyhole};
// Only media files that really exist in public/ reach the page.
const media=availableHeroMedia(path=>existsSync(join(process.cwd(),'public',path)));
function Actions({hero}:{hero:boolean}){
 return <div className="landing-actions" data-motion={hero?'hero-cta':undefined}><a className="landing-button" href="/check" data-motion="press"><span>{t.cta}</span><ArrowRight size={22} strokeWidth={2.25} aria-hidden="true"/></a><a className="landing-link" href="/check?example=1" data-motion="press">{t.example}</a></div>;
}
export default function Landing(){
 return <div className="landing on-night">
 <a className="skip-link" href="#main-content">Skip to content</a>
 <header className="landing-bar"><Wordmark/></header>
 <main id="main-content">
  <section className="hero" aria-labelledby="hero-title">
   <HeroMedia {...media}/>
   <div className="hero-copy">
    <p className="hero-eyebrow" data-motion="hero-eyebrow">{t.eyebrow}</p>
    <h1 id="hero-title" className="hero-title"><span className="hero-line-1" data-motion="hero-line-1">{t.line1.before}<br/> {t.line1.after} <em>{t.line1.em}</em>{t.line1.end}</span><span className="hero-line-2" data-motion="hero-line-2">{t.line2}</span></h1>
    <p className="hero-lead" data-motion="hero-lead">{t.lead}</p>
    <Actions hero/>
   </div>
  </section>
  <section className="landing-section landing-stakes" data-motion="reveal" aria-label="Why it matters">
   <p className="landing-stakes-line">{t.stakes}</p>
   <figure className="landing-stat"><p className="landing-stat-figure">{t.stat.figure}</p><figcaption><p>{t.stat.text}</p><a href={t.stat.source.url} target="_blank" rel="noreferrer">{t.stat.source.label}<ArrowUpRight size={18} aria-hidden="true"/></a></figcaption></figure>
  </section>
  <section className="landing-section landing-how" data-motion="reveal" aria-labelledby="how-title">
   <h2 id="how-title" className="landing-side-title">{t.howTitle}</h2>
   <ul className="landing-features">{t.features.map(f=>{const Icon=featureIcons[f.id];return <li key={f.id}><Icon size={26} strokeWidth={1.75} aria-hidden="true"/><h3>{f.title}</h3><p>{f.text}</p></li>;})}</ul>
  </section>
  <section className="landing-section landing-close" data-motion="reveal" aria-labelledby="close-title">
   <h2 id="close-title" className="landing-close-title"><Emphasis text={t.closing.text} word={t.closing.em}/></h2>
   <Actions hero={false}/>
  </section>
 </main>
 <footer className="landing-footer"><Wordmark/><p className="landing-honesty"><BadgeInfo size={20} aria-hidden="true"/>{t.honesty}</p></footer>
 </div>;
}
