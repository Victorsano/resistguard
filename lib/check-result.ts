import type {FollowUpAnswers,FollowUpQuestion} from '@/lib/check-follow-ups';

type CheckGap=
 |{kind:'unanswered'|'unsure';question:string}
 |{kind:'reason_missing'|'reason_evidence'|'other_medicines'|'condition'|'assessment'};

export function checkResult({prescribed,reason,questions,answers,interactions,needsInteractionReview,needsReasonReview}:{
 prescribed:boolean;
 reason:string;
 questions:FollowUpQuestion[];
 answers:FollowUpAnswers;
 interactions:boolean;
 needsInteractionReview:boolean;
 needsReasonReview:boolean;
}){
 const reportedConcern=questions.some(question=>question.concernOnYes&&answers[question.id]==='yes');
 const assessment=answers['reason-assessed'];
 const gaps:CheckGap[]=[];
 if(!reason.trim())gaps.push({kind:'reason_missing'});
 else if(needsReasonReview)gaps.push({kind:'reason_evidence'});
 if(needsInteractionReview)gaps.push({kind:'other_medicines'});
 if(!prescribed&&assessment==='no')gaps.push({kind:'assessment'});
 if(answers['long-term-condition']==='yes')gaps.push({kind:'condition'});
 for(const question of questions){
  if(answers[question.id]==='unsure')gaps.push({kind:'unsure',question:question.text});
  else if(question.mandatory&&!answers[question.id])gaps.push({kind:'unanswered',question:question.text});
 }
 const status=reportedConcern||interactions?'concern':gaps.length?'more_information':'no_concern';
 const clinician=prescribed?'prescriber':assessment==='yes'?'previous_clinician':
  (!reason.trim()&&!reportedConcern&&(interactions||needsInteractionReview))?'pharmacist':'doctor';
 return {status,clinician,assessment,gaps} as const;
}
