import {useEffect,useRef,type RefObject} from 'react';
import * as THREE from 'three';
import {stations} from './stations';

/** Camera path through the stations: a CatmullRomCurve3 for the camera and a second one for its target, both
 * sampled by the scroll. Independent implementation of the idea in the Codrops article of 2026-07-07
 * (gaspoorf/curve-gallery has no licence file): no code, model or asset is copied. */
export interface PathMotion{station:number}
const GAP=11,CHAMPAGNE=0xd2b77b,IVORY=0xf2eee6,GRAPHITE=0x101112,SURFACE=0x191a1c;
const shapes:(()=>THREE.BufferGeometry)[]=[()=>new THREE.IcosahedronGeometry(1.3,1),()=>new THREE.BoxGeometry(1.9,1.9,1.9,2,2,2),()=>new THREE.TorusKnotGeometry(.85,.3,96,12),()=>new THREE.OctahedronGeometry(1.5,1),()=>new THREE.TorusGeometry(1.1,.42,14,40),()=>new THREE.DodecahedronGeometry(1.4,0)];
const side=(index:number)=>index%2===0?-1:1;
const place=(index:number)=>new THREE.Vector3(Math.sin(index*1.3)*3,Math.cos(index*.9)*1.2,-index*GAP);

export default function ExploreScene({motion,onState}:{motion:RefObject<PathMotion>;onState:(state:'ready'|'failed')=>void}){
 const mount=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const host=mount.current;if(!host)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'})}catch{onState('failed');return}
  let disposed=false,visible=true,ready=false,current=0,last=performance.now();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.setClearColor(GRAPHITE,1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(50,1,.1,90);scene.fog=new THREE.FogExp2(GRAPHITE,.042);
  const anchors=stations.map((_,i)=>place(i));
  const rail=new THREE.CatmullRomCurve3(anchors.map((p,i)=>new THREE.Vector3(p.x+side(i)*2.4,p.y+.3,p.z+6.5)));
  const aim=new THREE.CatmullRomCurve3(anchors.map((p,i)=>new THREE.Vector3(p.x+side(i)*2.4,p.y,p.z-4)));
  const disposables:{dispose():void}[]=[];
  const track=<T extends {dispose():void}>(item:T):T=>{disposables.push(item);return item};
  const railLine=new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(rail.getPoints(400).map(p=>p.clone().setY(p.y-.9)))),track(new THREE.LineBasicMaterial({color:CHAMPAGNE,transparent:true,opacity:.35})));scene.add(railLine);
  const bodies=anchors.map((anchor,i)=>{
   const group=new THREE.Group(),geometry=track(shapes[i%shapes.length]());
   const wire=new THREE.Mesh(geometry,track(new THREE.MeshBasicMaterial({color:IVORY,wireframe:true,transparent:true,opacity:.85})));
   const core=new THREE.Mesh(geometry,track(new THREE.MeshBasicMaterial({color:SURFACE})));core.scale.setScalar(.97);
   const halo=new THREE.Mesh(track(new THREE.TorusGeometry(2.1,.012,6,96)),track(new THREE.MeshBasicMaterial({color:CHAMPAGNE,transparent:true,opacity:.55})));halo.rotation.x=Math.PI/2.4;
   group.add(core,wire,halo);group.position.copy(anchor);scene.add(group);
   return {group,wire:wire.material as THREE.MeshBasicMaterial,halo};
  });
  const count=900,dust=new Float32Array(count*3);
  for(let k=0;k<count;k++){dust[k*3]=(Math.random()-.5)*30;dust[k*3+1]=(Math.random()-.5)*16;dust[k*3+2]=12-Math.random()*(stations.length*GAP+14)}
  const dustGeometry=track(new THREE.BufferGeometry());dustGeometry.setAttribute('position',new THREE.BufferAttribute(dust,3));
  scene.add(new THREE.Points(dustGeometry,track(new THREE.PointsMaterial({color:IVORY,size:.05,transparent:true,opacity:.55,sizeAttenuation:true}))));
  const pointerTarget=new THREE.Vector2(),pointer=new THREE.Vector2(),color=new THREE.Color(),ivory=new THREE.Color(IVORY),gold=new THREE.Color(CHAMPAGNE),target=new THREE.Vector3();
  const resize=()=>{const rect=host.getBoundingClientRect();renderer.setSize(rect.width,rect.height);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix()};
  const onPointer=(event:PointerEvent)=>pointerTarget.set(event.clientX/window.innerWidth*2-1,-(event.clientY/window.innerHeight*2-1));
  const onLost=(event:Event)=>{event.preventDefault();onState('failed')};
  const frame=(now:number)=>{
   if(disposed)return;
   requestAnimationFrame(frame);
   if(!visible)return;
   const dt=Math.min(.05,(now-last)/1000);last=now;
   const damping=(factor:number)=>1-Math.pow(1-factor,dt*60),max=stations.length-1;
   current+=(THREE.MathUtils.clamp(motion.current.station,0,max)-current)*damping(.08);
   pointer.lerp(pointerTarget,damping(.06));
   const t=current/max;
   camera.position.copy(rail.getPoint(t));camera.position.x+=pointer.x*.35;camera.position.y+=pointer.y*.2;
   camera.lookAt(aim.getPoint(t,target));
   bodies.forEach(({group,wire,halo},i)=>{
    const near=Math.max(0,1-Math.abs(current-i)*1.3);
    group.rotation.y+=dt*(.25+near*.5);group.rotation.x=Math.sin(now/2600+i)*.18;
    group.scale.setScalar(.8+near*.35);halo.rotation.z+=dt*.4;
    wire.color.copy(color.copy(ivory).lerp(gold,near));
   });
   renderer.render(scene,camera);
   if(!ready){ready=true;onState('ready')}
  };
  const watch=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting});
  const sizes=new ResizeObserver(resize);
  watch.observe(host);sizes.observe(host);resize();
  window.addEventListener('pointermove',onPointer,{passive:true});renderer.domElement.addEventListener('webglcontextlost',onLost);
  requestAnimationFrame(frame);
  return()=>{
   disposed=true;watch.disconnect();sizes.disconnect();window.removeEventListener('pointermove',onPointer);renderer.domElement.removeEventListener('webglcontextlost',onLost);
   disposables.forEach(item=>item.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  };
 },[motion,onState]);
 return <div ref={mount} className="ex-canvas" data-scene="camera-path"/>;
}
