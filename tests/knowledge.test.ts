import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
const migrations=readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort();
function database(upTo?:string){const sqlite=new DatabaseSync(':memory:');for(const f of migrations){if(upTo&&f>=upTo)break;sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'))}const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function member(sqlite:DatabaseSync,role:string,name:string,org='omni101'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
const MARKER='PRIVATE_ORIGINAL_MARKER_7f3c';
// Simulates the importer: plain INSERT without access_scope, so the migration trigger must classify it. Ids are UUID-shaped like the importer's uid(), because the API validates z.uuid().
function seedPrivate(sqlite:DatabaseSync,id:string=crypto.randomUUID()){const t=Date.now(),body='Mandato privato sintetico '+MARKER;sqlite.prepare('INSERT INTO knowledge_records(id,organization_id,name,kind,status,body,source,created_by,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(id,'omni101','Private synthetic','MANDATE','CAPTURED',body,'Private founder original · art_test · sha256:abc','system:founder-mandate-import','system:founder-mandate-import',t,t);sqlite.prepare('INSERT INTO knowledge_revisions(id,organization_id,record_id,version,snapshot,author_id,created_at) VALUES(?,?,?,?,?,?,?)').run(id+':v1','omni101',id,1,JSON.stringify({body,source:'Private founder original · art_test'}),'system:founder-mandate-import',t);return id}
const team={name:'Derived requirement',kind:'REQUIREMENT',status:'CAPTURED',body:'Team-visible requirement derived from a private mandate.',source:'Private founder mandate · art_test',acceptance:'',evidence:'',source_id:null,task_id:null};
const ids=async(res:Response|null)=>((await res?.json()) as {records:{id:string}[]}).records.map(r=>r.id);

describe('knowledge access scope for private founder originals',()=>{
 it('backfills existing private originals and classifies new imports through the trigger',async()=>{
  const {sqlite}=database('0015');const t=Date.now();
  sqlite.prepare('INSERT INTO knowledge_records(id,organization_id,name,kind,status,body,source,created_by,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run('old-private','omni101','Old','MANDATE','CAPTURED','x','Private founder original · art_old','s','s',t,t);
  sqlite.prepare('INSERT INTO knowledge_records(id,organization_id,name,kind,status,body,source,created_by,updated_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run('old-team','omni101','Team','REQUIREMENT','CAPTURED','x','Private founder mandate · art_old','s','s',t,t);
  sqlite.exec(readFileSync('packages/db/migrations/0015_knowledge_access.sql','utf8'));
  const scope=(id:string)=>sqlite.prepare('SELECT access_scope FROM knowledge_records WHERE id=?').get(id)?.access_scope;
  expect(scope('old-private')).toBe('OWNER_ADMIN');expect(scope('old-team')).toBe('TEAM_INTERNAL');
  expect(scope(seedPrivate(sqlite,'new-private'))).toBe('OWNER_ADMIN');
  expect(()=>sqlite.prepare("UPDATE knowledge_records SET access_scope='PUBLIC' WHERE id='old-team'").run()).toThrow();
 });

 it('lets both Owners and Admin read private originals; every other role and other tenants are denied',async()=>{
  const {sqlite,env}=database(),id=seedPrivate(sqlite);
  const stamp=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('scope-other','Other','scope-other',stamp,stamp);
  const allowed=[await member(sqlite,'OWNER','owner-a'),await member(sqlite,'OWNER','owner-b'),await member(sqlite,'ADMIN','admin')];
  const denied=await Promise.all(['DEVELOPER','DESIGNER','SALES','PROJECT_MANAGER','FINANCE'].map(r=>member(sqlite,r,'role-'+r.toLowerCase())));
  for(const c of allowed){
   expect(await ids(await handleApi(req('/api/knowledge',c),env))).toContain(id);
   expect(await ids(await handleApi(req('/api/knowledge?q='+MARKER,c),env))).toEqual([id]);
   const detail=await handleApi(req('/api/knowledge/'+id+'?version=1',c),env);expect(detail?.status).toBe(200);expect(await detail?.text()).toContain(MARKER);
  }
  for(const c of denied){
   const list=await handleApi(req('/api/knowledge',c),env),text=await list?.clone().text();expect(list?.status).toBe(200);expect(await ids(list)).not.toContain(id);expect(text).not.toContain(MARKER);
   expect(await ids(await handleApi(req('/api/knowledge?q='+MARKER,c),env))).toEqual([]);
   expect(await ids(await handleApi(req('/api/knowledge?kind=MANDATE',c),env))).not.toContain(id);
   expect((await handleApi(req('/api/knowledge/'+id,c),env))?.status).toBe(404);
   expect((await handleApi(req('/api/knowledge/'+id+'?version=1',c),env))?.status).toBe(404);
  }
  expect((await handleApi(req('/api/knowledge',await member(sqlite,'CLIENT','scope-client')),env))?.status).toBe(403);
  const foreign=await member(sqlite,'OWNER','foreign-owner','scope-other'),foreignEnv={...env,ORGANIZATION_ID:'scope-other'};
  expect((await handleApi(req('/api/knowledge/'+id,foreign),foreignEnv))?.status).toBe(404);
  expect(await ids(await handleApi(req('/api/knowledge?q='+MARKER,foreign),foreignEnv))).toEqual([]);
 });

 it('keeps OWNER_ADMIN on legacy saves and blocks creation, declassification or source-linking by other roles',async()=>{
  const {sqlite,env}=database(),id=seedPrivate(sqlite),owner=await member(sqlite,'OWNER','owner'),dev=await member(sqlite,'DEVELOPER','dev');
  const scope=()=>sqlite.prepare('SELECT access_scope,version FROM knowledge_records WHERE id=?').get(id) as {access_scope:string;version:number};
  const legacy={name:'Private synthetic',kind:'MANDATE',status:'CAPTURED',body:'Owner edit '+MARKER,source:'Private founder original · art_test · sha256:abc',acceptance:'',evidence:'',source_id:null,task_id:null};
  expect((await handleApi(req('/api/knowledge/'+id,owner,'PATCH',{id,version:1,record:legacy}),env))?.status).toBe(200);
  expect(scope()).toEqual({access_scope:'OWNER_ADMIN',version:2});
  expect(sqlite.prepare('SELECT snapshot FROM knowledge_revisions WHERE record_id=? AND version=1').get(id)?.snapshot).toContain('Mandato privato sintetico');
  expect((await handleApi(req('/api/knowledge/'+id,dev,'PATCH',{id,version:2,record:{...legacy,access_scope:'TEAM_INTERNAL'}}),env))?.status).toBe(404);
  expect((await handleApi(req('/api/knowledge',dev,'POST',{id,version:0,record:{...legacy,source:'Team note',access_scope:'TEAM_INTERNAL'}}),env))?.status).toBe(409);
  expect(scope()).toEqual({access_scope:'OWNER_ADMIN',version:2});
  expect((await handleApi(req('/api/knowledge',dev,'POST',{id:crypto.randomUUID(),version:0,record:{...team,access_scope:'OWNER_ADMIN'}}),env))?.status).toBe(403);
  expect((await handleApi(req('/api/knowledge',dev,'POST',{id:crypto.randomUUID(),version:0,record:{...legacy,body:'Fake original'}}),env))?.status).toBe(403);
  expect((await handleApi(req('/api/knowledge',dev,'POST',{id:crypto.randomUUID(),version:0,record:{...team,source_id:id}}),env))?.status).toBe(400);
  const derived=crypto.randomUUID();expect((await handleApi(req('/api/knowledge',owner,'POST',{id:derived,version:0,record:{...team,source_id:id}}),env))?.status).toBe(201);
  const shared=await handleApi(req('/api/knowledge/'+derived,dev),env);expect(shared?.status).toBe(200);expect(await shared?.text()).not.toContain(MARKER);
  expect((await handleApi(req('/api/knowledge/'+derived,dev,'PATCH',{id:derived,version:1,record:{...team,source_id:id,body:'Dev edit of team requirement.'}}),env))?.status).toBe(200);
  expect(sqlite.prepare('SELECT access_scope FROM knowledge_records WHERE id=?').get(derived)?.access_scope).toBe('TEAM_INTERNAL');
 });
});
