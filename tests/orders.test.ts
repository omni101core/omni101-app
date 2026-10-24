import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleProposalStaff,handlePublicProposal} from '../apps/web/app/server/proposals';
import {handleApi} from '../apps/web/app/server/api';
import {digest,HttpError,type Env,type Identity} from '../apps/web/app/server/auth';

const QUOTE='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const BANK='conto-di-prova-1';
function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 const wrap=(sql:string,params:unknown[]=[])=>({sql,params,bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])??null},async all(){return {results:sqlite.prepare(sql).all(...params as [])}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {meta:{changes:Number(out.changes)}}}});
 const env={ORGANIZATION_ID:'org-a',DB:{prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.params as []).changes)}}));sqlite.exec('COMMIT');return out}catch(error){sqlite.exec('ROLLBACK');throw error}}}} as unknown as Env;
 for(const org of ['org-a','org-b'])sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,1,1)').run(org,org,org);
 const actor=(id:string,role:Identity['role'],orgId='org-a'):Identity=>{sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,1,1)').run(id,id+'@example.com',id);return {id,email:id+'@example.com',name:id,role,clientId:null,orgId}};
 actor('author','SALES');
 const quote=(id=QUOTE,status='APPROVED',org='org-a',leadId:string|null=null,approvedTiers=true)=>{
  sqlite.prepare('INSERT INTO quotes(id,organization_id,name,scope,terms,status,pricing_version,created_at,updated_at) VALUES(?,?,?,?,?,?,1,1,1)').run(id,org,'Sito per Trattoria Verde','Sito vetrina in cinque pagine con prenotazioni.','Pagamento anticipato del setup. Canone mensile con durata minima.',status);
  const groups=[{cadence:'ONE_TIME',netCents:200000,directCents:90000,effectiveMarginBp:4000},{cadence:'MONTHLY',netCents:9000,directCents:4000,effectiveMarginBp:5500}];
  sqlite.prepare('INSERT INTO pricing_versions(id,organization_id,quote_id,version,lead_id,input,calculation,created_by,created_at) VALUES(?,?,?,1,?,?,?,?,1)').run('pv-'+id,org,id,leadId,'{}',JSON.stringify({groups}),'author');
  // Tiers ESSENZIALE (v2) and COMPLETA (v3) have their own approved pricing versions; CONSIGLIATA is the quote's own v1.
  for(const [version,setup,monthly] of [[2,100000,5000],[3,300000,15000]] as const){ // approvedTiers=false: versions exist but the review flow has not approved them yet
   const pv='pv'+version+'-'+id;
   sqlite.prepare('INSERT INTO pricing_versions(id,organization_id,quote_id,version,lead_id,input,calculation,created_by,created_at) VALUES(?,?,?,?,NULL,?,?,?,1)').run(pv,org,id,version,'{}',JSON.stringify({groups:[{cadence:'ONE_TIME',netCents:setup},{cadence:'MONTHLY',netCents:monthly}]}),'author');
   if(approvedTiers)sqlite.prepare("INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,version,created_at,updated_at) VALUES(?,?,'Preventivo','APPROVED','quotes',?,1,1,1)").run('pricing:'+pv,org,id);
  }
 };
 const catalog=(version:number,setup:number)=>sqlite.prepare('INSERT INTO pricing_catalog_versions(id,organization_id,version,generated_at,payload,imported_by,created_at) VALUES(?,?,?,?,?,?,1)').run('cat-'+version,'org-a',version,'2026-10-'+version,JSON.stringify({voci:[
  {id:'ess',nome:'Essenziale sintetico',unaTantumCents:setup,mensileCents:5000,tempiGiorni:20,senzaAnticipo:null},
  {id:'con',nome:'Consigliato sintetico',unaTantumCents:setup*2,mensileCents:9000,tempiGiorni:30,senzaAnticipo:{canoneMensileCents:12000,durataMinimaMesi:12,totaleCents:1,nota:''}},
  {id:'com',nome:'Completo sintetico',unaTantumCents:setup*3,mensileCents:15000,tempiGiorni:45,senzaAnticipo:null}]}),'author');
 return {sqlite,env,actor,quote,catalog};
}
const asResponse=async(run:()=>Promise<Response|null>)=>{try{return await run()}catch(error){if(error instanceof HttpError)return new Response(JSON.stringify({error:error.message}),{status:error.status});throw error}};
const staff=(env:Env,actor:Identity,method='GET',body?:unknown,quote=QUOTE,suffix='/share')=>asResponse(()=>handleProposalStaff(new Request('https://omni101.app/api/pricing/'+quote+'/proposal'+(method==='GET'?'':suffix),{method,...(body===undefined?{}:{body:JSON.stringify(body)})}),env,actor));
const pub=(env:Env,token:string,method='GET',body?:unknown,suffix='')=>asResponse(()=>handlePublicProposal(new Request('https://omni101.app/api/proposal/'+token+suffix,{method,headers:{'cf-connecting-ip':'203.0.113.7'},...(body===undefined?{}:{body:JSON.stringify(body)})}),env));
const accept=(env:Env,token:string,extra:Record<string,unknown>={})=>pub(env,token,'POST',{option:'CONSIGLIATA',name:'Mario Rossi',role:'Titolare',email:'mario@example.com',termsAccepted:true,...extra},'/accept');
// Each tier names the catalog voice and its own approved pricing version: ess=v2 100000/5000, con=v1 (quote's own) 200000/9000, com=v3 300000/15000.
const OPTIONS={options:{ESSENZIALE:{voce:'ess',pricingVersion:2},CONSIGLIATA:'con',COMPLETA:{voce:'com',pricingVersion:3}}};
const share=async(env:Env,who:Identity,body:unknown=OPTIONS)=>(await (await staff(env,who,'POST',body))!.json()) as {token:string;path:string;expiresAt:number};
const checkout=(env:Env,token:string,body?:unknown)=>pub(env,token,'POST',body,'/checkout');
type Counts=Record<'orders'|'clients'|'projects'|'contacts'|'audit'|'notes',number>;
const counts=(sqlite:ReturnType<typeof fixture>['sqlite']):Counts=>{const n=(sql:string)=>Number((sqlite.prepare(sql).get() as {n:number}).n);return {orders:n('SELECT count(*) n FROM orders'),clients:n('SELECT count(*) n FROM clients'),projects:n('SELECT count(*) n FROM projects'),contacts:n('SELECT count(*) n FROM contacts'),audit:n("SELECT count(*) n FROM audit_logs WHERE action='ORDER_CREATED_SANDBOX'"),notes:n("SELECT count(*) n FROM notifications WHERE name='Ordine SANDBOX creato'")}};
async function accepted(){const f=fixture();f.quote();f.catalog(1,100000);const made=await share(f.env,f.actor('o','OWNER'));expect((await accept(f.env,made.token))?.status).toBe(201);return {...f,made}}

