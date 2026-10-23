import {Link} from 'react-router';
import {chiusura,type Segmento,type Servizio} from './logica';
import './showcase.css';

/** Closing line of every demo: two related links and one CTA that opens the brief with a fixed sentence. */
export function TiPuoServire({servizio,segmento}:{servizio:Servizio;segmento?:Segmento}){
 const {links,cta,href}=chiusura(servizio,segmento);
 return <aside className="sc-servire" data-showcase="ti-puo-servire" data-servizio={servizio} aria-label="Ti può servire anche">
  <span className="eyebrow">Ti può servire anche</span>
  <ul>{links.map(l=><li key={l.to}><Link className="text-link" to={l.to}>{l.label} ↗</Link></li>)}</ul>
  <Link className="button" to={href}>{cta} →</Link>
 </aside>;
}
