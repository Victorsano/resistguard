import {test} from 'node:test';
import assert from 'node:assert/strict';
import {medicines} from '../lib/safety';
import {availableFollowUps,parseFollowUpAnswers,selectFollowUps} from '../lib/check-follow-ups';
import {
  interactionEvidence,localGuidance,matchTypedMedicine,parseGuidanceContext,
  spellingCandidates,validateCheckSynthesis,validateGuidanceSelection,type GuidanceContext
} from '../lib/check-guidance';

const medicine=(id:string)=>medicines.find(item=>item.id===id)!;
const base:GuidanceContext={medicineId:'metronidazole',reason:'',prescribed:false,otherMedicines:[],namesIncomplete:false};

test('exact names, catalogue brands and complete combinations resolve without a second decision',()=>{
  assert.equal(matchTypedMedicine('EMZOCLOX'),'ampicillin-cloxacillin');
  assert.equal(matchTypedMedicine('04-5729'),'ampicillin-cloxacillin');
  assert.equal(matchTypedMedicine('acetaminophen'),'paracetamol');
  assert.equal(matchTypedMedicine('clavulanic acid and amoxicillin'),'co-amoxiclav');
  assert.equal(matchTypedMedicine('amoxicillin + unknown'),null);
  assert.equal(matchTypedMedicine('clavulanic acid'),null);
  assert.equal(matchTypedMedicine('warfarin'),'warfarin');
  assert.ok(spellingCandidates('paracetmol').some(entry=>entry.id==='paracetamol'&&entry.distance===1));
  assert.deepEqual(spellingCandidates('amoxicillin + unknown'),[]);
});

test('guidance follows the typed reason, prescription and confirmed medicine',()=>{
  const forThroat=localGuidance(medicine('metronidazole'),{...base,reason:'I have a sore throat'});
  const prescribed=localGuidance(medicine('metronidazole'),{...base,prescribed:true});
  assert.ok(forThroat.passages.some(item=>item.id==='tonsillitis_assessment'));
  assert.ok(forThroat.passages.some(item=>item.id==='need'));
  assert.ok(prescribed.passages.some(item=>item.id==='prescription'));
  const other=localGuidance(medicine('paracetamol'),{...base,medicineId:'paracetamol',reason:'sore throat'});
  assert.deepEqual(other.passages.map(item=>item.id),['label-caution','reason-to-discuss']);
  const prescribedWithOther=localGuidance(medicine('paracetamol'),{
    ...base,medicineId:'paracetamol',prescribed:true,otherMedicines:[{name:'warfarin',choice:'warfarin'}]
  });
  assert.deepEqual(prescribedWithOther.passages.map(item=>item.id),['label-caution','other-medicines','prescription-to-discuss']);
});

test('eligible interaction notes are sourced and unknown pairs remain uncertain',()=>{
  const warfarin={name:'Warfarin',choice:'warfarin'};
  const unknown={name:'Unknown example',choice:null};
  const nafdac=interactionEvidence(medicine('metronidazole'),[warfarin,unknown],false);
  assert.deepEqual(nafdac.interactions.map(item=>item.id),['metronidazole-warfarin']);
  assert.match(nafdac.interactions[0].source.url,/\.nafdac\.gov\.ng\//);
  assert.equal(nafdac.needsInteractionReview,true);
  const who=interactionEvidence(medicine('co-trimoxazole'),[warfarin],false);
  assert.ok(who.interactions[0].source.url.includes('who.int'));
  assert.deepEqual(interactionEvidence(medicine('trimethoprim'),[warfarin],false).interactions,[]);
  assert.equal(interactionEvidence(medicine('metronidazole'),[],true).needsInteractionReview,true);
});

test('guidance rejects unsupported medicine IDs and any output outside the supplied options',()=>{
  assert.equal(parseGuidanceContext({...base,medicineId:'unknown'}),null);
  assert.equal(parseGuidanceContext({...base,otherMedicines:[{name:'Unknown',choice:'unknown'}]}),null);
  assert.equal(parseGuidanceContext({...base,otherMedicines:[null]}),null);
  const options=[{index:0,ids:['paracetamol']}];
  assert.deepEqual(validateGuidanceSelection('{"passageIds":["label"],"matches":[{"index":0,"id":"paracetamol"}]}',['label'],options).matches.get(0),'paracetamol');
  assert.throws(()=>validateGuidanceSelection('{"passageIds":["fabricated"],"matches":[]}', ['label'],options));
  assert.throws(()=>validateGuidanceSelection('{"passageIds":["label"],"matches":[{"index":0,"id":"amoxicillin"}]}',['label'],options));
  assert.throws(()=>validateGuidanceSelection('{"passageIds":["label"],"matches":[],"advice":"made up"}',['label'],options));
});

test('follow-up selection uses this medicine and cannot skip required allergy or ulcer checks',()=>{
  const penicillin=availableFollowUps(medicine('ampicillin-cloxacillin'),{...base,reason:'a new skin change'});
  assert.deepEqual(selectFollowUps(penicillin,['reason-assessed']).map(question=>question.id),['penicillin-reaction','reason-assessed']);
  assert.match(penicillin[0].source.url,/\.nafdac\.gov\.ng\//);
  assert.throws(()=>selectFollowUps(penicillin,['stomach-ulcer']));
  const ibuprofen=availableFollowUps(medicine('ibuprofen'),{...base,prescribed:true});
  assert.deepEqual(selectFollowUps(ibuprofen,['asthma']).map(question=>question.id),['prior-reaction','stomach-ulcer','asthma']);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no'},ibuprofen),null);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'no',invented:'yes'},ibuprofen),null);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'unknown'},ibuprofen),null);
  assert.deepEqual(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'unsure'},ibuprofen),{'prior-reaction':'no','stomach-ulcer':'unsure'});
});

test('the result accepts a tailored takeaway and a question while rejecting directions or unsafe output',()=>{
  const takeaway='You reported a past reaction to penicillin. That is important to bring up when you ask about this combination.';
  const question='What does my past penicillin reaction mean for this medicine?';
  assert.deepEqual(validateCheckSynthesis(takeaway,question),{takeaway,questionForPharmacist:question});
  assert.throws(()=>validateCheckSynthesis('Take two capsules twice today.',question));
  assert.throws(()=>validateCheckSynthesis('You should stop your prescription today.',question));
  assert.throws(()=>validateCheckSynthesis('This looks safe to take with your medicines.',question));
  assert.throws(()=>validateCheckSynthesis(takeaway,'Visit https://example.invalid?'));
  assert.throws(()=>validateCheckSynthesis(takeaway,'Ask your pharmacist today.'));
});
