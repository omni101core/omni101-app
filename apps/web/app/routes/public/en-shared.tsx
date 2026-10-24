import {useEffect,type ReactNode} from 'react';
import {useLocation} from 'react-router';
import {PublicLayout} from '../../components/public/shell/PublicLayout';
import '../../components/public/landing/landing.css';
/** Shell for English pages: public layout + lang="en" on <html> while mounted (root.tsx is Italian-only). */
export function EnShell({children}:{children:ReactNode}){const {pathname}=useLocation();useEffect(()=>{const prev=document.documentElement.lang;document.documentElement.lang='en';return()=>{document.documentElement.lang=prev||'it'}},[]);return <PublicLayout pathname={pathname}><div lang="en" className="en-page">{children}</div></PublicLayout>}
