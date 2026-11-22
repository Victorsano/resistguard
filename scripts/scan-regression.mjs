// Exercises the real app endpoint and provider. Requires a running app with AI enabled.
// Results contain classifications and fixture IDs, never secrets or uploaded image data.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=(process.env.SCAN_TEST_URL||'http://127.0.0.1:3000').replace(/\/$/,'');
const fixtures=JSON.parse(await fs.readFile(path.join(root,'data/scan-fixtures.json'),'utf8'));
const output=process.env.SCAN_TEST_OUTPUT||path.join(root,'..','scan-regression.json');
const retry=process.argv.includes('--retry-failed');
let prior=null;
if(retry)prior=JSON.parse(await fs.readFile(output,'utf8'));
const only=process.argv.find(a=>a.startsWith('--only='))?.split('=')[1];
const cases=fixtures.filter(f=>(!only||only.split(',').includes(f.id))&&(!prior||prior.results.some(r=>r.fixture===f.id&&!r.pass)));
const results=[];
for(const [index,fixture] of cases.entries()){
 // Image tokens make free-tier TPM tighter than request count alone. Pace live tests.
 if(index)await new Promise(resolve=>setTimeout(resolve,35_000));
 const started=Date.now();
 try{
 const image='data:image/png;base64,'+(await fs.readFile(path.join(root,'public/test-labels',fixture.file))).toString('base64');
 const response=await fetch(`${base}/api/scan`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({image}),signal:AbortSignal.timeout(30_000)});
 const data=await response.json();
 const pass=response.ok&&data.status===fixture.expectedStatus&&(data.id??null)===fixture.expectedId;
 const result={fixture:fixture.id,expectedStatus:fixture.expectedStatus,actualStatus:data.status??null,expectedId:fixture.expectedId,actualId:data.id??null,reason:data.reason??null,http:response.status,pass,durationMs:Date.now()-started};
 results.push(result);console.log(JSON.stringify(result));
 }catch{const result={fixture:fixture.id,pass:false,error:'Request failed or timed out'};results.push(result);console.log(JSON.stringify(result));}
}
const merged=prior?prior.results.map(old=>{const current=results.find(r=>r.fixture===old.fixture);return current?{...current,previousAttempts:[...(old.previousAttempts||[]),{...old,previousAttempts:undefined}]}:old;}):results;
const summary={checkedAt:new Date().toISOString(),base,passed:merged.filter(r=>r.pass).length,total:merged.length,results:merged};
await fs.writeFile(output,JSON.stringify(summary,null,2));
console.log(`Passed ${summary.passed}/${summary.total}. Results: ${output}`);
if(summary.passed!==summary.total)process.exitCode=1;
