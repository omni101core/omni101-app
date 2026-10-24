import {articles,labels,projects,services} from '../components/public/shell/site-data';
import {offerText,offers,MOSTRA_PREZZI,type Offer} from '../components/public/landing/offers';
import {t} from '../components/public/shell/i18n';
import {media} from './media';
import prezzi from './prezzi-pubblici.json';
import caseStudiesEn from './case-studies.en.json';
import {articlesEn,articlesIt} from './articles';
export const siteOrigin='https://omni101.app';
const description='Diamo forma a siti, applicazioni, esperienze creative e sistemi intelligenti. Dall’idea al prodotto che funziona.';
const defaultImage='/media/originali/studio-01-tavolo.jpg';
// ponytail: only profiles already in the repo; none yet (the repo link is a code repository, not a brand profile). Add real profiles here.
export const sameAs:string[]=[];
/** Italian pages that must answer 200. /contact is out: it redirects to /start-project. /offerte* are in: the English offer pages point back to them with hreflang. */
export const publicPaths=[...new Set(['/', '/solutions',...services.map(s=>'/solutions/'+s.id),'/explore',...['commerce','workflow','creative','vision','voice','avatar','software'].map(s=>'/explore/'+s),'/work',...projects.map(p=>'/work/'+p.slug),'/studio','/start-project','/offerte',...offers.map(o=>'/offerte/'+o.slug),'/insights',...articles.map(a=>'/insights/'+a.slug),'/privacy','/terms'])];
/** IT path -> EN path, only for pairs that really exist (case studies exist in English for a subset of projects). */
export const pairEn:Record<string,string>={'/':'/en','/work':'/en/work','/studio':'/en/studio','/insights':'/en/insights','/offerte/ai-landing':'/en/offers/ai-landing','/offerte/ai-assistant':'/en/offers/ai-assistant','/offerte/ai-automation':'/en/offers/ai-automation','/offerte/local-desk':'/en/offers/local-desk',...Object.fromEntries(projects.filter(p=>caseStudiesEn.some(c=>c.slug===p.slug)).map(p=>['/work/'+p.slug,'/en/work/'+p.slug])),...Object.fromEntries(articlesIt.filter(a=>articlesEn.some(e=>e.slug===a.slug)).map(a=>['/insights/'+a.slug,'/en/insights/'+a.slug]))};
/** English pages that must answer 200. /en/contact is out: it redirects. */
export const enPaths=[...new Set([...Object.values(pairEn),...offers.map(o=>'/en/offers/'+o.slug)])];
export const sitemapPaths=[...publicPaths,...enPaths];
export const isEn=(path:string)=>path==='/en'||path.startsWith('/en/');
export function canonicalPath(path:string){if(path==='/legal/privacy')return '/privacy';if(path==='/legal/terms')return '/terms';return path.length>1?path.replace(/\/+$/,''):path;}
/** Cut at a word boundary so that the result is at most n characters. */
const clip=(s:string,n:number)=>s.length<=n?s:s.slice(0,n-1).replace(/\s+\S*$/,'').replace(/[\s,.;:—–-]+$/,'')+'…';
/** "OMNI101 · rest", at most 60 characters. Moves a trailing brand to the front. */
export function brandTitle(s:string){const r=s.replace(/\s*[·—–-]\s*OMNI101$/,'').replace(/^OMNI101\s*[·—–-]\s*/,'').trim();return r&&r!=='OMNI101'?clip('OMNI101 · '+r,60):'OMNI101';}
/** Unique descriptions for pages without their own summary. */
const itDesc:Record<string,string>={
 '/':description,
 '/solutions':'App, automazioni, contenuti creativi e crescita: 75 soluzioni con un esempio concreto e la loro disponibilità, dal disponibile oggi allo sperimentale.',
 '/explore':'Un percorso tra le famiglie di soluzioni e le demo da provare: dal negozio al flusso automatico, dai contenuti creativi alla visione.',
 '/explore/avatar':'Lo studio avatar di OMNI101: una demo per provare un personaggio digitale che presenta un’attività.',
 '/explore/software':'Il laboratorio software di OMNI101: esempi di applicazioni su misura da provare nel browser.',
 '/explore/voice':'Demo vocale con le API del browser. Il microfono parte solo su richiesta e i comandi si possono scrivere.',
 '/explore/vision':'Laboratorio gestuale nel browser. La webcam è facoltativa e i fotogrammi restano sul dispositivo.',
 '/explore/creative':'Il laboratorio di AI creativa di OMNI101: immagini e contenuti generati con l’AI, da provare e valutare.',
 '/explore/workflow':'Il laboratorio di flussi con agenti: un processo ripetitivo diventa un percorso con approvazioni e controllo umano.',
 '/explore/commerce':'Il laboratorio commerce di OMNI101: dalla vetrina al carrello, una demo di negozio online da provare.',
 '/work':'Concept e progetti interni dello studio: ospitalità, ristorazione, studi e commercio. Non sono clienti né numeri misurati.',
 '/studio':'OMNI101 è uno studio digitale che unisce strategia, design e sviluppo. Lavoriamo sulle possibilità e sul lavoro che serve a realizzarle.',
 '/start-project':'Raccontaci la tua idea per un sito, un’app o un’automazione: compili un breve modulo e lo studio ti ricontatta.',
 '/insights':'Guide brevi dello studio su progetto, automazione e AI nel lavoro reale.',
 '/privacy':'Come OMNI101 tratta i dati personali di chi visita il sito e di chi ci contatta.',
 '/terms':'Condizioni di utilizzo del sito e dei servizi di OMNI101.'};
