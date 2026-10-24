import {describe,expect,test} from 'vitest';
import {capabilities} from '../apps/web/app/content/capabilities';
import {filtriVisibili,schedaPrezzo,tempiScheda} from '../apps/web/app/components/public/capabilities/panels';

describe('catalogo scheda',()=>{
 test('euro only from the public price file, and only on the named products',()=>{
  const sito=schedaPrezzo('siti-premium','DISPONIBILE');
  expect(sito.da).toMatch(/^Da /);expect(sito.da).toContain('4400');expect(sito.da).toContain('69');
  expect(schedaPrezzo('e-commerce','DISPONIBILE').da).toContain('3750');
  expect(schedaPrezzo('gestionale','DISPONIBILE').da).toContain('16.000');
  expect(schedaPrezzo('social-content','DISPONIBILE').da).toContain('309');
  expect(schedaPrezzo('social-content','DISPONIBILE').da).not.toMatch(/0\s*€/);
  expect(schedaPrezzo('saas','DISPONIBILE').da).toBe('Da definire nel preventivo');
  expect(schedaPrezzo('siti-premium','SPERIMENTALE').da).toBe('Da definire nel preventivo');
  expect(schedaPrezzo('saas','DISPONIBILE').da).not.toContain('€');
 });
 test('tempi stay a quote line, no invented weeks',()=>{
  for(const c of capabilities){
   const row=schedaPrezzo(c.id,c.availability);
   expect(row.tempi).toBe(tempiScheda);
   expect(row.da.startsWith('Da ')).toBe(true);
   expect(row.tempi).not.toMatch(/settiman|giorni/i);
  }
 });
 test('a filter chip that matches Tutte is hidden, and the row goes away if only Tutte is left',()=>{
  expect(filtriVisibili({ALL:16,DISPONIBILE:16,SU_MISURA:0,SPERIMENTALE:0})).toEqual([]);
  expect(filtriVisibili({ALL:16,DISPONIBILE:14,SU_MISURA:2,SPERIMENTALE:0})).toEqual(['ALL','DISPONIBILE','SU_MISURA']);
  expect(filtriVisibili({ALL:7,DISPONIBILE:0,SU_MISURA:0,SPERIMENTALE:7})).toEqual([]);
 });
});
