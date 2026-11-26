'use client';

import {useState} from 'react';
import {MessageCircle,ChevronDown} from 'lucide-react';
import type {checkResult} from '@/lib/check-result';
import {clinicianMessage,clinicianWhatsAppLink,pharmacistSection} from '@/lib/next-steps';
import './next-steps.css';

export function PharmacistButton({href}:{href:string}){
 return <a className="primary next-steps-whatsapp" data-motion="press" href={href} target="_blank" rel="noreferrer"><MessageCircle size={22} aria-hidden="true"/>{pharmacistSection.button}</a>;
}

export default function NextSteps({medicine,clinician,prescribed,reason,flagged}:{
 medicine:{ingredients:readonly string[];antibiotic:boolean};
 clinician:ReturnType<typeof checkResult>['clinician'];
 prescribed:boolean;
 reason:string;
 flagged:string[];
}){
 const [includeReason,setIncludeReason]=useState(false);
 const [includeAnswers,setIncludeAnswers]=useState(false);
 const message=clinicianMessage(medicine,prescribed,includeReason?reason:'',includeAnswers?flagged:[]);
 const phone=clinician==='pharmacist'?process.env.NEXT_PUBLIC_PHARMACIST_WHATSAPP:undefined;

 return <details className="answer-sources">
  <summary>Preview a WhatsApp message<ChevronDown size={20} aria-hidden="true" className="answer-chevron"/></summary>
  <div className="answer-expanded next-steps">
   {reason&&<label><input type="checkbox" checked={includeReason} onChange={event=>setIncludeReason(event.target.checked)}/> Include my reason</label>}
   {flagged.length>0&&<label><input type="checkbox" checked={includeAnswers} onChange={event=>setIncludeAnswers(event.target.checked)}/> Include my follow-up answers</label>}
   <div className="next-steps-message" aria-label="Your message">{message}</div>
   <a className="secondary" href={clinicianWhatsAppLink(message,phone)} target="_blank" rel="noreferrer">
    <MessageCircle size={20} aria-hidden="true"/> Open in WhatsApp
   </a>
   <p className="next-steps-note">{phone?'Review the recipient and message before sending.':'You choose the recipient before sending.'}</p>
  </div>
 </details>;
}
