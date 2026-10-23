import {structuredData,safeJson} from './content/seo';
import {Links,Meta,Outlet,Scripts,ScrollRestoration,useRouteError,isRouteErrorResponse,useLocation} from 'react-router';
import {lazy,Suspense,useEffect,type ReactNode} from 'react';
const OmniAssist=lazy(()=>import('./components/assist/OmniAssist').then(m=>({default:m.OmniAssist}))); 
import './styles/public.css';
import './styles/admin.css';
import './styles/themes.css';
import {applyTheme} from './components/ThemeToggle';
import {NotFound} from './components/public/NotFound';
export function Layout({children}:{children:ReactNode}){const schema=structuredData(useLocation().pathname);return <html lang="it" suppressHydrationWarning><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#f5f1e9"/><Meta/><Links/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/>{schema&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(schema)}}/>}<script dangerouslySetInnerHTML={{__html:`(()=>{const s=/^\\/(admin|portal|login)(\\/|$)/.test(location.pathname)?'workspace':'public';let t=s==='public'?'light':'dark';try{const v=localStorage.getItem('omni:theme:'+s);if(v==='light'||v==='dark')t=v}catch{}document.documentElement.dataset.theme=t;document.documentElement.dataset.themeScope=s;document.querySelector('meta[name="theme-color"]').content=t==='light'?'#f5f1e9':'#101112'})()`}}/></head><body>{children}<ScrollRestoration/><Scripts/></body></html>}
export default function App(){const {pathname}=useLocation();useEffect(()=>{applyTheme(/^\/(admin|portal|login)(\/|$)/.test(pathname)?'workspace':'public')},[pathname]);return <><Outlet/>{!pathname.startsWith('/portal')&&pathname!=='/login'&&<Suspense fallback={null}><OmniAssist mode={pathname.startsWith('/admin')?'internal':'public'}/></Suspense>}</>}
export function ErrorBoundary(){const error=useRouteError();if(isRouteErrorResponse(error)&&error.status===404)return <NotFound/>;return <main style={{padding:'12vh 8vw',color:'#f2eee6',background:'#101112',minHeight:'100vh'}}><a href="/">OMNI101</a><h1>{isRouteErrorResponse(error)&&error.status===404?'Questa pagina non esiste.':'La pagina non è disponibile.'}</h1><p>Riprova oppure torna alla homepage.</p><a href="/">Torna allo studio →</a></main>}
