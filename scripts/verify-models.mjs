// Loads no secrets itself. Use node --env-file=.env.local scripts/verify-models.mjs.
if(!process.env.GROQ_API_KEY){console.error('Set GROQ_API_KEY in .env.local first.');process.exit(1);}
try {
 const response=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`},signal:AbortSignal.timeout(15_000)});
 if(!response.ok)throw new Error();
 const data=await response.json();const ids=new Set(data.data.map(m=>m.id));
 let missing=false;
 for(const model of [process.env.GROQ_VISION_MODEL||'qwen/qwen3.8-27b',process.env.GROQ_TEXT_MODEL||'openai/gpt-oss-120b']){const found=ids.has(model);console.log(`${model}: ${found?'listed for this API response':'not listed'}`);if(!found)missing=true;}
 if(missing)process.exitCode=1;
 console.log('Model listing does not test vision quality or guarantee inference quota.');
}catch{console.error('Could not verify models. Check the key, network, account permissions and current Groq model documentation.');process.exitCode=1;}
