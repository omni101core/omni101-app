import {useEffect,useRef,useState} from 'react';
import {Link,NavLink,useLocation} from 'react-router';
import {ThemeToggle} from '../../ThemeToggle';
import {gsap} from 'gsap';
import '../../../styles/public-grammar.css';

const links=[['/solutions','Soluzioni'],['/work','Progetti'],['/explore','Playground'],['/studio','Studio']];
const menu=[['/solutions','Soluzioni','Costruire, automatizzare, creare, far crescere.'],['/work','Progetti','Idee da vedere e da esplorare.'],['/explore','Playground','Le possibilità, da provare con le tue mani.'],['/studio','Studio','Come pensiamo e come lavoriamo.'],['/insights','Insights','Appunti e metodi dal nostro lavoro.'],['/start-project','Parliamone ↗','Raccontaci la tua idea.']];
/** Menu clip: Codrops EaseReverseClipMenu, https://github.com/codrops/EaseReverseClipMenu (MIT, Copyright (c) 2009-2024 Codrops). */
const closed='polygon(50% 50%,50% 50%,50% 50%,50% 50%)',opened='polygon(0% 0%,100% 0%,100% 100%,0% 100%)';

/**
 * Full-screen menu. Open and close both run on an "out" curve from the current clip, so a close never retraces the
 * opening backwards and an interrupted open turns around smoothly: the idea of Codrops EaseReverseClipMenu
 * (Codrops, MIT), written here with plain GSAP tweens.
 */
function Menu(){
 const [open,setOpen]=useState(false);
 const panel=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),close=useRef<HTMLButtonElement>(null),wasOpen=useRef(false);
 useEffect(()=>{
  const element=panel.current;
  if(!element)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items=element.querySelectorAll('.menu-item');
  gsap.killTweensOf([element,...items]);
  if(open){
   wasOpen.current=true;
   element.dataset.open='true';
   close.current?.focus({preventScroll:true});
   // ponytail: retry on the next frame if focus did not land inside the panel; CI diagnostics name the cause.
   const frame=requestAnimationFrame(()=>{if(!element.contains(document.activeElement))close.current?.focus({preventScroll:true})});
   if(reduced)return()=>cancelAnimationFrame(frame);
   gsap.to(element,{clipPath:opened,duration:.8,ease:'expo.out'});
   gsap.fromTo(items,{yPercent:70,opacity:0},{yPercent:0,opacity:1,duration:.8,ease:'expo.out',stagger:.05,delay:.12});
   return()=>cancelAnimationFrame(frame);
  }else if(wasOpen.current){
   trigger.current?.focus({preventScroll:true});
   if(reduced){element.dataset.open='false';return}
   gsap.to(element,{clipPath:closed,duration:.65,ease:'expo.out',onComplete:()=>{element.dataset.open='false'}});
  }
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setOpen(false);return}
   if(event.key!=='Tab'||!panel.current)return;
   const focusable=Array.from(panel.current.querySelectorAll<HTMLElement>('a[href],button'));
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[open]);
 return <>
  <button ref={trigger} type="button" className="menu-trigger" aria-label="Apri menu" aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(true)}>☰</button>
  <div ref={panel} id="site-menu" className="site-menu" role="dialog" aria-modal="true" aria-label="Menu principale" data-open="false" inert={!open}>
   <header><span className="wordmark">OMNI101</span><button ref={close} type="button" aria-label="Chiudi menu" onClick={()=>setOpen(false)}>×</button></header>
   <nav aria-label="Menu">{menu.map(([to,label,phrase],i)=><div className="menu-item" key={to}><Link to={to} aria-describedby={'menu-phrase-'+i} onClick={()=>setOpen(false)}>{label}</Link><small id={'menu-phrase-'+i}>{phrase}</small></div>)}</nav>
   <p className="menu-description">Digital Possibility Studio / Italia, e ovunque ci sia un’idea.</p>
  </div>
 </>;
}

export function Header(){const {pathname}=useLocation();return <header className="site-header"><Link className="wordmark" to="/">OMNI<span>101</span></Link><nav className="site-nav" aria-label="Navigazione principale">{links.map(([to,label])=><NavLink key={to} to={to}>{label}</NavLink>)}</nav><Link className="header-action" to="/start-project">Parliamone <i aria-hidden="true">↗</i></Link><ThemeToggle scope={pathname==='/login'?'workspace':'public'}/><Menu/></header>}
