import {useEffect,useRef,useState,type CSSProperties,type KeyboardEvent,type MouseEvent} from 'react';
import {Link} from 'react-router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {availabilityLabel,panels,type FamilyPanel} from './panels';
import {familyImage} from './panelMedia';

/** CSS 3D ring of family panels, turned by page scroll. Independent implementation of the pattern in the Codrops
 * "On-scroll 3D carousel" article (2025-05-07, repo codrops/3DCarousel, MIT): no file or asset is copied, and it
 * draws no WebGL because the panels are plain DOM. Without motion every panel is a visible, static card.
 * HOLD (coordinator, 22/10): the ring stays as is until REGIA v2; the depth version is parked in
 * esiti/omni101-codex-ripresa/tmp-sonnet-solutions/. */
const STEP=360/panels.length,LAST=panels.length-1;

function Panel({p,i,active,inert,link,onCatalog}:{p:FamilyPanel;i:number;active:boolean;inert:boolean;link:boolean;onCatalog:(event:MouseEvent<HTMLAnchorElement>)=>void}){
 const image=familyImage(p.slug);
 return <article className="cap-panel" data-family={p.slug} data-active={active} inert={inert} style={{'--i':i} as CSSProperties}>
  <span className="eyebrow">0{i+1} / {p.name} / {p.title}</span>
  <h2 className="cap-title">{p.headline}</h2>
  <figure className="cap-media" data-fallback={image.fallback?'true':undefined}>
   {image.fallback
    ?<div className="cap-art" role="img" aria-label={image.alt} style={image.style}/>
    :<img className="cap-art" src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>}
   <figcaption className="cap-over">
    <p className="cap-claim">{p.claim}</p>
    <div className="cap-case">
     <small>Un’applicazione concreta</small>
     <strong>{p.featured.title}</strong>
     <p>{p.featured.example}</p>
     <span className="cap-badge" data-availability={p.featured.availability}>{availabilityLabel[p.featured.availability]}</span>
    </div>
    <ul className="cap-also" aria-label={'Altre soluzioni '+p.name}>{p.also.map(c=><li key={c.id}>{c.title}</li>)}<li>{p.count} soluzioni</li></ul>
    <div className="cap-actions">
     {link?<Link className="button" to={'/solutions/'+p.slug}>Tutte le soluzioni {p.name} ↗</Link>:<a className="button" href="#catalogo" onClick={onCatalog}>Vedi le soluzioni ↓</a>}
     {p.featured.demo&&<Link className="cap-link" to={p.featured.demo}>Provala nel Playground ↗</Link>}
    </div>
   </figcaption>
  </figure>
 </article>;
}

export default function CapabilityCarousel({active,scrollDriven,onSelect,linkSelf}:{active:number;scrollDriven:boolean;onSelect:(index:number)=>void;linkSelf:boolean}){
 const root=useRef<HTMLElement>(null),ring=useRef<HTMLDivElement>(null),tabs=useRef<(HTMLButtonElement|null)[]>([]),placed=useRef(false),select=useRef(onSelect),[enhanced,setEnhanced]=useState(false);
 select.current=onSelect;
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 700px) and (min-width: 761px)'),sync=()=>setEnhanced(query.matches);sync();query.addEventListener('change',sync);return()=>query.removeEventListener('change',sync)},[]);
 useEffect(()=>{
  const element=root.current;if(!element||!enhanced||!scrollDriven)return;
  gsap.registerPlugin(ScrollTrigger);
  const trigger=ScrollTrigger.create({trigger:element,start:'top top',end:'bottom bottom',onUpdate:self=>{if(self.isActive)select.current(Math.round(self.progress*LAST))}});
  return()=>trigger.kill();
 },[enhanced,scrollDriven]);
 useEffect(()=>{
  const element=ring.current;if(!element)return;
  if(!enhanced){gsap.set(element,{clearProps:'transform'});placed.current=false;return;}
  gsap.to(element,{rotationY:-active*STEP,duration:placed.current?.9:0,ease:'power3.out',overwrite:'auto'});placed.current=true;
 },[active,enhanced]);
 const choose=(index:number)=>{
  const element=root.current;
  if(enhanced&&scrollDriven&&element){const range=element.offsetHeight-window.innerHeight;window.scrollTo({top:element.getBoundingClientRect().top+window.scrollY+range*index/LAST,behavior:'instant' as ScrollBehavior})}
  onSelect(index);
 };
 // An instant jump skips the ring, so the panel on screen when the visitor asks for the catalogue stays selected.
 const toCatalog=(event:MouseEvent<HTMLAnchorElement>)=>{
  const target=document.getElementById('catalogo');if(!target)return;
  event.preventDefault();target.scrollIntoView({behavior:'instant' as ScrollBehavior,block:'start'});target.focus({preventScroll:true});
 };
 const onKey=(event:KeyboardEvent<HTMLDivElement>)=>{
  const next=event.key==='ArrowRight'?(active+1)%panels.length:event.key==='ArrowLeft'?(active+LAST)%panels.length:event.key==='Home'?0:event.key==='End'?LAST:-1;
  if(next<0)return;
  event.preventDefault();choose(next);tabs.current[next]?.focus();
 };
 return <section ref={root} className="cap-carousel" data-enhanced={enhanced} data-scroll-driven={scrollDriven} data-active={panels[active].slug} aria-label="Le famiglie di soluzioni">
  <div className="cap-sticky">
   <div className="cap-tabs" role="tablist" aria-label="Famiglia di soluzioni" onKeyDown={onKey}>
    {panels.map((p,i)=><button key={p.slug} ref={node=>{tabs.current[i]=node}} type="button" role="tab" id={'cap-tab-'+p.slug} aria-selected={i===active} aria-controls="catalogo" tabIndex={i===active?0:-1} onClick={()=>choose(i)}><span>0{i+1}</span>{p.name}</button>)}
   </div>
   <div className="cap-stage"><div className="cap-orbit"><div ref={ring} className="cap-ring">
    {panels.map((p,i)=><Panel key={p.slug} p={p} i={i} active={i===active} inert={enhanced&&i!==active} link={linkSelf} onCatalog={toCatalog}/>)}
   </div></div></div>
   <a className="cap-skip" href="#catalogo" onClick={toCatalog}>Vai al catalogo ↓</a>
  </div>
 </section>;
}
