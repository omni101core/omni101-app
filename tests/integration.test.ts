import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
afterEach(()=>vi.unstubAllGlobals());
describe('persistent business operations',()=>{
 it('persists a real intake atomically, deduplicates and does not invent budget',async()=>{const {sqlite,env}=database();vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'omni101.app',action:'intake'}))));const payload={name:'Example intake',email:'example@example.test',message:'Vorrei un e-commerce con catalogo prodotti e automazioni.',services:['BUILD'],consent:true,turnstileToken:'test-only',budget:'Da definire'};const response=await handleApi(req('/api/intake','','POST',payload),env);expect(response?.status).toBe(201);for(const table of ['contacts','leads','tasks','workflow_executions','audit_logs'])expect(sqlite.prepare('SELECT count(*) n FROM '+table).get()?.n).toBe(1);expect(sqlite.prepare('SELECT estimated_value_cents FROM leads').get()?.estimated_value_cents).toBeNull();const again=await handleApi(req('/api/intake','','POST',payload),env);expect(again?.status).toBe(200);expect(sqlite.prepare('SELECT count(*) n FROM leads').get()?.n).toBe(1)});
 it('rejects invalid anti-bot proof with no business writes',async()=>{const {sqlite,env}=database();vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:false}))));const result=await handleApi(req('/api/intake','','POST',{name:'Test',email:'test@example.test',message:'Una richiesta abbastanza lunga per il test',services:[],consent:true,turnstileToken:'invalid'}),env);expect(result?.status).toBe(400);expect(sqlite.prepare('SELECT count(*) n FROM leads').get()?.n).toBe(0)});
 it('allows both individual Owners to create projects with equal rights',async()=>{const {sqlite,env}=database();const a=await owner(sqlite,'omni101','OWNER','owner-a'),b=await owner(sqlite,'omni101','OWNER','owner-b');for(const [name,cookie]of [['Progetto A',a],['Progetto B',b]]){const res=await handleApi(req('/api/records/projects',cookie,'POST',{name,status:'PLANNING'}),env);expect(res?.status).toBe(201)}expect(sqlite.prepare('SELECT count(*) n FROM projects').get()?.n).toBe(2);expect(sqlite.prepare('SELECT count(DISTINCT user_id) n FROM audit_logs').get()?.n).toBe(2)});
 it('prevents cross-organization foreign keys and reads',async()=>{const {sqlite,env}=database();const t=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('foreign','Other','other',t,t);const cookie=await owner(sqlite);sqlite.prepare('INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run('foreign-client','foreign','Private client',t,t);const invalid=await handleApi(req('/api/records/projects',cookie,'POST',{name:'Bad reference',status:'PLANNING',client_id:'foreign-client'}),env);expect(invalid?.status).toBe(400);const list=await handleApi(req('/api/records/clients',cookie),env);expect(await list?.json()).toEqual({records:[]})});
 it('protects financial writes from developer accounts',async()=>{const {sqlite,env}=database();const cookie=await owner(sqlite,'omni101','DEVELOPER','dev');const res=await handleApi(req('/api/records/expenses',cookie,'POST',{name:'Unauthorized cost',amount_cents:100,status:'RECORDED'}),env);expect(res?.status).toBe(403)});
 it('requires an actual pending approval and records the deciding Owner',async()=>{const {sqlite,env}=database();const cookie=await owner(sqlite);const t=Date.now();sqlite.prepare("INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,version,created_at,updated_at) VALUES('approval','omni101','Review','PENDING','test','deliverable',1,?,?)").run(t,t);const res=await handleApi(req('/api/approvals/approval/decision',cookie,'POST',{decision:'APPROVED',reason:'Evidence inspected'}),env);expect(res?.status).toBe(200);expect(sqlite.prepare("SELECT decided_by FROM approvals WHERE id='approval'").get()?.decided_by).toBe('owner');const repeated=await handleApi(req('/api/approvals/approval/decision',cookie,'POST',{decision:'REJECTED',reason:'Repeated decision'}),env);expect(repeated?.status).toBe(409)});
 it('does not disclose finance or commercial proposals to developer accounts',async()=>{const {sqlite,env}=database();const cookie=await owner(sqlite,'omni101','DEVELOPER','read-dev');for(const resource of ['invoices','contracts','expenses','proposals']){const response=await handleApi(req('/api/records/'+resource,cookie),env);expect(response?.status).toBe(403)}});

 it('revokes an individual collaborator session while retaining the deciding Owner',async()=>{const {sqlite,env}=database();const a=await owner(sqlite,'omni101','OWNER','revoke-owner-a'),b=await owner(sqlite,'omni101','OWNER','revoke-owner-b');const self=await handleApi(req('/api/team/revoke-owner-a/revoke',a,'POST',{reason:'Owner self protection'}),env);expect(self?.status).toBe(409);const response=await handleApi(req('/api/team/revoke-owner-b/revoke',a,'POST',{reason:'Synthetic access revocation verification'}),env);expect(response?.status).toBe(200);expect((await handleApi(req('/api/session',b),env))?.status).toBe(401);expect((await handleApi(req('/api/session',a),env))?.status).toBe(200)});

});

it('persists growth and creative plans, validates scope and protects studio costs',async()=>{
 const {sqlite,env}=database();const cookie=await owner(sqlite);
 for(const [resource,payload] of Object.entries({campaigns:{name:'Launch plan',status:'DRAFT',channel:'EMAIL'},'growth-plans':{name:'SEO plan',status:'BACKLOG',kind:'SEO'},'creative-jobs':{name:'Product film',status:'BRIEF',storyboard:'Opening, product detail, closing'},subscriptions:{name:'Provider register',status:'PLANNED',amount_cents:0,cadence:'MONTHLY'}})){
  const created=await handleApi(req('/api/records/'+resource,cookie,'POST',payload),env);expect(created?.status).toBe(201);
  const listed=await handleApi(req('/api/records/'+resource,cookie),env);expect((await listed?.json() as {records:unknown[]}).records).toHaveLength(1);
 }
 const t=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('other-studio','Other','other-studio',t,t);
 const foreign=await owner(sqlite,'other-studio','OWNER','other-owner');expect((await (await handleApi(req('/api/records/campaigns',foreign),{...env,ORGANIZATION_ID:'other-studio'}))?.json() as {records:unknown[]}).records).toHaveLength(0);
 const dev=await owner(sqlite,'omni101','DEVELOPER','studio-dev');expect((await handleApi(req('/api/records/subscriptions',dev),env))?.status).toBe(403);
 expect((await handleApi(req('/api/records/campaigns',dev,'POST',{name:'Forbidden',status:'DRAFT'}),env))?.status).toBe(403);
 expect((await handleApi(req('/api/records/campaigns',cookie,'POST',{name:'Wrong state',status:'SENT'}),env))?.status).toBe(400);
});

it('serves real operational priorities while withholding finance from developers',async()=>{
 const {sqlite,env}=database(),cookie=await owner(sqlite),dev=await owner(sqlite,'omni101','DEVELOPER','ops-dev'),t=Date.now();
 sqlite.prepare('INSERT INTO tasks(id,organization_id,name,status,priority,due_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('overdue','omni101','Attività scaduta','TODO','HIGH','2000-01-01',t,t);
 sqlite.prepare('INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('notice','omni101','Da leggere','Verifica','UNREAD',t,t);
 const a=await (await handleApi(req('/api/operations',cookie),env))!.json() as any;expect(a.overdueCount).toBe(1);expect(a.priorities[0].id).toBe('overdue');expect(a.finance).not.toBeNull();
 const d=await (await handleApi(req('/api/operations',dev),env))!.json() as any;expect(d.finance).toBeNull();
 expect((await handleApi(req('/api/notifications/notice/read',cookie,'POST',{}),env))?.status).toBe(200);expect(sqlite.prepare('SELECT status FROM notifications WHERE id=?').get('notice')?.status).toBe('READ');
});

describe('marketing safeguards and privacy register',()=>{
 it('retains suppression after withdrawal and a later documented consent, with idempotent evidence',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);const email='test-marketing@example.test';
  const event={email,state:'WITHDRAWN',source:'Internal verified consent reference',policyVersion:'2026-10',requestId:crypto.randomUUID()};
  expect((await handleApi(req('/api/growth/consents',cookie,'POST',event),env))?.status).toBe(201);
  expect((await handleApi(req('/api/growth/consents',cookie,'POST',event),env))?.status).toBe(200);
  expect((await handleApi(req('/api/growth/consents',cookie,'POST',{...event,state:'GRANTED',requestId:crypto.randomUUID()}),env))?.status).toBe(201);
  const res=await handleApi(req('/api/growth/eligibility',cookie,'POST',{email}),env);expect(await res?.json()).toMatchObject({suppressed:true,consent:'GRANTED',canSend:false});
  expect(sqlite.prepare('SELECT count(*) n FROM marketing_consent_records').get()?.n).toBe(2);expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='CONSENT_RECORDED'").get()?.n).toBe(2);
  expect(JSON.stringify(sqlite.prepare('SELECT * FROM marketing_suppressions').all())).not.toContain(email);
  expect((await handleApi(req('/api/growth/consents',cookie,'POST',{...event,source:'Different evidence'}),env))?.status).toBe(409);
 });
 it('limits privacy evidence to administrators and prevents unsupported closure',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),sales=await owner(sqlite,'omni101','SALES','growth-sales');
  expect((await handleApi(req('/api/growth/consents',sales,'POST',{email:'x@example.test',state:'GRANTED',source:'Verified source',policyVersion:'1',requestId:crypto.randomUUID()}),env))?.status).toBe(403);
  expect((await handleApi(req('/api/records/privacy-requests',sales),env))?.status).toBe(403);
  const data={name:'Access request',subject_email:'x@example.test',request_type:'ACCESS',status:'COMPLETED'};
  expect((await handleApi(req('/api/records/privacy-requests',cookie,'POST',data),env))?.status).toBe(400);
  expect((await handleApi(req('/api/records/privacy-requests',cookie,'POST',{...data,description:'Identity and scoped response reviewed by the responsible Owner.'}),env))?.status).toBe(201);
  for(const kind of ['SEM','GEO','LOCAL_SEO','PRIVACY'])expect((await handleApi(req('/api/records/growth-plans',cookie,'POST',{name:kind+' initiative',kind,status:'BACKLOG'}),env))?.status).toBe(201);
 });
});

