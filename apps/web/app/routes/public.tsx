import {useLocation,type LoaderFunctionArgs} from 'react-router';
import {PublicLayout} from '../components/public/shell/PublicLayout';
import {articles,labels,projects,services} from '../components/public/shell/site-data';
import {Home} from './public/home';
import {WorkCase,WorkIndex} from './public/work';
import {Studio} from './public/studio';
import {StartProject} from './public/start';
import {Contact} from './public/contact';
import {InsightArticle,Insights} from './public/insights';
import {Legal,Login} from './public/legal';
import {ExploreDemo} from './public/explore-demos';
export function meta({location}:{location:{pathname:string}}){const path=location.pathname;return [{title:`${labels[path]||'Possibilità digitali'} · OMNI101`},{name:'description',content:'Progettiamo e realizziamo applicazioni, sistemi intelligenti ed esperienze creative. Dall’idea al prodotto che funziona.'},{property:'og:title',content:'OMNI101 — Digital Possibility Studio'},{property:'og:description',content:'La tua idea. Oltre il software.'},{property:'og:type',content:'website'},{property:'og:url',content:'https://omni101.app'+path},{tagName:'link',rel:'canonical',href:'https://omni101.app'+path}]}
export function loader({request}:LoaderFunctionArgs){const p=new URL(request.url).pathname;const valid=['/','/solutions','/explore','/work','/studio','/start-project','/contact','/insights','/privacy','/terms','/legal/privacy','/legal/terms','/login'];if(!valid.includes(p)&&!services.some(s=>p==='/solutions/'+s.id)&&!['commerce','workflow','creative','vision','avatar','software'].some(s=>p==='/explore/'+s)&&!projects.some(s=>p==='/work/'+s.slug)&&!articles.some(s=>p==='/insights/'+s.slug))throw new Response('Pagina non trovata',{status:404});return null}
/** Catch-all of the public site: picks the page module for the pathname. `/solutions*` and `/explore` have their own routes in `routes.ts`. */
export default function PublicRoute(){const {pathname}=useLocation();return <PublicLayout pathname={pathname}><PublicPage pathname={pathname}/></PublicLayout>}
function PublicPage({pathname}:{pathname:string}){
 if(pathname==='/')return <Home/>;
 if(pathname==='/work')return <WorkIndex/>;
 if(pathname.startsWith('/work/'))return <WorkCase pathname={pathname}/>;
 if(pathname.startsWith('/explore/'))return <ExploreDemo slug={pathname.slice(9)}/>;
 if(pathname==='/studio')return <Studio/>;
 if(pathname==='/start-project')return <StartProject/>;
 if(pathname==='/contact')return <Contact/>;
 if(pathname==='/insights')return <Insights/>;
 if(pathname.startsWith('/insights/'))return <InsightArticle pathname={pathname}/>;
 if(pathname==='/login')return <Login/>;
 return <Legal terms={pathname.includes('terms')}/>;
}
