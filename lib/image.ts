export type PhotoCrop={x:number;y:number;width:number;height:number};
export type CropHandle='move'|'nw'|'ne'|'sw'|'se';
export const fullPhotoCrop:PhotoCrop={x:0,y:0,width:1,height:1};
const minimumCrop=.125;
const clamp=(value:number,minimum:number,maximum:number)=>Math.min(maximum,Math.max(minimum,value));

export function adjustPhotoCrop(crop:PhotoCrop,handle:CropHandle,dx:number,dy:number):PhotoCrop{
 if(handle==='move'){
  return {...crop,x:clamp(crop.x+dx,0,1-crop.width),y:clamp(crop.y+dy,0,1-crop.height)};
 }
 let {x,y}=crop;
 let right=x+crop.width;
 let bottom=y+crop.height;
 if(handle.endsWith('w'))x=clamp(x+dx,0,right-minimumCrop);
 else right=clamp(right+dx,x+minimumCrop,1);
 if(handle.startsWith('n'))y=clamp(y+dy,0,bottom-minimumCrop);
 else bottom=clamp(bottom+dy,y+minimumCrop,1);
 return {x,y,width:right-x,height:bottom-y};
}

export function zoomPhotoCrop(crop:PhotoCrop,zoom:number):PhotoCrop{
 const scale=1/clamp(zoom,1,8)/Math.max(crop.width,crop.height);
 const width=clamp(crop.width*scale,minimumCrop,1);
 const height=clamp(crop.height*scale,minimumCrop,1);
 return {
  width,height,x:clamp(crop.x+(crop.width-width)/2,0,1-width),
  y:clamp(crop.y+(crop.height-height)/2,0,1-height)
 };
}

export function photoCropPixels(crop:PhotoCrop,width:number,height:number){
 const x=clamp(Math.round(crop.x*width),0,width-1);
 const y=clamp(Math.round(crop.y*height),0,height-1);
 return {
  x,y,width:clamp(Math.round((crop.x+crop.width)*width)-x,1,width-x),
  height:clamp(Math.round((crop.y+crop.height)*height)-y,1,height-y)
 };
}

export async function prepareImage(file:File,crop:PhotoCrop=fullPhotoCrop):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPEG, PNG or WebP photo. For HEIC, export the photo as JPEG first.');
 if(file.size>12*1024*1024)throw new Error('Choose a photo smaller than 12 MB.');
 const url=URL.createObjectURL(file);
 try{
 const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('This image could not be opened. Try another photo.'));i.src=url;});
 if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>50_000_000)throw new Error('This photo is too large to process. Export a smaller copy.');
 const area=photoCropPixels(crop,img.naturalWidth,img.naturalHeight);
 const scale=Math.min(1,1600/Math.max(area.width,area.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(area.width*scale));canvas.height=Math.max(1,Math.round(area.height*scale));
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo processing is unavailable in this browser.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(img,area.x,area.y,area.width,area.height,0,0,canvas.width,canvas.height);
 // Re-encoding strips location/EXIF metadata before any image leaves the device.
 let output=canvas.toDataURL('image/jpeg',.88);
 if(output.length>2_700_000)output=canvas.toDataURL('image/jpeg',.65);
 if(output.length>2_700_000)throw new Error('The prepared photo is too large. Move closer to the label and try again.');
 return output;
 }finally{URL.revokeObjectURL(url);}
}
