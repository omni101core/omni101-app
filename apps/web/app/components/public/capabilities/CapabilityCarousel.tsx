import {useEffect,useState,type MouseEvent} from 'react';
import {panels} from './panels';
import FamilyTabs from './FamilyTabs';
import DealWheel from './DealWheel';
import {Panel} from './FamilyPanel';

/** The family chooser of /solutions. On wide screens with motion it is the deal wheel (`DealWheel`): a deck opens from
 * the centre and lifts into a wheel with one card per family. Without motion, or on a small screen, every family is a
 * still panel stacked in the page, with its picture and its concrete case. With `fixed` (/solutions/:family) it shows only
 * the chosen family as a still panel: no effect on that page. Tabs and keyboard work in every mode, and nothing needs a scroll. */
const query='(prefers-reduced-motion: no-preference) and (min-height: 700px) and (min-width: 761px)';

export default function CapabilityCarousel({active,fixed,onSelect}:{active:number;fixed:boolean;onSelect:(index:number)=>void}){
 const [enhanced,setEnhanced]=useState(false);
 useEffect(()=>{if(fixed){setEnhanced(false);return}const media=matchMedia(query),sync=()=>setEnhanced(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync)},[fixed]);
 const toCatalog=(event:MouseEvent<HTMLAnchorElement>)=>{
  const target=document.getElementById('catalogo');if(!target)return;
  event.preventDefault();target.scrollIntoView({behavior:'instant' as ScrollBehavior,block:'start'});target.focus({preventScroll:true});
 };
 return <section className="cap-carousel" data-enhanced={enhanced} data-fixed={fixed} data-active={panels[active].slug} aria-label="Le famiglie di soluzioni">
  <div className="cap-sticky">
   <FamilyTabs active={active} onSelect={onSelect}/>
   {fixed
    ?<div className="cap-stage"><Panel p={panels[active]} i={active} active link={false} onCatalog={toCatalog}/></div>
    :enhanced
     ?<DealWheel active={active} onSelect={onSelect}/>
     :<div className="cap-stage">{panels.map((p,i)=><Panel key={p.slug} p={p} i={i} active={i===active} link onCatalog={toCatalog}/>)}</div>}
   <a className="cap-skip" href="#catalogo" onClick={toCatalog}>Vai al catalogo ↓</a>
  </div>
 </section>;
}
