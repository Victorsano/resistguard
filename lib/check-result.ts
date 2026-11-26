import type {FollowUpAnswers,FollowUpQuestion} from '@/lib/check-follow-ups';

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
 const moreInformation=needsInteractionReview||needsReasonReview||!reason.trim()||(questions.some(question=>
  answers[question.id]==='unsure'||(question.mandatory&&!answers[question.id])||
  (question.id==='long-term-condition'&&answers[question.id]==='yes')||
  (question.id==='reason-assessed'&&answers[question.id]==='no')
 ));
 const status=reportedConcern||interactions?'concern':moreInformation?'more_information':'no_concern';
 const clinician=prescribed?'prescriber':(!reason.trim()&&!reportedConcern&&(interactions||needsInteractionReview))?'pharmacist':'doctor';
 return {status,clinician} as const;
}
