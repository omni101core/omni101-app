import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Link,NavLink,useLocation} from 'react-router';
import {ThemeToggle} from '../../ThemeToggle';
import {gsap} from 'gsap';
import '../../../styles/public-grammar.css';
import '../landing/landing.css';
import {flagged,headerAction,localePath,menuItems,navLinks,switchPath,t,useLocale,type Locale} from './i18n';
import {locales} from '../../../paraglide/runtime.js';
/** Menu clip: Codrops EaseReverseClipMenu, https://github.com/codrops/EaseReverseClipMenu (MIT, Copyright (c) 2009-2024 Codrops). */
const closed='polygon(50% 50%,50% 50%,50% 50%,50% 50%)',opened='polygon(0% 0%,100% 0%,100% 100%,0% 100%)';

/**
 * Full-screen menu. Open and close both run on an "out" curve from the current clip, so a close never retraces the
 * opening backwards and an interrupted open turns around smoothly: the idea of Codrops EaseReverseClipMenu
 * (Codrops, MIT), written here with plain GSAP tweens.
 */
function Menu({locale}:{locale:Locale}){
 const [open,setOpen]=useState(false);
 const panel=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),close=useRef<HTMLButtonElement>(null),wasOpen=useRef(false);
 useLayoutEffect(()=>{
  const element=panel.current;
  if(!element)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items=element.querySelectorAll('.menu-item');
  gsap.killTweensOf([element,...items]);
  if(open){
   wasOpen.current=true;
   element.dataset.open='true';
   // aria-modal does not contain focus. WebKit drops focus() while the clip is still the closed point.
   // ponytail: focus() inside focusin is dropped; one rAF. Per-event queue only if a browser nests deeper.
   let alive=true,frame=0;
   const containFocus=(event:FocusEvent)=>{
    if(!(event.target instanceof Node)||element.contains(event.target))return;
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{if(alive&&!element.contains(document.activeElement))close.current?.focus({preventScroll:true})});
   };
   document.addEventListener('focusin',containFocus);
   const focusClose=()=>{if(alive&&element.dataset.open==='true')close.current?.focus({preventScroll:true})};
   const releaseFocus=()=>{alive=false;cancelAnimationFrame(frame);document.removeEventListener('focusin',containFocus)};
   if(reduced){void element.offsetWidth;let tries=0;const retry=()=>{focusClose();if(alive&&!element.contains(document.activeElement)&&++tries<30)frame=requestAnimationFrame(retry)};retry();return releaseFocus} // ponytail: bounded per-frame retry, ~0.5s; trace in theme-quality.spec shows who wins if it still fails
   gsap.to(element,{clipPath:opened,duration:.8,ease:'expo.out',onComplete:focusClose});
   gsap.fromTo(items,{yPercent:70,opacity:0},{yPercent:0,opacity:1,duration:.8,ease:'expo.out',stagger:.05,delay:.12});
   return releaseFocus;
  }else if(wasOpen.current){
   trigger.current?.focus({preventScroll:true});
   if(reduced){element.dataset.open='false';return}
   gsap.to(element,{clipPath:closed,duration:.65,ease:'expo.out',onComplete:()=>{element.dataset.open='false'}});
  }
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){setOpen(false);return}
   if(event.key!=='Tab'||!panel.current)return;
   const focusable=Array.from(panel.current.querySelectorAll<HTMLElement>('a[href],button'));
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[open]);
 return <>
  <button ref={trigger} type="button" className="menu-trigger" aria-label={t('shell_menu_open',locale)} aria-expanded={open} aria-controls="site-menu" onClick={()=>setOpen(true)}>☰</button>
  <div ref={panel} id="site-menu" className="site-menu" role="dialog" aria-modal="true" aria-label={t('shell_menu_title',locale)} data-open="false" inert={!open}>
   <header><span className="wordmark">OMNI101</span><button ref={close} type="button" aria-label={t('shell_menu_close',locale)} onClick={()=>setOpen(false)}>×</button></header>
   <nav aria-label={t('shell_menu_nav',locale)}>{menuItems(locale).map((item,i)=><div className="menu-item" key={item.label}><Link to={item.to} aria-describedby={'menu-phrase-'+i} onClick={()=>setOpen(false)}>{flagged(t(item.label,locale),item.to,locale)}</Link><small id={'menu-phrase-'+i}>{t(item.phrase,locale)}</small></div>)}</nav>
   <p className="menu-description">{t('shell_menu_description',locale)}</p>
   <LanguageSwitch locale={locale}/>
  </div>
 </>;
}

/** IT/EN switch: each link goes to the same page in the other language for `/`, `/work*`, `/studio`, `/contact`, otherwise to that language's home. Shown in the header on wide screens and inside the menu on narrow ones (landing.css). */
function LanguageSwitch({locale}:{locale:Locale}){const {pathname}=useLocation();return <nav className="lang-switch" aria-label={t('shell_lang_label',locale)}>{locales.map(l=><Link key={l} to={switchPath(l,pathname)} lang={l} hrefLang={l} aria-label={t(l==='it'?'shell_lang_it':'shell_lang_en',locale)} aria-current={l===locale?'true':undefined}>{l.toUpperCase()}</Link>)}</nav>}
export function Header(){const {pathname}=useLocation();const locale=useLocale();const action=t('shell_action',locale);return <header className="site-header"><Link className="wordmark" to={localePath('/',locale)}>OMNI<span>101</span></Link><nav className="site-nav" aria-label={t('shell_nav_label',locale)}>{navLinks(locale).map(n=><NavLink key={n.label} to={n.to}>{flagged(t(n.label,locale),n.to,locale)}</NavLink>)}</nav><Link className="header-action" to={headerAction(locale)}>{action} <i aria-hidden="true">↗</i></Link><LanguageSwitch locale={locale}/><ThemeToggle scope={pathname==='/login'?'workspace':'public'}/><Menu locale={locale}/></header>}
