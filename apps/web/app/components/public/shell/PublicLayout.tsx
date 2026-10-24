import {PublicTransition} from '../PublicTransition';
import {Header} from './Header';
import {Footer} from './Footer';
import {useState,useEffect,useRef,type ReactNode} from 'react';
import {Link} from 'react-router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {labels} from './site-data';
import {RevealTitle} from './RevealTitle';
import '../../../styles/public-grammar.css';
export function CTA(){return <section className="cta-section"><span className="eyebrow">FACCIAMO QUALCOSA CHE CONTI.</span><RevealTitle as="h2">Le possibilità iniziano<br/><em>da una conversazione.</em></RevealTitle><div className="cta-row"><Link className="button" to="/start-project">Raccontaci la tua idea ↗</Link><p>Una nuova idea. Un problema da risolvere. Un progetto da far crescere.</p></div></section>}
export function PublicLayout({pathname,children}:{pathname:string;children:ReactNode}){const root=useRef<HTMLDivElement>(null);const [announcement,setAnnouncement]=useState('');const [hydrated,setHydrated]=useState(false);useEffect(()=>{setHydrated(true);const flag=requestAnimationFrame(()=>{document.documentElement.dataset.omniNav='1'});return()=>cancelAnimationFrame(flag)},[]);useEffect(()=>{const refresh=()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(()=>ScrollTrigger.refresh());};window.addEventListener('omni:public-transition-end',refresh);return()=>window.removeEventListener('omni:public-transition-end',refresh);},[]);useEffect(()=>{setAnnouncement(labels[pathname]||'OMNI101');if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;gsap.registerPlugin(ScrollTrigger);const ctx=gsap.context(()=>{const targets=gsap.utils.toArray<HTMLElement>('.scroll-reveal').filter(el=>!el.closest('[data-page-outgoing]'));const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){gsap.to(entry.target,{y:0,autoAlpha:1,duration:.7,ease:'power2.out',clearProps:'transform,opacity,visibility'});observer.unobserve(entry.target)}},{threshold:.04});gsap.set(targets,{y:8,autoAlpha:0});targets.forEach(el=>observer.observe(el));return()=>observer.disconnect()},root);return()=>ctx.revert()},[pathname]);
 return <div className="site" ref={root} data-hydrated={hydrated}><a href="#main" className="skip-link">Vai al contenuto</a><Header/><main id="main"><PublicTransition routeKey={pathname}>{children}{!['/','/start-project','/contact','/privacy','/terms','/legal/privacy','/legal/terms'].includes(pathname)&&<CTA/>}</PublicTransition></main><Footer/><span className="sr-only" role="status" aria-live="polite">{announcement}</span></div>
}
