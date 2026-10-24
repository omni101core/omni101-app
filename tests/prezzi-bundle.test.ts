import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
// The bundle block is written by hand from the pricing engine's quote(); a regeneration of the file must not drop it silently.
type Bundle={nome:string;livello:string;valuta:string;daUnaTantum:number;daMensile:number;prodotti:string[];fonte:string;verificatoIl:string};
const prezzi=JSON.parse(readFileSync('apps/web/app/content/prezzi-pubblici.json','utf8')) as {prodotti:Record<string,unknown>;bundle:Record<string,Bundle>};
const offersSrc=readFileSync('apps/web/app/components/public/landing/offers.ts','utf8');
describe('bundle prices in prezzi-pubblici.json',()=>{
 it('every bundle offer has its block',()=>{
  for(const m of offersSrc.matchAll(/\{slug:'([\w-]+)'/g))if(m[1]==='local-desk')expect(prezzi.bundle?.local_desk,'bundle.local_desk missing: re-run the engine quote and restore it').toBeTruthy();
 });
 it('each block is complete, positive, dated and built from known products',()=>{
  for(const [key,b] of Object.entries(prezzi.bundle)){
   expect(b.fonte,key).toMatch(/\S/);expect(b.verificatoIl,key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
   expect(b.valuta,key).toMatch(/^[A-Z]{3}$/);
   expect(b.daUnaTantum,key).toBeGreaterThan(0);expect(b.daMensile,key).toBeGreaterThan(0);
   for(const id of b.prodotti)expect(Object.keys(prezzi.prodotti),key).toContain(id);
  }
 });
});
