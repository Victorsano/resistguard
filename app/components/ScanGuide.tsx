'use client';
import {ScanLine,Sun,Focus,ShieldCheck} from 'lucide-react';
export default function ScanGuide(){
 return <section className="scan-guide" aria-label="Photo guide"><div className="guide-heading"><ScanLine size={20}/><div><strong>A better photo, a clearer next step</strong><p>Use one medicine package. Photograph its ingredient panel, not just the brand.</p></div></div><ol><li><Focus size={16}/><span><b>Fill the frame</b>Keep the complete ingredient list and every edge visible.</span></li><li><Sun size={16}/><span><b>Reduce glare</b>Use even light, tilt away from reflections and hold steady.</span></li><li><ShieldCheck size={16}/><span><b>Keep it private</b>Leave names, prescriptions and other personal details out.</span></li></ol></section>;
}
