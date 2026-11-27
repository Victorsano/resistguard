'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import './hero-particles.css';

const steps=['scan','confirm','chat','shield'] as const;
type Step=typeof steps[number];

export default function HeroParticles(){
 const stage=useRef<HTMLDivElement>(null);
 const select=useRef<(step:Step)=>void>(()=>{});
 const current=useRef<Step>('scan');
 const [active,setActive]=useState<Step>('scan');
 const [ready,setReady]=useState(false);
 const choose=useCallback((id:Step)=>{
  if(current.current===id)return;
  current.current=id;
  setActive(id);
  select.current(id);
 },[]);

 useEffect(()=>{
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const timer=window.setInterval(()=>{
   if(document.hidden)return;
   if(motion.matches)return;
   const index=steps.indexOf(active);
   choose(steps[(index+1)%steps.length]);
  },2000);
  return ()=>window.clearInterval(timer);
 },[active,choose]);

 useEffect(()=>{
  const host=stage.current!;
  const signal=new AbortController();
  let dispose:(()=>void)|undefined;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if((navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData)return;
  void Promise.all([
   import('three'),
   fetch('/hero-particles/points.json',{signal:signal.signal}).then(response=>{
    if(!response.ok)throw new Error('Particle data unavailable');
    return response.json() as Promise<Record<Step,[number,number,number,number,number][]>>;
   })
  ]).then(([three,shapes])=>{
   if(signal.signal.aborted)return;
   const renderer=new three.WebGLRenderer({alpha:true,antialias:false});
   const scene=new three.Scene();
   const camera=new three.OrthographicCamera(-1,1,1,-1,.1,10);
   camera.position.z=3;
   const positions=new Float32Array(shapes.scan.length*3);
   const colors=new Float32Array(positions.length);
   const geometry=new three.BufferGeometry();
   const position=new three.BufferAttribute(positions,3).setUsage(three.DynamicDrawUsage);
   const color=new three.BufferAttribute(colors,3).setUsage(three.DynamicDrawUsage);
   geometry.setAttribute('position',position);
   geometry.setAttribute('color',color);
   const size={value:2};
   const material=new three.ShaderMaterial({
    uniforms:{size},transparent:true,depthWrite:false,
    vertexShader:`attribute vec3 color; varying vec3 pointColor; uniform float size;
      void main(){pointColor=color; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=size;}`,
    fragmentShader:`varying vec3 pointColor;
      void main(){float radius=length(gl_PointCoord-.5)*2.; gl_FragColor=vec4(pointColor,.94*(1.-smoothstep(.58,1.,radius)));}`
   });
   const particles=new three.Points(geometry,material);
   particles.frustumCulled=false;
   scene.add(particles);
   host.append(renderer.domElement);
   let frame=0;
   const swirl={scan:.13,confirm:-.12,chat:.23,shield:-.25};
   function render(){
    position.needsUpdate=true;
    color.needsUpdate=true;
    renderer.render(scene,camera);
   }
   function resize(){
    const {clientWidth:width,clientHeight:height}=host;
    const side=Math.min(width,height);
    if(!side)return;
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(width,height,false);
    camera.left=-width/side;
    camera.right=width/side;
    camera.top=height/side;
    camera.bottom=-height/side;
    camera.updateProjectionMatrix();
    size.value=Math.max(1.4,side/170)*renderer.getPixelRatio();
    render();
   }
   function morph(id:Step,instant=false){
    cancelAnimationFrame(frame);
    const from=positions.slice();
    const fromColors=colors.slice();
    const start=performance.now();
    const target=shapes[id];
    function draw(now:number){
     const progress=instant||motion.matches?1:Math.min(1,(now-start)/900);
     const mix=progress*progress*(3-2*progress);
     const arc=Math.sin(Math.PI*mix)*swirl[id];
     for(let i=0;i<target.length;i++){
      const [x,y,r,g,b]=target[i];
      const offset=i*3;
      const offsetArc=arc*Math.min(1,Math.hypot(x-from[offset],y-from[offset+1]));
      positions[offset]=three.MathUtils.lerp(from[offset],x,mix)-y*offsetArc;
      positions[offset+1]=three.MathUtils.lerp(from[offset+1],y,mix)+x*offsetArc;
      colors[offset]=three.MathUtils.lerp(fromColors[offset],r/255,mix);
      colors[offset+1]=three.MathUtils.lerp(fromColors[offset+1],g/255,mix);
      colors[offset+2]=three.MathUtils.lerp(fromColors[offset+2],b/255,mix);
     }
     render();
     if(progress<1)frame=requestAnimationFrame(draw);
    }
    draw(start);
   }
   const observer=new ResizeObserver(resize);
   observer.observe(host);
   const updateMotion=()=>morph(current.current,true);
   motion.addEventListener('change',updateMotion);
   const contextLost=()=>{cancelAnimationFrame(frame);select.current=()=>{};setReady(false);};
   renderer.domElement.addEventListener('webglcontextlost',contextLost);
   dispose=()=>{
    observer.disconnect();
    motion.removeEventListener('change',updateMotion);
    renderer.domElement.removeEventListener('webglcontextlost',contextLost);
    cancelAnimationFrame(frame);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
   };
   resize();
   morph(current.current,true);
   select.current=morph;
   setReady(true);
  }).catch(()=>{dispose?.();dispose=undefined;});
  return ()=>{
   signal.abort();
   select.current=()=>{};
   dispose?.();
  };
 },[]);

 return <div className="hero-particles" aria-hidden="true">
  <div ref={stage} className="hero-particles-stage">
   {!ready&&<img src={'/hero-particles/'+active+'.png'} alt=""/>}
  </div>
 </div>;
}
