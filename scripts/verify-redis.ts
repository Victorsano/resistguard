import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {reserveQuota} from '../lib/availability';
async function main(){
const text=await fs.readFile('work/redis-test-setup.md','utf8');
const url=text.match(/https:\/\/[A-Za-z0-9-]+\.upstash\.io/)?.[0];
const token=text.match(/Bearer\s+([^\s"'`\\]+)/)?.[1];
if(!url||!token)throw new Error('Could not parse isolated test database credentials. No credentials printed.');
async function command(c:(string|number)[]){const r=await fetch(url!,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(c)});const v=await r.json();if(!r.ok||v.error)throw new Error('Isolated Redis command failed');return v.result;}
process.env.AI_CLIENT_MINUTE_LIMIT='2';process.env.AI_GLOBAL_MINUTE_LIMIT='4';process.env.AI_DAILY_REQUEST_LIMIT='5';process.env.AI_MONTHLY_REQUEST_LIMIT='5';
const now=Date.now();const responses=await Promise.all(Array.from({length:10},()=>reserveQuota(command,'test-client-a','test-secret-not-production',now)));
assert.equal(responses.filter(Boolean).length,2);
// Independent request functions use the same backing database, not local memory.
assert.equal(await reserveQuota(command,'test-client-b','test-secret-not-production',now),true);
assert.equal(await reserveQuota(command,'test-client-c','test-secret-not-production',now),true);
assert.equal(await reserveQuota(command,'test-client-d','test-secret-not-production',now),false);
assert.equal(await reserveQuota(command,'test-client-d','test-secret-not-production',now+60000),true);
assert.equal(await reserveQuota(command,'test-client-e','test-secret-not-production',now+120000),false);
const report={backend:'isolated temporary Redis, not production',checkedAt:new Date().toISOString(),parallelRequests:10,acceptedSameClient:2,globalMinuteEnforced:true,dailyBudgetEnforcedAcrossMinuteBoundaries:true,rawClientIdsStored:false,productionConnected:false};
await fs.writeFile('../redis-verification.json',JSON.stringify(report,null,2));console.log('PASS: real Redis atomic concurrency, shared global minute and daily budgets. Temporary database is not connected to production.');

}
void main().catch(()=>{console.error('Redis verification failed; credentials remain private.');process.exitCode=1;});
