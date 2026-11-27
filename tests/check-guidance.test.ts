import {test} from 'node:test';
import assert from 'node:assert/strict';
import {medicines} from '../lib/safety';
import {checkResult} from '../lib/check-result';
import {availableFollowUps,parseFollowUpAnswers,parseFollowUpDetails,selectFollowUps} from '../lib/check-follow-ups';
import {
  evidenceForCheck,interactionEvidence,localGuidance,matchTypedMedicine,parseGuidanceContext,
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
  assert.deepEqual(selectFollowUps(penicillin,[]).map(question=>question.id),['penicillin-reaction','reason-assessed']);
  assert.deepEqual(selectFollowUps(penicillin,['long-term-condition']).map(question=>question.id),['penicillin-reaction','reason-assessed','long-term-condition']);
  assert.throws(()=>selectFollowUps(penicillin,['reason-assessed']));
  assert.deepEqual(parseFollowUpAnswers({'penicillin-reaction':'no'},penicillin),{'penicillin-reaction':'no'});
  assert.match(penicillin[0].source.url,/\.nafdac\.gov\.ng\//);
  assert.throws(()=>selectFollowUps(penicillin,['stomach-ulcer']));
  const ibuprofen=availableFollowUps(medicine('ibuprofen'),{...base,prescribed:true});
  assert.deepEqual(selectFollowUps(ibuprofen,['asthma']).map(question=>question.id),['prior-reaction','stomach-ulcer','asthma']);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no'},ibuprofen),null);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'no',invented:'yes'},ibuprofen),null);
  assert.equal(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'unknown'},ibuprofen),null);
  assert.deepEqual(parseFollowUpAnswers({'prior-reaction':'no','stomach-ulcer':'unsure'},ibuprofen),{'prior-reaction':'no','stomach-ulcer':'unsure'});
});

test('the result accepts a tailored takeaway and an action while rejecting directions or unsafe output',()=>{
  const takeaway='You reported a past reaction to penicillin. That is important to bring up when you ask about this combination.';
  const action='Tell them what happened after you took penicillin.';
  assert.deepEqual(validateCheckSynthesis(takeaway,action),{takeaway,nextAction:action});
  assert.throws(()=>validateCheckSynthesis('Take two capsules twice today.',action));
  assert.throws(()=>validateCheckSynthesis('You should stop your prescription today.',action));
  assert.throws(()=>validateCheckSynthesis('This looks safe to take with your medicines.',action));
  assert.throws(()=>validateCheckSynthesis('You should not take it for a skin colour change.',action));
  assert.throws(()=>validateCheckSynthesis('You have a penicillin allergy and should ask a pharmacist.',action));
  assert.throws(()=>validateCheckSynthesis('You have no known penicillin allergy.',action));
  assert.throws(()=>validateCheckSynthesis(takeaway,'What safe antibiotic options exist for my skin change?'));
  assert.throws(()=>validateCheckSynthesis(takeaway,'Visit https://example.invalid?'));
  assert.throws(()=>validateCheckSynthesis(takeaway,'Should I ask my pharmacist today?'));
});

test('optional details belong only to a yes answer that asks for them',()=>{
 const questions=availableFollowUps(medicine('ampicillin-cloxacillin'),base);
 assert.deepEqual(parseFollowUpDetails({'penicillin-reaction':'  a rash  '},questions,{'penicillin-reaction':'yes'}),{'penicillin-reaction':'a rash'});
 assert.deepEqual(parseFollowUpDetails({'penicillin-reaction':'  '},questions,{'penicillin-reaction':'yes'}),{});
 assert.equal(parseFollowUpDetails({'penicillin-reaction':'a rash'},questions,{'penicillin-reaction':'unsure'}),null);
 assert.equal(parseFollowUpDetails({'penicillin-reaction':'x'.repeat(241)},questions,{'penicillin-reaction':'yes'}),null);
});

