'use client';

import {useEffect,useRef,useState} from 'react';
import {ArrowRight,BookOpen,ExternalLink,RotateCcw,ShieldCheck} from 'lucide-react';
import {
  conversationTopics,getPassage,retrieveUseEvidence,usePlans,useTopics,validateEvidenceOrder,
  type PassageId,type UsePlan,type UseTopic
} from '@/lib/use-check';
import './use-check.css';

type QuestionTopic=keyof typeof conversationTopics;

function EvidenceCard({id}:{id:PassageId}) {
  const passage=getPassage(id);
  return <article className="use-evidence-card">
    <h3>{passage.title}</h3>
    <p>{passage.text}</p>
    <a href={passage.reference.url} target="_blank" rel="noreferrer">{passage.reference.name} <ExternalLink size={13}/></a>
    <small>{passage.section} · {passage.reference.version} · checked {passage.checked}</small>
  </article>;
}

const lessonSteps=[
  {title:'Antibiotics are valuable',text:'Appropriate antibiotic treatment can be important when a clinician decides it is needed.'},
  {title:'Unnecessary use adds to the problem',text:'Misuse and overuse contribute to drug resistance and make infections harder to treat.'},
  {title:'Your next decision matters',text:'Ask a qualified professional whether an antibiotic is needed, and follow the instructions for your own prescription.'}
];

function ResistanceLesson(){
  const [step,setStep]=useState(0);
  const [choice,setChoice]=useState<'ask'|'reuse'|null>(null);
  return <section className="resistance-lesson" aria-labelledby="resistance-title">
    <div>
      <span className="eyebrow">Interactive AMR lesson</span>
      <h2 id="resistance-title">Why responsible use matters</h2>
      <p>A conceptual illustration of the public-health consequences of antibiotic misuse.</p>
    </div>
    <ol className="lesson-stages" aria-label="Lesson stages">
      {lessonSteps.map((item,index)=><li key={item.title} className={step===index?'lesson-current':''}>
        <button type="button" aria-current={step===index?'step':undefined} onClick={()=>setStep(index)}>
          <span className="lesson-number">{index+1}</span><span>{item.title}</span>
        </button>
      </li>)}
    </ol>
    <div className="lesson-reading" aria-live="polite">
      <h3>{lessonSteps[step].title}</h3>
      <p>{lessonSteps[step].text}</p>
    </div>
    <div className="lesson-controls">
      <button className="secondary" disabled={step===0} onClick={()=>setStep(step-1)}>Previous</button>
      {step<lessonSteps.length-1?<button className="primary" onClick={()=>setStep(step+1)}>Next <ArrowRight size={16}/></button>:
        <button className="primary" onClick={()=>{setStep(0);setChoice(null);}}><RotateCcw size={16}/> Replay</button>}
      <span>Step {step+1} of {lessonSteps.length}</span>
    </div>
    <div className="lesson-choice">
      <h3>Try a decision</h3>
      <p>Someone feels unwell and finds antibiotics left over from a previous illness. What could they do next?</p>
      <div className="lesson-controls">
        <button className="secondary" aria-pressed={choice==='reuse'} onClick={()=>setChoice('reuse')}>Use the leftovers</button>
        <button className="secondary" aria-pressed={choice==='ask'} onClick={()=>setChoice('ask')}>Ask a healthcare professional</button>
      </div>
      {choice&&<div className="lesson-feedback" role="status">
        <strong>{choice==='reuse'?'Pause and reconsider':'A constructive next step'}</strong>
        <p>{choice==='reuse'?'The antibiotic was prescribed for a different situation. Reusing it can delay appropriate care and lead to unnecessary antibiotic use.':'A professional can help establish what care is needed and explain whether an antibiotic is appropriate.'}</p>
        <a href={getPassage('leftovers').reference.url} target="_blank" rel="noreferrer">Read the CDC guidance <ExternalLink size={13}/></a>
      </div>}
    </div>
    <a className="use-source-link" href="https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance" target="_blank" rel="noreferrer">Read the WHO AMR fact sheet <ExternalLink size={13}/></a>
  </section>;
}

