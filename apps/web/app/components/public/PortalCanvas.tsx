import {Canvas,useFrame} from '@react-three/fiber';
import {Float} from '@react-three/drei';
import {useRef} from 'react';
import {Color,MathUtils,type Group,type Mesh,type MeshStandardMaterial} from 'three';

/**
 * OMNI PORTAL: one original sculpture (four rings and a core) that changes state while the
 * studio principles scroll past (/studio only). Each state is a pose; the scene eases toward it.
 */
export type PortalMode='idle'|'explore'|'build'|'automate'|'create'|'grow';
interface Pose{scales:[number,number,number,number];spread:number;spin:number;core:number;wobble:number;color:string}
const poses:Record<PortalMode,Pose>={
 idle:{scales:[1,.001,.001,.001],spread:0,spin:.12,core:.35,wobble:0,color:'#d2b77b'},
 explore:{scales:[1.15,.95,.75,.55],spread:1.1,spin:.2,core:.45,wobble:.15,color:'#d2b77b'},
 build:{scales:[1,.88,.76,.64],spread:0,spin:.1,core:.7,wobble:0,color:'#c9c4b5'},
 automate:{scales:[1,.88,.76,.64],spread:.55,spin:.7,core:.5,wobble:0,color:'#9fc6bf'},
 create:{scales:[1.1,.9,.8,.6],spread:1.6,spin:.25,core:.55,wobble:.5,color:'#c49d80'},
 grow:{scales:[1.35,1.12,.9,.68],spread:.35,spin:.18,core:.95,wobble:0,color:'#e6c98b'},
};
function Sculpture({mode}:{mode:PortalMode}){
 const group=useRef<Group>(null),rings=useRef<(Mesh|null)[]>([]),core=useRef<Mesh>(null);
 const now=useRef({scales:[...poses.idle.scales],spread:0,spin:poses.idle.spin,core:poses.idle.core,wobble:0,color:new Color(poses.idle.color)});
 const target=useRef(new Color());
 useFrame((state,delta)=>{
  const pose=poses[mode],cur=now.current,k=1-Math.exp(-delta*3.2),t=state.clock.elapsedTime;
  cur.spread=MathUtils.lerp(cur.spread,pose.spread,k);cur.spin=MathUtils.lerp(cur.spin,pose.spin,k);cur.core=MathUtils.lerp(cur.core,pose.core,k);cur.wobble=MathUtils.lerp(cur.wobble,pose.wobble,k);
  cur.color.lerp(target.current.set(pose.color),k);
  if(group.current)group.current.rotation.y+=delta*cur.spin;
  rings.current.forEach((ring,n)=>{
   if(!ring)return;
   cur.scales[n]=MathUtils.lerp(cur.scales[n],pose.scales[n],k);
   ring.scale.setScalar(Math.max(cur.scales[n],.001));
   ring.rotation.set(n*.33+cur.spread*n*.5+Math.sin(t*.8+n)*cur.wobble*.3,n*.5+cur.spread*n*.35,0);
   (ring.material as MeshStandardMaterial).color.copy(cur.color);
  });
  if(core.current)core.current.scale.setScalar(Math.max(cur.core,.001));
 });
 return <Float speed={1.1} rotationIntensity={.2} floatIntensity={.3}><group ref={group} rotation={[.5,.3,.15]}>{[0,1,2,3].map(n=><mesh key={n} ref={mesh=>{rings.current[n]=mesh}}><torusGeometry args={[1.6,.065,12,80]}/><meshStandardMaterial color={poses.idle.color} metalness={.83} roughness={.27}/></mesh>)}<mesh ref={core}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#e6d7ba" metalness={.7} roughness={.2}/></mesh></group></Float>;
}
export default function PortalCanvas({mode='idle',onReady}:{mode?:PortalMode;onReady?:()=>void}){
 return <Canvas dpr={[1,1.4]} camera={{position:[0,0,6],fov:40}} gl={{alpha:true,antialias:true}} aria-label="Scultura astratta Omni Portal" onCreated={()=>onReady?.()}><ambientLight intensity={1.2}/><directionalLight position={[3,4,5]} intensity={4}/><directionalLight position={[-4,-3,1]} intensity={2}/><Sculpture mode={mode}/></Canvas>;
}
