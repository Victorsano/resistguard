import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyObservation,parseObservation,type Observation} from '../lib/scan';
import {matchIngredients,assess,medicines} from '../lib/safety';
import {educationFor,validateSelection} from '../lib/education';
const base:Observation={productType:'medicine',label:'Amoxicillin',ingredients:['amoxicillin'],legibility:'clear',complete:true};
test('catalogue matching preserves the complete ingredient set',()=>{
 for(const m of medicines)assert.equal(matchIngredients(m.ingredients)?.id,m.id);
 assert.equal(matchIngredients(['clavulanic acid','amoxicillin'])?.id,'co-amoxiclav');
 assert.equal(matchIngredients(['amoxicillin','potassium clavulanate'])?.id,'co-amoxiclav');
 for(const i of [[],['amoxicillin','amoxicillin'],['amoxicillin','metronidazole'],['amoxicillin','clavulanic acid','ibuprofen']])assert.equal(matchIngredients(i),null);
 assert.equal(matchIngredients(['acetaminophen'])?.id,'paracetamol');
});
test('scan distinguishes non-antibiotic and supported combination without substituting',()=>{
 assert.equal(classifyObservation(base).id,'amoxicillin');
 const combination=classifyObservation({...base,ingredients:['amoxicillin','clavulanic acid']});assert.equal(combination.status,'combination');assert.equal(combination.id,'co-amoxiclav');
 const other=classifyObservation({...base,ingredients:['amoxicillin','metronidazole']});assert.equal(other.status,'combination');assert.equal(other.id,undefined);
 const pain=classifyObservation({...base,ingredients:['paracetamol']});assert.equal(pain.status,'non_antibiotic');assert.equal(pain.id,'paracetamol');
});
test('incomplete or uncertain evidence never selects a medicine',()=>{
 for(const v of [{complete:false},{legibility:'partial'},{legibility:'unreadable'},{productType:'uncertain'},{ingredients:[]}]){const r=classifyObservation({...base,...v} as Observation);assert.equal(r.status,'unreadable');assert.equal(r.id,undefined);}
});
test('a fully readable Drug Facts panel can identify an unsupported combination without the brand',()=>{
 const triple:Observation={productType:'medicine',label:null,ingredients:['bacitracin','neomycin','polymyxin b'],legibility:'clear',complete:true};
 const result=classifyObservation(triple);
 assert.equal(result.status,'combination');
 assert.equal(result.id,undefined);
 assert.match(result.title,/outside our catalogue/);
 assert.match(result.message,/3 active ingredient names/);
 assert.deepEqual(result.observation?.ingredients,triple.ingredients);
 const uncertain=classifyObservation({...triple,complete:false});
 assert.equal(uncertain.status,'unreadable');
 assert.equal(uncertain.id,undefined);
 assert.match(uncertain.message,/visible ingredient names have no exact catalogue entry/);
 assert.equal(classifyObservation({...base,label:null}).id,'amoxicillin');
 assert.equal(classifyObservation({...base,label:null,complete:false}).id,undefined);
});
test('cosmetics and unknown ingredients have different safe outcomes',()=>{
 const cosmetic=classifyObservation({...base,productType:'non_medicine',ingredients:[]});assert.equal(cosmetic.status,'non_medicine');assert.equal(cosmetic.id,undefined);
 const unknown=classifyObservation({...base,ingredients:['cefixime']});assert.equal(unknown.status,'unsupported');assert.equal(unknown.id,undefined);
 const conflict=classifyObservation({...base,productType:'non_medicine'});assert.equal(conflict.status,'unreadable');assert.equal(conflict.id,undefined);
});
test('observation validation rejects model-written advice and malformed shapes',()=>{
 assert.deepEqual(parseObservation(JSON.stringify(base)),base);
 for(const v of [null,[],{}, {...base,advice:'Take this'},{...base,complete:'yes'},{...base,ingredients:['<script>']},{...base,ingredients:new Array(7).fill('x')},{...base,label:'x'.repeat(141)},{...base,productType:'safe'}])assert.throws(()=>parseObservation(JSON.stringify(v)));
});
test('non-antibiotic guidance cannot inherit antibiotic prescription rules',()=>{
 for(const id of ['paracetamol','ibuprofen']){const r=assess(id,'cold')!;assert.equal(r.medicine.antibiotic,false);assert.match(r.rule.title,/not an antibiotic/);assert.doesNotMatch(r.rule.text,/Take antibiotics exactly/);}
});
test('education selection is restricted to source-based library with mandatory rules outside AI',()=>{
 const edu=educationFor('amoxicillin','cold')!;
 assert.deepEqual(validateSelection('{"paragraphIds":["identity","target"],"questionIds":["need","plan"]}',edu.paragraphs),{paragraphIds:['identity','target'],questionIds:['need','plan']});
 for(const v of [{paragraphIds:['identity','invented'],questionIds:['need','plan']},{paragraphIds:['identity','identity'],questionIds:['need','plan']},{paragraphIds:['identity'],questionIds:['need','plan']},{paragraphIds:['identity','target'],questionIds:['need','plan'],advice:'Take two'}])assert.throws(()=>validateSelection(JSON.stringify(v),edu.paragraphs));
 const non=educationFor('paracetamol','cold')!;assert.equal(Object.hasOwn(non.paragraphs,'target'),false);
});
