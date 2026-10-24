import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleCommerceConfigurations} from '../apps/web/app/server/commerce-configurations';
import {handleApi} from '../apps/web/app/server/api';
import {HttpError,digest,type Env,type Identity} from '../apps/web/app/server/auth';

function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 let beforeBatch:(()=>Promise<void>)|undefined;
 const wrap=(sql:string,params:unknown[]=[])=>({sql,params,bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])??null},async all(){return {results:sqlite.prepare(sql).all(...params as [])}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {meta:{changes:Number(out.changes)}}}});
 const env={DB:{prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){await beforeBatch?.();sqlite.exec('BEGIN');try{const out=statements.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.params as []).changes)}}));sqlite.exec('COMMIT');return out}catch(error){sqlite.exec('ROLLBACK');throw error}}}} as unknown as Env;
 for(const org of ['org-a','org-b'])sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,1,1)').run(org,org,org);
 for(const [id,org] of [['client-a','org-a'],['client-b','org-a'],['client-c','org-b']])sqlite.prepare('INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,1,1)').run(id,org,id);
 const actor=(id:string,role:Identity['role'],clientId:string|null=null,orgId='org-a'):Identity=>{sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,1,1)').run(id,id+'@example.test',id);return {id,email:id+'@example.test',name:id,role,clientId,orgId}};
 const owners=[actor('owner-a','OWNER'),actor('owner-b','OWNER')];
 const clients=[actor('buyer-a','CLIENT','client-a'),actor('buyer-b','CLIENT','client-b')];
 return {sqlite,env,actor,owners,clients,hold(fn:()=>Promise<void>){beforeBatch=fn}};
}
const configuration=(extra:Record<string,unknown>={})=>({version:1,theme:'studio',businessName:'Studio prova',headline:'Una pagina di prova',description:'Descrizione della pagina di prova.',ctaLabel:'Contattaci',ctaUrl:'https://example.test/contact',features:[{title:'Servizio',description:'Descrizione servizio'}],...extra});
const base='/api/commerce/configurations';
async function call(env:Env,actor:Identity,path=base,method='GET',payload?:unknown){
 const request=new Request('https://example.test'+path,{method,headers:{'Content-Type':'application/json'},...(payload!==undefined?{body:JSON.stringify(payload)}:{})});
 try{return await handleCommerceConfigurations(request,env,actor)}catch(error){if(error instanceof HttpError)return new Response(JSON.stringify({error:error.message}),{status:error.status});throw error}
}
const create=async(env:Env,actor:Identity)=>{const response=await call(env,actor,base,'POST',{configuration:configuration()});expect(response?.status).toBe(201);return response!.json() as Promise<{id:string;version:number;configuration:ReturnType<typeof configuration>}>};
describe('commerce configurations',()=>{
 it('creates authoritative UUID and resumes, saves, preserves old config on CAS conflict; schema version stays 1',async()=>{
  const {env,sqlite,owners}=fixture(),saved=await create(env,owners[0]);
  expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);expect(saved.version).toBe(1);
  expect(await (await call(env,owners[0],base+'/'+saved.id))?.json()).toMatchObject(saved);
  expect((await (await call(env,owners[1]))?.json()).configurations).toHaveLength(1);
  const updated=await call(env,owners[1],base+'/'+saved.id,'PATCH',{expectedVersion:1,configuration:configuration({headline:'Headline aggiornata'})});
  expect(await updated?.json()).toMatchObject({version:2,configuration:{version:1,headline:'Headline aggiornata'}});
  expect((await call(env,owners[0],base+'/'+saved.id,'PATCH',{expectedVersion:1,configuration:configuration()}))?.status).toBe(409);
  expect(sqlite.prepare('SELECT version,owner_user_id,client_id FROM commerce_configurations').get()).toMatchObject({version:2,owner_user_id:owners[0].id,client_id:null});
  expect(sqlite.prepare('SELECT count(*) n FROM audit_logs').get()?.n).toBe(2);
 });
 it('limits clients by both verified owner and client, tenant and role; IDs never authorize',async()=>{
  const {env,sqlite,clients,owners,actor}=fixture(),a=await create(env,clients[0]),b=await create(env,clients[1]);
  expect((await (await call(env,clients[0]))?.json()).configurations.map((x:{id:string})=>x.id)).toEqual([a.id]);
  for(const method of ['GET','PATCH'])expect((await call(env,clients[1],base+'/'+a.id,method,method==='PATCH'?{expectedVersion:1,configuration:configuration()}:undefined))?.status).toBe(404);
  expect((await call(env,{...clients[0],clientId:'client-b'},base+'/'+a.id))?.status).toBe(404);
  expect((await call(env,actor('foreign','OWNER',null,'org-b'),base+'/'+b.id))?.status).toBe(404);
  expect((await call(env,owners[0],base+'/'+b.id))?.status).toBe(200);
  for(const role of ['PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE','AGENT_SERVICE_ACCOUNT'] as const)expect((await call(env,actor(role,role)))?.status).toBe(403);
  expect((await call(env,{...clients[0],clientId:null}))?.status).toBe(403);
  expect((await call(env,clients[0],base+'/'+crypto.randomUUID()))?.status).toBe(404);
  expect(sqlite.prepare('SELECT count(*) n FROM commerce_configurations').get()?.n).toBe(2);
 });
 it('rejects tampered shape, unsafe URLs, invalid JSON and oversized bodies; XSS strings remain data',async()=>{
  const {env,owners}=fixture(),owner=owners[0];
  for(const url of ['http://example.test','javascript:alert(1)',Object.assign(new URL('https://example.test'),{username:'user',password:'pass'}).href,'https://example.test/\nfoo'])expect((await call(env,owner,base,'POST',{configuration:configuration({ctaUrl:url})}))?.status).toBe(400);
  for(const extra of [{status:'PAID'},{amount:1},{owner_user_id:'other'},{clientId:'client-a'},{id:crypto.randomUUID()}])expect((await call(env,owner,base,'POST',{configuration:configuration(),...extra}))?.status).toBe(400);
  for(const extra of [{version:2},{script:'alert(1)'},{features:[]},{features:[{title:'Ok',description:'Ok',html:'bad'}]}])expect((await call(env,owner,base,'POST',{configuration:configuration(extra)}))?.status).toBe(400);
  const xss='<script>alert(1)</script>',response=await call(env,owner,base,'POST',{configuration:configuration({headline:xss})});
  expect(response?.headers.get('content-type')).toContain('application/json');expect((await response?.json()).configuration.headline).toBe(xss);
  for(const body of ['', '{'])await expect(handleCommerceConfigurations(new Request('https://example.test'+base,{method:'POST',body}),env,owner)).rejects.toMatchObject({status:400});
  await expect(handleCommerceConfigurations(new Request('https://example.test'+base,{method:'POST',body:' '.repeat(16385)}),env,owner)).rejects.toMatchObject({status:413});
  expect(await handleCommerceConfigurations(new Request('https://example.test/api/commerce/configurations-other'),env,owner)).toBeNull();
 });
 it('two simultaneous writes read version 1: exactly one wins with a single update audit',async()=>{
  const {env,owners,sqlite,hold}=fixture(),saved=await create(env,owners[0]);let arrivals=0,release:()=>void=()=>{};const gate=new Promise<void>(resolve=>{release=resolve});
  hold(async()=>{arrivals++;if(arrivals===2)release();await gate});
  const results=await Promise.all(['Prima variante','Seconda variante'].map(headline=>call(env,owners[0],base+'/'+saved.id,'PATCH',{expectedVersion:1,configuration:configuration({headline})})));
  expect(results.map(r=>r?.status).sort()).toEqual([200,409]);
  expect(sqlite.prepare('SELECT version FROM commerce_configurations').get()?.version).toBe(2);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='COMMERCE_CONFIGURATION_UPDATED'").get()?.n).toBe(1);
 });
});

