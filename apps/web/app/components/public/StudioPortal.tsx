import {lazy,Suspense,useEffect,useRef,useState,type CSSProperties} from 'react';
import {useWebGLSlot} from './webglSlot';
import type {PortalMode} from './PortalCanvas';
import '../../styles/work-studio.css';
const PortalCanvas=lazy(()=>import('./PortalCanvas'));

/**
 * /studio signature effect: OMNI PORTAL, one canvas that changes state with the principles as
 * they scroll past a CSS-sticky stage (no pin). Without WebGL, with reduced motion, or before
 * hydration the stage is the CSS rings below, in the same state vocabulary.
 */
const steps:{mode:PortalMode;title:string;text:string}[]=[
 {mode:'idle',title:'Chiarezza',text:'Obiettivi, scope e responsabilità condivisi, prima di costruire qualunque cosa.'},
 {mode:'explore',title:'Curiosità',text:'Prima di scegliere una direzione ne esploriamo più di una, con prototipi che si possono toccare.'},
 {mode:'build',title:'Concretezza',text:'Ciò che progettiamo deve funzionare per chi lo usa e per chi lo gestisce.'},
 {mode:'automate',title:'Controllo',text:'Revisioni e approvazioni prima del rilascio. L’AI amplia ciò che possiamo fare: la responsabilità delle scelte resta umana.'},
 {mode:'create',title:'Cura',text:'Ogni dettaglio fa parte dell’esperienza: tipografia, ritmo, parole.'},
 {mode:'grow',title:'Continuità',text:'Un progetto può crescere dopo la prima versione. Ci siamo anche dopo.'},
];
export function StudioPortal(){
 const root=useRef<HTMLElement>(null);
 const [mode,setMode]=useState<PortalMode>('idle'),[animated,setAnimated]=useState(false),[near,setNear]=useState(false),[ready,setReady]=useState(false);
 const granted=useWebGLSlot('studio:portal',animated&&near);
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: no-preference)');
  const sync=()=>{setAnimated(query.matches);if(!query.matches)setMode('grow')};
  sync();query.addEventListener('change',sync);
  return()=>query.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{
  const el=root.current;
  if(!el)return;
  const visible=new IntersectionObserver(entries=>setNear(entries.some(entry=>entry.isIntersecting)),{rootMargin:'200px'});
  visible.observe(el);
  const pick=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting&&animated)setMode(entry.target.getAttribute('data-mode') as PortalMode)},{rootMargin:'-45% 0px -45% 0px'});
  el.querySelectorAll('[data-mode]').forEach(step=>pick.observe(step));
  return()=>{visible.disconnect();pick.disconnect()};
 },[animated]);
 useEffect(()=>{if(!granted)setReady(false)},[granted]);
 return <section ref={root} className="studio-portal" data-portal-mode={mode} aria-label="I principi dello studio">
  <header className="sp-intro"><span className="eyebrow">OMNI PORTAL / COME LAVORIAMO</span><h2 className="section-heading">Sei principi.<br/><em>Un solo modo di lavorare.</em></h2></header>
  <div className="sp-layout">
   <div className="sp-stage" aria-hidden="true">
    <div className="sp-fallback" data-ready={ready}>{[0,1,2,3].map(n=><i key={n} style={{'--n':n} as CSSProperties}/>)}<b/></div>
    {granted&&<div className="sp-canvas" data-engine="portal-canvas"><Suspense fallback={null}><PortalCanvas mode={mode} onReady={()=>setReady(true)}/></Suspense></div>}
    <p className="sp-state"><span>STATO</span> {mode.toUpperCase()}</p>
   </div>
   <ol className="sp-steps">{steps.map((step,i)=><li key={step.mode} className="sp-step" data-mode={step.mode}><span className="sp-index">0{i+1} / {step.mode.toUpperCase()}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
  </div>
 </section>;
}
