import {describe,it,expect} from 'vitest';
import {publicPaths,publicMeta,structuredData,safeJson} from '../apps/web/app/content/seo';
import {publicSeoResponse,indexPolicy} from '../apps/web/app/server/public-seo';
import type {Env} from '../apps/web/app/server/auth';
describe('indexable content and honest structured data',()=>{
 it('lists real public cases and articles without exposing workspace or query data',async()=>{
  const response=publicSeoResponse(new Request('https://omni101.app/sitemap.xml'),{ENVIRONMENT:'production'} as Env)!;const xml=await response.text();
  for(const path of ['/work/casa-luce','/work/tavola','/work/studio-forma','/explore/voice','/explore/vision','/insights/ai-nel-lavoro-reale'])expect(xml).toContain('https://omni101.app'+path);
  expect(xml).not.toContain('/admin');expect(new Set(publicPaths).size).toBe(publicPaths.length);
 });
 it('uses unique case metadata and identifies concepts without fake commercial ratings',()=>{
  expect(publicMeta('/work/casa-luce')[0]).toEqual({title:'Casa Luce / Ospitalità diretta · OMNI101'});
  const schema=JSON.stringify(structuredData('/work/casa-luce'));expect(schema).toContain('Concept dimostrativo');expect(schema).not.toContain('aggregateRating');expect(structuredData('/admin')).toBeNull();
  expect(safeJson({text:'</script><script>alert(1)</script>'})).not.toContain('<');
 });
 it('excludes preview, private routes and errors and redirects only known public aliases',async()=>{
  expect(indexPolicy('/','staging')).toContain('noindex');expect(indexPolicy('/admin','production')).toContain('noindex');expect(indexPolicy('/','production',404)).toContain('noindex');expect(indexPolicy('/','production')).toBeNull();
  const robots=publicSeoResponse(new Request('https://preview.omni101.app/robots.txt'),{ENVIRONMENT:'staging'} as Env)!;expect(await robots.text()).toBe('User-agent: *\nDisallow: /\n');
  expect(publicSeoResponse(new Request('https://omni101.app/legal/privacy'),{} as Env)?.headers.get('location')).toBe('https://omni101.app/privacy');
  expect(publicSeoResponse(new Request('https://omni101.app/admin/'),{} as Env)).toBeNull();
 });
});
