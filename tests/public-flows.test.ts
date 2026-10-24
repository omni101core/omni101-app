import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleProposalStaff,handlePublicProposal} from '../apps/web/app/server/proposals';
import {GONE,RETRY,linkMessage} from '../apps/web/app/routes/public/link-state';
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

// Public links /demo/:token and /proposal/:token, through the real API router on SQLite: every state answers with a status the page maps to a human message.
// Browser-like requests: same-origin Origin on writes (assertSameOrigin), and a fresh client IP per call so the per-minute limit of the public endpoints is not what these tests measure.
let hits=0;
const api=(env:Env,path:string,method='GET',body?:unknown)=>handleApi(new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','cf-connecting-ip':'198.51.100.'+(++hits%250+1)},...(body===undefined?{}:{body:JSON.stringify(body)})}),env) as Promise<Response>;
const sharedDemo=async(f:ReturnType<typeof fixture>,token:string)=>{
 f.sqlite.prepare("INSERT INTO leads(id,organization_id,name,message,status,created_at,updated_at) VALUES('lead-d','org-a','Mario','Sito per trattoria','NEW',1,1)").run();
 f.sqlite.prepare("INSERT INTO commerce_configurations(id,organization_id,owner_user_id,version,configuration,lead_id,language,share_token_hash,shared_at,created_at,updated_at) VALUES(?,?,'author',1,?,'lead-d','it',?,1,1,1)").run('33333333-3333-4333-8333-333333333333','org-a',JSON.stringify({businessName:'Trattoria Verde',ctaUrl:'https://omni101.app/start-project'}),await digest(token));
};

describe('public link states',()=>{
 it('demo: valid 200; revoked, replaced, draft and unknown 404 with a human error; DB failure 500 with a human error',async()=>{
  const f=fixture(),token=crypto.randomUUID();await sharedDemo(f,token);
  const ok=await api(f.env,'/api/demo/'+token);expect(ok.status).toBe(200);
  expect((await ok.json() as {configuration:{businessName:string}}).configuration.businessName).toBe('Trattoria Verde');
  const missing=await api(f.env,'/api/demo/'+crypto.randomUUID());expect(missing.status).toBe(404);expect((await missing.json() as {error:string}).error).toBe('Demo non disponibile.');
  expect((await api(f.env,'/api/demo/not-a-token')).status).toBe(404);
  // Mini-demos carry no clock: "expired" is a revoked or replaced token (hash cleared or changed).
  f.sqlite.prepare('UPDATE commerce_configurations SET share_token_hash=? WHERE lead_id=?').run(await digest(crypto.randomUUID()),'lead-d');
  expect((await api(f.env,'/api/demo/'+token)).status).toBe(404);
  f.sqlite.prepare('UPDATE commerce_configurations SET share_token_hash=NULL WHERE lead_id=?').run('lead-d');
  expect((await api(f.env,'/api/demo/'+token)).status).toBe(404);
  const broken={...f.env,DB:{...f.env.DB,prepare:(sql:string)=>{if(/commerce_configurations/.test(sql))throw new Error('boom');return f.env.DB.prepare(sql)}}} as Env;
  const down=await api(broken,'/api/demo/'+token);expect(down.status).toBe(500);expect((await down.json() as {error:string}).error).toBe('Operazione non completata. Riprova o contatta lo studio.');
 });
 it('proposal: three tiers visible, accept 201, second accept 409, accepted link still readable',async()=>{
  const f=fixture();f.quote();f.catalog(1,100000);const made=await share(f.env,f.actor('o','OWNER'));
  const view=await api(f.env,'/api/proposal/'+made.token);expect(view.status).toBe(200);
  const body=await view.json() as {proposal:{options:{tier:string}[]};accepted:null};
  expect(body.proposal.options.map(o=>o.tier)).toEqual(['ESSENZIALE','CONSIGLIATA','COMPLETA']);expect(body.accepted).toBeNull();
  const pay={option:'CONSIGLIATA',name:'Mario Rossi',role:'Titolare',email:'mario@example.com',termsAccepted:true};
  const first=await api(f.env,'/api/proposal/'+made.token+'/accept','POST',pay);expect(first.status).toBe(201);
  const again=await api(f.env,'/api/proposal/'+made.token+'/accept','POST',pay);expect(again.status).toBe(409);
  expect((await again.json() as {error:string}).error).toBe('Proposta già accettata.');
  const after=await api(f.env,'/api/proposal/'+made.token);expect(after.status).toBe(200);
  expect((await after.json() as {accepted:{option:{tier:string}}|null}).accepted?.option.tier).toBe('CONSIGLIATA');
  // Past expiry, an accepted proposal still opens (payment instructions) and a second accept is still 409, not 404.
  f.sqlite.prepare('UPDATE proposal_shares SET expires_at=1').run();
  expect((await api(f.env,'/api/proposal/'+made.token)).status).toBe(200);
  expect((await api(f.env,'/api/proposal/'+made.token+'/accept','POST',pay)).status).toBe(409);
 });
 it('proposal: expired, revoked, replaced, unknown and malformed tokens answer 404 "Proposta non disponibile." on view and accept; invalid form 400 with a human error; DB failure 500',async()=>{
  const f=fixture();f.quote();f.catalog(1,100000);const owner=f.actor('o','OWNER');
  const pay={option:'CONSIGLIATA',name:'Mario Rossi',role:'Titolare',email:'mario@example.com',termsAccepted:true};
  const gone=async(token:string)=>{
   for(const [path,method,payload] of [['','GET',undefined],['/accept','POST',pay]] as const){
    const r=await api(f.env,'/api/proposal/'+token+path,method,payload);expect(r.status).toBe(404);
    expect((await r.json() as {error:string}).error).toBe('Proposta non disponibile.');
   }
  };
  const first=await share(f.env,owner),second=await share(f.env,owner);
  await gone(first.token); // replaced
  f.sqlite.prepare('UPDATE proposal_shares SET expires_at=1 WHERE revoked_at IS NULL').run();
  await gone(second.token); // expired
  const third=await share(f.env,owner);
  const bad=await api(f.env,'/api/proposal/'+third.token+'/accept','POST',{...pay,termsAccepted:false});
  expect(bad.status).toBe(400);expect((await bad.json() as {error:string}).error).toMatch(/termini/);
  expect((await staff(f.env,owner,'DELETE'))?.status).toBe(200);
  await gone(third.token); // revoked
  await gone(crypto.randomUUID());await gone('not-a-token');
  const broken={...f.env,DB:{...f.env.DB,prepare:(sql:string)=>{if(/proposal_shares/.test(sql))throw new Error('boom');return f.env.DB.prepare(sql)}}} as Env;
  const down=await api(broken,'/api/proposal/'+crypto.randomUUID());expect(down.status).toBe(500);
  expect((await down.json() as {error:string}).error).toBe('Operazione non completata. Riprova o contatta lo studio.');
 });
 it('pages map status to a human message: gone for 4xx, retry for 429, 5xx and network; both pages use it',()=>{
  for(const status of [400,404,409])expect(linkMessage(status)).toBe(GONE);
  for(const status of [429,500,503,null])expect(linkMessage(status)).toBe(RETRY);
  expect(GONE).toMatch(/non è più valido/);expect(RETRY).toMatch(/Riprova/);
  for(const page of ['demo','proposal']){
   const source=readFileSync('apps/web/app/routes/public/'+page+'.tsx','utf8');
   expect(source).toContain('linkMessage');expect(source).not.toContain('MISSING');
  }
 });
});
