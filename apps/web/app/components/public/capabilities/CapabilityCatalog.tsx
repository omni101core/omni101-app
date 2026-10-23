import {useState} from 'react';
import {Link} from 'react-router';
import {capabilities,type Availability} from '../../../content/capabilities';
import {availabilityLabel,availabilityNote,panels} from './panels';

const states:(Availability|'ALL')[]=['ALL','DISPONIBILE','SU_MISURA','SPERIMENTALE'];

export default function CapabilityCatalog({index}:{index:number}){
 const [availability,setAvailability]=useState<Availability|'ALL'>('ALL'),panel=panels[index];
 const family=capabilities.filter(c=>c.family===panel.family),items=family.filter(c=>availability==='ALL'||c.availability===availability);
 const count=(state:Availability|'ALL')=>state==='ALL'?family.length:family.filter(c=>c.availability===state).length;
 return <section id="catalogo" className="cap-catalog" role="tabpanel" tabIndex={-1} aria-labelledby={'cap-tab-'+panel.slug}>
  <header className="cap-catalog-head">
   <div><span className="eyebrow">CATALOGO / {panel.name}</span><h2>{panel.title}: {family.length} soluzioni.</h2><p>{panel.claim}</p></div>
   <div className="cap-filter" role="group" aria-label="Filtra per disponibilità">{states.map(state=>count(state)>0&&<button key={state} type="button" aria-pressed={availability===state} onClick={()=>setAvailability(state)}>{state==='ALL'?'Tutte':availabilityLabel[state]} <span>{count(state)}</span></button>)}</div>
  </header>
  <ul className="cap-grid">{items.map(c=>{
   const own=c.cta.to.startsWith('/solutions/');
   return <li key={c.id}><article className="cap-card" data-capability={c.id}>
    <span className="cap-badge" data-availability={c.availability}>{availabilityLabel[c.availability]}</span>
    <h3>{c.title}</h3>
    <p>{c.description}</p>
    <p className="cap-example"><small>Esempio</small>{c.example}</p>
    <p className="cap-note">{availabilityNote[c.availability]}</p>
    <div className="cap-actions">
     <Link className="cap-link" to={own?'/start-project':c.cta.to}>{own?'Avvia un progetto':c.cta.label} →</Link>
     {c.demo&&<Link className="cap-link" to={c.demo}>Prova la demo ↗</Link>}
    </div>
   </article></li>;
  })}</ul>
  <nav className="cap-families" aria-label="Altre famiglie di soluzioni">{panels.map(p=><Link key={p.slug} to={'/solutions/'+p.slug} aria-current={p.family===panel.family?'page':undefined}>{p.name}</Link>)}</nav>
 </section>;
}
