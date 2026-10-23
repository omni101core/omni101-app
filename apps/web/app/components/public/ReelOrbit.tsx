import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Link,useNavigate} from 'react-router';
import {gsap} from 'gsap';
import {Visual} from './Visual';
import {media} from '../../content/media';
import {loadProgress,ringPose,ringScene,slotAngle} from './reel-ring';
import '../../styles/reel-entrance.css';

const cards=[['Commerce experience','/explore/commerce'],['Digital products','/solutions/build'],['Creative intelligence','/explore/creative'],['Connected workflows','/explore/workflow'],['Brand systems','/work/identity'],['Omni portal','/solutions'],['Custom software','/solutions/build'],['Digital storefronts','/explore/commerce'],['Content in motion','/explore/creative'],['AI operations','/explore/workflow'],['Editorial experiences','/work/editorial'],['New possibilities','/start-project']];
const STEP=360/cards.length;
const SEEN='omni:reel-seen';
const covers=cards.map((_,i)=>media.reel.length?media.reel[i%media.reel.length]:null);
/** Cards within three slots of the camera decide when the ring may open; the others load quietly. */
const isNear=(slot:number)=>Math.abs(slotAngle(slot,cards.length,0))<=STEP*3;
const coverUrls=[...new Set(covers.filter((cover,i)=>cover&&isNear(i)).map(cover=>cover!.src))];

/** The intro plays once per browser session; coming back to the home shows the open ring. */
function introSeen(){try{return sessionStorage.getItem(SEEN)==='1'}catch{return false}}
function markIntroSeen(){try{sessionStorage.setItem(SEEN,'1')}catch{/* storage can be blocked */}}

/**
 * Home hero. The loader and the hero are one scene: two numbers, `formation` (cards dealt around a small tilted ring)
 * and `expansion` (the ring opens into the level carousel), drive every card through `reel-ring.ts`. The counter reads
 * the covers that have really loaded; the opening waits for the deal and for those covers, whichever is later.
 * Original DOM implementation of the principle documented by Avi Vashishta. No author media or source copied.
 */
