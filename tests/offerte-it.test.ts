import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
// Not run by the delegate. Reads sources and JSON only (paraglide output is generated, not importable in node).
const read=(p:string)=>readFileSync(p,'utf8');
const web='apps/web/';
const prezzi=JSON.parse(read(web+'app/content/prezzi-pubblici.json')) as {valuta:string;prodotti:Record<string,{daUnaTantum:number;daMensile:number}>;bundle:Record<string,{daUnaTantum:number;daMensile:number;valuta:string}>};
const offersSrc=read(web+'app/components/public/landing/offers.ts');
const slugs=[...offersSrc.matchAll(/\{slug:'([\w-]+)',productId:'(\w+)'/g)].map(m=>({slug:m[1],productId:m[2]}));

describe('offerte IT: prezzi dal motore',()=>{
 it('every offer resolves to an engine entry with a monthly fee',()=>{
  expect(slugs.map(s=>s.slug)).toEqual(['ai-landing','ai-assistant','ai-automation','local-desk']);
  for(const s of slugs){const b=prezzi.bundle[s.slug.replace(/-/g,'_')],p=b??prezzi.prodotti[s.productId];expect(p,s.slug).toBeTruthy();expect(p.daMensile,s.slug).toBeGreaterThan(0)}
 });
 it('no price literal in sources, only the JSON feeds the "from" line',()=>{
  const page=read(web+'app/routes/public/offerte.tsx');
  expect(page).not.toMatch(/€\s?\d|\d\s?€/);
  expect(offersSrc).toMatch(/priceSetupMonthly[\s\S]*prezziPubblici/);
 });
 it('price stays behind the founder flag',()=>expect(offersSrc).toMatch(/export const MOSTRA_PREZZI=(false|true);/));
});

describe('offerte IT: messages e hreflang',()=>{
 it('new key exists in both locales with the same placeholder',()=>{
  for(const l of ['it','en'])expect((JSON.parse(read(web+'messages/'+l+'.json')) as Record<string,string>).landing_price_monthly_only).toContain('{monthly}');
 });
 it('each offer has an English twin for hreflang',()=>{
  const seo=read(web+'app/content/seo.ts');
  for(const s of slugs)expect(seo).toContain("'/offerte/"+s.slug+"':'/en/offers/"+s.slug+"'");
 });
 it('switchPath maps offer pages both ways',()=>{
  const i18n=read(web+'app/components/public/shell/i18n.ts');
  expect(i18n).toContain("'/offerte/'+offer[1]");expect(i18n).toContain("'/offers/'+offer[1]");
 });
});
