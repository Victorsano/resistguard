'use client';

import {useState} from 'react';
import {Search,ArrowUpRight,ArrowRight} from 'lucide-react';
import {medicines,nigeriaCatalogueDetails,nigeriaSources} from '@/lib/safety';
import './catalogue-references.css';

export default function Catalogue({onChoose}:{onChoose:(id:string)=>void}){
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('all');
  const term=query.trim().toLowerCase();
  const results=medicines.map(m=>({m,...nigeriaCatalogueDetails(m.id)})).filter(({m,forms,products})=>{
    if(filter==='antibiotics'&&!m.antibiotic || filter==='other'&&m.antibiotic) return false;
    if(filter==='nigeria'&&!forms.some(form=>['adult','child','euroclox'].includes(form.source))&&!products.length) return false;
    if((filter==='adult'||filter==='child')&&!forms.some(form=>form.source===filter)) return false;
    return [m.name,m.category,...m.ingredients,...products.flatMap(product=>[product.name,product.number])]
      .join(' ').toLowerCase().includes(term);
  });
  return <section className="content-view">
    <h1>Medicine catalogue</h1>
    <p>Look up {medicines.length} generic medicine records and selected Nigerian product references. Compare all active ingredients with the package before confirming a match.</p>
    <div className="catalogue-toolbar">
      <label className="search-field"><Search size={19}/><input type="search" placeholder="Ingredient, brand or NAFDAC number" aria-label="Search catalogue" value={query} onChange={event=>setQuery(event.target.value)}/></label>
      <select value={filter} onChange={event=>setFilter(event.target.value)} aria-label="Filter catalogue">
        <option value="all">All medicines</option><option value="antibiotics">Antibiotics</option><option value="other">Non-antibiotics</option>
        <option value="nigeria">Nigerian sources</option><option value="adult">Nigeria adult list</option><option value="child">Nigeria children’s list</option>
      </select>
    </div>
    <p role="status" className="field-help">{results.length} records shown</p>
    <div className="medicine-grid">{results.map(({m,forms,products})=><article key={m.id}>
      <span className={`pill ${m.antibiotic?'':'non-antibiotic-pill'}`}>{m.antibiotic?'Antibiotic':'Non-antibiotic'}</span>
      <h2>{m.name}</h2>
      <p className="review-label">Pharmacist review pending · Check due {m.reviewDue}</p>
      <p className="ingredient-list">{m.ingredients.join(' + ')}</p>
      <p>{m.summary}</p>
      <p className="catalogue-caution">{m.caution}</p>
      {(forms.length>0||products.length>0)&&<details className="catalogue-references">
        <summary>Formulations and product references</summary>
        <p>Strengths describe the product label. A pharmacist can check which formulation and instructions apply.</p>
        {forms.map(form=><div key={form.source+form.form}>
          <strong>{form.form} · {form.strengths.join(', ')}</strong>
          <a href={form.reference.url} target="_blank" rel="noreferrer">{form.reference.name} · {form.section} ↗</a>
        </div>)}
        {products.map(product=><div key={product.name}>
          <strong>{product.name} · {product.form} · {product.strength}</strong>
          <a href={product.url} target="_blank" rel="noreferrer">NAFDAC Greenbook · {product.number} ↗</a>
          <small>Register status on {product.checked} · {product.registerStatus}</small>
        </div>)}
        {products.length>0&&<p>Greenbook references describe listed products. Check current registration directly in the register and confirm the ingredients on your package.</p>}
      </details>}
      <div className="catalogue-card-footer">
        <button className="secondary" onClick={()=>onChoose(m.id)}>Check this label <ArrowRight size={15}/></button>
        <a href={m.source} target="_blank" rel="noreferrer">{m.sourceLabel}{'sourceSection' in m?` · ${m.sourceSection}`:''} <ArrowUpRight size={14}/></a>
      </div>
    </article>)}</div>
    {!results.length&&<p className="small-note">No entries match this search. Try the generic ingredient printed on the package or ask a pharmacist.</p>}
    <details className="catalogue-references catalogue-source-register">
      <summary>Sources for the Nigerian expansion</summary>
      {Object.values(nigeriaSources).map(source=><div key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a><p>{source.version} · {source.scope}</p></div>)}
    </details>
  </section>;
}
