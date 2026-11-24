'use client';

import {useEffect,useRef,useState} from 'react';
import {MessageCircle,X} from 'lucide-react';
import {assess,questions,scenarios,type Scenario} from '@/lib/safety';
import {getPassage} from '@/lib/use-check';
import './ask-resistguard.css';

export type AssistantContext={medicineId?:string;scenario?:Scenario;unclear?:boolean};
export type AssistantSession={context:AssistantContext;explain?:boolean};
type Answer={question:string;text:string;paragraphs?:string[];questions?:string[];sources?:{name:string;url:string}[];notice?:string};

const generalAnswers={
  scan:{question:'How do I photograph the label?',text:'Turn the pack so the ingredient line is horizontal. Use even light and keep the entire ingredient line in frame. If glare hides a word, tilt the pack and try again.'},
  registry:{question:'What does a NAFDAC number tell me?',text:'It points to a product record in the Greenbook. In Catalogue, search the number and compare the complete ingredient list with the pack.',sources:[{name:'NAFDAC Greenbook',url:'https://greenbook.nafdac.gov.ng/'}]},
  amr:{question:'Why does responsible antibiotic use matter?',text:getPassage('amr').text,sources:[getPassage('amr').reference]}
} satisfies Record<string,Answer>;

export default function AskResistGuard({session,onClose,onCatalogue}:{session:AssistantSession;onClose:()=>void;onCatalogue:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null);
  const lastTurn=useRef<HTMLDivElement>(null);
  const controller=useRef<AbortController|null>(null);
  const [turns,setTurns]=useState<Answer[]>([]);
  const [busy,setBusy]=useState(false);
  const context=session.context;
  const selected=context.medicineId?assess(context.medicineId,context.scenario??'general'):null;
  useEffect(()=>{lastTurn.current?.scrollIntoView({block:'nearest'});},[turns.length]);

  useEffect(()=>{
    const el=dialog.current;
    el?.showModal();
    return ()=>{controller.current?.abort();el?.close();};
  },[]);

  function add(answer:Answer){
    controller.current?.abort();
    controller.current=null;
    setBusy(false);
    setTurns(previous=>[...previous,answer]);
  }

  async function explain(scenario:Scenario){
    const result=assess(context.medicineId,scenario);
    if(!result)return;
    controller.current?.abort();
    const request=new AbortController();
    controller.current=request;
    const timeout=setTimeout(()=>request.abort(),23000);
    const fallback:Answer={
      question:scenario==='cold'?'Why doesn’t this antibiotic treat flu?':`Explain ${scenarios[scenario].label.toLowerCase()} simply`,
      text:result.rule.text,paragraphs:[result.medicine.summary,result.medicine.caution],
      questions:[questions.need,questions.interactions],
      sources:[{name:result.medicine.sourceLabel,url:result.medicine.source},...result.sources]
    };
    setBusy(true);
    try {
      const response=await fetch('/api/explain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:context.medicineId,scenario}),signal:request.signal});
      if(!response.ok)throw new Error('Explanation unavailable');
      const data=await response.json();
      if(controller.current===request)setTurns(previous=>[...previous,{...fallback,...data,question:fallback.question}]);
    } catch {
      if(controller.current===request)setTurns(previous=>[...previous,{...fallback,notice:'Showing source guidance while the connection is unavailable.'}]);
    } finally {
      clearTimeout(timeout);
      if(controller.current===request)setBusy(false);
    }
  }

  useEffect(()=>{
    if(session.explain&&context.medicineId)void explain(context.scenario??'general');
    return ()=>{controller.current?.abort();controller.current=null;};
  },[]);

  return <dialog className="ask-panel" ref={dialog} aria-labelledby="ask-title" onCancel={event=>{event.preventDefault();onClose();}}>
    <header className="ask-header">
      <div><h2 id="ask-title"><MessageCircle size={22} aria-hidden="true"/> Ask ResistGuard</h2><p>Medicine labels and antibiotic education</p></div>
      <button autoFocus className="ask-close" aria-label="Close assistant" onClick={onClose}><X size={22}/></button>
    </header>
    <div className="ask-body">
      {selected&&<p className="ask-context">Confirmed ingredient entry · {selected.medicine.name}</p>}
      {context.unclear&&<p className="ask-context">Scan needs a clearer ingredient label</p>}
      <div className="ask-prompts" aria-label="Suggested questions">
        {selected&&<button className="secondary" disabled={busy} onClick={()=>void explain(context.scenario??'general')}>Explain my selected topic</button>}
        {selected?.medicine.antibiotic&&context.scenario!=='cold'&&<button className="secondary" disabled={busy} onClick={()=>void explain('cold')}>Why doesn’t this antibiotic treat flu?</button>}
        {Object.values(generalAnswers).map(answer=><button key={answer.question} className="secondary" disabled={busy} onClick={()=>add(answer)}>{answer.question}</button>)}
      </div>
      <div className="ask-conversation" aria-live="polite">
        {turns.map((turn,index)=><div className="ask-turn" key={index} ref={index===turns.length-1?lastTurn:undefined}>
          <p className="ask-question">{turn.question}</p>
          <div className="ask-answer">
            <p>{turn.text}</p>
            {turn.paragraphs?.length?<ul>{turn.paragraphs.map(text=><li key={text}>{text}</li>)}</ul>:null}
            {turn.questions?.length?<><h3>Ask a pharmacist</h3><ul>{turn.questions.map(text=><li key={text}>{text}</li>)}</ul></>:null}
            {turn.notice&&<p className="field-help">{turn.notice}</p>}
            {turn.sources?.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}
            {turn.question===generalAnswers.registry.question&&<button className="text-button" onClick={onCatalogue}>Open Catalogue</button>}
          </div>
        </div>)}
        {busy&&<p role="status">Preparing the explanation…</p>}
      </div>
    </div>
    <p className="ask-footer">For diagnosis, treatment or personal suitability, speak to a pharmacist or clinician.</p>
  </dialog>;
}
