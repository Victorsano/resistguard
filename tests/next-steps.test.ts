import {test} from 'node:test';
import assert from 'node:assert/strict';
import {medicines} from '../lib/safety';
import {clinicianMessage,clinicianWhatsAppLink,genuineCheck,joinIngredients,pharmacistNumber,pharmacistSection,unlistedWhatsAppLink,unlistedWhatsAppMessage,whatsAppLink,whatsAppMessage} from '../lib/next-steps';
const record=(id:string)=>{const m=medicines.find(x=>x.id===id);assert.ok(m,id);return m;};
const cases=[['amoxicillin','contains amoxicillin.','an antibiotic.'],['co-amoxiclav','contains amoxicillin and clavulanic acid.','an antibiotic.'],['paracetamol','contains paracetamol.','not an antibiotic.']] as const;
const decode=(link:string)=>decodeURIComponent(link.slice(link.indexOf('?text=')+6));
test('ingredient names join the way people say them',()=>{
 assert.equal(joinIngredients(['amoxicillin']),'amoxicillin');
 assert.equal(joinIngredients(['amoxicillin','clavulanic acid']),'amoxicillin and clavulanic acid');
 assert.equal(joinIngredients(record('triple-antibiotic').ingredients),'bacitracin, neomycin and polymyxin b');
});
test('WhatsApp message names the confirmed ingredients and antibiotic status',()=>{
 for(const [id,names,status] of cases){
  const m=record(id);const text=decode(whatsAppLink(m));
  assert.equal(text,whatsAppMessage(m));
  assert.ok(text.includes(names),id);assert.ok(text.includes(`ResistGuard says it is ${status}`),id);
  if(!m.antibiotic)assert.ok(!text.includes('says it is an antibiotic'),id);
  for(const q of ['Do I need this medicine for my illness?','Is it safe with my other medicines, allergies or conditions?','How should I take it, and for how long?'])assert.ok(text.includes(q),id);
 }
});
test('WhatsApp link only adds a valid pharmacist number',()=>{
 for(const [id] of cases){
  const m=record(id);
  for(const phone of [undefined,'','00000000000','+0234','abc','12345','2340000000000000000'])assert.ok(whatsAppLink(m,phone).startsWith('https://wa.me/?text='),String(phone));
  assert.ok(whatsAppLink(m,'2340000000000').startsWith('https://wa.me/2340000000000?text='));
  assert.ok(whatsAppLink(m,'+234 000 000 0000').startsWith('https://wa.me/2340000000000?text='));
 }
 assert.equal(pharmacistNumber('0800 000 0000'),null);
});
test('WhatsApp link holds no photo data and no product name',()=>{
 for(const [id] of cases){
  const m=record(id);const link=whatsAppLink(m);const text=decode(link).toLowerCase();
  for(const bad of ['data:','base64'])assert.ok(!link.toLowerCase().includes(bad)&&!text.includes(bad),id+' '+bad);
  if(m.name.toLowerCase()!==joinIngredients(m.ingredients))assert.ok(!text.includes(m.name.toLowerCase()),id);
 }
 assert.ok(!decode(whatsAppLink(record('co-amoxiclav'))).toLowerCase().includes('co-amoxiclav'));
});
test('genuine check sends users to NAFDAC without a short code or a verdict',()=>{
 const text=JSON.stringify({genuineCheck,pharmacistSection});
 assert.doesNotMatch(text,/\b\d{5}\b/);
 assert.equal(genuineCheck.steps.length,3);
 assert.equal(genuineCheck.disclaimer,'ResistGuard cannot tell if a medicine is genuine. These checks come from NAFDAC.');
 assert.ok(genuineCheck.steps.every(s=>!('link' in s)||s.link.url==='https://greenbook.nafdac.gov.ng/'));
 assert.deepEqual([...new Set(text.match(/https?:\/\/[^"\s]+/g))],['https://greenbook.nafdac.gov.ng/']);
});
test('not-in-list message names the ingredients the AI read and says the medicine is not in the list',()=>{
 const text=decode(unlistedWhatsAppLink(['Fosfomycin','Lactic Acid']));
 assert.equal(text,unlistedWhatsAppMessage(['Fosfomycin','Lactic Acid']));
 assert.ok(text.includes('The label lists fosfomycin and lactic acid.'));
 assert.ok(text.includes("ResistGuard doesn't have this medicine in its list"));
 assert.ok(!text.includes('says it is an antibiotic')&&!text.includes('says it is not an antibiotic'));
 for(const q of ['Do I need this medicine for my illness?','Is it safe with my other medicines, allergies or conditions?','How should I take it, and for how long?'])assert.ok(text.includes(q));
 assert.ok(unlistedWhatsAppLink(['fosfomycin']).startsWith('https://wa.me/?text='));
 assert.ok(unlistedWhatsAppLink(['fosfomycin'],'+234 803 000 0000').startsWith('https://wa.me/2348030000000?text='));
 assert.ok(!text.toLowerCase().includes('data:'));
});

test('share preview includes only the answers selected for sharing',()=>{
 const m=record('amoxicillin');
 const preview=clinicianMessage(m,'yes','prescriber','',[],[]);
 assert.match(preview,/prescribed it for this illness/);
 assert.doesNotMatch(preview,/Reason:|Details from my check/);
 const shared=clinicianMessage(m,'yes','prescriber','Fictional reason',['Fictional medicine'],['Fictional answer']);
 assert.match(shared,/Fictional reason/);
 assert.match(shared,/Fictional answer/);
 assert.match(shared,/Fictional medicine/);
 assert.match(shared,/whether this medicine is meant to help with the symptoms I described/);
 const pharmacist=clinicianMessage(m,null,'pharmacist','',[],[]);
 assert.doesNotMatch(pharmacist,/prescribed/);
 assert.match(pharmacist,/interacts with anything else/);
 assert.equal(decode(clinicianWhatsAppLink(shared)),shared);
});


test('a prior symptom check does not imply the recipient prescribed a medicine or gave a plan',()=>{
 const message=clinicianMessage(record('ampicillin-cloxacillin'),'no','previous_clinician','',[],[]);
 assert.match(message,/A doctor did not prescribe it/);
 assert.match(message,/Could you tell me whether I need this medicine/);
 assert.doesNotMatch(message,/already checked|you gave|you assessed|treatment plan/i);
});


test('the WhatsApp draft mentions pus from a scar only when the reason is shared',()=>{
 const candidate=record('ampicillin-cloxacillin');
 const reason='pus is coming out of my scar';
 const draft=clinicianMessage(candidate,null,'prescriber',reason,[],[]);
 assert.match(draft,/Was this medicine meant for the pus coming from my scar, and does the area need to be checked/);
 assert.doesNotMatch(draft,/A doctor prescribed/);
 assert.doesNotMatch(clinicianMessage(candidate,null,'prescriber','',[],[]),/pus|scar/);
});

test('the surgical wound draft asks the surgical team to check it when the reason is shared',()=>{
 const candidate=record('ampicillin-cloxacillin');
 const draft=clinicianMessage(candidate,null,'prescriber','Pus is coming out of my scar after the operation I had',[],[]);
 assert.match(draft,/Could your team check it promptly/);
 assert.doesNotMatch(clinicianMessage(candidate,null,'prescriber','',[],[]),/pus|surgery/i);
});
