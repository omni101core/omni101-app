import type {Env} from './auth';
import {canonicalPath,publicPaths,siteOrigin} from '../content/seo';
const icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#101112"/><circle cx="32" cy="32" r="18" fill="none" stroke="#d5bb83" stroke-width="6"/><path d="M43 11v14h14" fill="none" stroke="#f5f1e9" stroke-width="4"/></svg>';
const xml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function indexPolicy(path:string,environment?:string,status=200){return environment!=='production'||/^\/(admin|portal|login|api)(\/|$)/.test(path)||status>=400?'noindex, nofollow, nosnippet':null;}
export function publicSeoResponse(request:Request,env:Env):Response|null{
 const url=new URL(request.url),path=url.pathname;
 if(path==='/robots.txt')return new Response(env.ENVIRONMENT==='production'?'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /portal\nDisallow: /login\nDisallow: /api\nSitemap: '+siteOrigin+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
 if(path==='/sitemap.xml')return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+publicPaths.map(p=>'<url><loc>'+xml(siteOrigin+p)+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8'}});
 if(path==='/favicon.svg'||path==='/favicon.ico')return new Response(icon,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'public, max-age=86400'}});
 const normalized=canonicalPath(path);if(normalized!==path&&publicPaths.includes(normalized)){url.pathname=normalized;return Response.redirect(url.toString(),308)}
 return null;
}
