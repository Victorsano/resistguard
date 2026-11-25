import {ChevronRight,Info,Pill,List,LockKeyhole} from 'lucide-react';
import {findMedicines} from '@/lib/flow';
import {copy} from '@/lib/screen-copy';
import './find-by-name.css';

export default function FindByName({query,onChoose,onAll}:{query:string;onChoose:(id:string)=>void;onAll:()=>void}){
 const results=findMedicines(query);
 const t=copy.find;
 return <div className="find-by-name">
  {results.length>0&&<ul className="find-by-name-results" aria-label="Matching medicines">{results.map(m=><li key={m.id}><button type="button" onClick={()=>onChoose(m.id)}><span className="find-by-name-name">{m.name}</span><span className={`find-by-name-chip ${m.antibiotic?'find-by-name-chip-antibiotic':'find-by-name-chip-other'}`}>{m.antibiotic?<Pill size={16} aria-hidden="true"/>:<Info size={16} aria-hidden="true"/>}{m.antibiotic?t.antibiotic:t.notAntibiotic}</span><ChevronRight size={20} aria-hidden="true"/></button></li>)}</ul>}
  {query.trim()&&!results.length&&<p className="find-by-name-none" role="status">{t.none}</p>}
  <button type="button" className="text-button find-by-name-all" onClick={onAll}><List size={20} aria-hidden="true"/>{t.all}</button>
  <p className="find-by-name-note"><LockKeyhole size={16} aria-hidden="true"/>{t.note}</p>
 </div>;
}
