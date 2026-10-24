import {articles,labels,projects,services} from '../components/public/shell/site-data';
import {media} from './media';
export const siteOrigin='https://omni101.app';
const description='Diamo forma a siti, applicazioni, esperienze creative e sistemi intelligenti. Dall’idea al prodotto che funziona.';
export const publicPaths=[...new Set(['/', '/solutions',...services.map(s=>'/solutions/'+s.id),'/explore',...['commerce','workflow','creative','vision','voice','avatar','software'].map(s=>'/explore/'+s),'/work',...projects.map(p=>'/work/'+p.slug),'/studio','/start-project','/contact','/insights',...articles.map(a=>'/insights/'+a.slug),'/privacy','/terms'])];
export function canonicalPath(path:string){if(path==='/legal/privacy')return '/privacy';if(path==='/legal/terms')return '/terms';return path.length>1?path.replace(/\/+$/,''):path;}
export function pageSeo(pathname:string){
 const path=canonicalPath(pathname),project=projects.find(p=>path==='/work/'+p.slug),article=articles.find(a=>path==='/insights/'+a.slug),service=services.find(s=>path==='/solutions/'+s.id);
 const name=project?.name||article?.title||service?.headline||labels[path]||'OMNI101';
 const summary=project?.description||article?.summary||service?.description||description;
 const picture=project?media.work[projects.indexOf(project)]:article?media.insights[articles.indexOf(article)]:undefined;
 return {path,name,title:path==='/'?'OMNI101 — La tua idea. Oltre il software.':name+' · OMNI101',description:summary,url:siteOrigin+path,image:siteOrigin+(picture?.src||'/media/originali/studio-01-tavolo.jpg'),imageAlt:picture?.alt||'Il tavolo di lavoro dello studio OMNI101',project,article,service};
}
export function publicMeta(path:string){const s=pageSeo(path);return [{title:s.title},{name:'description',content:s.description},{property:'og:title',content:s.title},{property:'og:description',content:s.description},{property:'og:type',content:s.article?'article':'website'},{property:'og:url',content:s.url},{property:'og:site_name',content:'OMNI101'},{property:'og:locale',content:'it_IT'},{property:'og:image',content:s.image},{property:'og:image:alt',content:s.imageAlt},{name:'twitter:card',content:'summary_large_image'},{tagName:'link',rel:'canonical',href:s.url},...(path==='/'?[{tagName:'link',rel:'alternate',hreflang:'it',href:siteOrigin+'/'},{tagName:'link',rel:'alternate',hreflang:'en',href:siteOrigin+'/en'},{tagName:'link',rel:'alternate',hreflang:'x-default',href:siteOrigin+'/'}]:[]),...(/^\/(login|admin|portal)(\/|$)/.test(path)?[{name:'robots',content:'noindex, nofollow'}]:[])];}
/** Meta for the English landing routes (/en*): English title/description, canonical, hreflang it/en on /en. */
export function enMeta(path:string,title:string,description:string){const url=siteOrigin+path;return [{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{property:'og:url',content:url},{property:'og:site_name',content:'OMNI101'},{property:'og:locale',content:'en_US'},{property:'og:image',content:siteOrigin+'/media/originali/studio-01-tavolo.jpg'},{name:'twitter:card',content:'summary_large_image'},{tagName:'link',rel:'canonical',href:url},{tagName:'link',rel:'alternate',hreflang:'en',href:url},...(path==='/en'?[{tagName:'link',rel:'alternate',hreflang:'it',href:siteOrigin+'/'},{tagName:'link',rel:'alternate',hreflang:'x-default',href:siteOrigin+'/'}]:[])]}
export function structuredData(path:string){
 const s=pageSeo(path);if(!publicPaths.includes(s.path))return null;
 const organization={'@type':'Organization','@id':siteOrigin+'/#organization',name:'OMNI101',url:siteOrigin,description,email:'info@omni101.app'};
 const page:Record<string,unknown>={'@type':s.article?'Article':s.project?'CreativeWork':'WebPage','@id':s.url+'#content',url:s.url,name:s.name,description:s.description,inLanguage:'it-IT',isPartOf:{'@id':siteOrigin+'/#website'}};
 if(s.article){page.headline=s.article.title;page.articleBody=s.article.body.join('\n');page.author={'@id':siteOrigin+'/#organization'}}
 if(s.project)page.description=s.project.description+' '+(s.project.type==='CONCEPT'?'Concept dimostrativo, non un risultato commerciale di un cliente.':'Progetto interno dello studio.');
 const parts=s.path.split('/').filter(Boolean);const crumbs=[{name:'OMNI101',url:siteOrigin+'/'}];if(parts.length>1)crumbs.push({name:labels['/'+parts[0]]||parts[0],url:siteOrigin+'/'+parts[0]});if(parts.length)crumbs.push({name:s.name,url:s.url});
 return {'@context':'https://schema.org','@graph':[organization,{'@type':'WebSite','@id':siteOrigin+'/#website',name:'OMNI101',url:siteOrigin,inLanguage:'it-IT',publisher:{'@id':siteOrigin+'/#organization'}},page,...(s.service?[{'@type':'Service',name:s.service.name,description:s.service.description,url:s.url,provider:{'@id':siteOrigin+'/#organization'}}]:[]),{'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.url}))}]};
}
export function safeJson(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
