import test from 'node:test';
import assert from 'node:assert/strict';
import {pilotSummary,validatePilotRow,type PilotRow} from '../lib/pilot';

test('wrong acceptance uses only incorrect candidates with an observed decision',()=>{
 const row:PilotRow={platform:'android',browser:'chrome',condition:'clear',expected:'a',observed:'b',result:'candidate',understoodBoundary:false,knowsNextStep:false};
 const summary=pilotSummary([row,{...row,decision:'accepted'},{...row,decision:'did_not_confirm'},{...row,expected:'b',decision:'accepted'}]);
 assert.equal(summary.wrongAccepted,1);
 assert.equal(summary.wrongWithDecision,2);
 assert.ok(validatePilotRow(row,['a','b']));
 assert.ok(!validatePilotRow({...row,result:'unavailable',observed:'none',decision:'accepted'},['a','b']));
});