// Route reale: handleApi con cookie di sessione, same-origin e rate limit esistenti.
describe('commerce configurations via handleApi',()=>{
 it('anonimo respinto, CLIENT altrui 404, POST e PATCH ok',async()=>{
  const {sqlite,env}=fixture(),t=Date.now();
  sqlite.prepare('INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run('route-client-1','omni101','c1',t,t);
  sqlite.prepare('INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run('route-client-2','omni101','c2',t,t);
  const login=async(name:string,role:string,clientId:string|null=null)=>{sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,client_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,role,clientId,t,t);sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,await digest('tok-'+name),t+3600000,t,t);return '__Host-omni_session=tok-'+name};
  const api={...env,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101'} as Env;
  const req=(cookie:string|null,method='GET',payload?:unknown,path=base)=>handleApi(new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(payload!==undefined?{body:JSON.stringify(payload)}:{})}),api);
  expect([401,403]).toContain((await req(null))?.status);
  expect([401,403]).toContain((await req(null,'POST',{configuration:configuration()}))?.status);
  const one=await login('route-one','CLIENT','route-client-1'),two=await login('route-two','CLIENT','route-client-2'),boss=await login('route-boss','OWNER');
  const created=await req(one,'POST',{configuration:configuration()});
  expect(created?.status).toBe(201);
  const saved=await created!.json() as {id:string;version:number};
  expect((await req(two,'GET',undefined,base+'/'+saved.id))?.status).toBe(404);
  expect((await req(two,'PATCH',{expectedVersion:1,configuration:configuration()},base+'/'+saved.id))?.status).toBe(404);
  const patched=await req(boss,'PATCH',{expectedVersion:1,configuration:configuration({headline:'Titolo da route'})},base+'/'+saved.id);
  expect(patched?.status).toBe(200);
  expect(await patched!.json()).toMatchObject({version:2,configuration:{headline:'Titolo da route'}});
 });
});
