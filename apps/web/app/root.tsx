import {Links,Meta,Outlet,Scripts,ScrollRestoration,useRouteError,isRouteErrorResponse,useLocation} from 'react-router';
import {lazy,Suspense,type ReactNode} from 'react';
const OmniAssist=lazy(()=>import('./components/assist/OmniAssist').then(m=>({default:m.OmniAssist}))); 
import './styles/public.css';
import './styles/admin.css';
import {NotFound} from './components/public/NotFound';
export function Layout({children}:{children:ReactNode}){return <html lang="it"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#101112"/><Meta/><Links/></head><body>{children}<ScrollRestoration/><Scripts/></body></html>}
export default function App(){const {pathname}=useLocation();return <><Outlet/>{!pathname.startsWith('/portal')&&pathname!=='/login'&&<Suspense fallback={null}><OmniAssist mode={pathname.startsWith('/admin')?'internal':'public'}/></Suspense>}</>}
export function ErrorBoundary(){const error=useRouteError();if(isRouteErrorResponse(error)&&error.status===404)return <NotFound/>;return <main style={{padding:'12vh 8vw',color:'#f2eee6',background:'#101112',minHeight:'100vh'}}><a href="/">OMNI101</a><h1>{isRouteErrorResponse(error)&&error.status===404?'Questa pagina non esiste.':'La pagina non è disponibile.'}</h1><p>Riprova oppure torna alla homepage.</p><a href="/">Torna allo studio →</a></main>}
