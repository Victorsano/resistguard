import {MessageCircle} from 'lucide-react';
import {genuineCheck,pharmacistSection,whatsAppLink} from '@/lib/next-steps';
import './next-steps.css';

export default function NextSteps({medicine}:{medicine:{ingredients:readonly string[];antibiotic:boolean}}){
 return <><div className="pharmacist-plan next-steps-genuine"><h3>{genuineCheck.title}</h3><ol className="next-steps-list">{genuineCheck.steps.map((step,index)=><li key={index}><span className="next-steps-number">{String(index+1).padStart(2,'0')}</span><span>{step.text}{'link' in step&&<><a href={step.link.url} target="_blank" rel="noreferrer">{step.link.label}</a>{step.after}</>}</span></li>)}</ol><small className="next-steps-disclaimer">{genuineCheck.disclaimer}</small></div>
 <div className="pharmacist-plan next-steps-pharmacist"><h3>{pharmacistSection.title}</h3><p>{pharmacistSection.text}</p><a className="next-steps-whatsapp" href={whatsAppLink(medicine,process.env.NEXT_PUBLIC_PHARMACIST_WHATSAPP)} target="_blank" rel="noreferrer"><MessageCircle size={16} aria-hidden="true"/>{pharmacistSection.button}</a></div></>;
}
