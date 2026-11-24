import test from 'node:test';
import assert from 'node:assert/strict';
import evidence from '../data/use-evidence.json';
import {
  getPassage,parseEvidenceRequest,retrieveUseEvidence,usePlans,useTopics,
  validateEvidenceOrder,type UseTopic
} from '../lib/use-check';

test('each education topic and plan retrieves traceable passages',()=>{
  for(const topic of Object.keys(useTopics) as UseTopic[]){
    const passages=retrieveUseEvidence(topic);
    assert.ok(passages.length);
    for(const passage of passages){
      assert.match(passage.reference.url,/^https:\/\//);
      assert.ok(passage.section);
      assert.equal(passage.reviewStatus,'pending_pharmacist');
    }
  }
  for(const plan of Object.values(usePlans)) assert.ok(getPassage(plan.passage).reference);
  assert.equal(evidence.reviewStatus,'pending_pharmacist');
  assert.equal(usePlans.leftover.passage,'leftovers');
  assert.equal(usePlans.shared.passage,'leftovers');
});

test('model can reorder every retrieved passage but cannot omit or add content',()=>{
  const ids=retrieveUseEvidence('eczema').map(p=>p.id);
  const reversed=[...ids].reverse();
  assert.deepEqual(validateEvidenceOrder(JSON.stringify({passageIds:reversed}),ids),reversed);
  for(const invalid of [{passageIds:ids.slice(1)},{passageIds:[ids[0],...ids.slice(0,-1)]},{passageIds:['interaction',...ids.slice(1)]},{passageIds:ids,advice:'invented'}]){
    assert.throws(()=>validateEvidenceOrder(JSON.stringify(invalid),ids));
  }
});

test('only an enumerated education topic is accepted by the API',()=>{
  assert.equal(parseEvidenceRequest({topic:'boil'}),'boil');
  assert.equal(parseEvidenceRequest({topic:'unknown'}),null);
  assert.equal(parseEvidenceRequest({topic:'eczema',medicalHistory:'private'}),null);
  assert.equal(parseEvidenceRequest(null),null);
});
