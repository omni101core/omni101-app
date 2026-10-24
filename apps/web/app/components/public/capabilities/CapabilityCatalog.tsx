import {useState} from 'react';
import {Link} from 'react-router';
import {capabilities,type Availability} from '../../../content/capabilities';
import {availabilityLabel,availabilityNote,cosaServe,filtriVisibili,panels,schedaPrezzo} from './panels';

export default function CapabilityCatalog({index}:{index:number}){
 const [availability,setAvailability]=useState<Availability|'ALL'>('ALL'),panel=panels[index];
 const family=capabilities.filter(c=>c.family===panel.family);
 const count=(state:Availability|'ALL')=>state==='ALL'?family.length:family.filter(c=>c.availability===state).length;
 const filters=filtriVisibili({ALL:count('ALL'),DISPONIBILE:count('DISPONIBILE'),SU_MISURA:count('SU_MISURA'),SPERIMENTALE:count('SPERIMENTALE')});
 const active=filters.includes(availability)?availability:'ALL',items=family.filter(c=>active==='ALL'||c.availability===active);
 return <section id="catalogo" className="cap-catalog" role="tabpanel" tabIndex={-1} aria-labelledby={'cap-tab-'+panel.slug}>
  <header className="cap-catalog-head">
   <div><span className="eyebrow">CATALOGO / {panel.name}</span><h2>{panel.title}: {family.length} soluzioni.</h2><p>{panel.claim}</p></div>
   {filters.length>0&&<div className="cap-filter" role="group" aria-label="Filtra per disponibilità">{filters.map(state=><button key={state} type="button" aria-pressed={active===state} onClick={()=>setAvailability(state)}>{state==='ALL'?'Tutte':availabilityLabel[state]} <span>{count(state)}</span></button>)}</div>}
  </header>
  <ul className="cap-grid">{items.map(c=>{
   const own=c.cta.to.startsWith('/solutions/'),prezzo=schedaPrezzo(c.id,c.availability);
   return <li key={c.id}><article className="cap-card" data-capability={c.id}>
    <span className="cap-badge" data-availability={c.availability}>{availabilityLabel[c.availability]}</span>
    <h3>{c.title}</h3>
    <dl className="cap-facts">
     <div><dt>Per chi</dt><dd>{c.businessUse}</dd></div>
     <div><dt>Risultato</dt><dd>{c.description}</dd></div>
     <div><dt>Cosa serve</dt><dd>{cosaServe[c.availability]}</dd></div>
     <div><dt>Da</dt><dd>{prezzo.da}</dd></div>
     <div><dt>Tempi</dt><dd>{prezzo.tempi}</dd></div>
    </dl>
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
