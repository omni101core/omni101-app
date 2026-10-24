import {structuredData,safeJson} from './content/seo';
import {Links,Meta,Outlet,Scripts,ScrollRestoration,useRouteError,isRouteErrorResponse,useLocation} from 'react-router';
import {lazy,Suspense,useEffect,type ReactNode} from 'react';
const OmniAssist=lazy(()=>import('./components/assist/OmniAssist').then(m=>({default:m.OmniAssist}))); 
import './styles/public.css';
import './styles/admin.css';
import './styles/themes.css';
import {applyTheme} from './components/ThemeToggle';
import {NotFound} from './components/public/NotFound';
import {localeFromPath,localePath,t} from './components/public/shell/i18n';
/** Fonts the first paint needs, fetched with the HTML instead of after the CSS. */
export const links=()=>['/fonts/Satoshi-400.woff2','/fonts/Satoshi-500.woff2'].map(href=>({rel:'preload',href,as:'font',type:'font/woff2',crossOrigin:'anonymous' as const}));
export function Layout({children}:{children:ReactNode}){const {pathname}=useLocation();const schema=structuredData(pathname);return <html lang={localeFromPath(pathname)} suppressHydrationWarning><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#f5f1e9"/><Meta/><Links/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/>{schema&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(schema)}}/>}<script dangerouslySetInnerHTML={{__html:`(()=>{const s=/^\\/(admin|portal|login)(\\/|$)/.test(location.pathname)?'workspace':'public';let t=s==='public'?'light':'dark';try{const v=localStorage.getItem('omni:theme:'+s);if(v==='light'||v==='dark')t=v}catch{}document.documentElement.dataset.theme=t;document.documentElement.dataset.themeScope=s;document.querySelector('meta[name="theme-color"]').content=t==='light'?'#f5f1e9':'#101112'})()`}}/></head><body>{children}<ScrollRestoration/><Scripts/></body></html>}
export default function App(){const {pathname}=useLocation();useEffect(()=>{applyTheme(/^\/(admin|portal|login)(\/|$)/.test(pathname)?'workspace':'public')},[pathname]);return <><Outlet/>{!pathname.startsWith('/portal')&&pathname!=='/login'&&<Suspense fallback={null}><OmniAssist mode={pathname.startsWith('/admin')?'internal':'public'}/></Suspense>}</>}
export function ErrorBoundary(){const error=useRouteError();const locale=localeFromPath(useLocation().pathname);const home=localePath('/',locale);if(isRouteErrorResponse(error)&&error.status===404)return <NotFound/>;return <main style={{padding:'12vh 8vw',color:'#f2eee6',background:'#101112',minHeight:'100vh'}}><a href={home}>OMNI101</a><h1>{isRouteErrorResponse(error)&&error.status===404?t('error_not_found',locale):t('error_generic',locale)}</h1><p>{t('error_retry',locale)}</p><a href={home}>{t('error_back',locale)}</a></main>}
