import {readiness,gateMessage} from '@/lib/availability';
export const dynamic='force-dynamic';
export async function GET(){const gate=readiness();return Response.json({ai:gate.ok?'available':'paused',message:gateMessage(gate.reason),clinicalReview:'pending',pilot:'not_started'},{headers:{'Cache-Control':'no-store'}});}
