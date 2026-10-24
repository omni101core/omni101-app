import {useEffect,useState} from 'react';
import {useNavigate} from 'react-router';
import CapabilityCarousel from './CapabilityCarousel';
import CapabilityCatalog from './CapabilityCatalog';
import SegmentGrid from './SegmentGrid';
import EngagementModes from './EngagementModes';
import {ClosingCTA,PublicShell} from './PublicShell';
import {familyFromSlug,panels} from './panels';

/** /solutions opens a deal wheel with one card per family; /solutions/:family is a still page: the family panel, the
 * segments that buy from it (one demo each) and the filtered catalogue. The tabs navigate on the family page. The
 * transition key is shared by every family, so changing family keeps focus on the tab. The selected family always decides
 * which one the catalogue below lists. */
export default function SolutionsView({slug}:{slug?:string}){
 const family=familyFromSlug(slug),fixed=family?panels.findIndex(p=>p.family===family):-1,navigate=useNavigate(),[active,setActive]=useState(Math.max(0,fixed));
 useEffect(()=>{if(fixed>=0)setActive(fixed)},[fixed]);
 const select=(index:number)=>{
  if(fixed<0){setActive(index);return}
  if(index!==fixed)navigate('/solutions/'+panels[index].slug,{preventScrollReset:true});
 };
 const panel=panels[active];
 return <PublicShell routeKey="solutions">
  <section className="page-hero cap-hero" data-wheel={family?undefined:true}>
   <span className="eyebrow">{family?panel.name+' / SOLUZIONI':'02 / SOLUZIONI'}</span>
   <h1>{family?<>{panel.title}.<br/><em>{panel.headline}</em></>:<>Ogni idea,<br/><em>una possibilità concreta.</em></>}</h1>
   <p>{family?panel.claim:'Quattro famiglie e un’area sperimentale, una carta ciascuna. Scegline una con il mouse, la tastiera o un gesto: sotto trovi il catalogo, con ciò che realizziamo oggi e ciò che progettiamo su misura.'}</p>
  </section>
  <CapabilityCarousel active={active} fixed={fixed>=0} onSelect={select}/>
  {family&&<SegmentGrid family={family} name={panel.name}/>}
  <CapabilityCatalog index={active}/>
  <EngagementModes/>
  <ClosingCTA/>
 </PublicShell>;
}
