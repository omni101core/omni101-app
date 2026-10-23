import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
afterEach(()=>vi.unstubAllGlobals());
const estimateInput={name:'SYNTHETIC scoped proposal',leadId:null as string|null,clientId:null as string|null,currency:'EUR',scope:'Website and delivery scope documented by the sales team.',terms:'Payment terms require commercial review.',assumptions:'Costs entered by a human, not an approved default rate card.',lines:[{name:'Delivery work',category:'LABOR',cadence:'ONE_TIME',unit:'hours',quantityMilli:10000,unitCostCents:5000},{name:'Support',category:'LABOR',cadence:'MONTHLY',unit:'hours',quantityMilli:1000,unitCostCents:5000}],overheadBp:1000,contingencyBp:1000,marginBp:5000,discountBp:0,taxBp:null,taxNote:''};

describe('commercial chain: landing to client portal',()=>{
 it('walks intake, pipeline, pricing, second-Owner approval, project and portal isolation',async()=>{
  const {sqlite,env}=database(),a=await owner(sqlite,'omni101','OWNER','chain-owner-a'),b=await owner(sqlite,'omni101','OWNER','chain-owner-b'),t=Date.now();
  for(const [id,name]of [['chain-client-1','Synthetic client one'],['chain-client-2','Synthetic client two']])sqlite.prepare('INSERT INTO clients(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(id,'omni101',name,t,t);
  const c1=await owner(sqlite,'omni101','CLIENT','chain-portal-1'),c2=await owner(sqlite,'omni101','CLIENT','chain-portal-2');
  sqlite.prepare('UPDATE memberships SET client_id=? WHERE user_id=?').run('chain-client-1','chain-portal-1');sqlite.prepare('UPDATE memberships SET client_id=? WHERE user_id=?').run('chain-client-2','chain-portal-2');
  // 1. landing -> lead CRM
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'omni101.app',action:'intake'}))));
  const intake=await handleApi(req('/api/intake','','POST',{name:'Synthetic chain lead',email:'chain-lead@example.test',message:'Vorrei un sito con catalogo e automazioni per lo studio.',services:['BUILD'],consent:true,turnstileToken:'test-only',budget:'Da definire'}),env);
  expect(intake?.status).toBe(201);expect(sqlite.prepare('SELECT count(*) n FROM leads').get()?.n).toBe(1);
  const leadId=String(sqlite.prepare('SELECT id FROM leads').get()?.id);
  // 2. pipeline Kanban + 3. qualification state, moved by Owner A
  for(const status of ['QUALIFICATION','PROPOSAL_DRAFT']){expect((await handleApi(req('/api/records/leads/'+leadId,a,'PATCH',{status}),env))?.status).toBe(200);expect(sqlite.prepare('SELECT status FROM leads WHERE id=?').get(leadId)?.status).toBe(status);}
  // 4. computed proposal, linked to lead and first client
  const quoteId=crypto.randomUUID();
  const saved=await handleApi(req('/api/pricing',a,'POST',{quoteId,requestId:crypto.randomUUID(),version:0,input:{...estimateInput,leadId,clientId:'chain-client-1'}}),env);expect(saved?.status).toBe(201);
  expect(sqlite.prepare('SELECT amount_cents FROM quotes WHERE id=?').get(quoteId)?.amount_cents).toBe(121000);
  // 5. review by Owner A, 6. decision by second Owner B
  const review=await handleApi(req('/api/pricing/'+quoteId+'/review',a,'POST',{version:1}),env);expect(review?.status).toBe(201);const approvalId=(await review?.json() as any).approval.id;
  expect((await (await handleApi(req('/api/portal',c1),env))?.json() as any).proposals).toHaveLength(0);
  expect((await handleApi(req('/api/approvals/'+encodeURIComponent(approvalId)+'/decision',b,'POST',{decision:'APPROVED',reason:'Second Owner inspected synthetic scope and price.'}),env))?.status).toBe(200);
  expect(sqlite.prepare('SELECT status FROM quotes WHERE id=?').get(quoteId)?.status).toBe('APPROVED');
  expect(sqlite.prepare("SELECT decided_by FROM approvals WHERE id=?").get(approvalId)?.decided_by).toBe('chain-owner-b');
  // 7. acceptance -> project
  const converted=await handleApi(req('/api/lead-to-project',b,'POST',{leadId,approvalId,dealWon:true,name:'Chain project'}),env);expect(converted?.status).toBe(201);
  expect(sqlite.prepare('SELECT quote_id FROM lead_project_links WHERE lead_id=?').get(leadId)?.quote_id).toBe(quoteId);
  // 8. portal: setup shares project with client one (raw SQL, as in existing fixtures); client two sees nothing
  sqlite.prepare("UPDATE projects SET client_id='chain-client-1',visibility='CLIENT' WHERE name='Chain project'").run();
  const one=await (await handleApi(req('/api/portal',c1),env))?.json() as any;
  expect(one.proposals.map((q:any)=>q.id)).toEqual([quoteId]);expect(JSON.stringify(one.projects)).toContain('Chain project');
  const two=await handleApi(req('/api/portal',c2),env);expect(two?.status).toBe(200);const other=await two?.json() as any;
  expect(other.proposals).toHaveLength(0);expect(JSON.stringify(other)).not.toContain('Chain project');
 });
 it.todo('lead conserva attribuzione osservata');
 it.todo('qualifica registra criteri e motivo, non solo lo stato');
 it.todo('accettazione cliente della proposta dal portale');
});
