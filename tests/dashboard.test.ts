import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(origin='https://omni101.app'){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:origin,ORGANIZATION_ID:'omni101',AI_PROVIDER:'nvidia',AI_MODEL:'verified-free-model',AI_API_KEY:'test-only',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0'} as unknown as Env}}
async function person(sqlite:DatabaseSync,name:string,role='OWNER'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,'omni101',name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const call=async(env:Env,cookie:string,method:string,path:string)=>{const r=await handleApi(new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app',Cookie:cookie}}),env);return {status:r!.status,body:await r!.json() as any}};
const card=(body:any,key:string)=>(body.cards as any[]).find(c=>c.key===key);
function seed(sqlite:DatabaseSync){const t=Date.now();const ins=(table:string,cols:string,...v:unknown[])=>sqlite.prepare(`INSERT INTO ${table}(id,organization_id,${cols},created_at,updated_at) VALUES(?,?,${cols.split(',').map(()=>'?').join(',')},?,?)`).run(...[...v.slice(0,1),'omni101',...v.slice(1),t,t] as []);
 ins('leads','name,status','l1','A','NEW');ins('leads','name,status','l2','B','NEW');ins('leads','name,status','l3','C','QUALIFICATION');
 ins('quotes','name,status','q1','Q','IN_REVIEW');ins('quotes','name,status','q2','Q2','DRAFT');
 ins('issues','name,status','i1','T','OPEN');ins('issues','name,status','i2','T2','CLOSED');
 ins('approvals','name,status,resource_type,resource_id','a1','A','PENDING','quotes','q1');
 ins('invoices','name,status,amount_cents','f1','F','PAID',12300);}
describe('dashboard',()=>{
 it('rejects anonymous reads',async()=>{const {env}=database();const res=await handleApi(new Request('https://omni101.app/api/dashboard'),env);expect(res?.status).toBe(401)});
 it('counts real rows and links every number to its list',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');seed(sqlite);
  const {status,body}=await call(env,owner,'GET','/api/dashboard');expect(status).toBe(200);
  expect(card(body,'newLeads')).toMatchObject({value:2,href:'/admin/leads?status=NEW'});
  expect(card(body,'qualifyingLeads').value).toBe(1);
  expect(card(body,'quotesInReview')).toMatchObject({value:1,href:'/admin/proposals?status=IN_REVIEW'});
  expect(card(body,'openIssues')).toMatchObject({value:1,href:'/admin/issues?status=OPEN'});
  expect(card(body,'pendingApprovals').value).toBe(1);
  expect(card(body,'revenueCents').value).toBe(12300);
  for(const c of body.cards)expect(c.href).toMatch(/^\/admin\/[a-z-]+(\?status=[A-Z_]+)?$/);
  expect(body.metrics.newLeads).toBe(2);
 });
 it('hides numbers the role cannot open',async()=>{
  const {sqlite,env}=database();const designer=await person(sqlite,'designer','DESIGNER'),sales=await person(sqlite,'sales','SALES');seed(sqlite);
  const d=(await call(env,designer,'GET','/api/dashboard')).body;
  expect(card(d,'quotesInReview')).toBeUndefined();expect(card(d,'revenueCents')).toBeUndefined();expect(card(d,'openIssues')).toBeDefined();
  const s=(await call(env,sales,'GET','/api/dashboard')).body;
  expect(card(s,'quotesInReview')).toBeDefined();expect(card(s,'revenueCents')).toBeUndefined();expect(card(s,'aiCostCents')).toBeUndefined();
 });
 it('refuses a CLIENT account: the dashboard is staff only',async()=>{
  const {sqlite,env}=database();const t=Date.now();sqlite.prepare("INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES('cliA','omni101','A',?,?)").run(t,t);
  const client=await person(sqlite,'cliente','CLIENT');sqlite.prepare("UPDATE memberships SET client_id='cliA' WHERE id='cliente'").run();
  expect((await call(env,client,'GET','/api/dashboard')).status).toBe(403);
 });
 it('does not count another organization',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');const t=Date.now();
  sqlite.prepare("INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES('altra','Altra','altra',?,?)").run(t,t);
  sqlite.prepare("INSERT INTO leads(id,organization_id,name,status,created_at,updated_at) VALUES('lx','altra','X','NEW',?,?)").run(t,t);
  expect(card((await call(env,owner,'GET','/api/dashboard')).body,'newLeads').value).toBe(0);
 });
});
