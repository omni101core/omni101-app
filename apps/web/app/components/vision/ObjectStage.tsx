import {useEffect,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import type {Group} from 'three';

function Portal({rotation,reduced}:{rotation:number;reduced:boolean}){
 const ref=useRef<Group>(null);
 const rotationRef=useRef(rotation);
 rotationRef.current=rotation;
 const {invalidate}=useThree();
 useEffect(()=>{invalidate()},[rotation,reduced,invalidate]);
 useFrame(()=>{
  const group=ref.current;
  if(!group)return;
  const target=rotationRef.current*Math.PI/180;
  if(reduced){group.rotation.y=target;return}
  const next=group.rotation.y+(target-group.rotation.y)*.2;
  group.rotation.y=next;
  if(Math.abs(target-next)>.01)invalidate();
 });
 return <group ref={ref}><mesh><torusGeometry args={[1.05,.22,20,48]}/><meshStandardMaterial color="#d2b77b" metalness={.55} roughness={.32}/></mesh><mesh rotation={[Math.PI/2.4,.4,0]}><torusGeometry args={[.62,.06,12,40]}/><meshStandardMaterial color="#f2eee6" metalness={.15} roughness={.45}/></mesh></group>;
}

export default function ObjectStage({rotation,reduced,onReady}:{rotation:number;reduced:boolean;onReady:()=>void}){
 return <Canvas className="vision-gl" frameloop="demand" dpr={[1,1.5]} camera={{position:[0,0,3.6],fov:42}} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} aria-hidden="true" onCreated={({gl,invalidate})=>{onReady();invalidate();gl.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault()})}}><ambientLight intensity={.8}/><directionalLight position={[2.2,2.4,3]} intensity={2.4}/><Portal rotation={rotation} reduced={reduced}/></Canvas>;
}
