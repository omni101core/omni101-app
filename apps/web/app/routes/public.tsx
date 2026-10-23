import {publicMeta} from '../content/seo';
import {redirect,useLocation,type LoaderFunctionArgs} from 'react-router';
import {PublicLayout} from '../components/public/shell/PublicLayout';
import {articles,labels,projects,services} from '../components/public/shell/site-data';
import {Home} from './public/home';
import {WorkCase,WorkIndex} from './public/work';
import {Studio} from './public/studio';
import {StartProject} from './public/start';
import {InsightArticle,Insights} from './public/insights';
import {Legal,Login} from './public/legal';
import {ExploreDemo} from './public/explore-demos';
export function meta({location}:{location:{pathname:string}}){return publicMeta(location.pathname)}
export function loader({request}:LoaderFunctionArgs){const p=new URL(request.url).pathname;if(p==='/contact')throw redirect('/start-project');const valid=['/','/solutions','/explore','/work','/studio','/start-project','/insights','/privacy','/terms','/legal/privacy','/legal/terms','/login'];if(!valid.includes(p)&&!services.some(s=>p==='/solutions/'+s.id)&&!['commerce','workflow','creative','vision','avatar','software'].some(s=>p==='/explore/'+s)&&!projects.some(s=>p==='/work/'+s.slug)&&!articles.some(s=>p==='/insights/'+s.slug))throw new Response('Pagina non trovata',{status:404});return null}
/** Catch-all of the public site: picks the page module for the pathname. `/solutions*` and `/explore` have their own routes in `routes.ts`. */
export default function PublicRoute(){const {pathname}=useLocation();return <PublicLayout pathname={pathname}><PublicPage pathname={pathname}/></PublicLayout>}
function PublicPage({pathname}:{pathname:string}){
 if(pathname==='/')return <Home/>;
 if(pathname==='/work')return <WorkIndex/>;
 if(pathname.startsWith('/work/'))return <WorkCase pathname={pathname}/>;
 if(pathname.startsWith('/explore/'))return <ExploreDemo slug={pathname.slice(9)}/>;
 if(pathname==='/studio')return <Studio/>;
 if(pathname==='/start-project')return <StartProject/>;
 if(pathname==='/insights')return <Insights/>;
 if(pathname.startsWith('/insights/'))return <InsightArticle pathname={pathname}/>;
 if(pathname==='/login')return <Login/>;
 return <Legal terms={pathname.includes('terms')}/>;
}
