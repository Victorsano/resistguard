import test from 'node:test';
import assert from 'node:assert/strict';
import {medicines,matchIngredients,nigeriaCatalogueDetails,nigeriaProducts} from '../lib/safety';
import nigeria from '../data/nigeria-catalogue.json';
import {retrieveUseEvidence} from '../lib/use-check';
import manifest from '../data/content-manifest.json';

test('new catalogue records, formulations and Greenbook examples have traceable sources',()=>{
  assert.equal(manifest.records,medicines.length);
  const ids=new Set(medicines.map(m=>m.id));
  for(const m of nigeria.records) assert.ok(Object.hasOwn(nigeria.sources,m.sourceKey));
  for(const id of Object.keys(nigeria.formulations)){
    assert.ok(ids.has(id));
    for(const form of nigeriaCatalogueDetails(id).forms){
      assert.ok(form.reference.url.startsWith('https://'));
      assert.ok(form.section && form.strengths.length);
    }
  }
  for(const product of nigeriaProducts){
    assert.ok(ids.has(product.medicineId));
    assert.ok(product.url.startsWith('https://greenbook.nafdac.gov.ng/'));
    assert.match(product.number,/^[A-Z0-9]+-[0-9]+$/);
  }
});

test('registration references do not let brand names bypass exact ingredient matching',()=>{
  assert.equal(matchIngredients(['emzoclox']),null);
  assert.equal(matchIngredients(['emzifix']),null);
  assert.equal(matchIngredients(['cefixime trihydrate'])?.id,'cefixime');
  assert.equal(matchIngredients(['ampicillin trihydrate','cloxacillin sodium'])?.id,'ampicillin-cloxacillin');
  assert.equal(matchIngredients(['ampicillin','cloxacillin','amoxicillin']),null);
});

test('new education cases retrieve the scenario-specific source passage',()=>{
  for(const [topic,id] of [['uti','uti_assessment'],['pneumonia','pneumonia_assessment'],['tonsillitis','tonsillitis_assessment'],['typhoid','typhoid_assessment'],['wound','wound_assessment']] as const){
    assert.ok(retrieveUseEvidence(topic).some(p=>p.id===id));
  }
  assert.ok(retrieveUseEvidence('general').some(p=>p.id==='nigeria_amr'));
});
