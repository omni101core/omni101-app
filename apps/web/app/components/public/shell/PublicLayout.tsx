import {PublicTransition} from '../PublicTransition';
import {Header} from './Header';
import {Footer} from './Footer';
import {useState,useEffect,useRef,type ReactNode} from 'react';
import {Link} from 'react-router';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {headerAction,routeLabel,t,useLocale} from './i18n';
import {RevealTitle} from './RevealTitle';
import '../../../styles/public-grammar.css';
export function CTA(){const locale=useLocale();return <section className="cta-section"><span className="eyebrow">{t('shell_cta_eyebrow',locale)}</span><RevealTitle as="h2">{t('shell_cta_title_a',locale)}<br/><em>{t('shell_cta_title_b',locale)}</em></RevealTitle><div className="cta-row"><Link className="button" to={headerAction(locale)}>{t('shell_cta_button',locale)}</Link><p>{t('shell_cta_text',locale)}</p></div></section>}
export function PublicLayout({pathname,children}:{pathname:string;children:ReactNode}){const locale=useLocale();const root=useRef<HTMLDivElement>(null);const [announcement,setAnnouncement]=useState('');const [hydrated,setHydrated]=useState(false);useEffect(()=>{setHydrated(true);const flag=requestAnimationFrame(()=>{document.documentElement.dataset.omniNav='1'});return()=>cancelAnimationFrame(flag)},[]);useEffect(()=>{const refresh=()=>{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(()=>ScrollTrigger.refresh());};window.addEventListener('omni:public-transition-end',refresh);return()=>window.removeEventListener('omni:public-transition-end',refresh);},[]);useEffect(()=>{setAnnouncement(routeLabel(pathname,locale));if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;gsap.registerPlugin(ScrollTrigger);const ctx=gsap.context(()=>{const targets=gsap.utils.toArray<HTMLElement>('.scroll-reveal').filter(el=>!el.closest('[data-page-outgoing]'));const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){gsap.to(entry.target,{y:0,autoAlpha:1,duration:.7,ease:'power2.out',clearProps:'transform,opacity,visibility'});observer.unobserve(entry.target)}},{threshold:.04});gsap.set(targets,{y:8,autoAlpha:0});targets.forEach(el=>observer.observe(el));return()=>observer.disconnect()},root);return()=>ctx.revert()},[pathname,locale]);
 return <div className="site" ref={root} data-hydrated={hydrated}><a href="#main" className="skip-link">{t('shell_skip',locale)}</a><Header/><main id="main"><PublicTransition routeKey={pathname}>{children}{!['/','/en','/start-project','/contact','/privacy','/terms','/legal/privacy','/legal/terms'].includes(pathname)&&!pathname.startsWith('/en/offers/')&&<CTA/>}</PublicTransition></main><Footer/><span className="sr-only" role="status" aria-live="polite">{announcement}</span></div>
}
