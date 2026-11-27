import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkAntibiogram,classCounts,sampleAntibiograms,type Antibiogram} from '../lib/antibiogram';

const sheet=(id:string)=>sampleAntibiograms.find(item=>item.id===id)!.antibiogram;
const titles=(a:Antibiogram)=>checkAntibiogram(a).flags.map(flag=>flag.title);

test('sheet 1: resistance in two classes raises no priority flag',()=>{
 const result=checkAntibiogram(sheet('1'));
 assert.deepEqual(result.flags,[]);
 assert.deepEqual(result.steps,['No priority pattern in the antibiotics tested. Report as usual.']);
});

test('sheet 2: carbapenem-resistant Klebsiella, multidrug resistant, and an unexpected ampicillin result',()=>{
 const flags=titles(sheet('2'));
 assert.deepEqual(flags,['Carbapenem-resistant Enterobacterales','Multidrug resistant','Check the ampicillin result']);
 // Expected resistance is not counted towards multidrug resistance
 assert.equal(classCounts(sheet('2')).resistant.includes('Penicillins'),false);
});

test('sheet 3: MRSA always counts as multidrug resistant',()=>{
 assert.deepEqual(titles(sheet('3')),['Methicillin-resistant Staphylococcus aureus (MRSA)','Multidrug resistant']);
});

test('sheet 4: third-generation cephalosporin resistance is flagged when carbapenems still work',()=>{
 assert.deepEqual(titles(sheet('4')),['Third-generation cephalosporin-resistant Enterobacterales','Multidrug resistant']);
});

test('sheet 5: carbapenem-resistant Pseudomonas with two results that contradict expected resistance',()=>{
 assert.deepEqual(titles(sheet('5')),['Carbapenem-resistant Pseudomonas aeruginosa','Multidrug resistant','Check the ceftriaxone result','Check the trimethoprim-sulfamethoxazole result']);
});

test('sheet 6: Acinetobacter with one class left is extensively drug resistant',()=>{
 assert.deepEqual(titles(sheet('6')),['Carbapenem-resistant Acinetobacter baumannii','Extensively drug resistant']);
});

test('sheet 7: typhoid uses its own multidrug definition and is not extensively resistant while ceftriaxone works',()=>{
 assert.deepEqual(titles(sheet('7')),['Fluoroquinolone-resistant Salmonella Typhi','Multidrug-resistant typhoid']);
 const xdr={...sheet('7'),results:{...sheet('7').results,ceftriaxone:'R' as const}};
 assert.ok(titles(xdr).includes('Extensively drug-resistant typhoid'));
});

test('priority findings send the result to infection control, a reference lab and NCDC surveillance',()=>{
 const steps=checkAntibiogram(sheet('2')).steps;
 assert.equal(steps[0],'Recheck the flagged results before you release this report.');
 assert.ok(steps.some(step=>step.includes('NCDC')));
});

test('the check never names an antibiotic to treat with',()=>{
 for(const {antibiogram} of sampleAntibiograms){
  const {flags,steps}=checkAntibiogram(antibiogram);
  const text=[...flags.flatMap(flag=>[flag.title,flag.detail]),...steps].join(' ');
  assert.doesNotMatch(text,/\b(treat with|prescribe|give|start|dose|mg)\b/i);
 }
});
