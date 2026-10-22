import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router';
import CapabilityCarousel from './CapabilityCarousel';
import CapabilityCatalog from './CapabilityCatalog';
import {ClosingCTA,PublicShell} from './PublicShell';
import {familyFromSlug,panels} from './panels';

/** /solutions brings the family panels forward in depth with the scroll; /solutions/:family shows one panel, still and
 * large, with no scroll effect, and the tabs navigate. The transition key is shared by every family, so changing family keeps focus on the tab. The selected panel always decides which family the catalog below lists. */
export default function SolutionsView({slug}:{slug?:string}){
 const family=familyFromSlug(slug),fixed=family?panels.findIndex(p=>p.family===family):-1,navigate=useNavigate(),[active,setActive]=useState(Math.max(0,fixed));
 useEffect(()=>{if(fixed>=0)setActive(fixed)},[fixed]);
 const select=(index:number)=>{
  if(fixed<0){setActive(index);return}
  if(index!==fixed)navigate('/solutions/'+panels[index].slug,{preventScrollReset:true});
 };
 const panel=panels[active];
 return <PublicShell routeKey="solutions">
  <section className="page-hero cap-hero">
   <span className="eyebrow">{family?panel.name+' / SOLUZIONI':'02 / SOLUZIONI'}</span>
   <h1>{family?<>{panel.title}.<br/><em>{panel.headline}</em></>:<>Ogni idea,<br/><em>una possibilità concreta.</em></>}</h1>
   <p>{family?panel.claim:'Quattro famiglie e un’area sperimentale. Scorri: ogni pannello arriva dal fondo con un’applicazione reale; sotto trovi il catalogo, con ciò che realizziamo oggi e ciò che progettiamo su misura.'}</p>
  </section>
  <CapabilityCarousel active={active} scrollDriven={fixed<0} onSelect={select} linkSelf={fixed<0}/>
  <CapabilityCatalog index={active}/>
  <ClosingCTA/>
 </PublicShell>;
}
