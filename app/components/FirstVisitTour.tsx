import {Compass} from 'lucide-react';
import type {ReactNode} from 'react';
import './first-visit-tour.css';

export const tourPreferenceKey = 'resistguard:tour-dismissed';

export default function FirstVisitTour({step,title,children,onEnd,finished=false}:{
  step:number;
  title:string;
  children:ReactNode;
  onEnd:()=>void;
  finished?:boolean;
}){
  return <aside className="first-visit-tour" data-step={step} aria-label="First-visit tour">
    <div className="first-visit-tour-header">
      <span><Compass size={16} aria-hidden="true"/> First visit · Step {step} of 4</span>
      <button type="button" className="text-button" onClick={onEnd}>{finished?'Finish tour':'Skip tour'}</button>
    </div>
    <h3>{title}</h3>
    {children}
  </aside>;
}
