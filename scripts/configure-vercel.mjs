// Run with: node --env-file=.env.local scripts/configure-vercel.mjs
// Secrets travel to Vercel through stdin, never command arguments or console output.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const key=process.env.GROQ_API_KEY?.trim();
if(!key){console.error('GROQ_API_KEY is missing.');process.exit(1);}
const cli=path.join(process.env.APPDATA||'', 'npm/node_modules/vercel/dist/index.js');
if(!fs.existsSync(cli)){console.error('Install the Vercel CLI first.');process.exit(1);}
const child=spawn(process.execPath,[cli,'env','add','GROQ_API_KEY','production','--sensitive','--yes','--scope','victors-projects-6471ee68'],{stdio:['pipe','pipe','pipe'],windowsHide:true});
child.stdout.resume();child.stderr.resume();child.stdin.end(key+'\n');
const timer=setTimeout(()=>child.kill(),30_000);
child.on('error',()=>{clearTimeout(timer);console.error('Could not run the Vercel CLI.');process.exitCode=1;});
child.on('exit',code=>{clearTimeout(timer);if(code===0)console.log('Stored the server-side Groq key in Vercel Production as a sensitive environment variable.');else{console.error('Vercel did not confirm the environment update. Inspect project environment variable names before retrying.');process.exitCode=1;}});
