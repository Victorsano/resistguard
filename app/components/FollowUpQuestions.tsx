'use client';

import type {FollowUpAnswer,FollowUpAnswers,FollowUpQuestion} from '@/lib/check-follow-ups';
import {copy} from '@/lib/screen-copy';

export default function FollowUpQuestions({questions,answers,pending,useAI,onChange,onContinue}:{
 questions:FollowUpQuestion[];
 answers:FollowUpAnswers;
 pending:boolean;
 useAI:boolean;
 onChange:(answers:FollowUpAnswers)=>void;
 onContinue:(useAI:boolean)=>void;
}){
 const t=copy.followUp;
 const ready=!pending&&questions.every(question=>!question.mandatory||Object.hasOwn(answers,question.id));
 return <div className="check-questions follow-up">
  <h1>{t.title}</h1>
  {pending?<p role="status">{t.loading}</p>:<>
   {questions.map(question=><fieldset key={question.id} className="follow-up-field">
    <legend>{question.text}{!question.mandatory&&<small> {t.optional}</small>}</legend>
    <div className="check-questions-toggle">
     {(['yes','no','unsure'] as FollowUpAnswer[]).map(answer=><label key={answer} className="check-questions-choice">
      <input type="radio" name={question.id} value={answer} checked={answers[question.id]===answer}
       onChange={()=>onChange({...answers,[question.id]:answer})}/>
      {t[answer]}
     </label>)}
    </div>
    <a className="follow-up-source" href={question.source.url} target="_blank" rel="noreferrer">{question.source.name} ↗</a>
   </fieldset>)}
   {useAI&&<p className="check-questions-hint" id="follow-up-consent">{t.consent}</p>}
   <button type="button" className="primary check-questions-continue" disabled={!ready}
    aria-describedby={useAI?'follow-up-consent':undefined} onClick={()=>onContinue(useAI)}>{useAI?t.groq:t.finish}</button>
   {useAI&&<button type="button" className="text-button" disabled={!ready} onClick={()=>onContinue(false)}>{copy.questions.localGuidance}</button>}
  </>}
 </div>;
}
