import {MessageCircle,ShieldCheck,ChevronDown} from 'lucide-react';
import {genuineCheck,pharmacistSection,whatsAppLink} from '@/lib/next-steps';
import './next-steps.css';

export function PharmacistButton({href}:{href:string}){
 return <a className="primary next-steps-whatsapp" data-motion="press" href={href} target="_blank" rel="noreferrer"><MessageCircle size={22} aria-hidden="true"/>{pharmacistSection.button}</a>;
}

export default function NextSteps({medicine}:{medicine:{ingredients:readonly string[];antibiotic:boolean}}){
 return <div className="next-steps">
  <PharmacistButton href={whatsAppLink(medicine,process.env.NEXT_PUBLIC_PHARMACIST_WHATSAPP)}/><p className="next-steps-note">{pharmacistSection.text}</p>
  <details className="next-steps-genuine"><summary><ShieldCheck size={22} aria-hidden="true"/><span>{genuineCheck.title}</span><ChevronDown size={20} aria-hidden="true" className="next-steps-chevron"/></summary><ol className="next-steps-list">{genuineCheck.steps.map((step,index)=><li key={index}><span className="next-steps-number">{index+1}</span><span>{step.text}{'link' in step&&<><a href={step.link.url} target="_blank" rel="noreferrer">{step.link.label}</a>{step.after}</>}</span></li>)}</ol><p className="next-steps-disclaimer">{genuineCheck.disclaimer}</p></details>
 </div>;
}