describe('persistent knowledge and provenance',()=>{
 it('shares attributed versions between Owners, rejects stale saves and preserves source history',async()=>{
  const {sqlite,env}=database(),a=await owner(sqlite,'omni101','OWNER','memory-a'),b=await owner(sqlite,'omni101','OWNER','memory-b');
  const id=crypto.randomUUID(),record={name:'Cinematic mandate',kind:'MANDATE',status:'CAPTURED',body:'Original founder request, preserve this text.',source:'Founder attachment 2026-10-23',acceptance:'',evidence:'',source_id:null,task_id:null};
  const data={id,version:0,record};expect((await handleApi(req('/api/knowledge',a,'POST',data),env))?.status).toBe(201);
  expect((await handleApi(req('/api/knowledge',a,'POST',data),env))?.status).toBe(200);
  const updated={...record,body:'Revised context with a decision.'};expect((await handleApi(req('/api/knowledge/'+id,b,'PATCH',{id,version:1,record:updated}),env))?.status).toBe(200);
  expect((await handleApi(req('/api/knowledge/'+id,a,'PATCH',{id,version:1,record}),env))?.status).toBe(409);
  const response=await handleApi(req('/api/knowledge/'+id,a),env),detail=await response?.json() as {record:{version:number;updated_by:string};revisions:{snapshot:string;author_id:string}[]};
  expect(detail.record).toMatchObject({version:2,updated_by:'memory-b'});expect(detail.revisions).toHaveLength(2);expect(detail.revisions[1].snapshot).toContain(record.body);expect(detail.revisions[1].author_id).toBe('memory-a');
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='KNOWLEDGE_SAVED'").get()?.n).toBe(2);
  const search=await handleApi(req('/api/knowledge?q=revised&kind=MANDATE',a),env);expect((await search?.json() as {records:unknown[]}).records).toHaveLength(1);
 });
 it('isolates tenants, excludes clients and requires proof for VERIFIED',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),client=await owner(sqlite,'omni101','CLIENT','memory-client');
  expect((await handleApi(req('/api/knowledge',client),env))?.status).toBe(403);
  const stamp=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('memory-other','Other','memory-other',stamp,stamp);const foreign=await owner(sqlite,'memory-other','OWNER','foreign-memory');
  const id=crypto.randomUUID(),record={name:'Requirement',kind:'REQUIREMENT',status:'VERIFIED',body:'A real requirement',source:'Founder request',acceptance:'Pass a test',evidence:'',source_id:null,task_id:null};
  expect((await handleApi(req('/api/knowledge',cookie,'POST',{id,version:0,record}),env))?.status).toBe(400);
  expect((await handleApi(req('/api/knowledge',cookie,'POST',{id,version:0,record:{...record,status:'PLANNED'}}),env))?.status).toBe(201);
  expect((await handleApi(req('/api/knowledge/'+id,foreign),env))?.status).toBe(404);
  expect((await handleApi(req('/api/knowledge',foreign,'POST',{id:crypto.randomUUID(),version:0,record:{...record,status:'CAPTURED',source_id:id}}),env))?.status).toBe(400);
  expect((await handleApi(req('/api/knowledge',cookie,'POST',{id:crypto.randomUUID(),version:0,record:{...record,status:'CAPTURED',task_id:'missing-task'}}),env))?.status).toBe(400);
 });
});