test('concerns take precedence, uncertain answers stay open, and prescribing goes to a doctor',()=>{
 const questions=availableFollowUps(medicine('ampicillin-cloxacillin'),base);
 const input={prescribed:true,reason:'A sore throat',questions,interactions:false,needsInteractionReview:false,needsReasonReview:false};
 assert.deepEqual(checkResult({...input,answers:{'penicillin-reaction':'no'}}),{status:'no_concern',clinician:'prescriber',assessment:undefined,gaps:[]});
 assert.equal(checkResult({...input,answers:{'penicillin-reaction':'unsure'}}).status,'more_information');
 assert.equal(checkResult({...input,answers:{'penicillin-reaction':'no'},needsReasonReview:true}).status,'more_information');
 assert.equal(checkResult({...input,answers:{'penicillin-reaction':'yes'},needsInteractionReview:true}).status,'concern');
 assert.equal(checkResult({...input,prescribed:false,answers:{'penicillin-reaction':'no'}}).clinician,'doctor');
 assert.deepEqual(checkResult({...input,prescribed:false,reason:'',answers:{'penicillin-reaction':'no'},interactions:true}),{status:'concern',clinician:'pharmacist',assessment:undefined,gaps:[{kind:'reason_missing'}]});
});

test('new NAFDAC interactions and WHO evidence gaps use the source catalogue',()=>{
 const result=localGuidance(medicine('ampicillin-cloxacillin'),{
  ...base,medicineId:'ampicillin-cloxacillin',reason:'Diarrhoea',otherMedicines:[{name:'allopurinol',choice:'allopurinol'}]
 });
 assert.equal(result.needsReasonReview,false);
 assert.equal(result.interactions[0].id,'ampicillin-cloxacillin-allopurinol');
 assert.match(result.passages[0].source.url,/who\.int/);
 assert.equal(localGuidance(medicine('ampicillin-cloxacillin'),{...base,reason:'a new skin colour change'}).needsReasonReview,true);
});

test('a boil and headache keep their meanings for a current prescription',()=>{
 const context={...base,medicineId:'ampicillin-cloxacillin',reason:'Headache and a boil in my elbow',prescribed:true};
 const guidance=localGuidance(medicine(context.medicineId),context);
 assert.ok(guidance.passages.some(item=>item.id==='boil'));
 assert.ok(!guidance.passages.some(item=>item.id==='wound_assessment'));
 assert.deepEqual(guidance.uncoveredReasons,['headache']);
 const action='Ask your doctor which symptom the medicine is intended to help with.';
 assert.throws(()=>validateCheckSynthesis(
  'A wound may need more than an antibiotic and should be assessed by a health professional before use.',action,context));
 assert.throws(()=>validateCheckSynthesis('This antibiotic was not prescribed for your symptoms.',action,context));
 assert.doesNotThrow(()=>validateCheckSynthesis('Boil care can vary. The boil guidance does not cover headache.',action,context));
});

test('an existing assessment changes the handoff without turning it into a prescription',()=>{
 const context={...base,medicineId:'ampicillin-cloxacillin',reason:'Headache and a boil'};
 const questions=availableFollowUps(medicine(context.medicineId),context);
 const input={...context,questions,interactions:false,needsInteractionReview:false,needsReasonReview:true};
 const result=checkResult({...input,answers:{'penicillin-reaction':'no','reason-assessed':'yes'}});
 assert.equal(result.assessment,'yes');
 assert.equal(result.clinician,'previous_clinician');
 assert.deepEqual(result.gaps,[{kind:'reason_evidence'}]);
 assert.throws(()=>validateCheckSynthesis('A clinician hasn’t assessed whether this medicine is needed.',
  'Ask the clinician to review the medicine.',{...context,assessment:'yes'}));
 assert.equal(checkResult({...input,answers:{'penicillin-reaction':'no','reason-assessed':'no'}}).clinician,'doctor');
});

test('an unfamiliar reason remains an evidence gap even with a prescription',()=>{
 const context={...base,medicineId:'ampicillin-cloxacillin',reason:'Dermatographia',prescribed:true};
 const guidance=localGuidance(medicine(context.medicineId),context);
 assert.equal(guidance.needsReasonReview,true);
 assert.deepEqual(guidance.passages.map(passage=>passage.id),['label-caution','prescription']);
 const explanation='The label describes the medicine, and the supplied sources do not explain its use for the skin condition you reported.';
 assert.deepEqual(validateCheckSynthesis(explanation,undefined,context),{takeaway:explanation});
});

test('cough guidance provides context without treating a cough as a diagnosis',()=>{
 const context={...base,reason:'Cough'};
 const guidance=localGuidance(medicine(context.medicineId),context);
 assert.ok(guidance.passages.some(item=>item.id==='cough_aware'));
 assert.equal(guidance.needsReasonReview,true);
 assert.deepEqual(guidance.uncoveredReasons,['cough']);
});

