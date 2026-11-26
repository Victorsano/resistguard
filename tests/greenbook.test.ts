import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compareRegisteredIngredients,registrationNumber} from '../lib/greenbook';
import {greenbookSearch,parseGreenbookDetails} from '../lib/greenbook-source';
import {parseObservation,parseRegistrationScan} from '../lib/scan';

test('checks an exact NAFDAC number, with no guess from photo or search',()=>{
 assert.equal(registrationNumber('  a4 – 8312  '),'A4-8312');
 assert.equal(registrationNumber('a fake number'),null);
 assert.equal(parseRegistrationScan('{"registrationNumber":"04-5729"}'),'04-5729');
 assert.equal(parseRegistrationScan('{"registrationNumber":null}'),null);
 assert.throws(()=>parseRegistrationScan('{"registrationNumber":"04-5729","advice":"extra"}'));
 const observation={productType:'medicine',label:null,ingredients:['cefixime'],legibility:'clear',complete:true};
 assert.deepEqual(parseObservation(JSON.stringify(observation)),observation);
 assert.equal(parseObservation(JSON.stringify({...observation,registrationNumber:'A4-8312'})).registrationNumber,'A4-8312');
 assert.equal(greenbookSearch('A4-8312').searchParams.get('search[value]'),'A4-8312');
});

test('requires the exact number on the registry record and compares ingredients',()=>{
 const html='<div class="card-body" ><h1>Product &amp; Co.</h1><span>Cefixime (Cefixime Trihydrate)</span> <br/> <span>400 mg</span> <br/><h1>NRN</h1><p>A4-8312</p><h1>Status</h1><p>Active</p><h1>Manufacturer Name</h1><p>Manufacturer Ltd</p>';
 const url='https://greenbook.nafdac.gov.ng/products/details/4888';
 const parsed=parseGreenbookDetails(html,'A4-8312',url);
 assert.equal(parsed?.name,'Product & Co.');
 assert.equal(parsed?.manufacturer,'Manufacturer Ltd');
 assert.equal(parseGreenbookDetails(html,'04-5729',url),null);
 assert.equal(compareRegisteredIngredients(['cefixime'],parsed!.ingredients),'match');
 assert.equal(compareRegisteredIngredients(['amoxicillin'],parsed!.ingredients),'mismatch');
 assert.equal(compareRegisteredIngredients(['ampicillin','cloxacillin'],'Ampicillin (Ampicillin Trihydrate); Cloxacillin (Cloxacillin Sodium)'),'match');
 assert.equal(compareRegisteredIngredients(['cefixime'],'Cefixime, tablet'),'unconfirmed');
});
