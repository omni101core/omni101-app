import {Link} from 'react-router';
import {Header} from '../shell/Header';
import {useEffect,useState,type ReactNode} from 'react';
import {PublicTransition} from '../PublicTransition';
import {panels} from './panels';
import '../../../styles/capabilities.css';

/** Layout of the public site for the dedicated Explore and Solutions routes. `routes/public.tsx` owns the
 * original Header and Footer and does not export them, so the same structure and classes are repeated here. */
function Footer(){return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><Link className="wordmark" to="/">OMNI101</Link><p>Digital Possibility Studio.</p></div><div className="footer-links"><div><small>Possibilità</small>{panels.filter(p=>p.family!=='EMERGING').map(p=><Link key={p.slug} to={'/solutions/'+p.slug}>{p.name.charAt(0)+p.name.slice(1).toLowerCase()}</Link>)}</div><div><small>Esplora</small><Link to="/work">Progetti</Link><Link to="/explore">Playground</Link><Link to="/insights">Insights</Link><Link to="/login">Workspace ↗</Link></div><div><small>Una conversazione</small><a href="mailto:info@omni101.app">info@omni101.app ↗</a><span>Italia. Ovunque ci sia un’idea.</span></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} OMNI101</span><span>IDEAS INTO POSSIBILITIES.</span><div className="footer-legal"><Link to="/privacy">Privacy</Link><Link to="/terms">Termini</Link></div></div></footer>}

export function PublicShell({routeKey,children}:{routeKey:string;children:ReactNode}){const [hydrated,setHydrated]=useState(false);useEffect(()=>setHydrated(true),[]);return <div className="site" data-hydrated={hydrated}><a href="#main" className="skip-link">Vai al contenuto</a><Header/><main id="main"><PublicTransition routeKey={routeKey}>{children}</PublicTransition></main><Footer/></div>}
export function ClosingCTA(){return <section className="cap-cta"><h2>Hai già un’idea?</h2><p>Una nuova idea. Un problema da risolvere. Un progetto da far crescere.</p><Link className="button" to="/start-project">Raccontaci la tua idea ↗</Link></section>}
