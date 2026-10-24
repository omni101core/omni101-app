import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
afterEach(()=>vi.unstubAllGlobals());

const seedOrg=(sqlite:DatabaseSync,id:string)=>{const t=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run(id,id,id,t,t)};
const json=async(r:Response|null)=>await r?.json() as any;

describe('crm pipeline',()=>{
 const seedLead=(sqlite:DatabaseSync,id='lead-1',status='QUALIFICATION',value:number|null=100000)=>{const t=Date.now();sqlite.prepare('INSERT INTO leads(id,organization_id,name,status,estimated_value_cents,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(id,'omni101','Lead '+id,status,value,t,t)};
 const move=(cookie:string,env:Env,leadId:string,payload:object,kind='leads')=>handleApi(req('/api/crm/'+kind+'/'+leadId+'/move',cookie,'POST',payload),env);

 it('requires a lost reason on the move endpoint and stores it with history and audit',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedLead(sqlite);
  expect((await move(cookie,env,'lead-1',{status:'LOST'}))?.status).toBe(400);
  expect((await move(cookie,env,'lead-1',{status:'LOST',lostReason:'no'}))?.status).toBe(400);
  expect((await move(cookie,env,'lead-1',{status:'NEGOTIATION',lostReason:'non ha senso qui'}))?.status).toBe(400);
  const ok=await move(cookie,env,'lead-1',{status:'LOST',lostReason:'Budget non disponibile'});expect(ok?.status).toBe(200);
  const row=sqlite.prepare('SELECT status,lost_reason,lost_at FROM leads WHERE id=?').get('lead-1') as any;expect(row).toMatchObject({status:'LOST',lost_reason:'Budget non disponibile'});expect(row.lost_at).toBeGreaterThan(0);
  expect(sqlite.prepare("SELECT from_status,to_status,reason,actor_id FROM crm_stage_events WHERE resource_id='lead-1'").all()).toEqual([{from_status:'QUALIFICATION',to_status:'LOST',reason:'Budget non disponibile',actor_id:'owner'}]);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='MOVE' AND resource_id='lead-1'").get()?.n).toBe(1);
  const back=await move(cookie,env,'lead-1',{status:'QUALIFICATION'});expect(back?.status).toBe(200);
  expect(sqlite.prepare('SELECT lost_reason,lost_at FROM leads WHERE id=?').get('lead-1')).toEqual({lost_reason:null,lost_at:null});
 });

 it('refuses an unknown phase, a missing record and a read-only role',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedLead(sqlite);const finance=await owner(sqlite,'omni101','FINANCE','fin');
  expect((await move(cookie,env,'lead-1',{status:'BOH'}))?.status).toBe(400);
  expect((await move(cookie,env,'nope',{status:'WON'}))?.status).toBe(404);
  expect((await move(finance,env,'lead-1',{status:'WON'}))?.status).toBe(403);
  expect(sqlite.prepare('SELECT status FROM leads WHERE id=?').get('lead-1')?.status).toBe('QUALIFICATION');
 });

 it('refuses a CLIENT account on the move, pipeline and history endpoints',async()=>{
  const {sqlite,env}=database(),t=Date.now();seedLead(sqlite);sqlite.prepare("INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES('cliA','omni101','A',?,?)").run(t,t);
  const client=await owner(sqlite,'omni101','CLIENT','cliente');sqlite.prepare("UPDATE memberships SET client_id='cliA' WHERE id='cliente'").run();
  expect((await move(client,env,'lead-1',{status:'WON'}))?.status).toBe(403);
  for(const path of ['/api/crm/pipeline','/api/crm/leads/lead-1/history'])expect((await handleApi(req(path,client),env))?.status).toBe(403);
  expect(sqlite.prepare('SELECT status FROM leads WHERE id=?').get('lead-1')?.status).toBe('QUALIFICATION');
 });
 it('detects a concurrent change with expectedUpdatedAt and writes neither event nor audit',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedLead(sqlite);const at=(sqlite.prepare('SELECT updated_at FROM leads WHERE id=?').get('lead-1') as any).updated_at;
  expect((await move(cookie,env,'lead-1',{status:'DISCOVERY',expectedUpdatedAt:at}))?.status).toBe(200);
  const stale=await move(cookie,env,'lead-1',{status:'WON',expectedUpdatedAt:at});expect(stale?.status).toBe(409);expect((await json(stale)).current.status).toBe('DISCOVERY');
  expect(sqlite.prepare("SELECT count(*) n FROM crm_stage_events WHERE resource_id='lead-1'").get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='MOVE'").get()?.n).toBe(1);
 });

 it('blocks LOST without reason on the generic records API, and the database trigger backs it up',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedLead(sqlite);
  const patch=await handleApi(req('/api/records/leads/lead-1',cookie,'PATCH',{status:'LOST'}),env);expect(patch?.status).toBe(409);
  expect((await handleApi(req('/api/records/leads',cookie,'POST',{name:'Nato perso',status:'LOST'}),env))?.status).toBe(409);
  expect(()=>sqlite.prepare("UPDATE leads SET status='LOST' WHERE id='lead-1'").run()).toThrow(/lost_reason_required/);
  // Altre fasi dall'API generica restano valide e finiscono comunque nello storico (trigger).
  expect((await handleApi(req('/api/records/leads/lead-1',cookie,'PATCH',{status:'PROPOSAL_DRAFT'}),env))?.status).toBe(200);
  expect(sqlite.prepare("SELECT to_status FROM crm_stage_events WHERE resource_id='lead-1'").all()).toEqual([{to_status:'PROPOSAL_DRAFT'}]);
 });

 it('applies the same rules to deals',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);const t=Date.now();sqlite.prepare("INSERT INTO deals(id,organization_id,name,status,value_cents,created_at,updated_at) VALUES('deal-1','omni101','Trattativa','NEGOTIATION',50000,?,?)").run(t,t);
  expect((await move(cookie,env,'deal-1',{status:'LOST'},'deals'))?.status).toBe(400);
  expect((await move(cookie,env,'deal-1',{status:'LOST',lostReason:'Scelto un concorrente'},'deals'))?.status).toBe(200);
  expect(sqlite.prepare("SELECT lost_reason FROM deals WHERE id='deal-1'").get()?.lost_reason).toBe('Scelto un concorrente');
 });

 it('values the pipeline from the linked quote first, then the estimate, weighted by phase',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);const t=Date.now();
  seedLead(sqlite,'with-quote','PROPOSAL_SENT',1);seedLead(sqlite,'estimate-only','QUALIFICATION',50000);seedLead(sqlite,'lost-one','LOST',999);
  sqlite.prepare("INSERT INTO users(id,email,name,created_at,updated_at) VALUES('qu','qu@example.test','qu',?,?)").run(t,t);
  sqlite.prepare("INSERT INTO quotes(id,organization_id,name,amount_cents,status,created_at,updated_at) VALUES('q1','omni101','Preventivo',200000,'IN_REVIEW',?,?)").run(t,t);
  sqlite.prepare("INSERT INTO quotes(id,organization_id,name,amount_cents,status,created_at,updated_at) VALUES('q-rej','omni101','Rifiutato',900000,'REJECTED',?,?)").run(t,t);
  sqlite.prepare("INSERT INTO pricing_versions(id,organization_id,quote_id,version,lead_id,input,calculation,created_by,created_at) VALUES('pv1','omni101','q1',1,'with-quote','{}','{}','qu',?)").run(t);
  sqlite.prepare("INSERT INTO pricing_versions(id,organization_id,quote_id,version,lead_id,input,calculation,created_by,created_at) VALUES('pv2','omni101','q-rej',1,'estimate-only','{}','{}','qu',?)").run(t+1);
  const res=await handleApi(req('/api/crm/pipeline',cookie),env);expect(res?.status).toBe(200);const data=await json(res);
  const byId=Object.fromEntries(data.leads.map((l:any)=>[l.id,l]));
  expect(byId['with-quote']).toMatchObject({valueCents:200000,source:'quote',expectedCents:110000});
  expect(byId['estimate-only']).toMatchObject({valueCents:50000,source:'estimate',expectedCents:10000});
  expect(data.openValueCents).toBe(250000);expect(data.expectedCents).toBe(120000);expect(data.lostCount).toBe(1);
 });

 it('serves history newest first and keeps organizations apart',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedLead(sqlite);
  await move(cookie,env,'lead-1',{status:'DISCOVERY'});await move(cookie,env,'lead-1',{status:'LOST',lostReason:'Progetto rinviato'});
  const items=(await json(await handleApi(req('/api/crm/leads/lead-1/history',cookie),env))).items as any[];
  expect(items.map(i=>i.type)).toEqual(['stage','stage','created']);expect(items[0]).toMatchObject({title:'DISCOVERY → LOST',detail:'Progetto rinviato',actor:'owner'});
  seedOrg(sqlite,'crm-other');const foreign=await owner(sqlite,'crm-other','OWNER','crm-other-owner');
  expect((await handleApi(req('/api/crm/leads/lead-1/history',foreign),{...env,ORGANIZATION_ID:'crm-other'}))?.status).toBe(404);
  expect((await json(await handleApi(req('/api/crm/pipeline',foreign),{...env,ORGANIZATION_ID:'crm-other'}))).leads).toEqual([]);
 });
});
