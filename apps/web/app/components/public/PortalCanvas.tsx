import {Canvas,useFrame} from '@react-three/fiber';
import {Float} from '@react-three/drei';
import {useRef} from 'react';
import type {Group} from 'three';
function Sculpture({mode}:{mode:string}){const group=useRef<Group>(null);useFrame((_,delta)=>{if(group.current)group.current.rotation.y+=delta*.13});return <Float speed={1.1} rotationIntensity={.2} floatIntensity={.3}><group ref={group} rotation={[.5,.3,.15]}>{[0,1,2,3].map((n)=><mesh key={n} rotation={[n*.33,n*.5,0]} scale={1-n*.12}><torusGeometry args={[1.6,.065,12,80]}/><meshStandardMaterial color={mode==='create'?'#c49d80':'#d2b77b'} metalness={.83} roughness={.27}/></mesh>)}<mesh><icosahedronGeometry args={[.55,1]}/><meshStandardMaterial color="#e6d7ba" metalness={.7} roughness={.2}/></mesh></group></Float>}
export default function PortalCanvas({mode='idle'}:{mode?:string}){return <Canvas dpr={[1,1.4]} camera={{position:[0,0,6],fov:40}} gl={{alpha:true,antialias:true}} aria-label="Scultura astratta Omni Portal"><ambientLight intensity={1.2}/><directionalLight position={[3,4,5]} intensity={4}/><directionalLight position={[-4,-3,1]} intensity={2}/><Sculpture mode={mode}/></Canvas>}
