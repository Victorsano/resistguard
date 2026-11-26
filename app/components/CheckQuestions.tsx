import {useRef,useState} from 'react';
import {addMedicineName,type CheckDetails,type CheckQuestion,type YesNo} from '@/lib/flow';
import {findOtherMedicines} from '@/lib/check-guidance';
import PackPhoto from './PackPhoto';
import {copy} from '@/lib/screen-copy';
import './check-questions.css';

type Props={
 step:CheckQuestion;
 details:CheckDetails;
 medicineName:string;
 aiAvailable:boolean;
 onChange:(details:CheckDetails)=>void;
 onMedicineName:(name:string)=>void;
 onContinue:(details:CheckDetails,useAI:boolean)=>void;
};

const t=copy.questions;

function YesNoToggle({value,onChange}:{value:YesNo|null;onChange:(answer:YesNo)=>void}){
 return <fieldset className="check-questions-toggle" aria-labelledby="check-question-title">
  {(['yes','no'] as const).map(answer=><label key={answer} className="check-questions-choice" data-motion="press">
   <input type="radio" name="check-question-choice" value={answer} checked={value===answer} onChange={()=>onChange(answer)}/>
   {t[answer]}
  </label>)}
 </fieldset>;
}

export default function CheckQuestions({step,details,medicineName,aiAvailable,onChange,onMedicineName,onContinue}:Props){
 const nameInput=useRef<HTMLInputElement>(null);
 const [scanPack,setScanPack]=useState(false);
 const suggestions=findOtherMedicines(medicineName);
 const title=step==='reason'?t.reason:step==='prescription'?t.prescription:t.otherMedicines;
 const listFull=details.medicines.length>=24;
 const canContinue=step==='reason'||(step==='prescription'?details.prescribed!==null:
  details.otherMedicines==='no'||(details.otherMedicines==='yes'&&
   (details.medicines.length>0||!!medicineName.trim()||details.unsureAboutNames)));

 function chooseOtherMedicines(answer:YesNo){
  if(answer==='no'){
   onChange({...details,otherMedicines:answer,medicines:[],unsureAboutNames:false});
   onMedicineName('');
   setScanPack(false);
  }else{
   onChange({...details,otherMedicines:answer});
  }
 }

 function addName(name=medicineName){
  const nextDetails={...details,medicines:addMedicineName(details.medicines,name)};
  onChange(nextDetails);
  onMedicineName('');
  return nextDetails;
 }
 function continueCheck(useAI:boolean){
  onContinue(step==='other-medicines'&&details.otherMedicines==='yes'?addName():details,useAI);
 }

 return <div className="check-questions">
  <h1 id="check-question-title">{title}</h1>
  {step==='reason'&&<>
   <label className="check-questions-field">
    <span>{t.reasonLabel}</span>
    <textarea rows={3} maxLength={500} value={details.reason} onChange={event=>onChange({...details,reason:event.target.value})} aria-describedby="check-questions-privacy" autoComplete="off"/>
   </label>
   <p className="check-questions-hint" id="check-questions-privacy">{t.privacy}</p>
  </>}
  {step==='prescription'&&<YesNoToggle value={details.prescribed} onChange={prescribed=>onChange({...details,prescribed})}/>}
  {step==='other-medicines'&&<>
   <YesNoToggle value={details.otherMedicines} onChange={chooseOtherMedicines}/>
   {details.otherMedicines==='yes'&&<div className="check-questions-medicines">
    <form className="check-questions-add" onSubmit={event=>{
     event.preventDefault();
     addName();
     nameInput.current?.focus();
    }}>
     <label className="check-questions-field">
      <span>{t.medicineName}</span>
      <input ref={nameInput} type="text" maxLength={100} disabled={listFull} value={medicineName} onChange={event=>onMedicineName(event.target.value)} autoComplete="off"/>
     </label>
     <button type="submit" className="secondary" data-motion="press" disabled={listFull||!medicineName.trim()}>{t.addMedicine}</button>
    </form>
    {suggestions.length>0&&!scanPack&&!listFull&&<ul className="check-questions-names" aria-label="Catalogue matches">
     {suggestions.map(medicine=><li key={medicine.id}><span>{medicine.name}</span>
      <button type="button" className="text-button" onClick={()=>addName(medicine.name)} aria-label={'Add '+medicine.name}>Add</button></li>)}
    </ul>}
    {aiAvailable&&!scanPack&&!listFull&&<button type="button" className="secondary" onClick={()=>setScanPack(true)}>Scan another pack</button>}
    {scanPack&&<PackPhoto mode="companion" onClose={()=>setScanPack(false)} onRead={ingredients=>{
     addName(ingredients.join(' + '));setScanPack(false);
    }}/>}
    {listFull&&<p>Remove an entry to add another. If names are missing, tick the box below.</p>}
    {details.medicines.length>0&&<ul className="check-questions-names">
     {details.medicines.map(({name})=><li key={name}>
      <span>{name}</span>
      <button type="button" className="text-button" data-motion="press" aria-label={t.removeMedicine(name)} onClick={()=>{
       onChange({...details,medicines:details.medicines.filter(entry=>entry.name!==name)});
       nameInput.current?.focus();
      }}>{t.remove}</button>
     </li>)}
    </ul>}
    <label className="check-questions-unsure">
     <input type="checkbox" checked={details.unsureAboutNames} onChange={event=>onChange({...details,unsureAboutNames:event.target.checked})}/>
     {t.unsureAboutNames}
    </label>
   </div>}
  </>}
  {step==='other-medicines'&&aiAvailable?<>
   <p className="check-questions-hint" id="guidance-consent">{t.guidanceConsent}</p>
   <button type="button" className="primary check-questions-continue" data-motion="press" aria-describedby="guidance-consent" disabled={!canContinue||scanPack} onClick={()=>continueCheck(true)}>{t.guidance}</button>
   <button type="button" className="text-button" data-motion="press" disabled={!canContinue||scanPack} onClick={()=>continueCheck(false)}>{t.localGuidance}</button>
  </>:<button type="button" className="primary check-questions-continue" data-motion="press" disabled={!canContinue||scanPack} onClick={()=>continueCheck(false)}>{t.continue}</button>}
 </div>;
}
