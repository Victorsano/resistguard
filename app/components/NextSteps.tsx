'use client';

import {useState} from 'react';
import {MessageCircle,ChevronDown} from 'lucide-react';
import type {YesNo} from '@/lib/flow';
import {clinicianMessage,clinicianWhatsAppLink,pharmacistSection,type CheckClinician} from '@/lib/next-steps';
import './next-steps.css';

export function PharmacistButton({href}:{href:string}){
 return <a className="primary next-steps-whatsapp" data-motion="press" href={href} target="_blank" rel="noreferrer"><MessageCircle size={22} aria-hidden="true"/>{pharmacistSection.button}</a>;
}

export default function NextSteps({medicine,clinician,prescribed,reason,otherMedicines,flagged}:{
 medicine:{ingredients:readonly string[];antibiotic:boolean};
 clinician:CheckClinician;
 prescribed:YesNo|null;
 reason:string;
 otherMedicines:string[];
 flagged:string[];
}){
 const [includeReason,setIncludeReason]=useState(false);
 const [includeAnswers,setIncludeAnswers]=useState(false);
 const [includeMedicines,setIncludeMedicines]=useState(false);
 const message=clinicianMessage(medicine,prescribed,clinician,includeReason?reason:'',
  includeMedicines?otherMedicines:[],includeAnswers?flagged:[]);
 const phone=clinician==='pharmacist'?process.env.NEXT_PUBLIC_PHARMACIST_WHATSAPP:undefined;

 return <details className="answer-sources">
  <summary>Preview a WhatsApp message<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
  <div className="answer-expanded next-steps">
   {reason&&<label><input type="checkbox" checked={includeReason} onChange={event=>setIncludeReason(event.target.checked)}/> Include my reason</label>}
   {otherMedicines.length>0&&<label><input type="checkbox" checked={includeMedicines} onChange={event=>setIncludeMedicines(event.target.checked)}/> Include my other medicines and supplements</label>}
   {flagged.length>0&&<label><input type="checkbox" checked={includeAnswers} onChange={event=>setIncludeAnswers(event.target.checked)}/> Include my follow-up answers</label>}
   <div className="next-steps-message" aria-label="Your message">{message}</div>
   <a className="secondary" href={clinicianWhatsAppLink(message,phone)} target="_blank" rel="noreferrer">
    <MessageCircle size={20} aria-hidden="true"/> Open in WhatsApp
   </a>
   <p className="next-steps-note">{phone?'Review the recipient and message before sending.':'You choose the recipient before sending.'}</p>
  </div>
 </details>;
}