test('co-amoxiclav asks about a past liver reaction and flags documented combinations',()=>{
 const context={...base,medicineId:'co-amoxiclav',otherMedicines:[
  {name:'Methotrexate',choice:'methotrexate'},{name:'Probenecid',choice:'probenecid'}
 ]};
 const candidate=medicine(context.medicineId);
 const questions=availableFollowUps(candidate,context);
 assert.ok(questions.some(question=>question.id==='co-amoxiclav-liver-reaction'&&question.mandatory&&question.concernOnYes));
 assert.equal(parseFollowUpAnswers({'penicillin-reaction':'no'},questions),null);
 assert.deepEqual(localGuidance(candidate,context).interactions.map(item=>item.id),['co-amoxiclav-methotrexate','co-amoxiclav-probenecid']);
 assert.equal(checkResult({...context,questions,answers:{'penicillin-reaction':'no','co-amoxiclav-liver-reaction':'yes'},
  interactions:false,needsInteractionReview:false,needsReasonReview:false}).status,'concern');
});

test('fever and dental evidence guide the conversation without filling an evidence gap',()=>{
 const guidance=localGuidance(medicine(base.medicineId),{...base,reason:'Fever and toothache'});
 assert.deepEqual(guidance.passages.slice(0,2).map(item=>item.id),['fever_ncdc','tooth_pain_aware']);
 assert.deepEqual(guidance.uncoveredReasons,['fever','tooth pain']);
 assert.equal(guidance.needsReasonReview,true);
});

test('ciprofloxacin retains required checks and flags documented interactions without Groq',()=>{
 const context={...base,medicineId:'ciprofloxacin',otherMedicines:[{name:'Tizanidine',choice:matchTypedMedicine('Tizanidine')}]};
 const candidate=medicine(context.medicineId);
 const questions=selectFollowUps(availableFollowUps(candidate,context),[]);
 assert.deepEqual(questions.map(({id})=>id),['prior-reaction','cipro-child','cipro-tendon']);
 const guidance=localGuidance(candidate,context);
 assert.deepEqual(guidance.interactions.map(({id})=>id),['ciprofloxacin-tizanidine']);
 assert.equal(checkResult({...context,questions,answers:{'prior-reaction':'no','cipro-child':'no','cipro-tendon':'no'},
  ...guidance,interactions:guidance.interactions.length>0}).status,'concern');
});

test('new co-amoxiclav combinations can be resolved from typed names',()=>{
 const context={...base,medicineId:'co-amoxiclav',otherMedicines:['Warfarin','Mycophenolate mofetil'].map(name=>({name,choice:matchTypedMedicine(name)}))};
 const guidance=localGuidance(medicine(context.medicineId),context);
 assert.deepEqual(guidance.interactions.map(({id})=>id),['co-amoxiclav-warfarin','co-amoxiclav-mycophenolate']);
});

test('pus from a skin cut reaches wound guidance without inferring a diagnosis',()=>{
 const candidate=medicine('ampicillin-cloxacillin');
 const context={...base,medicineId:candidate.id,prescribed:true,reason:'PUS IS COMING OUT OF MY SKIN CUT'};
 const guidance=localGuidance(candidate,context);
 assert.equal(guidance.needsReasonReview,false);
 assert.ok(guidance.passages.some(passage=>passage.id==='wound_assessment'&&passage.text.includes('can be a sign')));
 assert.equal(localGuidance(candidate,{...context,reason:'Pus is coming out'}).needsReasonReview,true);
 assert.equal(localGuidance(candidate,{...context,reason:'No pus from a skin cut'}).needsReasonReview,true);
});

test('semantic retrieval can cite wound guidance for unfamiliar wording without clearing the source-based gap',()=>{
 const candidate=medicine('ampicillin-cloxacillin');
 const context={...base,medicineId:candidate.id,reason:'Pus from my scar',prescribed:true};
 const guidance=localGuidance(candidate,context);
 assert.equal(guidance.needsReasonReview,true);
 assert.ok(!guidance.passages.some(item=>item.id==='wound_assessment'));
 const evidence=evidenceForCheck(candidate,context);
 assert.ok(evidence.reasonSearchIds.includes('wound_assessment'));
 assert.ok(evidence.reasonSearchIds.includes('surgical_wound_discharge'));
 assert.ok(evidence.candidates.some(item=>item.id==='medicine-uses'&&item.source.name.includes('section 4.1')));
 assert.deepEqual(validateGuidanceSelection('{"passageIds":["wound_assessment","medicine-uses"],"matches":[]}',
  evidence.candidates.map(item=>item.id),[]).passageIds,['wound_assessment','medicine-uses']);
});
