import {enMeta,publicMeta} from '../content/seo';
import {t} from '../components/public/shell/i18n';
import caseStudiesEn from '../content/case-studies.en.json';
import {articlesEn} from '../content/articles';
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
/** `/en/work*`, `/en/studio` and `/en/insights*` render the same views as the Italian paths; the views read the language from the URL. */
const enAlias=(path:string)=>/^\/en\/(work|studio|insights)(\/|$)/.test(path)?path.slice(3):path;
export function meta({location}:{location:{pathname:string}}){
 const path=location.pathname;
 if(path===enAlias(path))return publicMeta(path);
 // English work/studio: own title and description, canonical and hreflang pair from enMeta
 const g=articlesEn.find(x=>path==='/en/insights/'+x.slug);
 if(g)return enMeta(path,g.title+' · OMNI101',g.metaDescription||g.summary);
 if(path==='/en/insights')return enMeta(path);
 const c=caseStudiesEn.find(x=>path==='/en/work/'+x.slug);
 if(c)return enMeta(path,c.title+' · OMNI101',c.problem);
 return path.startsWith('/en/work')?enMeta(path,t('route_work','en')+' · OMNI101',t('work_hero_text','en')):enMeta(path,t('route_studio','en')+' · OMNI101',t('studio_hero_text','en'));
}
export function loader({request}:LoaderFunctionArgs){const u=new URL(request.url).pathname;if(u==='/contact')throw redirect('/start-project');if(u==='/en/contact')throw redirect('/en#mini-demo');if(u.startsWith('/en/insights/')&&!articlesEn.some(a=>u==='/en/insights/'+a.slug))throw new Response('Page not found',{status:404});const p=enAlias(u);const valid=['/','/solutions','/explore','/work','/studio','/start-project','/insights','/privacy','/terms','/legal/privacy','/legal/terms','/login'];if(!valid.includes(p)&&!services.some(s=>p==='/solutions/'+s.id)&&!['commerce','workflow','creative','vision','avatar','software'].some(s=>p==='/explore/'+s)&&!projects.some(s=>p==='/work/'+s.slug)&&!articles.some(s=>p==='/insights/'+s.slug))throw new Response('Pagina non trovata',{status:404});return null}
/** Catch-all of the public site: picks the page module for the pathname. `/solutions*` and `/explore` have their own routes in `routes.ts`. */
export default function PublicRoute(){const {pathname}=useLocation();return <PublicLayout pathname={pathname}><PublicPage pathname={pathname}/></PublicLayout>}
function PublicPage({pathname:full}:{pathname:string}){
 const pathname=enAlias(full);
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
