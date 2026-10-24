import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {articlesEn,articlesIt} from '../apps/web/app/content/articles';
import {altOf,enPaths,pairEn,publicMeta,publicPaths,sitemapPaths,structuredData} from '../apps/web/app/content/seo';
import {offers} from '../apps/web/app/components/public/landing/offers';
import {articles} from '../apps/web/app/components/public/shell/site-data';
type Node={'@type':string;[k:string]:unknown};
const graph=(p:string)=>(structuredData(p) as {'@graph':Node[]}|null)?.['@graph']??[];
const meta=(p:string)=>publicMeta(p) as Record<string,string>[];
const read=(p:string)=>readFileSync('apps/web/app/'+p,'utf8');
const pages=(lang:'it'|'en')=>(lang==='it'?articlesIt:articlesEn).map(a=>({a,path:(lang==='it'?'/insights/':'/en/insights/')+a.slug}));
describe('guides are wired: list, article page, sitemap',()=>{
 it('every Italian guide is in the article list and has an English twin in the pairs',()=>{
  expect(articlesIt.map(a=>a.slug)).toEqual(articlesEn.map(a=>a.slug));
  for(const {a,path} of pages('it')){
   expect(articles.some(x=>x.slug===a.slug)).toBe(true);
   expect(publicPaths).toContain(path);expect(pairEn[path]).toBe('/en/insights/'+a.slug);expect(enPaths).toContain('/en/insights/'+a.slug);
  }
  expect(pairEn['/insights']).toBe('/en/insights');expect(enPaths).toContain('/en/insights');
 });
 it('sitemap has no duplicates after adding the guides',()=>expect(new Set(sitemapPaths).size).toBe(sitemapPaths.length));
 it('older Italian-only guides stay listed and get no English page',()=>{
  const old=articles.filter(a=>!articlesIt.some(x=>x.slug===a.slug));
  expect(old.length).toBeGreaterThan(0);
  for(const a of old){expect(publicPaths).toContain('/insights/'+a.slug);expect(pairEn['/insights/'+a.slug]).toBeUndefined();expect(enPaths).not.toContain('/en/insights/'+a.slug)}
 });
});
describe('guide pages: meta and JSON-LD',()=>{
 for(const lang of ['it','en'] as const)for(const {a,path} of pages(lang))it(lang+' '+a.slug,()=>{
  const m=meta(path),title=m[0].title,canonical=m.find(x=>(x as unknown as {rel?:string}).rel==='canonical') as unknown as {href:string};
  expect(title.startsWith('OMNI101')).toBe(true);expect(title.length).toBeLessThanOrEqual(60);expect(canonical.href).toBe('https://omni101.app'+path);
  const alt=altOf(path)!;expect(alt.it).toBe('/insights/'+a.slug);expect(alt.en).toBe('/en/insights/'+a.slug);
  const g=graph(path),art=g.find(n=>n['@type']==='Article')!,faq=g.find(n=>n['@type']==='FAQPage')!;
  expect(art.headline).toBe(a.title);expect(art.datePublished).toBe(a.date);expect(art.inLanguage).toBe(lang==='it'?'it-IT':'en');
  const q=(faq.mainEntity as {name:string;acceptedAnswer:{text:string}}[]);
  expect(q.map(x=>x.name)).toEqual(a.faq!.map(f=>f.q));expect(q.map(x=>x.acceptedAnswer.text)).toEqual(a.faq!.map(f=>f.a));
  expect(JSON.stringify(g)).not.toContain('aggregateRating');
  expect(g.find(n=>n['@type']==='BreadcrumbList')).toBeTruthy();
 });
 it('older guides keep Article without a FAQPage',()=>{
  const old=articles.find(a=>!articlesIt.some(x=>x.slug===a.slug))!;
  const g=graph('/insights/'+old.slug);expect(g.some(n=>n['@type']==='Article')).toBe(true);expect(g.some(n=>n['@type']==='FAQPage')).toBe(false);
 });
});
describe('guide content links to real offers',()=>{
 const slugs=offers.map(o=>o.slug);
 for(const lang of ['it','en'] as const)for(const {a} of pages(lang))it(lang+' '+a.slug+': sections, FAQ and CTA',()=>{
  expect(a.sections!.length).toBeGreaterThanOrEqual(3);expect(a.faq!.length).toBeGreaterThanOrEqual(3);
  const m=a.cta!.href.match(lang==='it'?/^\/offerte\/([\w-]+)$/:/^\/en\/offers\/([\w-]+)$/)!;
  expect(m,a.cta!.href).toBeTruthy();expect(slugs).toContain(m[1]);
 });
});
describe('routing and navigation source',()=>{
 it('English insights routes exist once and the loader only serves English guides',()=>{
  const routes=read('routes.ts');
  expect(routes.match(/route\('en\/insights','routes\/public\.tsx'/g)).toHaveLength(1);expect(routes.match(/route\('en\/insights\/\*','routes\/public\.tsx'/g)).toHaveLength(1);
  const pub=read('routes/public.tsx');
  expect(pub).toContain('work|studio|insights');expect(pub).toContain('articlesEn.some(a=>u===\'/en/insights/\'+a.slug)');
 });
 it('the page renders sections, FAQ and CTA from the guide data',()=>{
  const src=read('routes/public/insights.tsx');
  for(const needle of ['a.sections','a.faq','a.cta','localePath(\'/insights/\'+a.slug,l)'])expect(src).toContain(needle);
 });
});
describe('Italian offer pages are indexable (review fix)',()=>{
 it('/offerte and each /offerte/<slug> are in the sitemap with an Offer node in Italian',()=>{
  expect(publicPaths).toContain('/offerte');
  for(const o of offers){
   const path='/offerte/'+o.slug;expect(publicPaths).toContain(path);
   const svc=graph(path).find(n=>n['@type']==='Service')!;expect(svc.inLanguage).toBe('it-IT');
   expect(altOf(path)!.en).toBe('/en/offers/'+o.slug);
  }
 });
});
