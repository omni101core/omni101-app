import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleProposalStaff,handlePublicProposal} from '../apps/web/app/server/proposals';
import {handleApi,decision,records} from '../apps/web/app/server/api';
import {handlePricing} from '../apps/web/app/server/pricing';
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

describe('proposal share and acceptance',()=>{
 it('roles and tenant: only OWNER/ADMIN/SALES share, readers see, other org gets 404',async()=>{
  const {env,actor,quote,catalog}=fixture();quote();catalog(1,100000);quote(OTHER,'APPROVED','org-b');
  for(const role of ['PROJECT_MANAGER','FINANCE','DEVELOPER','CLIENT'] as const)expect((await staff(env,actor('w-'+role,role),'POST',OPTIONS))?.status).toBe(403);
  expect((await staff(env,actor('c','CLIENT'),'GET'))?.status).toBe(403);
  expect((await staff(env,actor('f','FINANCE'),'GET'))?.status).toBe(200);
  expect((await staff(env,actor('x','OWNER','org-b'),'POST',OPTIONS))?.status).toBe(404);
  expect((await staff(env,actor('s','SALES'),'POST',OPTIONS,OTHER))?.status).toBe(404);
  expect((await staff(env,actor('s2','SALES'),'POST',OPTIONS))?.status).toBe(201);
 });
 it('only an APPROVED quote is shared; unknown catalog voice or option is refused',async()=>{
  const draft=fixture();draft.quote(QUOTE,'DRAFT');draft.catalog(1,100000);
  expect((await staff(draft.env,draft.actor('o','OWNER'),'POST',OPTIONS))?.status).toBe(409);
  const ok=fixture();ok.quote();ok.catalog(1,100000);
  expect((await staff(ok.env,ok.actor('o','OWNER'),'POST',{options:{CONSIGLIATA:'nope'}}))?.status).toBe(400);
  expect((await staff(ok.env,ok.actor('o2','OWNER'),'POST',{options:{BOGUS:'ess'}}))?.status).toBe(400);
  expect(ok.sqlite.prepare('SELECT count(*) n FROM proposal_shares').get()?.n).toBe(0);
 });
 it('public view: only the hash is stored, 30 days, no costs or margins, lead language, three options, no-referrer',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();
  sqlite.prepare("INSERT INTO leads(id,organization_id,name,message,status,language,created_at,updated_at) VALUES('lead-en','org-a','Jane','Language: English\nMore bookings','NEW','en',1,1)").run();
  quote(QUOTE,'APPROVED','org-a','lead-en');catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  const row=sqlite.prepare('SELECT token_hash,expires_at,created_at,language FROM proposal_shares').get() as {token_hash:string;expires_at:number;created_at:number;language:string};
  expect(row.token_hash).toBe(await digest(made.token));expect(JSON.stringify(row)).not.toContain(made.token);
  expect(row.expires_at-row.created_at).toBe(30*24*3600*1000);expect(row.language).toBe('en');
  const response=await pub(env,made.token);expect(response?.status).toBe(200);
  const text=await response!.text();expect(text).not.toMatch(/directCents|effectiveMarginBp|margin|unitCostCents|lead-en|Jane/i);
  const view=JSON.parse(text) as {language:string;proposal:{options:{tier:string;setupCents:number;minMonths:number|null}[];scope:string;terms:string};accepted:null};
  expect(view.language).toBe('en');expect(view.accepted).toBeNull();
  expect(view.proposal.options.map(o=>o.tier)).toEqual(['ESSENZIALE','CONSIGLIATA','COMPLETA']);
  expect(view.proposal.options.map(o=>o.setupCents)).toEqual([100000,200000,300000]);expect(view.proposal.options[1].minMonths).toBe(12);
  expect(view.proposal.scope).toContain('cinque pagine');expect(view.proposal.terms).toContain('Pagamento');
  expect(response!.headers.get('x-robots-tag')).toMatch(/noindex/);expect(response!.headers.get('referrer-policy')).toBe('no-referrer');
 });
 it('without chosen voices the approved version itself is the single option',async()=>{
  const {env,actor,quote}=fixture();quote();
  const made=await share(env,actor('o','OWNER'),{});
  const view=await (await pub(env,made.token))!.json() as {language:string;proposal:{options:{tier:string;name:string;setupCents:number;monthlyCents:number}[]}};
  expect(view.language).toBe('it');expect(view.proposal.options).toEqual([expect.objectContaining({tier:'CONSIGLIATA',name:'Sito per Trattoria Verde',setupCents:200000,monthlyCents:9000})]);
 });
 it('expired, revoked, replaced and unknown tokens answer 404',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);const owner=actor('o','OWNER');
  const first=await share(env,owner);const second=await share(env,owner);
  expect((await pub(env,first.token))?.status).toBe(404);expect((await accept(env,first.token))?.status).toBe(404);
  expect((await pub(env,second.token))?.status).toBe(200);
  expect((await pub(env,crypto.randomUUID()))?.status).toBe(404);expect((await pub(env,'not-a-token'))?.status).toBe(404);
  sqlite.prepare('UPDATE proposal_shares SET expires_at=1 WHERE revoked_at IS NULL').run();
  expect((await pub(env,second.token))?.status).toBe(404);expect((await accept(env,second.token))?.status).toBe(404);
  const third=await share(env,owner);expect((await pub(env,third.token))?.status).toBe(200);
  expect((await staff(env,owner,'DELETE'))?.status).toBe(200);
  expect((await pub(env,third.token))?.status).toBe(404);expect((await accept(env,third.token))?.status).toBe(404);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='PROPOSAL_REVOKED'").get()?.n).toBe(1);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
 });
 it('acceptance: ACCEPTED, task, notification, audit, hashed IP, bank details from settings, immutable',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  sqlite.prepare("INSERT INTO settings(id,organization_id,name,value,created_at,updated_at) VALUES('s1','org-a','payment_iban',?,1,1),('s2','org-a','payment_account_holder','Studio di prova',1,1)").run(BANK);
  const made=await share(env,actor('o','OWNER'));
  const response=await accept(env,made.token);expect(response?.status).toBe(201);
  const out=await response!.json() as {option:{tier:string;setupCents:number};payment:{iban:string;accountHolder:string;reference:string;amountCents:number}};
  expect(out.option).toMatchObject({tier:'CONSIGLIATA',setupCents:200000});expect(out.payment).toMatchObject({iban:BANK,accountHolder:'Studio di prova',amountCents:200000});expect(out.payment.reference).toMatch(/^PROP-[0-9A-F]{8}$/);
  expect(sqlite.prepare('SELECT status FROM quotes WHERE id=?').get(QUOTE)?.status).toBe('ACCEPTED');
  const acc=sqlite.prepare('SELECT * FROM proposal_acceptances').get() as Record<string,unknown>;
  expect(acc).toMatchObject({quote_id:QUOTE,pricing_version:1,option_tier:'CONSIGLIATA',signer_name:'Mario Rossi',signer_role:'Titolare',signer_email:'mario@example.com',terms_accepted:1});
  expect(acc.ip_hash).toBe(await digest('org-a:203.0.113.7'));expect(JSON.stringify(acc)).not.toContain('203.0.113.7');expect(typeof acc.accepted_at).toBe('number');
  expect(sqlite.prepare("SELECT count(*) n FROM tasks WHERE name LIKE 'Avvio progetto%'").get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT status FROM notifications WHERE name='Proposta accettata'").get()?.status).toBe('UNREAD');
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='PROPOSAL_ACCEPTED' AND resource_id=?").get(QUOTE)?.n).toBe(1);
  const view=await (await pub(env,made.token))!.json() as {accepted:{payment:{iban:string}}};expect(view.accepted.payment.iban).toBe(BANK);
  expect(()=>sqlite.prepare("UPDATE proposal_acceptances SET signer_name='x'").run()).toThrow(/append-only/);
  expect(()=>sqlite.prepare('DELETE FROM proposal_acceptances').run()).toThrow(/append-only/);
  const seen=await (await staff(env,actor('f','FINANCE'),'GET'))!.json() as {status:string;acceptance:{name:string;option:{tier:string}}};
  expect(seen.status).toBe('ACCEPTED');expect(seen.acceptance).toMatchObject({name:'Mario Rossi',option:{tier:'CONSIGLIATA'}});
  expect((await staff(env,actor('o2','OWNER'),'POST',OPTIONS))?.status).toBe(409);
 });
 it('without bank details in settings the customer is told we write back (nothing invented)',async()=>{
  const {env,actor,quote,catalog}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  const out=await (await accept(env,made.token))!.json() as {payment:{iban:string|null;accountHolder:string|null}};
  expect(out.payment).toMatchObject({iban:null,accountHolder:null});
 });
 it('double acceptance answers 409 and changes nothing; price snapshot stays after the catalog moves on',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  catalog(2,999900);
  const before=await (await pub(env,made.token))!.json() as {proposal:{options:{setupCents:number}[]}};expect(before.proposal.options.map(o=>o.setupCents)).toEqual([100000,200000,300000]);
  expect((await accept(env,made.token))?.status).toBe(201);
  const snapshot=sqlite.prepare('SELECT option_snapshot,proposal_snapshot FROM proposal_acceptances').get() as {option_snapshot:string;proposal_snapshot:string};
  expect((await accept(env,made.token,{option:'COMPLETA'}))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM tasks WHERE name LIKE 'Avvio progetto%'").get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM notifications WHERE name='Proposta accettata'").get()?.n).toBe(1);
  expect(sqlite.prepare('SELECT option_snapshot,proposal_snapshot FROM proposal_acceptances').get()).toEqual(snapshot);
  expect(JSON.parse(snapshot.option_snapshot)).toMatchObject({tier:'CONSIGLIATA',setupCents:200000});
  expect(JSON.parse(snapshot.proposal_snapshot).options.map((o:{setupCents:number})=>o.setupCents)).toEqual([100000,200000,300000]);
 });
 it('invalid acceptance input: 400 and nothing recorded',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'),{options:{CONSIGLIATA:'con'}});
  for(const extra of [{termsAccepted:false},{termsAccepted:undefined},{email:'non-email'},{name:''},{role:'x'},{option:'COMPLETA'},{option:'ALTRA'},{extra:1}])expect((await accept(env,made.token,extra))?.status).toBe(400);
  expect(sqlite.prepare('SELECT status FROM quotes WHERE id=?').get(QUOTE)?.status).toBe('APPROVED');
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
  expect((await pub(env,made.token,'GET',undefined,'/accept'))?.status).toBe(405);
 });
 it('a quote no longer APPROVED cannot be accepted through an older link',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  sqlite.prepare("UPDATE quotes SET status='REJECTED' WHERE id=?").run(QUOTE);
  expect((await accept(env,made.token))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
  expect(sqlite.prepare("SELECT count(*) n FROM tasks WHERE name LIKE 'Avvio progetto%'").get()?.n).toBe(0);
 });
 it('listino options must equal the approved version: other amounts 409, nothing shared',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  expect((await staff(env,actor('o','OWNER'),'POST',{options:{ESSENZIALE:'ess'}}))?.status).toBe(409);
  expect((await staff(env,actor('o2','OWNER'),'POST',{options:{CONSIGLIATA:'con',COMPLETA:'com'}}))?.status).toBe(409);
  expect((await staff(env,actor('o4','OWNER'),'POST',{options:{ESSENZIALE:{voce:'ess',pricingVersion:99}}}))?.status).toBe(409);
  expect((await staff(env,actor('o5','OWNER'),'POST',{options:{ESSENZIALE:{voce:'com',pricingVersion:2}}}))?.status).toBe(409);
  sqlite.prepare("UPDATE approvals SET status='PENDING' WHERE id LIKE 'pricing:pv2-%'").run();
  expect((await staff(env,actor('o6','OWNER'),'POST',OPTIONS))?.status).toBe(409);
  sqlite.prepare("UPDATE approvals SET status='APPROVED' WHERE id LIKE 'pricing:pv2-%'").run();
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_shares').get()?.n).toBe(0);
  expect((await staff(env,actor('o3','OWNER'),'POST',OPTIONS))?.status).toBe(201);
 });
 it('approved ANNUAL or USAGE amounts are refused, never silently dropped',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  for(const cadence of ['ANNUAL','USAGE']){
   const groups=[{cadence:'ONE_TIME',netCents:200000},{cadence:'MONTHLY',netCents:9000},{cadence,netCents:50000}];
   sqlite.prepare('UPDATE pricing_versions SET calculation=? WHERE quote_id=? AND version=1').run(JSON.stringify({groups}),QUOTE);
   for(const body of [{},OPTIONS])expect((await staff(env,actor('o-'+cadence,'OWNER'),'POST',body))?.status).toBe(400);
  }
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_shares').get()?.n).toBe(0);
 });
 it('three tiers: tampered COMPLETA is 409 and records nothing; correct ESSENZIALE is 201 with its own snapshot',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  const stored=sqlite.prepare('SELECT snapshot FROM proposal_shares').get() as {snapshot:string};
  const tampered=JSON.parse(stored.snapshot) as {options:{tier:string;setupCents:number}[]};
  tampered.options.find(o=>o.tier==='COMPLETA')!.setupCents=1;
  sqlite.prepare('UPDATE proposal_shares SET snapshot=?').run(JSON.stringify(tampered));
  expect((await accept(env,made.token,{option:'COMPLETA'}))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
  expect(sqlite.prepare('SELECT status FROM quotes WHERE id=?').get(QUOTE)?.status).toBe('APPROVED');
  const ok=await accept(env,made.token,{option:'ESSENZIALE'});expect(ok?.status).toBe(201);
  const out=await ok!.json() as {option:Record<string,unknown>;payment:{amountCents:number}};
  expect(out.option).toMatchObject({tier:'ESSENZIALE',pricingVersion:2,currency:'EUR',setupCents:100000,monthlyCents:5000});expect(out.payment.amountCents).toBe(100000);
  expect(sqlite.prepare('SELECT option_tier,pricing_version FROM proposal_acceptances').get()).toMatchObject({option_tier:'ESSENZIALE',pricing_version:1});
 });
 it('a tier whose pricing version loses its approval cannot be accepted; the others still can',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  sqlite.prepare("UPDATE approvals SET status='REJECTED' WHERE id LIKE 'pricing:pv2-%'").run();
  expect((await accept(env,made.token,{option:'ESSENZIALE'}))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
  expect((await accept(env,made.token))?.status).toBe(201);
 });
 it('revoke after acceptance answers 409 and the customer keeps the summary; revoke before still works',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);const owner=actor('o','OWNER');
  sqlite.prepare("INSERT INTO settings(id,organization_id,name,value,created_at,updated_at) VALUES('s1','org-a','payment_iban',?,1,1)").run(BANK);
  const made=await share(env,owner);expect((await accept(env,made.token))?.status).toBe(201);
  expect((await staff(env,owner,'DELETE'))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_shares WHERE revoked_at IS NOT NULL').get()?.n).toBe(0);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='PROPOSAL_REVOKED'").get()?.n).toBe(0);
  const view=await (await pub(env,made.token))!.json() as {accepted:{payment:{iban:string}}};expect(view.accepted.payment.iban).toBe(BANK);
 });
 it('a transient DB failure on accept is 503 and retryable; a stored acceptance is 409',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote();catalog(1,100000);
  const made=await share(env,actor('o','OWNER'));
  const real=env.DB.batch.bind(env.DB);let fail=true;
  (env.DB as unknown as {batch:unknown}).batch=async(statements:never[])=>{if(fail)throw new Error('D1 transient');return real(statements)};
  const down=await accept(env,made.token);expect(down?.status).toBe(503);expect(down!.headers.get('retry-after')).toBeTruthy();
  expect(sqlite.prepare('SELECT count(*) n FROM proposal_acceptances').get()?.n).toBe(0);
  fail=false;expect((await accept(env,made.token))?.status).toBe(201);
  fail=true;expect((await accept(env,made.token))?.status).toBe(409);
 });
 const review=(env:Env,who:Identity,body:unknown)=>asResponse(()=>handlePricing(new Request('https://omni101.app/api/pricing/'+QUOTE+'/review',{method:'POST',body:JSON.stringify(body)}),env,who));
 const decide=(env:Env,who:Identity,approvalId:string)=>asResponse(()=>decision(new Request('https://omni101.app/api/approvals/'+approvalId+'/decision',{method:'POST',body:JSON.stringify({decision:'APPROVED',reason:'Prezzi verificati'})}),env,who));
 it('one review request approves all three tiers together, then a 3-tier share is 201; roles are enforced',async()=>{
  const {env,actor,quote,catalog,sqlite}=fixture();quote(QUOTE,'DRAFT','org-a',null,false);catalog(1,100000);
  const sales=actor('req','SALES'),owner=actor('own','OWNER');
  expect((await review(env,actor('dev','DEVELOPER'),{version:1}))?.status).toBe(403);
  expect((await review(env,sales,{version:1,tierVersions:{ESSENZIALE:1}}))?.status).toBe(400);
  expect((await review(env,sales,{version:1,tierVersions:{ESSENZIALE:9}}))?.status).toBe(409);
  expect(sqlite.prepare('SELECT count(*) n FROM approvals').get()?.n).toBe(0);
  expect((await review(env,sales,{version:1,tierVersions:{ESSENZIALE:2,COMPLETA:3}}))?.status).toBe(201);
  expect(sqlite.prepare("SELECT count(*) n FROM approvals WHERE status='PENDING'").get()?.n).toBe(1);
  const main='pricing:pv-'+QUOTE;
  expect((await decide(env,sales,main))?.status).toBe(403);
  expect((await decide(env,actor('own2','ADMIN'),main))?.status).toBe(200);
  expect(sqlite.prepare('SELECT status FROM quotes WHERE id=?').get(QUOTE)?.status).toBe('APPROVED');
  expect(sqlite.prepare("SELECT id FROM approvals WHERE status='APPROVED' ORDER BY id").all().map(r=>r.id)).toEqual(['pricing:pv-'+QUOTE,'pricing:pv2-'+QUOTE,'pricing:pv3-'+QUOTE]);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='PRICING_TIER_APPROVED'").get()?.n).toBe(2);
  expect((await staff(env,owner,'POST',OPTIONS))?.status).toBe(201);
 });
 it('a review requested alone leaves tier versions unapproved: the 3-tier share is 409',async()=>{
  const {env,actor,quote,catalog}=fixture();quote(QUOTE,'DRAFT','org-a',null,false);catalog(1,100000);
  expect((await review(env,actor('req','SALES'),{version:1}))?.status).toBe(201);
  expect((await decide(env,actor('own','ADMIN'),'pricing:pv-'+QUOTE))?.status).toBe(200);
  expect((await staff(env,actor('o','OWNER'),'POST',OPTIONS))?.status).toBe(409);
 });
 it('ACCEPTED cannot be written by the generic records API, create or patch: 409 naming the reason',async()=>{
  const {env,actor,sqlite}=fixture();const owner=actor('o','OWNER');
  sqlite.prepare("INSERT INTO quotes(id,organization_id,name,status,created_at,updated_at) VALUES('manual','org-a','Manuale','DRAFT',1,1)").run();
  for(const [method,id,body] of [['PATCH','manual',{status:'ACCEPTED'}],['POST',undefined,{name:'Nuovo preventivo',status:'ACCEPTED'}]] as const){
   const res=await asResponse(()=>records(new Request('https://omni101.app/api/records/proposals'+(id?'/'+id:''),{method,body:JSON.stringify(body)}),env,owner,'proposals',id));
   expect(res?.status).toBe(409);expect(await res!.text()).toMatch(/ACCEPTED/);
  }
  expect(sqlite.prepare("SELECT status FROM quotes WHERE id='manual'").get()?.status).toBe('DRAFT');
  expect(sqlite.prepare("SELECT count(*) n FROM quotes WHERE status='ACCEPTED'").get()?.n).toBe(0);
 });
 it('approved pricing versions are immutable: UPDATE and DELETE are refused, unapproved ones stay editable',async()=>{
  const {sqlite,quote,catalog}=fixture();quote();catalog(1,100000);
  expect(()=>sqlite.prepare("UPDATE pricing_versions SET calculation='{}' WHERE version=2").run()).toThrow(/immutable/);
  expect(()=>sqlite.prepare('DELETE FROM pricing_versions WHERE version=3').run()).toThrow(/immutable/);
  expect(sqlite.prepare("UPDATE pricing_versions SET input='{\"x\":1}' WHERE version=1").run().changes).toBe(1);
 });
 it('public route is wired in handleApi without authentication',async()=>{
  const {env}=fixture();
  const response=await handleApi(new Request('https://omni101.app/api/proposal/'+crypto.randomUUID()),env);
  expect(response?.status).toBe(404);
 });
});
