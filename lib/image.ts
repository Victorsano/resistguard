export async function prepareImage(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP photo. For HEIC, export the photo as JPEG first.');
 if(file.size>12*1024*1024)throw new Error('Choose a photo smaller than 12 MB.');
 const url=URL.createObjectURL(file);
 try{
 const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('This image could not be opened. Try another photo.'));i.src=url;});
 if(!img.width||!img.height||img.width*img.height>50_000_000)throw new Error('This photo is too large to process. Export a smaller copy.');
 const scale=Math.min(1,1600/Math.max(img.width,img.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo processing is unavailable in this browser.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 // Re-encoding strips location/EXIF metadata before any image leaves the device.
 let output=canvas.toDataURL('image/jpeg',.88);
 if(output.length>2_700_000)output=canvas.toDataURL('image/jpeg',.65);
 if(output.length>2_700_000)throw new Error('The prepared photo is too large. Move closer to the label and try again.');
 return output;
 }finally{URL.revokeObjectURL(url);}
}
