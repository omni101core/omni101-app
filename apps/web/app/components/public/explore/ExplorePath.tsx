import {lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Link} from 'react-router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Visual} from '../Visual';
import {useWebGLSlot} from '../webglSlot';
import {stations} from './stations';
import type {PathMotion} from './ExploreScene';
import '../../../styles/explore.css';

const ExploreScene=lazy(()=>import('./ExploreScene'));
const pad=(n:number)=>String(n).padStart(2,'0');

/** Stations in scroll order. The cards are real DOM in every mode; the enhanced mode (wide screen, motion allowed)
 * pins one WebGL canvas behind them and moves its camera along the path as the cards scroll past the centre. */
export default function ExplorePath(){
 const root=useRef<HTMLElement>(null),items=useRef<(HTMLLIElement|null)[]>([]),motion=useRef<PathMotion>({station:0}),[enhanced,setEnhanced]=useState(false),[near,setNear]=useState(false),[scene,setScene]=useState<'idle'|'ready'|'failed'>('idle'),[active,setActive]=useState(0);
 const gl=useWebGLSlot('explore:path',enhanced&&near&&scene!=='failed');
 useEffect(()=>{const query=matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)'),sync=()=>setEnhanced(query.matches);sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync)},[]);
 useEffect(()=>{
  const element=root.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'300px 0px'});
  observer.observe(element);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  const element=root.current;if(!element||!enhanced)return;
  gsap.registerPlugin(ScrollTrigger);
  const update=()=>{
   const centers=items.current.map(item=>{const rect=item?.getBoundingClientRect();return rect?rect.top+rect.height/2:0}),middle=window.innerHeight/2,last=centers.length-1;
   let station=0;
   if(middle>=centers[last])station=last;
   else if(middle>centers[0]){const i=centers.findIndex((center,k)=>middle>=center&&middle<centers[k+1]);station=i+(middle-centers[i])/(centers[i+1]-centers[i])}
   motion.current.station=station;
   const nearest=Math.round(station);setActive(previous=>previous===nearest?previous:nearest);
  };
  const trigger=ScrollTrigger.create({trigger:element,start:'top bottom',end:'bottom top',onUpdate:update,onRefresh:update});
  update();
  return()=>trigger.kill();
 },[enhanced]);
 const go=(index:number)=>{
  const item=items.current[index];if(!item)return;
  item.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  item.querySelector<HTMLElement>('h2')?.focus({preventScroll:true});
 };
 const shown=enhanced&&gl&&scene!=='failed';
 return <section ref={root} className="ex-path" data-engine="curve-camera-path" data-enhanced={enhanced} data-gl={shown&&scene==='ready'?'on':'off'} data-active-station={enhanced?stations[active].id:undefined} aria-label="Percorso nelle possibilità">
  <nav className="ex-index" aria-label="Stazioni del percorso"><ol>{stations.map((s,i)=><li key={s.id}><button type="button" aria-current={enhanced&&i===active?'step':undefined} onClick={()=>go(i)}><span>{pad(i+1)}</span>{s.id}</button></li>)}</ol></nav>
  <div className="ex-stage" aria-hidden="true">
   {shown&&<Suspense fallback={null}><ExploreScene motion={motion} onState={setScene}/></Suspense>}
   <div className="ex-hud"><span>{pad(active+1)} / {pad(stations.length)}</span><strong>{stations[active].kicker}</strong><i style={{transform:`scaleX(${(active+1)/stations.length})`}}/></div>
  </div>
  <ol className="ex-stations">{stations.map((s,i)=><li key={s.id} ref={node=>{items.current[i]=node}} className="ex-station" data-side={i%2===0?'left':'right'}>
   <article className="ex-card" data-station={s.id} data-kind={s.kind} data-active={enhanced&&i===active}>
    <div className="ex-visual"><Visual kind={s.visual}/></div>
    <span className="eyebrow">{pad(i+1)} / {s.kicker}</span>
    <h2 tabIndex={-1}>{s.title}</h2>
    <p>{s.text}</p>
    {s.detail&&<p className="ex-detail"><small>Un esempio</small>{s.detail}</p>}
    <Link className="button" to={s.to}>{s.label}</Link>
   </article>
  </li>)}</ol>
 </section>;
}
