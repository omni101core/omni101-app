import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
// Dati solo sintetici: nessun importo reale del listino entra nel repo.
const listino=(generatoIl:string,nome='Voce sintetica')=>({generatoIl,fonte:'motore prezzi',voci:[{id:'synthetic-1',nome,unaTantumCents:120000,mensileCents:9000,tempiGiorni:30,senzaAnticipo:{canoneMensileCents:12000,durataMinimaMesi:12,totaleCents:144000,nota:'Condizione sintetica di test.'}}]});
describe('catalogo listino versionato',()=>{
 it('importa una nuova versione, deduplica per generatoIl e registra audit',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);
  const first=await handleApi(req('/api/pricing/catalog',cookie,'POST',listino('2026-10-01T08:00:00.000Z')),env);
  expect(first?.status).toBe(201);expect(await first?.json()).toEqual({version:1,voci:1});
  expect(sqlite.prepare('SELECT count(*) n FROM pricing_catalog_versions').get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='PRICING_CATALOG_IMPORTED'").get()?.n).toBe(1);
  const same=await handleApi(req('/api/pricing/catalog',cookie,'POST',listino('2026-10-01T08:00:00.000Z')),env);
  expect(same?.status).toBe(200);expect(await same?.json()).toEqual({version:1,duplicate:true});
  expect(sqlite.prepare('SELECT count(*) n FROM pricing_catalog_versions').get()?.n).toBe(1);
  const next=await handleApi(req('/api/pricing/catalog',cookie,'POST',listino('2026-10-02T08:00:00.000Z','Voce sintetica aggiornata')),env);
  expect(next?.status).toBe(201);expect(await next?.json()).toEqual({version:2,voci:1});
  const read=await (await handleApi(req('/api/pricing/catalog',cookie),env))?.json() as {version:number;generatoIl:string;importedBy:string;voci:{nome:string}[]};
  expect(read.version).toBe(2);expect(read.generatoIl).toBe('2026-10-02T08:00:00.000Z');expect(read.importedBy).toBe('owner');expect(read.voci[0].nome).toBe('Voce sintetica aggiornata');
  expect(sqlite.prepare('SELECT count(*) n FROM pricing_catalog_versions').get()?.n).toBe(2);
 });
 it('consente la lettura ai ruoli pricing ma non import o accesso cliente/developer',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',listino('2026-10-03T08:00:00.000Z')),env))?.status).toBe(201);
  for(const role of ['ADMIN','PROJECT_MANAGER','SALES','FINANCE']){const reader=await owner(sqlite,'omni101',role,'catalog-'+role.toLowerCase());const res=await handleApi(req('/api/pricing/catalog',reader),env);expect(res?.status).toBe(200);expect((await res?.json() as {version:number}).version).toBe(1)}
  const sales=await owner(sqlite,'omni101','SALES','catalog-sales-writer');
  expect((await handleApi(req('/api/pricing/catalog',sales,'POST',listino('2026-10-04T08:00:00.000Z')),env))?.status).toBe(403);
  expect(sqlite.prepare('SELECT count(*) n FROM pricing_catalog_versions').get()?.n).toBe(1);
  for(const role of ['CLIENT','DEVELOPER']){const blocked=await owner(sqlite,'omni101',role,'catalog-'+role.toLowerCase());expect((await handleApi(req('/api/pricing/catalog',blocked),env))?.status).toBe(403);expect((await handleApi(req('/api/pricing/catalog',blocked,'POST',listino('2026-10-05T08:00:00.000Z')),env))?.status).toBe(403)}
 });
 it('isola le organizzazioni: nessuna lettura, nessuna deduplica condivisa',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),stamp=Date.now();
  sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('catalog-foreign','Other','catalog-foreign',stamp,stamp);
  const foreign=await owner(sqlite,'catalog-foreign','OWNER','catalog-foreign-owner'),foreignEnv={...env,ORGANIZATION_ID:'catalog-foreign'};
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',listino('2026-10-06T08:00:00.000Z')),env))?.status).toBe(201);
  const empty=await (await handleApi(req('/api/pricing/catalog',foreign),foreignEnv))?.json() as {version:number|null;voci:unknown[]};
  expect(empty).toEqual({version:null,voci:[]});
  const imported=await handleApi(req('/api/pricing/catalog',foreign,'POST',listino('2026-10-06T08:00:00.000Z')),foreignEnv);
  expect(imported?.status).toBe(201);expect(await imported?.json()).toEqual({version:1,voci:1});
  const visible=await (await handleApi(req('/api/pricing/catalog',cookie),env))?.text();
  expect(visible).not.toContain('catalog-foreign');
 });
 it('rifiuta importi negativi, campi fuori contratto e oltre 200 voci',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),base=listino('2026-10-07T08:00:00.000Z');
  const negative={...base,voci:[{...base.voci[0],unaTantumCents:-1}]};
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',negative),env))?.status).toBe(400);
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',{...base,fonte:'listino manuale'}),env))?.status).toBe(400);
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',{...base,voci:[{...base.voci[0],senzaAnticipo:{canoneMensileCents:12000,durataMinimaMesi:12,totaleCents:144000}}]}),env))?.status).toBe(400);
  const many={...base,voci:Array.from({length:201},(_,i)=>({...base.voci[0],id:'synthetic-'+i}))};
  expect((await handleApi(req('/api/pricing/catalog',cookie,'POST',many),env))?.status).toBe(400);
  expect(sqlite.prepare('SELECT count(*) n FROM pricing_catalog_versions').get()?.n).toBe(0);
 });
});