export type PageInfo={path:string;lang:'it'|'en';name:string;title:string;description:string;url:string;image:string;imageAlt:string;project?:(typeof projects)[number];article?:(typeof articles)[number];service?:(typeof services)[number];offer?:Offer};
const altIt='Il tavolo di lavoro dello studio OMNI101',altEn='The OMNI101 studio work table';
export function pageSeo(pathname:string):PageInfo{
 const path=canonicalPath(pathname);
 if(isEn(path)){
  const url=siteOrigin+path,offer=offers.find(o=>path==='/en/offers/'+o.slug),c=caseStudiesEn.find(x=>path==='/en/work/'+x.slug),pj=c&&projects.find(p=>p.slug===c.slug);
  const base={path,lang:'en' as const,url,image:siteOrigin+defaultImage,imageAlt:altEn};
  if(offer){const x=offerText(offer,'en');return {...base,name:x.name,title:x.title,description:x.description,offer}}
  if(c&&pj)return {...base,name:c.title,title:c.title,description:c.problem,project:pj,image:siteOrigin+(media.work[projects.indexOf(pj)]?.src||defaultImage)};
  const g=articlesEn.find(x=>path==='/en/insights/'+x.slug);
  if(g)return {...base,name:g.title,title:g.title,description:g.metaDescription||g.summary,article:g};
  if(path==='/en/insights')return {...base,name:t('route_insights','en'),title:t('insights_home_title_a','en')+' '+t('insights_home_title_b','en'),description:t('insights_home_text','en')};
  if(path==='/en/work')return {...base,name:t('route_work','en'),title:t('route_work','en'),description:t('work_hero_text','en')};
  if(path==='/en/studio')return {...base,name:t('route_studio','en'),title:t('route_studio','en'),description:t('studio_hero_text','en')};
  return {...base,name:'OMNI101',title:t('landing_home_meta_title','en'),description:t('landing_home_meta_description','en')};
 }
 const offer=offers.find(o=>path==='/offerte/'+o.slug);
 if(offer){const x=offerText(offer,'it');return {path,lang:'it',name:x.name,title:x.title,description:x.description,url:siteOrigin+path,image:siteOrigin+defaultImage,imageAlt:altIt,offer}}
 if(path==='/offerte')return {path,lang:'it',name:'Offerte',title:t('landing_home_meta_title','it'),description:t('landing_home_meta_description','it'),url:siteOrigin+path,image:siteOrigin+defaultImage,imageAlt:altIt};
 const project=projects.find(p=>path==='/work/'+p.slug),article=articles.find(a=>path==='/insights/'+a.slug),service=services.find(s=>path==='/solutions/'+s.id);
 const name=project?.name||article?.title||service?.headline||labels[path]||'OMNI101';
 const summary=project?.description||article?.summary||service?.description||itDesc[path]||description;
 const picture=project?media.work[projects.indexOf(project)]:article?media.insights[articles.indexOf(article)]:undefined;
 return {path,lang:'it',name,title:path==='/'?'OMNI101 — La tua idea. Oltre il software.':name,description:summary,url:siteOrigin+path,image:siteOrigin+(picture?.src||defaultImage),imageAlt:picture?.alt||altIt,project,article,service};
}
/** hreflang alternates: it/en/x-default (x-default = Italian) for real pairs, only the page itself otherwise. */
export function altOf(path:string){const en=pairEn[path];const it=en?path:Object.keys(pairEn).find(k=>pairEn[k]===path);return it?{it,en:en??path}:null}
function langAlts(path:string){const a=altOf(path),link=(hreflang:string,p:string)=>({tagName:'link',rel:'alternate',hreflang,href:siteOrigin+p});return a?[link('it',a.it),link('en',a.en),link('x-default',a.it)]:[link(isEn(path)?'en':'it',path)];}
/** One meta list for every public page, Italian or English. title/description are raw; branding and length limits (60/155) are applied here. */
export function buildMeta(pathname:string,title:string,desc:string,o:{image?:string;imageAlt?:string;type?:string}={}){
 const path=canonicalPath(pathname),en=isEn(path),url=siteOrigin+path,ti=brandTitle(title),de=clip(desc,155),img=o.image||siteOrigin+defaultImage,alt=o.imageAlt||(en?altEn:altIt);
 return [{title:ti},{name:'description',content:de},{property:'og:title',content:ti},{property:'og:description',content:de},{property:'og:type',content:o.type||'website'},{property:'og:url',content:url},{property:'og:site_name',content:'OMNI101'},{property:'og:locale',content:en?'en_US':'it_IT'},...(altOf(path)?[{property:'og:locale:alternate',content:en?'it_IT':'en_US'}]:[]),{property:'og:image',content:img},{property:'og:image:alt',content:alt},{name:'twitter:card',content:'summary_large_image'},{name:'twitter:title',content:ti},{name:'twitter:description',content:de},{name:'twitter:image',content:img},{name:'twitter:image:alt',content:alt},{tagName:'link',rel:'canonical',href:url},...langAlts(path),...(/^\/(login|admin|portal)(\/|$)/.test(path)?[{name:'robots',content:'noindex, nofollow'}]:[])];
}
export function publicMeta(path:string){const s=pageSeo(path);return buildMeta(path,s.title,s.description,{image:s.image,imageAlt:s.imageAlt,type:s.article?'article':'website'});}
/** Meta for explicit English routes. Title/description may be omitted: they come from pageSeo. */
/** Meta for the Italian offer routes (/offerte*); each has an English twin in `pairEn`. */
export function itMeta(path:string,title:string,desc:string){const s=pageSeo(path);return buildMeta(path,title,desc,{image:s.image,imageAlt:s.imageAlt});}
export function enMeta(path:string,title?:string,desc?:string){const s=pageSeo(path);return buildMeta(path,title??s.title,desc??s.description,{image:s.image,imageAlt:s.imageAlt});}
/** "From" prices exactly as the pricing engine file states them; null while the founder flag hides prices on the site. */
export function offerPrice(o:Offer,show=MOSTRA_PREZZI){
 if(!show)return null;
 const b=(prezzi.bundle as Record<string,{daUnaTantum:number;daMensile:number;valuta:string}|undefined>)[o.slug.replace(/-/g,'_')],p=prezzi.prodotti[o.productId];
 return {currency:b?.valuta??prezzi.valuta,oneOff:b?b.daUnaTantum:p.daUnaTantum,monthly:b?b.daMensile:p.daMensile};
}
function offerNode(o:Offer,url:string,show:boolean,lang:'it'|'en'='en'){
 const x=offerText(o,lang),pr=offerPrice(o,show);
 const spec=pr?[...(pr.oneOff>0?[{'@type':'PriceSpecification',minPrice:pr.oneOff,priceCurrency:pr.currency,description:'One-off price, from'}]:[]),...(pr.monthly>0?[{'@type':'UnitPriceSpecification',price:pr.monthly,priceCurrency:pr.currency,unitCode:'MON',description:'Monthly price, from'}]:[])]:[];
 return {'@type':'Service','@id':url+'#service',name:x.name,description:x.description,url,inLanguage:lang==='en'?'en':'it-IT',provider:{'@id':siteOrigin+'/#organization'},...(spec.length?{offers:{'@type':'Offer',url,priceCurrency:pr!.currency,priceSpecification:spec}}:{})};
}
export function structuredData(path:string,showPrices=MOSTRA_PREZZI){
 const s=pageSeo(path);if(!sitemapPaths.includes(s.path))return null;
 const en=s.lang==='en',lang=en?'en':'it-IT',home=en?'/en':'/';
 const organization={'@type':'Organization','@id':siteOrigin+'/#organization',name:'OMNI101',alternateName:['omni101','omni101.app'],url:siteOrigin,logo:{'@type':'ImageObject',url:siteOrigin+'/favicon.svg'},description,email:'info@omni101.app',contactPoint:{'@type':'ContactPoint',contactType:'customer support',email:'info@omni101.app',availableLanguage:['it','en']},...(sameAs.length?{sameAs}:{})};
 const website={'@type':'WebSite','@id':siteOrigin+'/#website',name:'OMNI101',alternateName:'omni101.app',url:siteOrigin,inLanguage:['it-IT','en'],publisher:{'@id':siteOrigin+'/#organization'}}; // ponytail: no SearchAction, the site has no search
 const page:Record<string,unknown>={'@type':s.article?'Article':s.project?'CreativeWork':'WebPage','@id':s.url+'#content',url:s.url,name:s.name,description:s.description,inLanguage:lang,isPartOf:{'@id':siteOrigin+'/#website'}};
 if(s.article){page.headline=s.article.title;page.articleBody=s.article.body.join('\n');page.author={'@id':siteOrigin+'/#organization'};if(s.article.date){page.datePublished=s.article.date;page.dateModified=s.article.date}}
 if(s.project&&!en)page.description=s.project.description+' '+(s.project.type==='CONCEPT'?'Concept dimostrativo, non un risultato commerciale di un cliente.':'Progetto interno dello studio.');
 const crumbs=[{name:'OMNI101',url:siteOrigin+home}];
 if(en){if(s.path==='/en/work/'+s.project?.slug)crumbs.push({name:t('route_work','en'),url:siteOrigin+'/en/work'});if(s.article)crumbs.push({name:t('route_insights','en'),url:siteOrigin+'/en/insights'});if(s.path!=='/en')crumbs.push({name:s.name,url:s.url});}
 else{const parts=s.path.split('/').filter(Boolean);if(parts.length>1)crumbs.push({name:labels['/'+parts[0]]||parts[0],url:siteOrigin+'/'+parts[0]});if(parts.length)crumbs.push({name:s.name,url:s.url});}
 return {'@context':'https://schema.org','@graph':[organization,website,page,...(s.article?.faq?.length?[{'@type':'FAQPage','@id':s.url+'#faq',inLanguage:lang,mainEntity:s.article.faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}]:[]),...(s.service?[{'@type':'Service',name:s.service.name,description:s.service.description,url:s.url,inLanguage:'it-IT',provider:{'@id':siteOrigin+'/#organization'}}]:[]),...(s.offer?[offerNode(s.offer,s.url,showPrices,s.lang)]:[]),{'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.url}))}]};
}
export function safeJson(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
