import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {assistantToolRegistry} from '../apps/web/app/server/assistant';
import type {Env} from '../apps/web/app/server/auth';
function setup(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};const now=Date.now();sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,created_at,updated_at) VALUES(?,?,?,?,0,?,?)').run('budget','omni101',now-1000,now+86400000,now,now);return {sqlite,env:{DB,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only',AI_PROVIDER:'nvidia',AI_MODEL:'verified-free-model',AI_API_KEY:'test-only',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0'} as unknown as Env}}
const answer={text:'Possiamo definire il tuo e-commerce, partendo da catalogo e pagamenti.',cards:[],checklist:[],actions:[{type:'brief',label:'Prepara il brief',brief:'Vorrei un e-commerce.'}]};
function providers(turnstile=true){return vi.fn(async(url:string,_options?:RequestInit)=>String(url).includes('challenges.cloudflare.com')?new Response(JSON.stringify(turnstile?{success:true,hostname:'omni101.app',action:'intake'}:{success:false})):new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}],usage:{prompt_tokens:100,completion_tokens:30}})))}
const post=(env:Env,path:string,payload:unknown,cookie='')=>handleApi(new Request('https://omni101.app'+path,{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(payload)}),env)!;
async function chat(env:Env,message='Vorrei un e-commerce con catalogo di 200 prodotti e pagamento con carta.'){const response=await post(env,'/api/assistant',{message,mode:'public'});return {conversationId:(await response.json() as {conversationId:string}).conversationId,cookie:response.headers.get('Set-Cookie')!.split(';')[0]}}
const lead={name:'Giulia Verdi',email:'giulia@example.test',message:'Vorrei un e-commerce con catalogo di 200 prodotti e pagamento con carta.',services:[] as string[],turnstileToken:'test-only',consent:true};
const count=(sqlite:DatabaseSync,table:string)=>(sqlite.prepare('SELECT count(*) n FROM '+table).get() as {n:number}).n;
afterEach(()=>vi.unstubAllGlobals());
describe('OMNI ASSIST submit_lead: explicit, server-validated, through /api/intake',()=>{
 it('registers the tool as a confirmed intake call, not a model-driven write',()=>{
  expect(assistantToolRegistry.submit_lead).toContain('/api/intake');
  expect(assistantToolRegistry.submit_lead).toContain('conferma esplicita');
 });
 it('creates exactly one real lead from a confirmed chat brief and records the handoff in the conversation',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',providers());
  const {conversationId,cookie}=await chat(env);
  expect(count(sqlite,'leads')).toBe(0);
  const sent=await post(env,'/api/intake',{...lead,via:{assistant:{confirmed:true,conversationId}}},cookie);
  expect(sent.status).toBe(201);
  expect(count(sqlite,'leads')).toBe(1);
  expect(count(sqlite,'contacts')).toBe(1);
  expect(count(sqlite,'tasks')).toBe(1);
  expect(count(sqlite,'workflow_executions')).toBe(1);
  const row=sqlite.prepare('SELECT source,status,brief FROM leads').get() as {source:string;status:string;brief:string};
  expect([row.source,row.status]).toEqual(['assistant','QUALIFICATION']);
  expect(row.brief).toContain('catalogo di 200 prodotti');
  const audit=JSON.parse((sqlite.prepare("SELECT details FROM audit_logs WHERE action='INTAKE_RECEIVED'").get() as {details:string}).details);
  expect(audit).toMatchObject({via:'assistant',confirmed:true,conversationLinked:true,conversationId,consent:true});
  const messages=sqlite.prepare('SELECT role,content FROM assistant_messages WHERE conversation_id=? ORDER BY created_at').all(conversationId) as {role:string;content:string}[];
  expect(messages[messages.length-1].content).toContain('Richiesta inviata allo studio con il tuo consenso');
  const again=await post(env,'/api/intake',{...lead,via:{assistant:{confirmed:true,conversationId}}},cookie);
  expect(again.status).toBe(200);
  expect((await again.json() as {duplicate:boolean}).duplicate).toBe(true);
  expect(count(sqlite,'leads')).toBe(1);
 });
 it('writes nothing without explicit confirmation, consent or a valid Turnstile proof',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',providers());
  const {conversationId,cookie}=await chat(env);
  for(const payload of [
   {...lead,via:{assistant:{confirmed:false,conversationId}}},
   {...lead,via:{assistant:{conversationId}}},
   {...lead,consent:false,via:{assistant:{confirmed:true,conversationId}}},
   {...lead,via:{assistant:{confirmed:true,conversationId,brief:'iniettato'}}},
   {...lead,via:{assistant:{confirmed:true},source:'admin'}},
   {...lead,message:'troppo corto',via:{assistant:{confirmed:true,conversationId}}}
  ])expect((await post(env,'/api/intake',payload,cookie)).status).toBe(400);
  vi.stubGlobal('fetch',providers(false));
  expect((await post(env,'/api/intake',{...lead,via:{assistant:{confirmed:true,conversationId}}},cookie)).status).toBe(400);
  for(const table of ['leads','contacts','tasks','workflow_executions'])expect(count(sqlite,table)).toBe(0);
  expect(count(sqlite,'audit_logs')).toBe(0);
 });
 it('never links or writes into a conversation the visitor does not own',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',providers());
  const owner=await chat(env,'Vorrei un avatar che presenti i prodotti del nostro negozio.');
  const stranger=await chat(env,'Mi serve un software di prenotazioni per la mia palestra.');
  const before=count(sqlite,'assistant_messages');
  const sent=await post(env,'/api/intake',{...lead,via:{assistant:{confirmed:true,conversationId:owner.conversationId}}},stranger.cookie);
  expect(sent.status).toBe(201);
  const audit=JSON.parse((sqlite.prepare("SELECT details FROM audit_logs WHERE action='INTAKE_RECEIVED'").get() as {details:string}).details);
  expect([audit.conversationLinked,audit.conversationId]).toEqual([false,null]);
  expect(count(sqlite,'assistant_messages')).toBe(before);
  const anonymous=await post(env,'/api/intake',{...lead,email:'altro@example.test',via:{assistant:{confirmed:true,conversationId:owner.conversationId}}});
  expect(anonymous.status).toBe(201);
  expect(count(sqlite,'assistant_messages')).toBe(before);
 });
 it('keeps the plain website form unchanged: source website, no assistant fields in the audit',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',providers());
  const sent=await post(env,'/api/intake',lead);
  expect(sent.status).toBe(201);
  expect((sqlite.prepare('SELECT source FROM leads').get() as {source:string}).source).toBe('website');
  expect(JSON.parse((sqlite.prepare("SELECT details FROM audit_logs WHERE action='INTAKE_RECEIVED'").get() as {details:string}).details)).not.toHaveProperty('via');
 });
});
