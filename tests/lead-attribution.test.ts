import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import type {Env} from '../apps/web/app/server/auth';
function setup(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};const now=Date.now();sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,created_at,updated_at) VALUES(?,?,?,?,0,?,?)').run('budget','omni101',now-1000,now+86400000,now,now);return {sqlite,env:{DB,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only',AI_PROVIDER:'nvidia',AI_MODEL:'verified-free-model',AI_API_KEY:'test-only',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0'} as unknown as Env}}
const ok=()=>vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'omni101.app',action:'intake'})));
const post=(env:Env,payload:unknown)=>handleApi(new Request('https://omni101.app/api/intake',{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json'},body:JSON.stringify(payload)}),env)!;
const full={name:'Giulia Verdi',email:'giulia@example.test',message:'Vorrei un sito con catalogo e pagamento con carta.',services:[] as string[],turnstileToken:'test-only',consent:true};
const express={name:'Luca Neri',email:'luca@example.test',message:'Mi serve un sito',express:true,turnstileToken:'test-only',consent:true};
const lead=(sqlite:DatabaseSync)=>sqlite.prepare('SELECT source,classification,attribution FROM leads').get() as {source:string;classification:string;attribution:string|null};
afterEach(()=>vi.unstubAllGlobals());
describe('intake Express e attribuzione osservata',()=>{
 it('crea un lead valido dal percorso Express con messaggio corto e lo marca',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  expect((await post(env,express)).status).toBe(201);
  const row=lead(sqlite);
  expect(JSON.parse(row.classification).intake).toBe('express');
  expect(row.attribution).toBeNull();
 });
 it('mantiene i 20 caratteri per il racconto completo e rifiuta Express sotto i 5',async()=>{
  const {env}=setup();vi.stubGlobal('fetch',ok());
  expect((await post(env,{...full,message:'troppo breve'})).status).toBe(400);
  expect((await post(env,{...express,message:'ciao'})).status).toBeGreaterThanOrEqual(400);
 });
 it('Express richiede ancora consenso e Turnstile',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:false}))));
  expect((await post(env,{...express,consent:false})).status).toBeGreaterThanOrEqual(400);
  expect((await post(env,express)).status).toBe(400);
  expect((sqlite.prepare('SELECT count(*) n FROM leads').get() as {n:number}).n).toBe(0);
 });
 it('salva utm e dominio del referrer ripuliti',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  const attribution={utm_source:' newsletter ',utm_medium:'email',utm_campaign:'autunno-2026',utm_content:'cta_1',referrer:'Example.com',altro:'ignorato'};
  expect((await post(env,{...full,attribution})).status).toBe(201);
  expect(JSON.parse(lead(sqlite).attribution!)).toEqual({utm_source:'newsletter',utm_medium:'email',utm_campaign:'autunno-2026',utm_content:'cta_1',referrer:'example.com'});
 });
 it('scarta valori malevoli o troppo lunghi senza perdere il lead',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  const attribution={utm_source:'<script>alert(1)</script>',utm_medium:'x'.repeat(201),utm_campaign:'ok',utm_content:{a:1},referrer:'https://evil.test/path'};
  expect((await post(env,{...full,attribution})).status).toBe(201);
  expect(JSON.parse(lead(sqlite).attribution!)).toEqual({utm_campaign:'ok'});
 });
 it('lead senza utm resta invariato',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  expect((await post(env,full)).status).toBe(201);
  const row=lead(sqlite);
  expect([row.source,row.attribution]).toEqual(['website',null]);
  expect(JSON.parse(row.classification).intake).toBeUndefined();
 });
});
