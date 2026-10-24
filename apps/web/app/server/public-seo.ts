import type {Env} from './auth';
import {altOf,canonicalPath,siteOrigin,sitemapPaths} from '../content/seo';
import {llmsFull,llmsTxt} from '../content/geo';
const icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101112"/><circle cx="32" cy="32" r="18" fill="none" stroke="#d5bb83" stroke-width="6"/><path d="M43 11v14h14" fill="none" stroke="#f5f1e9" stroke-width="4"/></svg>';
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
/** Search and AI crawlers named on purpose: they may read the public pages (everything not disallowed below). */
export const crawlers=['Googlebot','Bingbot','OAI-SearchBot','ChatGPT-User','PerplexityBot','ClaudeBot','Google-Extended'];
export const privatePrefixes=['/admin','/portal','/login','/api','/demo/','/proposal/'];
export const robotsTxt=(production:boolean)=>production?[...crawlers,'*'].map(a=>'User-agent: '+a).join('\n')+'\nAllow: /\n'+privatePrefixes.map(p=>'Disallow: '+p).join('\n')+'\nSitemap: '+siteOrigin+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n';
/** lastmod is the build date when the deploy provides it; the fallback is the date of this change. */
const lastmodFallback='2026-10-24';
export function sitemapXml(lastmod=lastmodFallback){
 const link=(hreflang:string,p:string)=>'<xhtml:link rel="alternate" hreflang="'+hreflang+'" href="'+xml(siteOrigin+p)+'"/>';
 return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+sitemapPaths.map(p=>{const a=altOf(p);return '<url><loc>'+xml(siteOrigin+p)+'</loc><lastmod>'+lastmod+'</lastmod>'+(a?link('it',a.it)+link('en',a.en)+link('x-default',a.it):'')+'</url>'}).join('')+'</urlset>';
}
export function indexPolicy(path:string,environment?:string,status=200){return environment!=='production'||/^\/(admin|portal|login|api)(\/|$)/.test(path)||status>=400?'noindex, nofollow, nosnippet':null;}
export function publicSeoResponse(request:Request,env:Env):Response|null{
 const url=new URL(request.url),path=url.pathname,text=(body:string,type='text/plain; charset=utf-8')=>new Response(body,{headers:{'Content-Type':type}});
 if(path==='/robots.txt')return text(robotsTxt(env.ENVIRONMENT==='production'));
 if(path==='/sitemap.xml')return text(sitemapXml(((env as {BUILD_DATE?:string}).BUILD_DATE||'').slice(0,10)||lastmodFallback),'application/xml; charset=utf-8');
 if(path==='/llms.txt')return text(llmsTxt());
 if(path==='/llms-full.txt')return text(llmsFull());
 if(path==='/favicon.svg'||path==='/favicon.ico')return new Response(icon,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=86400'}});
 const normalized=canonicalPath(path);if(normalized!==path&&sitemapPaths.includes(normalized)){url.pathname=normalized;return Response.redirect(url.toString(),308)}
 return null;
}
