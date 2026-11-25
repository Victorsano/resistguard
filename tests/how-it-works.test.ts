import {test} from 'node:test';
import assert from 'node:assert/strict';
import {howItWorks} from '../lib/how-it-works';
import {getPassage} from '../lib/use-check';
test('How it works keeps the three former Ask ResistGuard answers',()=>{
 assert.deepEqual(howItWorks.answers.map(a=>a.question),['How do I photograph the label?','What does a NAFDAC number tell me?','Why does responsible antibiotic use matter?']);
 for(const a of howItWorks.answers){assert.ok(a.text.length>0,a.id);for(const s of a.sources)assert.match(s.url,/^https:\/\//,a.id);}
});
test('responsible use answer comes from the reviewed AMR passage',()=>{
 const amr=howItWorks.answers.find(a=>a.id==='amr');assert.ok(amr);
 assert.equal(amr.text,getPassage('amr').text);
 assert.equal(amr.sources[0].url,getPassage('amr').reference.url);
});
test('NAFDAC answer links the Greenbook and opens Catalogue',()=>{
 const registry=howItWorks.answers.find(a=>a.id==='registry');assert.ok(registry);
 assert.ok('catalogue' in registry&&registry.catalogue);
 assert.equal(registry.sources[0].url,'https://greenbook.nafdac.gov.ng/');
});
