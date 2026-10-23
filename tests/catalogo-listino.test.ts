import {it,expect} from 'vitest';
import {convertiListino} from '../scripts/catalogo-listino.mjs';
it('converts euro to cents, sorts by id, maps piano senza anticipo and adds no extra fields',()=>{
 const base={generatoIl:'2026-01-01T00:00:00.000Z',prodotti:{
  z_beta:{nome:'Beta',unaTantum:101.5,mensile:10,tempiGiorni:3},
  a_alpha:{nome:'Alpha',unaTantum:100,mensile:10,tempiGiorni:3,pianoSenzaAnticipo:{prezzo_una_tantum:20,canone_mensile:11,durata_minima_mesi:12,totale_durata_minima_mesi:132,nota:'nota contract'}}}};
 const out=convertiListino(base);
 expect(out.fonte).toBe('motore prezzi');expect(out.generatoIl).toBe('2026-01-01T00:00:00.000Z');
 expect(out.voci.map(v=>v.id)).toEqual(['a_alpha','z_beta']);
 const a=out.voci[0],b=out.voci[1];
 expect(a.unaTantumCents).toBe(10000);expect(a.mensileCents).toBe(1000);expect(a.tempiGiorni).toBe(3);
 expect(a.senzaAnticipo).toEqual({canoneMensileCents:1100,durataMinimaMesi:12,totaleCents:13200,nota:'nota contract'});
 expect(b.senzaAnticipo).toBe(null);
 expect(Object.keys(a)).toEqual(['id','nome','unaTantumCents','mensileCents','tempiGiorni','senzaAnticipo']);
 expect(Object.keys(out)).toEqual(['generatoIl','fonte','voci']);
});
it('rejects negative numbers with an Italian message',()=>{
 const base={generatoIl:'g',prodotti:{x:{nome:'X',unaTantum:-1,mensile:1,tempiGiorni:1}}};
 expect(()=>convertiListino(base)).toThrow(/numero finito >= 0/);
});
