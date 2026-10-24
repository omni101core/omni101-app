import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {altOf,enPaths,pageSeo,pairEn,publicMeta,publicPaths,safeJson,sameAs,sitemapPaths,structuredData} from '../apps/web/app/content/seo';
import {llmsFull,llmsTxt} from '../apps/web/app/content/geo';
import {crawlers,publicSeoResponse,sitemapXml} from '../apps/web/app/server/public-seo';
import {MOSTRA_PREZZI} from '../apps/web/app/components/public/landing/offers';
import prezzi from '../apps/web/app/content/prezzi-pubblici.json';
import type {Env} from '../apps/web/app/server/auth';
type Meta=Record<string,string>;
const pub=new URL('../apps/web/public/',import.meta.url);
const meta=(p:string)=>publicMeta(p) as Meta[];
const val=(m:Meta[],k:string,v:string)=>m.find(x=>x[k]===v);
const content=(p:string,key:string)=>(val(meta(p),'property',key)??val(meta(p),'name',key))?.content;
const get=async(path:string,env:Partial<Env>={ENVIRONMENT:'production'})=>(await publicSeoResponse(new Request('https://omni101.app'+path),env as Env)!).text();
const urls=(xml:string)=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
describe('brand, titles and descriptions',()=>{
 it('every indexable page starts with OMNI101, fits 60/155 and is unique',()=>{
  const titles=sitemapPaths.map(p=>meta(p)[0].title),descs=sitemapPaths.map(p=>content(p,'description')!);
  for(const t of titles){expect(t.startsWith('OMNI101')).toBe(true);expect(t.length).toBeLessThanOrEqual(60)}
  for(const d of descs){expect(d.length).toBeGreaterThan(20);expect(d.length).toBeLessThanOrEqual(155)}
  expect(new Set(titles).size).toBe(titles.length);expect(new Set(descs).size).toBe(descs.length);
 });
 it('home title matches the H1 in Italian and English pages carry en_US',()=>{
  expect(meta('/')[0].title).toBe('OMNI101 · La tua idea. Oltre il software.');
  expect(content('/','og:locale')).toBe('it_IT');expect(content('/en','og:locale')).toBe('en_US');
 });
 it('og and twitter are complete and og:image is a real file of the repo',()=>{
  for(const p of sitemapPaths){
   for(const k of ['og:title','og:description','og:type','og:url','og:site_name','og:locale','og:image','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image'])expect(content(p,k),p+' '+k).toBeTruthy();
   const img=new URL(content(p,'og:image')!);expect(img.origin).toBe('https://omni101.app');expect(existsSync(new URL('.'+img.pathname,pub)),img.pathname).toBe(true);
  }
 });
});
describe('hreflang and canonical',()=>{
 const links=(p:string)=>(meta(p) as unknown as {rel?:string;hreflang?:string;href?:string}[]).filter(x=>x.rel==='alternate');
 it('every pair is reciprocal with it/en/x-default and a self canonical',()=>{
  expect(Object.keys(pairEn).length).toBeGreaterThanOrEqual(3);
  for(const [it,en] of Object.entries(pairEn)){
   for(const p of [it,en]){
    const a=links(p),by=(h:string)=>a.find(x=>x.hreflang===h)?.href;
    expect(by('it')).toBe('https://omni101.app'+it);expect(by('en')).toBe('https://omni101.app'+en);expect(by('x-default')).toBe('https://omni101.app'+it);
    expect(val(meta(p),'rel','canonical')?.href).toBe('https://omni101.app'+p);
   }
  }
 });
 it('pages without a pair declare only themselves; every sitemap page has a canonical',()=>{
  expect(altOf('/start-project')).toBeNull();expect(links('/start-project')).toEqual([{tagName:'link',rel:'alternate',hreflang:'it',href:'https://omni101.app/start-project'}]);
  expect(links('/en/offers/ai-landing')[0].hreflang).toBe('en');
  for(const p of sitemapPaths)expect(val(meta(p),'rel','canonical')?.href).toBe('https://omni101.app'+p);
 });
});
const SITE='https://omni101.app';
const MAIL=['info','omni101.app'].join('@');
describe('JSON-LD',()=>{
 it('parses on every indexable page with Organization, WebSite and BreadcrumbList',()=>{
  for(const p of sitemapPaths){
   const d=JSON.parse(safeJson(structuredData(p))),g=d['@graph'] as Record<string,any>[],ty=(x:string)=>g.find(n=>n['@type']===x);
   expect(d['@context']).toBe('https://schema.org');
   expect(ty('Organization')).toMatchObject({name:'OMNI101',url:SITE,email:MAIL,contactPoint:{email:MAIL}});
   expect(ty('WebSite')).toMatchObject({name:'OMNI101',url:'https://omni101.app'});expect(ty('WebSite').potentialAction).toBeUndefined();
   expect(ty('BreadcrumbList').itemListElement.at(-1).item).toBe(pageSeo(p).url);
   expect(g.find(n=>n.url===pageSeo(p).url&&n.inLanguage)?.inLanguage).toBe(p==='/en'||p.startsWith('/en/')?'en':'it-IT');
  }
  for(const s of sameAs)expect(s).toMatch(/^https:\/\//);
  expect(structuredData('/admin')).toBeNull();
 });
 it('offer prices come only from the engine file, and only when the flag allows them',()=>{
  const price=(p:string,show:boolean)=>(structuredData(p,show)!['@graph'] as Record<string,any>[]).find(n=>n['@type']==='Service')!.offers;
  expect(price('/en/offers/ai-landing',false)).toBeUndefined();
  const o=price('/en/offers/ai-landing',true),spec=o.priceSpecification as {minPrice?:number;price?:number}[];
  expect(o.priceCurrency).toBe(prezzi.valuta);expect(spec.some(s=>s.minPrice===prezzi.prodotti.sito_pronto.daUnaTantum)).toBe(true);expect(spec.some(s=>s.price===prezzi.prodotti.sito_pronto.daMensile)).toBe(true);
  const ld=price('/en/offers/local-desk',true);expect(ld.priceCurrency).toBe(prezzi.bundle.local_desk.valuta);
  expect(ld.priceSpecification.some((s:{minPrice?:number})=>s.minPrice===prezzi.bundle.local_desk.daUnaTantum)).toBe(true);
  expect(Boolean(price('/en/offers/ai-landing',MOSTRA_PREZZI))).toBe(MOSTRA_PREZZI);
 });
});
describe('sitemap and robots',()=>{
 it('lists final URLs in both languages with lastmod and reciprocal alternates, none of the known redirects or 404s',async()=>{
  const xml=await get('/sitemap.xml'),locs=urls(xml);
  expect(new Set(locs).size).toBe(locs.length);expect(locs).toHaveLength(sitemapPaths.length);
  for(const bad of ['/contact','/en/contact','/legal/privacy','/legal/terms','/admin','/portal','/login'])expect(locs).not.toContain('https://omni101.app'+bad);
  // /offerte* are indexable: the English offer pages declare them as hreflang alternates, so they must be listed too.
  for(const good of ['/offerte','/offerte/ai-landing','/offerte/local-desk'])expect(locs).toContain('https://omni101.app'+good);
  expect(publicPaths.every(p=>locs.includes('https://omni101.app'+p))).toBe(true);expect(enPaths.every(p=>locs.includes('https://omni101.app'+p))).toBe(true);
  expect((xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)||[]).length).toBe(locs.length);
  expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://omni101.app/en"/>');
  expect(sitemapXml('2026-01-02')).toContain('<lastmod>2026-01-02</lastmod>');
 });
 it('robots allows search and AI crawlers on public pages, blocks private areas, points to the sitemap',async()=>{
  const r=await get('/robots.txt');
  for(const c of crawlers)expect(r).toContain('User-agent: '+c+'\n');
  expect(r).toContain('User-agent: *\nAllow: /\n');
  for(const d of ['/admin','/portal','/login','/api'])expect(r).toContain('Disallow: '+d+'\n');
  expect(r).not.toMatch(/Disallow: \/\n/);expect(r).toContain('Sitemap: https://omni101.app/sitemap.xml');
  expect(await get('/robots.txt',{ENVIRONMENT:'staging'})).toBe('User-agent: *\nDisallow: /\n');
 });
});
describe('GEO and IndexNow',()=>{
 it('serves llms.txt and llms-full.txt with brand, contact, offers and links',async()=>{
  const a=await get('/llms.txt'),b=await get('/llms-full.txt');
  for(const x of [a,b]){expect(x.startsWith('# OMNI101')).toBe(true);expect(x).toContain('info@omni101.app');expect(x).toContain('https://omni101.app/en/offers/ai-landing')}
  expect(a).toContain('https://omni101.app/sitemap.xml');expect(b.length).toBeGreaterThan(a.length);
  expect(a).not.toMatch(/\/Users\//);
 });
 it('states "from" prices only as the engine file has them',()=>{
  expect(llmsTxt(false)).not.toMatch(/from [$€]/);
  const t=llmsTxt(true);const fmt=(n:number,currency:string)=>new Intl.NumberFormat('en',{style:'currency',currency,maximumFractionDigits:0}).format(n);
  expect(t).toContain('one-off from '+fmt(prezzi.prodotti.sito_pronto.daUnaTantum,prezzi.valuta));expect(t).toContain('one-off from '+fmt(prezzi.bundle.local_desk.daUnaTantum,prezzi.bundle.local_desk.valuta));expect(llmsFull(true)).toContain('monthly from');
 });
 it('IndexNow key file holds its own 32 hex name',()=>{
  const f=readdirSync(pub).find(n=>/^[0-9a-f]{32}\.txt$/.test(n))!;expect(f).toBeTruthy();expect(readFileSync(new URL(f,pub),'utf8').trim()).toBe(f.slice(0,-4));
 });
});
