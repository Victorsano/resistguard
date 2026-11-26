import type {Metadata} from 'next';
import {readiness} from '@/lib/availability';
import CheckApp from '@/app/components/CheckApp';
export const metadata:Metadata={title:'What are you about to take? · ResistGuard'};
// Rendered per request so the first paint already knows whether photo reading is paused (DISABLE_AI=1 and the other gates).
// The client still asks /api/readiness, exactly as before. ?example=1 starts the same sample as the "See an example" button.
export default async function CheckPage({searchParams}:{searchParams:Promise<{[key:string]:string|string[]|undefined}>}){
 const {example}=await searchParams;
 return <CheckApp aiPaused={!readiness().ok} example={example==='1'}/>;
}
