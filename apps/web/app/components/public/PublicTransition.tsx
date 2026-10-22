import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {gsap} from 'gsap';
import '../../styles/public-transition.css';

/**
 * Original OMNI101 implementation of the parallel-page architecture described by
 * Ismael Martínez, Codrops, 2026-10-08:
 * https://tympanus.net/codrops/2026/10/08/building-parallel-page-transitions-with-gsap-and-react-router/
 * The linked Amber demo has no declared license; its source/assets are not copied.
 * No hyperkinetic dependency: existing GSAP owns one timeline and both live layers.
 */
type Departing={routeKey:string;node:ReactNode;viewportTop:number};
type Frame={routeKey:string;node:ReactNode;departing:Departing|null};
export function PublicTransition({routeKey,children}:{routeKey:string;children:ReactNode}){
 const root=useRef<HTMLDivElement>(null),incoming=useRef<HTMLDivElement>(null),outgoing=useRef<HTMLDivElement>(null),line=useRef<HTMLSpanElement>(null);
 const [frame,setFrame]=useState<Frame>({routeKey,node:children,departing:null});
 const sequence=useRef(0);
 // Derive the paired render before commit. The old React node keeps its stable key
 // and stays mounted; the incoming node renders immediately in normal document flow.
 if(frame.routeKey!==routeKey){setFrame({routeKey,node:children,departing:{routeKey:frame.routeKey,node:frame.node,viewportTop:root.current?.getBoundingClientRect().top||0}});}
 else if(frame.node!==children){setFrame({...frame,node:children});}
 useLayoutEffect(()=>{
  const scope=root.current,next=incoming.current,previous=outgoing.current,tracking=line.current;
  if(!scope||!next)return;
  const generation=++sequence.current;
  const focusHeading=()=>{
   const heading=next.querySelector<HTMLElement>('h1');
   if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  };
  if(!frame.departing||!previous){scope.dataset.phase='idle';return;}
  const finish=()=>{
   if(sequence.current!==generation)return;
   scope.dataset.phase='idle';
   setFrame(current=>current.routeKey===routeKey?{...current,departing:null}:current);
   focusHeading();
   scope.dispatchEvent(new CustomEvent('omni:public-transition-end',{bubbles:true,detail:{routeKey}}));
  };
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches){finish();return;}
  scope.dataset.phase='running';
  // Keep the departing visible region aligned when React Router restores scroll.
  // Never set global scroll position or overwrite history.scrollRestoration.
  previous.style.top=(frame.departing.viewportTop-scope.getBoundingClientRect().top)+'px';
  const title=next.querySelector('h1');
  const supporting=Array.from(next.querySelectorAll('.page-hero>p,.hero-copy,.hero-support,.page-intro')).slice(0,3);
  const context=gsap.context(()=>{
   const timeline=gsap.timeline({defaults:{ease:'power3.inOut'},onComplete:finish});
   timeline.to(previous,{y:-52,scale:.986,autoAlpha:0,clipPath:'inset(0% 0% 18% 0%)',duration:.48},0)
    .fromTo(next,{y:76,autoAlpha:0,clipPath:'inset(76px 0px 0px 0px)'},{y:0,autoAlpha:1,clipPath:'inset(0px 0px 0px 0px)',duration:.62,ease:'power3.out'},.06);
   if(title&&!title.hasAttribute('data-reveal-title'))timeline.fromTo(title,{y:36,clipPath:'inset(0% 0% 100% 0%)'},{y:0,clipPath:'inset(0% 0% 0% 0%)',duration:.46,ease:'power3.out'},.14);
   if(supporting.length)timeline.fromTo(supporting,{y:18,autoAlpha:0},{y:0,autoAlpha:1,duration:.38,stagger:.035,ease:'power2.out'},.22);
   if(tracking)timeline.fromTo(tracking,{scaleX:0,autoAlpha:1,transformOrigin:'0% 50%'},{scaleX:1,duration:.34,ease:'power2.inOut'},0).to(tracking,{autoAlpha:0,duration:.17},.48);
  },scope);
  // A starved main thread must never leave the departing page mounted: settle by wall clock.
  const guard=window.setTimeout(()=>{context.revert();finish();},2400);
  // A preference change mid-flight is an immediate accessible swap, not a new animation.
  const motionChange=()=>{if(preference.matches){context.revert();finish();}};
  preference.addEventListener('change',motionChange);
  return()=>{window.clearTimeout(guard);sequence.current++;preference.removeEventListener('change',motionChange);context.revert();};
 },[routeKey,frame.departing?.routeKey]);
 return <div ref={root} className="public-transition" data-public-transition data-route={routeKey} data-phase={frame.departing?'running':'idle'}>
  {frame.departing&&<div ref={outgoing} key={frame.departing.routeKey} className="public-transition-layer public-transition-outgoing" data-page-outgoing inert aria-hidden="true">{frame.departing.node}</div>}
  <div ref={incoming} key={routeKey} className="public-transition-layer public-transition-incoming" data-page-incoming>{children}</div>
  <span ref={line} className="public-transition-tracking" aria-hidden="true"/>
 </div>;
}