export default function UseCheck(){
  const [topic,setTopic]=useState<UseTopic>('general');
  const [plan,setPlan]=useState<UsePlan|null>(null);
  const [reviewed,setReviewed]=useState(false);
  const [topics,setTopics]=useState<QuestionTopic[]>([]);
  const [order,setOrder]=useState<PassageId[]>([]);
  const [aiStatus,setAiStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const abort=useRef<AbortController|null>(null);
  const result=useRef<HTMLHeadingElement>(null);
  useEffect(()=>()=>abort.current?.abort(),[]);
  useEffect(()=>{if(reviewed) result.current?.focus();},[reviewed]);

  function selectTopic(next:UseTopic){
    abort.current?.abort();
    abort.current=null;
    setTopic(next);setPlan(null);setReviewed(false);setTopics([]);setOrder([]);setAiStatus('');setBusy(false);
  }
  function selectPlan(next:UsePlan){
    setPlan(next);setReviewed(false);
  }
  async function organise(){
    const controller=new AbortController();
    abort.current?.abort();abort.current=controller;
    setBusy(true);setAiStatus('');
    const timeout=setTimeout(()=>controller.abort(),23000);
    try {
      const response=await fetch('/api/use-evidence',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic}),signal:controller.signal
      });
      if(!response.ok) throw new Error('Cannot organise');
      const data=await response.json();
      const ids=validateEvidenceOrder(JSON.stringify({passageIds:data.passageIds}),retrieveUseEvidence(topic).map(p=>p.id));
      if(abort.current!==controller) return;
      setOrder(ids);
      setAiStatus(data.mode==='AI-organised source-based education'?'AI organised the retrieved source passages. All safety information is retained.':'Source-based education is available without AI.');
    } catch {
      if(abort.current===controller) setAiStatus('The AI request could not finish. Read the source passages below.');
    } finally {
      clearTimeout(timeout);
      if(abort.current===controller) setBusy(false);
    }
  }
  const baseIds=retrieveUseEvidence(topic).map(p=>p.id);
  const antibioticExample=useTopics[topic].kind==='antibiotic';
  const selectedIds=order.length?order:baseIds;
  const planPassage=antibioticExample&&plan?usePlans[plan].passage:null;
  const evidenceIds=selectedIds.filter(id=>id!==planPassage);

  return <section className="content-view use-check">
    <div className="use-intro">
      <div>
        <span className="eyebrow">Antibiotic use & resistance</span>
        <h1>Before taking<br/><em>an antibiotic.</em></h1>
        <p>Explore a common situation, recognise a risky assumption, and prepare for a conversation with a pharmacist.</p>
      </div>
      <aside className="use-intro-note"><ShieldCheck size={25}/><strong>Education only</strong><p>Use the examples to learn. For individual treatment or medicine-safety decisions, ask a qualified clinician or pharmacist.</p></aside>
    </div>
    <div className="use-check-workspace">
      <section className="use-questions">
        <h2>Choose a situation</h2>
        <p>Try one of these fictional examples. No health history or personal details are needed.</p>
        <div className="use-topic-options">
          {Object.entries(useTopics).map(([id,item])=><button key={id} className="use-topic-button" aria-pressed={topic===id} onClick={()=>selectTopic(id as UseTopic)}>{item.title}</button>)}
        </div>
        <div className="use-example" aria-live="polite"><span className="eyebrow">Example</span><p>{useTopics[topic].example}</p></div>
        {antibioticExample&&<fieldset className="use-fieldset">
          <legend>How would they use the antibiotic?</legend>
          {Object.entries(usePlans).map(([key,item])=><label key={key} className="use-radio">
            <input type="radio" name="use-plan" value={key} checked={plan===key} onChange={()=>selectPlan(key as UsePlan)}/><span>{item.label}</span>
          </label>)}
        </fieldset>}
        <fieldset className="use-fieldset">
          <legend>Prepare questions for a pharmacist</legend>
          <p>Select conversation topics to include. These choices stay on this page.</p>
          {(Object.keys(conversationTopics) as QuestionTopic[]).map(key=><label key={key} className="use-radio">
            <input type="checkbox" checked={topics.includes(key)} onChange={event=>setTopics(previous=>event.target.checked?[...previous,key]:previous.filter(item=>item!==key))}/>
            <span>{({age:'Age / child care',allergy:'Allergies',medicines:'Other medicines',pregnancy:'Pregnancy or breastfeeding',conditions:'Existing health conditions'})[key]}</span>
          </label>)}
        </fieldset>
        <button className="primary" disabled={antibioticExample&&!plan} onClick={()=>setReviewed(true)}>See what to consider <ArrowRight size={16}/></button>
        {antibioticExample&&!plan&&<p className="field-help">Choose how the medicine would be used first.</p>}
      </section>
      <section className="use-result" aria-label="Educational result">
        {reviewed?<><span className="eyebrow">Source-linked education</span>
          <h2 tabIndex={-1} ref={result}>{antibioticExample&&plan?usePlans[plan].title:'Ask for a medicine-safety review'}</h2>
          <p>Consider the following points with a pharmacist. Professional content review is pending.</p>
          {planPassage&&<div className="use-priority"><EvidenceCard id={planPassage}/></div>}
          {evidenceIds.map(id=><EvidenceCard key={id} id={id}/>)}
          {antibioticExample&&<div className="use-ai">
            <button className="secondary" disabled={busy} onClick={organise}><BookOpen size={16}/>{busy?'Organising evidence…':'Organise the evidence with AI'}</button>
            <p className="field-help">Only the example topic and public evidence are used. Your selected answers and conversation topics stay in the browser.</p>
            <p role="status">{aiStatus}</p>
          </div>}
          <div className="use-next"><h3>Take these questions with you</h3><ul>
            <li>Can you check what care is appropriate in this situation?</li>
            {topics.map(key=><li key={key}>{conversationTopics[key]}</li>)}
          </ul>
          {topics.includes('age')&&<p>{getPassage('children').text} <a href={getPassage('children').reference.url} target="_blank" rel="noreferrer">CDC guidance</a></p>}
          </div>
          <button className="text-button" onClick={()=>selectTopic(topic)}><RotateCcw size={15}/> Reset this example</button>
        </>:<div className="use-empty"><BookOpen size={38}/><h2>Why do you want to use it?</h2><p>Choose a situation and a possible action. The explanation will show the relevant public guidance and the questions you can bring to a pharmacist.</p></div>}
      </section>
    </div>
    <ResistanceLesson/>
  </section>;
}
