import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const src=readFileSync('apps/web/app/routes/public/legal.tsx','utf8');
describe('privacy: testo definitivo',()=>{
 it('niente frase provvisoria',()=>{expect(src).not.toContain('devono essere confermati');expect(src).not.toContain('Documento di configurazione')});
 it('ha titolare, Turnstile, D1, Email Routing, cookie e diritti',()=>{for(const k of ['Titolare del trattamento','Turnstile','D1','Cloudflare Email Routing','cookie di profilazione','Garante'])expect(src).toContain(k)});
 it('placeholder visibile finché i dati legali non sono confermati',()=>{expect(src).toContain('[DA CONFERMARE]')});
});
