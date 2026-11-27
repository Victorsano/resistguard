import type {Metadata} from 'next';
import LabCheck from '@/app/components/LabCheck';
export const metadata:Metadata={title:'Antibiogram check · ResistGuard'};
// The lab-side check at /lab. Rules only, no AI call, nothing stored.
export default function LabPage(){
 return <LabCheck/>;
}
