import {describe,expect,test} from 'vitest';
import {media} from '../apps/web/app/content/media';
import {battute,briefLink,chiusura,coppiaMedia,decadimento,nodiVisibili,passiBinario,sagoma,segmenti} from '../apps/web/app/components/showcase/logica';

describe('showcase logic',()=>{
 test('every segment has a line in both languages',()=>{
  for(const s of segmenti){expect(battute[s].it.length).toBeGreaterThan(20);expect(battute[s].en.length).toBeGreaterThan(20)}
 });
 test('binario: six steps per segment, the three-node variant keeps request, key action and human review',()=>{
  for(const s of ['generico','studio','locale','bottega'] as const){
   const passi=passiBinario(s,'Una richiesta di prova.');
   expect(passi).toHaveLength(6);expect(passi[0]?.testo).toBe('Una richiesta di prova.');expect(passi[5]?.titolo).toBe('Revisione umana');
   expect(nodiVisibili(passi,3).map(p=>p.titolo)).toEqual([passi[0]!.titolo,passi[3]!.titolo,'Revisione umana']);
   expect(new Set(passi.map(p=>p.titolo)).size).toBe(6);
  }
  expect(passiBinario('generico','x')[3]?.testo).toContain('Nessun dato viene scritto nel CRM reale');
 });
 test('sagoma is a deterministic envelope in 0..1 and never invents a recording',()=>{
  const a=sagoma('Buongiorno, lo studio è chiuso.',24);
  expect(a).toHaveLength(24);expect(a).toEqual(sagoma('Buongiorno, lo studio è chiuso.',24));
  expect(a.every(v=>v>0&&v<=1)).toBe(true);
  expect(sagoma('',4)).toEqual([0.08,0.08,0.08,0.08]);
 });
 test('decadimento falls to zero',()=>{
  expect(decadimento(1,90)).toBeCloseTo(0.5,5);expect(decadimento(0.01,16)).toBe(0);
 });
 test('brief links are encoded and cut at 2000 characters, the same limit as start.tsx',()=>{
  expect(briefLink(' Voglio una risposta ')).toBe('/start-project?brief=Voglio%20una%20risposta');
  expect(decodeURIComponent(briefLink('a'.repeat(3000)).split('=')[1]!)).toHaveLength(2000);
 });
 test('every service closes with two links and a brief; the segment changes the sentence only where declared',()=>{
  for(const sv of ['voce','vetrina','binario','create','vision'] as const){
   const c=chiusura(sv);expect(c.links).toHaveLength(2);expect(c.href).toMatch(/^\/start-project\?brief=.+/);
  }
  expect(chiusura('voce','locale').href).not.toBe(chiusura('voce','studio').href);
  expect(chiusura('vision','locale').href).toBe(chiusura('vision').href);
 });
 test('PrimaDopo mounts only with both stills of the declared pair',()=>{
  const presenti=[...media.reel,...media.work,...media.explore].map(m=>m.src),hasBottega=['reel-01','reel-08'].every(n=>presenti.some(src=>src.includes(n)));
  expect(coppiaMedia('bottega')!==null).toBe(hasBottega);
  expect(coppiaMedia(undefined)).toBeNull();
  expect(coppiaMedia('studio')).toBeNull();
  const img={src:'/media/a.jpg',alt:'a',w:10,h:10};
  expect(coppiaMedia(undefined,img,undefined)).toBeNull();
  expect(coppiaMedia(undefined,img,{...img,src:'/media/b.jpg'})).not.toBeNull();
 });
});
