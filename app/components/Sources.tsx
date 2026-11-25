import {allSources} from '@/lib/flow';
import {copy} from '@/lib/screen-copy';
import './sources.css';

export default function Sources(){
 const list=allSources();
 const t=copy.sources;
 return <section className="content-view sources" aria-labelledby="sources-title">
  <h1 id="sources-title" tabIndex={-1} data-screen-heading>{t.title}</h1>
  <p>{t.intro}</p>
  {([[t.medicines,list.medicines],[t.guidance,list.guidance]] as const).map(([heading,items])=><section className="sources-group" key={heading}><h2>{heading}</h2><ul>{items.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name} ↗</a></li>)}</ul></section>)}
 </section>;
}