export default function ReelOrbit({head,foot}:{head:ReactNode;foot:ReactNode}){
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),ring=useRef<HTMLDivElement>(null),loader=useRef<HTMLDivElement>(null),digits=useRef<(HTMLSpanElement|null)[]>([]);
 const model=useRef({formation:0,expansion:0,angle:0,target:0}),drag=useRef<number|null>(null),dragged=useRef(false),paused=useRef(false),playing=useRef(false),skip=useRef(()=>{});
 const navigate=useNavigate();
 const [isPaused,setPaused]=useState(false),[entering,setEntering]=useState(true),[reduced,setReduced]=useState(false),[active,setActive]=useState(0);

 useEffect(()=>{
  const mq=matchMedia('(prefers-reduced-motion: reduce)'),el=root.current,world=ring.current,view=stage.current,veil=loader.current;
  if(!el||!world||!view)return;
  setReduced(mq.matches);
  const scene=model.current,written=new Map<string,string>();
  const links=Array.from(world.querySelectorAll<HTMLElement>('.reel-card'));
  let alive=true,last=performance.now(),lastActive=0,lastCount=-1,visible=true,loaded=0,formed=false,ready=coverUrls.length===0,opening=false,frame=0;
  const write=(key:string,value:string,apply:()=>void)=>{if(written.get(key)===value)return;written.set(key,value);apply()};
  const count=(value:number)=>{
   if(value===lastCount)return;
   lastCount=value;
   const text=String(value).padStart(3,'0');
   digits.current.forEach((digit,i)=>{if(digit)digit.style.transform='translateY(-'+Number(text[i])*10+'%)'});
  };
  const draw=()=>{
   const s=ringScene(scene.expansion);
   write('perspective',String(s.perspective),()=>view.style.perspective=s.perspective+'px');
   world.style.transform='rotateZ('+s.roll+'deg) translateZ('+(-s.radius)+'px) rotateX('+s.tilt+'deg)';
   const faces=scene.expansion<.6?'visible':'hidden';
   for(let i=0;i<links.length;i++){
    const pose=ringPose(slotAngle(i,links.length,scene.angle),scene.formation,s.radius);
    links[i].style.transform='translate3d('+pose.x+'px,0,'+pose.z+'px) rotateY('+pose.yaw+'deg) scale('+s.scale+')';
    links[i].style.opacity=String(pose.appear);
    write('face'+i,faces,()=>links[i].style.backfaceVisibility=faces);
   }
   const index=((Math.round(-scene.angle/STEP)%links.length)+links.length)%links.length;
   if(index!==lastActive){lastActive=index;setActive(index)}
   count(loadProgress(loaded,coverUrls.length,scene.formation));
  };
  const finish=()=>{
   gsap.killTweensOf(scene);
   if(veil)gsap.killTweensOf(veil);
   scene.formation=1;scene.expansion=1;playing.current=false;
   count(100);draw();setEntering(false);markIntroSeen();wake();
  };
  skip.current=finish;
  const tryOpen=()=>{
   if(!alive||!playing.current||!formed||!ready||opening)return;
   opening=true;
   gsap.to(scene,{expansion:1,duration:1.7,ease:'power4.inOut',onUpdate:draw,onComplete:finish});
   if(veil)gsap.to(veil,{autoAlpha:0,duration:.9,delay:.45,ease:'power2.out'});
  };
  const settle=()=>{if(!alive)return;loaded++;if(loaded>=coverUrls.length){ready=true;tryOpen()}};
  const blockScroll=(event:Event)=>{if(playing.current&&event.cancelable)event.preventDefault()};
  const keys=(event:KeyboardEvent)=>{
   if(!playing.current)return;
   if(event.key==='Escape'||event.key==='Tab')finish();
   else if([' ','PageDown','PageUp','ArrowDown','ArrowUp','End','Home'].includes(event.key))event.preventDefault();
  };
  window.addEventListener('keydown',keys);
  window.addEventListener('wheel',blockScroll,{passive:false});
  window.addEventListener('touchmove',blockScroll,{passive:false});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()},{rootMargin:'100px'});
  const motionChange=()=>{setReduced(mq.matches);if(mq.matches)finish();else wake()};
  mq.addEventListener('change',motionChange);
  document.addEventListener('visibilitychange',wake);
  observer.observe(el);
  coverUrls.forEach(src=>{const image=new Image();image.onload=image.onerror=settle;image.src=src});
  const patience=window.setTimeout(()=>{ready=true;tryOpen()},6000);
  if(mq.matches||introSeen()){finish()}
  else{
   playing.current=true;
   gsap.to(scene,{formation:1,duration:2,ease:'none',onUpdate:draw,onComplete:()=>{formed=true;tryOpen()}});
  }
  draw();
  function canAnimate(){return alive&&visible&&!document.hidden&&!mq.matches}
  function wake(){
   if(!canAnimate()){cancelAnimationFrame(frame);frame=0;return}
   if(!frame){last=performance.now();frame=requestAnimationFrame(tick)}
  }
  function tick(time:number){
   frame=0;
   if(!canAnimate())return;
   const dt=Math.min((time-last)/1000,.05);last=time;
   if(!playing.current){
    if(!paused.current&&drag.current===null)scene.target-=dt*3.4;
    if(Math.abs(scene.target-scene.angle)>=.01){
     scene.angle+=(scene.target-scene.angle)*(1-Math.exp(-dt*9));draw();
    }
   }
   frame=requestAnimationFrame(tick);
  }
  wake();
  return()=>{
   alive=false;cancelAnimationFrame(frame);window.clearTimeout(patience);
   gsap.killTweensOf(scene);if(veil)gsap.killTweensOf(veil);
   observer.disconnect();
   mq.removeEventListener('change',motionChange);
   document.removeEventListener('visibilitychange',wake);
   window.removeEventListener('keydown',keys);
   window.removeEventListener('wheel',blockScroll);
   window.removeEventListener('touchmove',blockScroll);
  };
 },[]);

 function pause(value=true){paused.current=value;setPaused(value)}
 function step(direction:number){skip.current();pause();model.current.target+=direction*STEP}

 return <section ref={root} className={'home-hero omni-reel'+(entering?' reel-entering':' expanded')+(reduced?' reel-reduced':'')} data-reel-phase={entering?'formation':'expanded'}>
  {head}
  <div className="reel-stage" ref={stage} role="region" aria-label="Esplora 12 possibilità digitali. Usa le frecce per ruotare e Invio per aprire." tabIndex={0}
   onKeyDown={e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowLeft'?1:-1)}
    if(e.key==='Enter'){skip.current();navigate(cards[active][1])}
   }}
   onPointerDown={e=>{skip.current();drag.current=e.clientX;dragged.current=false;pause()}}
   onPointerMove={e=>{if(drag.current===null)return;const delta=e.clientX-drag.current;if(Math.abs(delta)>2)dragged.current=true;model.current.target+=delta*.19;drag.current=e.clientX}}
   onPointerUp={()=>drag.current=null} onPointerLeave={()=>drag.current=null} onPointerCancel={()=>drag.current=null}
   onWheel={e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){pause();model.current.target-=e.deltaX*.12}}}>
   <div className="reel-wheel" ref={ring}>{cards.map(([name,to],i)=>{
    const cover=covers[i];
    return <Link to={to} className="reel-card" key={name} onClick={e=>{if(dragged.current)e.preventDefault()}} onFocus={()=>{skip.current();pause();model.current.target=-i*STEP}} draggable={false} tabIndex={reduced||active===i?0:-1}>
     <div className="reel-campaign img-hover">{cover?<img src={cover.src} alt="" width={cover.w} height={cover.h} decoding="async" draggable={false} {...(isNear(i)?{}:{loading:'lazy' as const,fetchPriority:'low' as const})}/>:<Visual kind={i}/>}</div>
     <div><span>{name}</span><b>↗</b></div>
    </Link>;
   })}</div>
  </div>
  <div className="reel-loader" ref={loader} aria-hidden={!entering}>
   <span className="reel-loader-caption">Le possibilità prendono forma</span>
   <div className="reel-count" aria-hidden="true">{[0,1,2].map(i=><span key={i} className="reel-digit"><span ref={node=>{digits.current[i]=node}}>{Array.from({length:10},(_,n)=><i key={n}>{n}</i>)}</span></span>)}<em>%</em></div>
   <button type="button" className="reel-skip" onClick={()=>skip.current()}>Salta intro ↗</button>
  </div>
  <div className="reel-controls"><span>{entering?'12 POSSIBILITÀ PRENDONO FORMA.':'12 POSSIBILITÀ. NESSUN LIMITE.'}</span><div><button aria-label="Progetto precedente" onClick={()=>step(1)}>←</button><button aria-label={isPaused?'Riprendi animazione':'Pausa animazione'} onClick={()=>{skip.current();pause(!isPaused)}}>{isPaused?'▷':'Ⅱ'}</button><button aria-label="Progetto successivo" onClick={()=>step(-1)}>→</button></div></div>
  {foot}
 </section>;
}
