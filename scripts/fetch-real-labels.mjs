import fs from 'node:fs/promises';
const cases=[{id:'amoxicillin',setid:'4fb7837e-964c-4d38-a3a5-b384b1bd6e08',index:1,expected:'amoxicillin'},{id:'acetaminophen',setid:'fc5d92c2-4bbe-8ad1-e053-6294a90a65b6',index:1,expected:'paracetamol'},{id:'co-trimoxazole',setid:'d60c218c-6529-4944-af0b-a9dc720f32e9',index:0,expected:'co-trimoxazole'}];
await fs.mkdir('work/real-labels',{recursive:true});
const manifest=[];
for(const c of cases){const r=await fetch(`https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${c.setid}/media.json`);const data=await r.json();const media=data.data.media[c.index];const image=await fetch(media.url);if(!image.ok)throw new Error('Image fetch failed');await fs.writeFile(`work/real-labels/${c.id}.jpg`,Buffer.from(await image.arrayBuffer()));manifest.push({...c,source:`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${c.setid}`,imageUrl:media.url,file:`${c.id}.jpg`,kind:'published_manufacturer_label_artwork_not_phone_photo'});}
await fs.writeFile('work/real-labels/manifest.json',JSON.stringify(manifest,null,2));console.log('Downloaded three published label artwork fixtures for private regression.');
