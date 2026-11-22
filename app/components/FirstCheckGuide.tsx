'use client';
import {useEffect, useRef, useState} from 'react';

export default function FirstCheckGuide({onClose, onStart}: {onClose: () => void; onStart: () => void}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [answer, setAnswer] = useState<'match' | 'unsure' | null>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section id="first-check-guide" className="first-check-guide" aria-labelledby="practice-heading">
    <button className="text-button guide-close" onClick={onClose}>Close tutorial</button>
    <span className="eyebrow">First check · practice example</span>
    <h2 id="practice-heading" tabIndex={-1} ref={heading}>Would you confirm this reading?</h2>
    <p>Imagine you turned the box over and found the small print. Compare it with the sample reading below. This exercise uses no camera or AI.</p>
    <dl className="practice-pair">
      <div><dt>Printed on the example box</dt><dd>Amoxicillin + clavulanic acid</dd></div>
      <div><dt>Practice scan reading</dt><dd>Amoxicillin</dd></div>
    </dl>
    <p><strong>Does every active ingredient match?</strong></p>
    <div className="practice-choices"><button className="secondary" onClick={() => setAnswer('match')}>Yes, confirm</button>
      <button className="secondary" onClick={() => setAnswer('unsure')}>No / I’m unsure</button></div>
    <div role="status">{answer && <p><strong>{answer === 'match' ? 'Take another look.' : 'You spotted the missing ingredient.'}</strong> The box also lists clavulanic acid. Leave the match unconfirmed. Try a clearer photo of the whole panel or ask a pharmacist to check the box with you.</p>}</div>
    {answer && <button className="primary" onClick={onStart}>Try a label check</button>}
  </section>;
}
