import {detailsAreConfirmed,keepTyped,suggestMedicines,suggestReasons,type CheckDetails,type ReasonChoice,type ReasonId} from '@/lib/flow';
import {copy,reasonLabels} from '@/lib/screen-copy';
import './review-check-details.css';

const t=copy.reviewDetails;
const reasonIds=Object.keys(reasonLabels) as ReasonId[];

export default function ReviewCheckDetails({details,onChange,onConfirm}:{
 details:CheckDetails;
 onChange:(details:CheckDetails)=>void;
 onConfirm:()=>void;
}){
 const suggestedReasons=suggestReasons(details.reason);
 const otherReasons=reasonIds.filter(id=>!suggestedReasons.includes(id));

 return <div className="review-check-details">
  <h1>{t.title}</h1>
  {details.reason.trim()&&<div className="review-check-details-entry">
   <div className="review-check-details-typed"><span>{t.typed}</span><p>{details.reason.trim()}</p></div>
   <label className="review-check-details-field">
    <span>{t.reason}</span>
    <select value={details.reasonChoice??''} onChange={event=>onChange({...details,reasonChoice:event.target.value as ReasonChoice})}>
     <option value="" disabled>{t.placeholder}</option>
     {suggestedReasons.length>0&&<optgroup label={t.suggested}>
      {suggestedReasons.map(id=><option key={id} value={id}>{reasonLabels[id]}</option>)}
     </optgroup>}
     <optgroup label={t.otherReasons}>
      {otherReasons.map(id=><option key={id} value={id}>{reasonLabels[id]}</option>)}
     </optgroup>
     <option value={keepTyped}>{t.keepReason}</option>
    </select>
   </label>
  </div>}
  {details.medicines.map(entry=>{
   const suggestions=suggestMedicines(entry.name);
   const chosen=suggestions.find(medicine=>medicine.id===entry.choice);
   return <div key={entry.name} className="review-check-details-entry">
    <div className="review-check-details-typed"><span>{t.typed}</span><p>{entry.name}</p></div>
    {suggestions.length===0&&<p className="review-check-details-note">{t.noMatch}</p>}
    <label className="review-check-details-field">
     <span>{t.medicine(entry.name)}</span>
     <select value={entry.choice??''} onChange={event=>onChange({...details,medicines:details.medicines.map(medicine=>
      medicine.name===entry.name?{...medicine,choice:event.target.value}:medicine
     )})}>
      <option value="" disabled>{t.placeholder}</option>
      {suggestions.map(medicine=><option key={medicine.id} value={medicine.id}>{medicine.name}</option>)}
      <option value={keepTyped}>{t.keepMedicine}</option>
     </select>
    </label>
    {chosen&&<div className="review-check-details-ingredients">
     <p>{t.checkIngredients}</p>
     <ul>{chosen.ingredients.map(ingredient=><li key={ingredient}>{ingredient}</li>)}</ul>
    </div>}
   </div>;
  })}
  <button type="button" className="primary review-check-details-confirm" data-motion="press" disabled={!detailsAreConfirmed(details)} onClick={onConfirm}>{t.confirm}</button>
 </div>;
}
