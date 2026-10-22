import {Links,Meta,Outlet,Scripts,ScrollRestoration,useRouteError,isRouteErrorResponse} from 'react-router';
import type {ReactNode} from 'react';
import './styles/public.css';
import './styles/admin.css';
export function Layout({children}:{children:ReactNode}){return <html lang="it"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="theme-color" content="#101112"/><Meta/><Links/></head><body>{children}<ScrollRestoration/><Scripts/></body></html>}
export default function App(){return <Outlet/>}
export function ErrorBoundary(){const error=useRouteError();return <main style={{padding:'12vh 8vw',color:'#f2eee6',background:'#101112',minHeight:'100vh'}}><a href="/">OMNI101</a><h1>{isRouteErrorResponse(error)&&error.status===404?'Questa pagina non esiste.':'La pagina non è disponibile.'}</h1><p>Riprova oppure torna alla homepage.</p><a href="/">Torna allo studio →</a></main>}
