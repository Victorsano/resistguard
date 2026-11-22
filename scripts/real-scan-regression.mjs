import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const base=process.env.REAL_SCAN_TEST_URL||'http://127.0.0.1:3000';
const sources=JSON.parse(await fs.readFile('work/real-labels/manifest.json','utf8'));
const results=[];
for(const [index,c] of sources.entries()){
 if(index)await new Promise(r=>setTimeout(r,35000));
 const bytes=await fs.readFile(path.join('work/real-labels',c.file));
 const start=Date.now();
 try{const r=await fetch(base+'/api/scan',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({image:'data:image/jpeg;base64,'+bytes.toString('base64')}),signal:AbortSignal.timeout(30000)});const v=await r.json();const outcome=v.id?(v.id===c.expected?'correct_candidate':'incorrect_candidate'):v.status==='unavailable'?'unavailable':'safe_abstention';const result={id:c.id,source:c.source,imageUrl:c.imageUrl,kind:c.kind,sha256:createHash('sha256').update(bytes).digest('hex'),expectedId:c.expected,actualId:v.id||null,status:v.status,reason:v.reason||null,http:r.status,outcome,durationMs:Date.now()-start};results.push(result);console.log(JSON.stringify(result));}catch{results.push({id:c.id,outcome:'unavailable',error:'request_failed'});console.log(c.id+': request failed');}
}
const report={checkedAt:new Date().toISOString(),base,scope:'published label artwork, not physical-device photography',results,summary:{total:results.length,correct:results.filter(r=>r.outcome==='correct_candidate').length,incorrect:results.filter(r=>r.outcome==='incorrect_candidate').length,abstained:results.filter(r=>r.outcome==='safe_abstention').length,unavailable:results.filter(r=>r.outcome==='unavailable').length}};
await fs.writeFile('../real-label-regression.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary));if(report.summary.incorrect||report.summary.unavailable)process.exitCode=1;
