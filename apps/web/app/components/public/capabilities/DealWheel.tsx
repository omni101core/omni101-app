import {useEffect,useRef,type CSSProperties,type MouseEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {useNavigate} from 'react-router';
import {gsap} from 'gsap';
import {panels} from './panels';
import {familyImage} from './panelMedia';
import {FamilyDetail} from './FamilyPanel';

/** The deal wheel of /solutions: a deck opens from the centre into a fan, then lifts into a wheel with one card per family.
 * Independent reimplementation of the idea in the "deck of reels dealt into a fan that lifts into a wheel" recipe
 * (`esiti/.../avi/prompts/`): no code, text or asset of that site is used. CSS 3D only, no WebGL.
 *
 * Geometry: ten slots on a full circle (each family twice, 180° apart) around a pivot below the stage, so only the
 * top 5 are ever in view and the wheel turns forever without a seam. A slot's pose is one transform: go to the pivot,
 * rotate, push out along the rotated axis, flip, scale. Two values drive it: `deal` (the deck fans out, from the top
 * card outwards) and `lift` (the fan grows into the wheel). The wheel is always settled on a whole family. */
const COUNT=panels.length,SLOTS=COUNT*2,STEP=360/SLOTS,VISIBLE=84,CARD_RATIO=.74;
const mod=(n:number,m:number)=>((n%m)+m)%m;
const wrap=(deg:number)=>mod(deg+180,360)-180;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp01=(v:number)=>Math.min(1,Math.max(0,v));
const span=(v:number,a:number,b:number)=>clamp01((v-a)/(b-a));
const outCubic=(t:number)=>1-Math.pow(1-t,3);

interface Drag{x:number;spin:number;moved:boolean;lastX:number;lastT:number;velocity:number}
interface Engine{sync:(index:number)=>void;wake:()=>void;stop:()=>void}

export default function DealWheel({active,onSelect}:{active:number;onSelect:(index:number)=>void}){
 const shell=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null),scene=useRef<HTMLDivElement>(null),cards=useRef<(HTMLElement|null)[]>([]);
 const engine=useRef<Engine|null>(null),select=useRef(onSelect),state=useRef({target:0,spin:0,drag:null as Drag|null,suppress:false});
 const navigate=useNavigate();
 select.current=onSelect;

 useEffect(()=>{
  const root=shell.current,area=stage.current,world=scene.current;if(!root||!area||!world)return;
  const s=state.current,v={deal:0,lift:0},lastTransform:string[]=[],lastShown:boolean[]=[],lastVeil:string[]=[];
  let height=0,raf=0,last=0,phase='',worldTransform='',top=-1,wheelAcc=0,wheelAt=0,wheelLock=0;
  const measure=()=>{
   height=area.clientHeight;const ch=Math.round(height*.62);
   area.style.setProperty('--ch',ch+'px');area.style.setProperty('--cw',Math.round(ch*CARD_RATIO)+'px');
  };
  const paint=()=>{
   const H=height||area.clientHeight;
   const radius=lerp(.5*H,.92*H,v.lift),pivot=lerp(.6*H,.9*H,v.lift),grow=lerp(.76,1,v.lift);
   const sceneTransform=`rotateX(${(v.lift*7).toFixed(2)}deg) scale(${(1+v.lift*.06).toFixed(4)})`;
   if(sceneTransform!==worldTransform){worldTransform=sceneTransform;world.style.transform=sceneTransform}
   const nearest=mod(Math.round(s.spin/STEP),SLOTS);
   for(let i=0;i<SLOTS;i+=1){
    const el=cards.current[i];if(!el)continue;
    const home=wrap(i*STEP-s.spin),away=Math.abs(home);
    const order=Math.min(away,VISIBLE)/VISIBLE,p=outCubic(span(v.deal,order*.6,order*.6+.4));
    const shown=away<VISIBLE&&p>0;
    if(shown!==lastShown[i]){lastShown[i]=shown;el.style.visibility=shown?'visible':'hidden'}
    if(!shown)continue;
    const transform=`translate3d(0,${(pivot).toFixed(1)}px,${(-away*1.5).toFixed(1)}px) rotateZ(${(home+(1-p)*70).toFixed(2)}deg) translate3d(0,${(-radius*p+(1-p)*.19*H).toFixed(1)}px,0) rotateY(${((1-p)*180).toFixed(1)}deg) scale(${((.7+.3*p)*grow).toFixed(4)})`;
    if(transform!==lastTransform[i]){lastTransform[i]=transform;el.style.transform=transform}
    const veil=(.62*span(away,0,72)).toFixed(2);
    if(veil!==lastVeil[i]){lastVeil[i]=veil;el.style.setProperty('--veil',veil)}
   }
   if(nearest!==top){if(top>=0)cards.current[top]?.removeAttribute('data-top');top=nearest;cards.current[nearest]?.setAttribute('data-top','true')}
   const now=v.deal<1?'deal':v.lift<1?'lift':'idle';
   if(now!==phase){phase=now;root.dataset.phase=now}
  };
  const frame=(time:number)=>{
   const dt=Math.min(.05,(time-last)/1000);last=time;
   s.spin+=(s.target-s.spin)*(1-Math.exp(-dt*(s.drag?14:7)));
   const settling=Math.abs(s.target-s.spin)>.01;
   if(!settling)s.spin=s.target;
   paint();
   raf=settling||s.drag||timeline.isActive()?requestAnimationFrame(frame):0;
  };
  const wake=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}};
  const goTo=(n:number,notify=true)=>{s.target=n*STEP;if(notify)select.current(mod(n,COUNT));wake()};
  const timeline=gsap.timeline({paused:true,onUpdate:wake})
   .to(v,{deal:1,duration:1.9,ease:'none'})
   .to(v,{lift:1,duration:1.5,ease:'power4.inOut'},'+=.05');
  measure();paint();
  const resize=new ResizeObserver(()=>{measure();wake()});resize.observe(area);
  // The entrance starts when the stage is in view, so a visitor who lands lower still sees it.
  const watcher=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){watcher.disconnect();timeline.play();wake()}},{threshold:.15});watcher.observe(area);
  const skip=(event:KeyboardEvent)=>{if(event.key==='Escape'&&timeline.progress()<1){timeline.progress(1);wake()}};window.addEventListener('keydown',skip);
  // Only a horizontal gesture turns the wheel; a vertical wheel keeps scrolling the page.
  const onWheel=(event:WheelEvent)=>{
   if(Math.abs(event.deltaX)<Math.abs(event.deltaY)*1.2)return;
   event.preventDefault();
   const time=performance.now();
   if(time<wheelLock)return;
   if(time-wheelAt>200)wheelAcc=0;
   wheelAt=time;wheelAcc+=event.deltaX;
   if(Math.abs(wheelAcc)>70&&v.lift>=1){const direction=wheelAcc>0?1:-1;wheelAcc=0;wheelLock=time+450;goTo(Math.round(s.target/STEP)+direction)}
  };
  area.addEventListener('wheel',onWheel,{passive:false});
  engine.current={
   sync:index=>{
    const n=Math.round(s.target/STEP);
    if(mod(n,COUNT)===index||s.drag)return;
    goTo(n+mod(index-n+2,COUNT)-2,false);
   },
   wake,
   stop:()=>{timeline.progress(1);wake()},
  };
  return()=>{
   cancelAnimationFrame(raf);raf=0;timeline.kill();resize.disconnect();watcher.disconnect();
   window.removeEventListener('keydown',skip);area.removeEventListener('wheel',onWheel);engine.current=null;
  };
 },[]);

 useEffect(()=>{engine.current?.sync(active)},[active]);

 const down=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const s=state.current;s.suppress=false;
  if(shell.current?.dataset.phase!=='idle'){engine.current?.stop();return}
  if(event.pointerType==='mouse'&&event.button!==0)return;
  s.drag={x:event.clientX,spin:s.target,moved:false,lastX:event.clientX,lastT:performance.now(),velocity:0};
 };
 const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const s=state.current,d=s.drag;if(!d)return;
  const width=event.currentTarget.clientWidth||1,dx=event.clientX-d.x,now=performance.now();
  // The pointer is captured only once it is a drag, so a plain click still reaches the card under it.
  if(Math.abs(dx)>6&&!d.moved){d.moved=true;event.currentTarget.dataset.dragging='true';event.currentTarget.setPointerCapture(event.pointerId)}
  if(!d.moved)return;
  const per=STEP/(width*.16);
  s.target=d.spin-dx*per;
  const dt=Math.max(1,now-d.lastT);d.velocity=lerp(d.velocity,-(event.clientX-d.lastX)*per/(dt/1000),.4);d.lastX=event.clientX;d.lastT=now;
  engine.current?.wake();
 };
 const up=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const s=state.current,d=s.drag;if(!d)return;
  s.drag=null;delete event.currentTarget.dataset.dragging;
  if(!d.moved)return;
  s.suppress=true;
  const stale=performance.now()-d.lastT>80,origin=Math.round(d.spin/STEP);
  const n=Math.max(origin-2,Math.min(origin+2,Math.round((s.target+(stale?0:d.velocity*.18))/STEP)));
  s.target=n*STEP;select.current(mod(n,COUNT));engine.current?.wake();
 };
 // A click on the top card opens its family; a click on any other card turns the wheel to it. A drag never clicks.
 const click=(event:MouseEvent<HTMLDivElement>)=>{
  const s=state.current;if(s.suppress){s.suppress=false;return}
  const card=(event.target as HTMLElement).closest<HTMLElement>('.deal-card');if(!card||shell.current?.dataset.phase!=='idle')return;
  const slot=Number(card.dataset.slot),n=Math.round(s.target/STEP);
  // The cards below the top one overlap its edges in 3D, so the hit card is not always the top one: a click in the
  // middle column of the stage is on the top card, whichever card the browser reports.
  const box=event.currentTarget.getBoundingClientRect(),half=parseFloat(event.currentTarget.style.getPropertyValue('--cw'))/2||0;
  if(mod(n,SLOTS)===slot||Math.abs(event.clientX-(box.left+box.width/2))<half*.9){navigate('/solutions/'+panels[mod(n,COUNT)].slug);return}
  const target=slot+SLOTS*Math.round((n-slot)/SLOTS);
  s.target=target*STEP;select.current(mod(target,COUNT));engine.current?.wake();
 };
 const toCatalog=(event:MouseEvent<HTMLAnchorElement>)=>{
  const target=document.getElementById('catalogo');if(!target)return;
  event.preventDefault();target.scrollIntoView({behavior:'instant' as ScrollBehavior,block:'start'});target.focus({preventScroll:true});
 };

 const p=panels[active];
 return <div ref={shell} className="deal" data-phase="deal">
  <div ref={stage} className="deal-stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click}>
   <div ref={scene} className="deal-scene">
    {Array.from({length:SLOTS},(_,i)=>{
     const family=panels[i%COUNT],image=familyImage(family.slug);
     return <article key={i} ref={node=>{cards.current[i]=node}} className="deal-card" data-slot={i} data-family={family.slug} aria-hidden="true">
      <div className="deal-face">
       {image.fallback
        ?<div className="cap-art" style={image.style}/>
        :<img className="cap-art" src={image.src} alt="" width={image.width} height={image.height} loading="eager" decoding="async" draggable={false}/>}
       <span className="deal-veil"/>
       <div className="deal-label"><small>0{i%COUNT+1} / {family.name}</small><strong>{family.title}</strong></div>
      </div>
      <div className="deal-back"><span>O</span></div>
     </article>;
    })}
   </div>
  </div>
  <div className="deal-caption" key={p.slug} style={{'--i':active} as CSSProperties}>
   <div className="deal-head">
    <span className="eyebrow">0{active+1} / {p.name} / {p.title}</span>
    <h2 className="cap-title">{p.headline}</h2>
   </div>
   <div className="deal-detail"><FamilyDetail p={p} link onCatalog={toCatalog}/></div>
  </div>
 </div>;
}
