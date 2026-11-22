// Run against a local server with no GROQ_API_KEY, or DISABLE_AI=1.
import assert from 'node:assert/strict';
const base=process.env.SMOKE_URL||'http://127.0.0.1:3000';
async function post(path,body,origin){return fetch(`${base}/api/${path}`,{method:'POST',headers:{'Content-Type':'application/json',...(origin?{origin}:{})},body:JSON.stringify(body)});}
let r=await fetch(base);assert.equal(r.status,200);assert.match(await r.text(),/ResistGuard/);
r=await post('explain',{id:'amoxicillin',scenario:'cold'},base);assert.equal(r.status,200);let d=await r.json();assert.equal(d.mode,'source-based');assert.match(d.text,/viruses/);
r=await post('explain',{id:'invented',scenario:'cold'});assert.equal(r.status,400);
r=await post('explain',{id:'amoxicillin',scenario:'constructor'});assert.equal(r.status,400);
r=await post('scan',{image:'https://example.com/image.png'});assert.equal(r.status,400);
r=await post('scan',{image:'data:image/png;base64,ZmFrZQ=='});assert.equal(r.status,400);
r=await post('explain',{id:'amoxicillin',scenario:'cold'},'https://evil.example');assert.equal(r.status,403);
const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
r=await post('scan',{image});assert.equal(r.status,200);d=await r.json();assert.equal(d.mode,'manual');assert.equal(d.status,'unavailable');assert.ok(['not_configured','disabled'].includes(d.reason));
let limited=false;for(let i=0;i<7;i++){r=await post('scan',{image});if(r.status===429){limited=true;assert.equal((await r.json()).mode,'manual');break;}}
assert.ok(limited,'scan limit must preserve manual fallback');
console.log('PASS: homepage, keyless explanation, unknown ingredient, invalid scenario, URL rejection, image signature, cross-origin rejection, keyless scan, rate-limit fallback.');
