import type {ReactNode} from 'react';
import {useLocation} from 'react-router';
import {PublicLayout} from '../../components/public/shell/PublicLayout';
import '../../components/public/landing/landing.css';
/** Shell for the landing pages (/en*): public layout. <html lang> comes from the pathname in root.tsx, so SSR and client agree. */
export function EnShell({children}:{children:ReactNode}){const {pathname}=useLocation();return <PublicLayout pathname={pathname}><div className="en-page">{children}</div></PublicLayout>}
