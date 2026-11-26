import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addMedicineName,findMedicines,scanOutcome,staysOnPhoto,allSources,capitalise,suggestReasons} from '../lib/flow';
import {unavailableScan,type ScanResult} from '../lib/scan';
const ids=(q:string)=>findMedicines(q).map(m=>m.id);
const scan=(over:Partial<ScanResult>&{reason?:string}):ScanResult&{reason?:string}=>({mode:'candidate',status:'unreadable',title:'t',message:'m',nextStep:'n',...over});
const obs=(over:object={})=>({productType:'medicine' as const,label:null,ingredients:[] as string[],legibility:'clear' as const,complete:true,...over});
test('find by name searches names, ingredients, brands and NAFDAC numbers like the Catalogue',()=>{
 assert.deepEqual(ids('amoxicillin').sort(),['amoxicillin','co-amoxiclav']);
 assert.deepEqual(ids('Emzoclox'),['ampicillin-cloxacillin']);
 assert.deepEqual(ids('04-5729'),['ampicillin-cloxacillin']);
 assert.deepEqual(ids('  PARACETAMOL '),['paracetamol']);
 assert.deepEqual(ids(''),[]);
 assert.deepEqual(ids('zzzz'),[]);
});
test('scan outcomes pick the right screen-3 message',()=>{
 assert.equal(scanOutcome(scan({status:'candidate',id:'amoxicillin'})),'match');
 assert.equal(scanOutcome(scan({status:'combination',id:'co-amoxiclav'})),'match');
 assert.equal(scanOutcome(scan({status:'unsupported',observation:obs({ingredients:['fosfomycin']})})),'not_listed');
 assert.equal(scanOutcome(scan({status:'combination',observation:obs({ingredients:['a','b']})})),'not_listed');
 assert.equal(scanOutcome(scan({status:'non_medicine'})),'not_medicine');
 assert.equal(scanOutcome(scan({observation:obs({label:'Emzoclox'})})),'brand_only');
 assert.equal(scanOutcome(scan({observation:obs({legibility:'partial'})})),'unreadable');
 assert.equal(scanOutcome(scan({})),'unreadable');
 assert.equal(scanOutcome({...unavailableScan(),reason:'not_configured'}),'paused');
 assert.equal(scanOutcome({...unavailableScan(),reason:'request_limit'}),'failed');
 assert.equal(scanOutcome({...unavailableScan(),reason:'rate_limit'}),'failed');
 assert.equal(scanOutcome({...unavailableScan(),reason:'timeout'}),'timeout');
 assert.equal(scanOutcome(unavailableScan(),true),'timeout');
 assert.equal(scanOutcome({...unavailableScan(),reason:'connection'}),'failed');
 assert.ok(['timeout','paused','failed'].every(o=>staysOnPhoto(o as never)));
 assert.ok(!staysOnPhoto('match')&&!staysOnPhoto('not_listed'));
});
test('typed medicine names ignore blanks and duplicates and keep the spelling the user entered',()=>{
 const names=[{name:'Paracetamol',choice:'paracetamol'}];
 assert.equal(addMedicineName(names,'  '),names);
 assert.equal(addMedicineName(names,' paracetamol '),names);
 assert.deepEqual(addMedicineName(names,'  Brand from pack  '),[...names,{name:'Brand from pack',choice:null}]);
 assert.deepEqual(names,[{name:'Paracetamol',choice:'paracetamol'}]);
});
test('reasons suggest known phrases without picking an option for the user',()=>{
 assert.deepEqual(suggestReasons('I have a sore throat and fever.'),['throat','fever']);
 assert.deepEqual(suggestReasons('My toothache'),['dental']);
 assert.deepEqual(suggestReasons('I don’t have a cough'),[]);
 assert.deepEqual(suggestReasons('I feel coldness in my fingers'),[]);
});
test('sources page lists every link once',()=>{
 const {medicines,guidance}=allSources();
 const urls=[...medicines,...guidance].map(s=>s.url);
 assert.ok(urls.length>5);
 for(const list of [medicines,guidance])assert.equal(new Set(list.map(s=>s.url)).size,list.length);
 assert.ok(urls.every(u=>u.startsWith('https://')));
 assert.equal(capitalise('clavulanic acid'),'Clavulanic acid');
});
test('flow copy matches the spec and never implies a medicine is safe',async()=>{
 const {copy}=await import('../lib/screen-copy');
 assert.equal(copy.home.title,'What are you about to take?');
 assert.equal(copy.home.titleEm,'take');
 assert.equal(copy.home.scan,'Scan your medicine');
 assert.equal(copy.confirm.title,'Is this what your pack says?');
 assert.equal(copy.confirm.chosen('Amoxicillin'),'You chose amoxicillin');
 assert.equal(copy.answer.review,'Not yet reviewed by a pharmacist');
 assert.equal(copy.answer.boundary,"This tells you what's in the pack. Only a pharmacist or doctor can tell you if you need it.");
 assert.equal(copy.find.all,'See all 28 medicines');
 assert.match(copy.photo.consent,/Groq/);
 const text=JSON.stringify(copy);
 assert.doesNotMatch(text,/\bsafe\b|approved|ok to take|genuine/i);
 assert.doesNotMatch(text,/\b\d{5}\b/);
});