describe('sandbox checkout',()=>{
 it('refuses a checkout before the proposal is accepted',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);const made=await share(env,actor('o','OWNER'));
  expect((await checkout(env,made.token))?.status).toBe(409);
  expect(counts(sqlite).orders).toBe(0);
 });
 it('creates order, client, project, audit and notification; amount is the approved price, status PENDING_BANK_TRANSFER, no internal ids exposed',async()=>{
  const {env,sqlite,made}=await accepted();
  const response=await checkout(env,made.token);expect(response?.status).toBe(201);
  const body=await response!.json() as {order:Record<string,unknown>};
  expect(body.order).toMatchObject({mode:'SANDBOX',paymentStatus:'PENDING_BANK_TRANSFER',amountCents:200000,currency:'EUR'});
  expect(JSON.stringify(body)).not.toMatch(/client_id|project_id|clientId|projectId/);
  expect(counts(sqlite)).toEqual({orders:1,clients:1,projects:1,contacts:1,audit:1,notes:1});
  const row=sqlite.prepare('SELECT o.client_id,o.project_id,o.amount_cents,p.client_id AS pc,p.visibility,q.client_id AS qc,q.project_id AS qp FROM orders o JOIN projects p ON p.id=o.project_id JOIN quotes q ON q.id=o.quote_id').get() as {client_id:string;project_id:string;amount_cents:number;pc:string;visibility:string;qc:string;qp:string};
  expect(row).toMatchObject({amount_cents:200000,visibility:'CLIENT'});expect(row.pc).toBe(row.client_id);expect(row.qc).toBe(row.client_id);expect(row.qp).toBe(row.project_id);
  expect(sqlite.prepare("SELECT k.email FROM clients c JOIN contacts k ON k.id=c.contact_id").get()).toEqual({email:'mario@example.com'});
 });
 it('is idempotent: double click and parallel calls give one order',async()=>{
  const {env,sqlite,made}=await accepted();
  const [a,b]=await Promise.all([checkout(env,made.token),checkout(env,made.token)]);
  const again=await checkout(env,made.token);
  expect([a!.status,b!.status,again!.status].sort()).toEqual([200,200,201]);
  expect(counts(sqlite)).toEqual({orders:1,clients:1,projects:1,contacts:1,audit:1,notes:1});
  expect((await again!.json() as {order:{reference:string}}).order.reference).toBe((await a!.json() as {order:{reference:string}}).order.reference);
 });
 it('ignores any amount sent by the caller',async()=>{
  const {env,sqlite,made}=await accepted();
  await checkout(env,made.token,{amountCents:1,paymentStatus:'PAID'});
  expect(sqlite.prepare('SELECT amount_cents,payment_status FROM orders').get()).toEqual({amount_cents:200000,payment_status:'PENDING_BANK_TRANSFER'});
 });
 const existingClient=(f:ReturnType<typeof fixture>)=>{
  f.sqlite.prepare("INSERT INTO contacts(id,organization_id,name,email,created_at,updated_at) VALUES('k1','org-a','Mario R.','MARIO@Example.com',1,1)").run();
  f.sqlite.prepare("INSERT INTO clients(id,organization_id,name,contact_id,status,created_at,updated_at) VALUES('c1','org-a','Trattoria Verde','k1','ACTIVE',1,1)").run();
 };
 it('reuses only the quote\'s own client',async()=>{
  const f=fixture();f.quote();f.catalog(1,100000);existingClient(f);
  f.sqlite.prepare("UPDATE quotes SET client_id='c1'").run();
  const made=await share(f.env,f.actor('o','OWNER'));await accept(f.env,made.token);
  expect((await checkout(f.env,made.token))?.status).toBe(201);
  expect(counts(f.sqlite)).toMatchObject({orders:1,clients:1,contacts:1,projects:1});
  expect(f.sqlite.prepare('SELECT client_id FROM orders').get()).toEqual({client_id:'c1'});
  expect(f.sqlite.prepare("SELECT count(*) n FROM tasks WHERE name LIKE 'Verifica cliente%'").get()).toEqual({n:0});
 });
 it('never attaches the order to a client picked by the e-mail typed in the public form',async()=>{
  const f=fixture();f.quote();f.catalog(1,100000);existingClient(f);
  const made=await share(f.env,f.actor('o','OWNER'));await accept(f.env,made.token,{email:'mario@example.com'});
  expect((await checkout(f.env,made.token))?.status).toBe(201);
  expect(counts(f.sqlite)).toMatchObject({orders:1,clients:2,contacts:2,projects:1});
  const order=f.sqlite.prepare('SELECT client_id FROM orders').get() as {client_id:string};
  expect(order.client_id).not.toBe('c1');
  expect(f.sqlite.prepare("SELECT count(*) n FROM projects WHERE client_id='c1'").get()).toEqual({n:0});
  expect(f.sqlite.prepare("SELECT count(*) n FROM tasks WHERE name LIKE 'Verifica cliente%'").get()).toEqual({n:1});
  // contacts.email is unique per organization: the new contact is stored without the taken e-mail and says why.
  const fresh=f.sqlite.prepare("SELECT k.email,k.notes FROM clients c JOIN contacts k ON k.id=c.contact_id WHERE c.id=?").get(order.client_id) as {email:string|null;notes:string};
  expect(fresh.email).toBeNull();expect(fresh.notes).toContain('mario@example.com');
 });
 it('a failing write rolls back everything and leaves no half-created client',async()=>{
  const {env,sqlite,made}=await accepted();
  sqlite.exec("CREATE TRIGGER boom BEFORE INSERT ON audit_logs WHEN NEW.action='ORDER_CREATED_SANDBOX' BEGIN SELECT RAISE(ABORT,'boom'); END");
  expect((await checkout(env,made.token))?.status).toBe(500);
  expect(counts(sqlite)).toMatchObject({orders:0,clients:0,projects:0,contacts:0});
  sqlite.exec('DROP TRIGGER boom');
  expect((await checkout(env,made.token))?.status).toBe(201);
 });
 it('order price and links are frozen, only payment_status moves, no delete',async()=>{
  const {env,sqlite,made}=await accepted();await checkout(env,made.token);
  expect(()=>sqlite.prepare('UPDATE orders SET amount_cents=1').run()).toThrow(/frozen/);
  expect(()=>sqlite.prepare('DELETE FROM orders').run()).toThrow(/append-only/);
  expect(()=>sqlite.prepare("UPDATE orders SET payment_status='REFUNDED'").run()).toThrow();
  sqlite.prepare("UPDATE orders SET payment_status='PAID'").run();
 });
 it('public GET shows the order after checkout; staff read shows it with the quote; other tenant sees none',async()=>{
  const {env,actor,sqlite,made}=await accepted();
  expect((await (await pub(env,made.token))!.json() as {accepted:{order:unknown}}).accepted.order).toBeNull();
  await checkout(env,made.token);
  expect((await (await pub(env,made.token))!.json() as {accepted:{order:{paymentStatus:string}}}).accepted.order.paymentStatus).toBe('PENDING_BANK_TRANSFER');
  const staffView=await (await staff(env,actor('f','FINANCE'),'GET'))!.json() as {order:{payment_status:string}|null};
  expect(staffView.order?.payment_status).toBe('PENDING_BANK_TRANSFER');
  expect((await staff(env,actor('x','FINANCE','org-b'),'GET'))?.status).toBe(404);
  expect(sqlite.prepare("SELECT count(*) n FROM orders WHERE organization_id='org-b'").get()).toEqual({n:0});
 });
 it('GET and other verbs on /checkout are not supported',async()=>{
  const {env,made}=await accepted();
  expect((await pub(env,made.token,'GET',undefined,'/checkout'))?.status).toBe(405);
 });
});
