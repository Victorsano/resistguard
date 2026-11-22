import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assess,matchIngredient,medicines,scenarios,parseScan} from '../lib/safety';
import {allow,readBody,sameOrigin} from '../lib/guard';
test('exact ingredient matching rejects brands, combinations and strengths',()=>{
 assert.equal(matchIngredient(' Amoxicillin ')?.id,'amoxicillin');
 for(const v of ['Amoxil','amoxicillin clavulanate','amoxicillin 500mg',null,{},'unknown'])assert.equal(matchIngredient(v),null);
});
test('all supported scenarios return deterministic guidance with emergency boundary',()=>{
 for(const m of medicines)for(const s of Object.keys(scenarios)){const r=assess(m.id,s)!;assert.ok(r.rule.text.length>50);assert.match(r.emergency,/immediate emergency/);assert.ok(r.sources.every(x=>x.url.startsWith('https://')));}
 for(const s of ['__proto__','constructor','anything'])assert.equal(assess('amoxicillin',s),null);
 assert.equal(assess('not-a-drug','cold'),null);
});
test('request budget limits each anonymous bucket',()=>{const now=Date.now()+120_000;for(let i=0;i<6;i++)assert.equal(allow('test',now),true);assert.equal(allow('test',now),false);assert.equal(allow('test',now+60_001),true);});
test('same origin rejects cross-site posts',()=>{assert.equal(sameOrigin(new Request('https://demo.test/api',{headers:{origin:'https://evil.test'}})),false);});
test('same origin supports normalized loopback and trusted proxy scheme',()=>{
 assert.equal(sameOrigin(new Request('http://localhost:3000/api',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})),true);
 assert.equal(sameOrigin(new Request('http://internal/api',{headers:{host:'demo.vercel.app','x-forwarded-proto':'https',origin:'https://demo.vercel.app'}})),true);
 assert.equal(sameOrigin(new Request('http://localhost:3000/api',{headers:{host:'127.0.0.1:3000',origin:'http://evil.test:3000'}})),false);
});
test('body reader rejects excessive input and non-JSON',async()=>{
 await assert.rejects(readBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({x:'a'.repeat(2_900_001)})})));
 await assert.rejects(readBody(new Request('http://localhost',{method:'POST',body:'hello'})));
});
test('vision output fails closed for uncertain, malformed and combined records',()=>{
 assert.equal(parseScan('{"ingredient":"amoxicillin"}')?.id,'amoxicillin');
 for(const raw of ['null','[]','{}','{"ingredient":null}','{"ingredient":"Amoxil"}','{"ingredient":"amoxicillin + clavulanate"}','{"ingredient":"amoxicillin","extra":"ignore"}'])assert.equal(parseScan(raw),null);
 assert.throws(()=>parseScan('not JSON'));
});
