import {describe,expect,it} from 'vitest';
import {resolve} from 'node:path';
// @ts-expect-error plain .mjs script, no types
import {check,load} from '../scripts/i18n-check.mjs';

const glossary={signatures:['OMNI101','Digital Possibility Studio','BUILD']};
const base={a:'Ciao {name}, benvenuto in OMNI101',b:'Costruiamo con BUILD ogni giorno',c:'Una frase abbastanza lunga da tradurre'};
const run=(en:Record<string,string>)=>check({baseLocale:'it',locales:['it','en'],messages:{it:base,en},glossary}) as string[];
const good={a:'Hi {name}, welcome to OMNI101',b:'We build with BUILD every day',c:'A sentence long enough to translate'};

describe('i18n-check',()=>{
 it('accepts a faithful translation',()=>expect(run(good)).toEqual([]));
 it('reports a missing key',()=>{const {c,...rest}=good;expect(run(rest)).toEqual(['en: missing key c'])});
 it('reports an extra key',()=>expect(run({...good,z:'x'})).toEqual(['en: extra key z not in it']));
 it('reports different placeholders',()=>expect(run({...good,a:'Hi {user}, welcome to OMNI101'}).join()).toContain('placeholders differ in a'));
 it('reports an altered signature',()=>expect(run({...good,a:'Hi {name}, welcome to Omni 101'}).join()).toContain('signature "OMNI101" altered in a'));
 it('reports a suspicious length',()=>expect(run({...good,c:'Ok'}).join()).toContain('suspicious length in c'));
 it('reports an untranslated copy',()=>expect(run({...good,c:base.c}).join()).toContain('identical to it'));
 it('the real messages pass',()=>expect(check(load(resolve(__dirname,'../apps/web')))).toEqual([]));
});
