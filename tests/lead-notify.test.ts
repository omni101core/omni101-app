import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import type {Env} from '../apps/web/app/server/auth';
// Il modulo esiste solo nel runtime del Worker: in node lo sostituiamo.
vi.mock('cloudflare:email',()=>({EmailMessage:class{constructor(public from:string,public to:string,public raw:string){}}}));
function setup(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};const now=Date.now();sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,created_at,updated_at) VALUES(?,?,?,?,0,?,?)').run('budget','omni101',now-1000,now+86400000,now,now);return {sqlite,env:{DB,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only',AI_PROVIDER:'test',AI_MODEL:'verified-free-model',AI_API_KEY:'test-only',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0'} as unknown as Env}}
const ok=()=>vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'omni101.app',action:'intake'})));
const post=(env:Env,payload:unknown)=>handleApi(new Request('https://omni101.app/api/intake',{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json'},body:JSON.stringify(payload)}),env)!;
const brief='Lead magnet: Free personalized mini-demo\nLanguage: Italian\nOffer: AI landing page (ai-landing)\nPage: /en/offers/ai-landing\nGoal: più contatti dal sito';
const lead={name:'Giulia Verdi',email:'giulia@example.test',message:brief,services:['BUILD'],budget:'€ 5.000 – 15.000',turnstileToken:'test-only',consent:true};
const decode=(raw:string)=>Buffer.from(raw.split('\r\n\r\n')[1].replace(/\r\n/g,''),'base64').toString('utf8');
afterEach(()=>vi.unstubAllGlobals());
describe('avviso email del lead',()=>{
 it('invia nome, email, servizio, budget, lingua e link dashboard; header senza input utente',async()=>{
  const {env}=setup();vi.stubGlobal('fetch',ok());const send=vi.fn(async()=>{});
  const e={...env,NOTIFY_MAIL:{send},LEAD_NOTIFY_TO:'omni101.core@gmail.com'} as Env;
  expect((await post(e,lead)).status).toBe(201);
  expect(send).toHaveBeenCalledTimes(1);
  const m=send.mock.calls[0][0] as unknown as {from:string;to:string;raw:string};
  expect([m.from,m.to]).toEqual(['leads@omni101.app','omni101.core@gmail.com']);
  const head=m.raw.split('\r\n\r\n')[0];
  expect(head).toContain('Subject: Nuova richiesta dal sito');
  expect(head).not.toContain('Giulia');expect(head).not.toContain('example.test');
  const body=decode(m.raw);
  for(const s of ['Nome: Giulia Verdi','Email: giulia@example.test','Servizio: BUILD','Budget: € 5.000 – 15.000','Lingua pagina: Italian','/admin/leads'])expect(body).toContain(s);
 });
 it('senza binding (staging/test) salta senza errore',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  expect((await post(env,lead)).status).toBe(201);
  expect((sqlite.prepare('SELECT count(*) n FROM leads').get() as {n:number}).n).toBe(1);
 });
 it('se l’invio fallisce il lead resta salvato e l’intake risponde 201',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());vi.spyOn(console,'error').mockImplementation(()=>{});
  const e={...env,NOTIFY_MAIL:{send:vi.fn(async()=>{throw new Error('boom')})},LEAD_NOTIFY_TO:'omni101.core@gmail.com'} as Env;
  expect((await post(e,lead)).status).toBe(201);
  expect((sqlite.prepare('SELECT count(*) n FROM leads').get() as {n:number}).n).toBe(1);
 });
});
