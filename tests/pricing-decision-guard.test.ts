import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';

// Real SQLite, versioned pricing review: requester owner-r, deciders owner-a / owner-b.
async function fixture(afterQuoteRead?:(sqlite:DatabaseSync)=>void){
 const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 const now=Date.now();
 for(const user of ['owner-r','owner-a','owner-b']){
  sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(user,user+'@example.test',user,now,now);
  sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(user,'omni101',user,'OWNER',now,now);
  sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(user,'omni101',user,await digest(user),now+60000,now,now);
 }
 sqlite.prepare("INSERT INTO quotes(id,organization_id,name,status,pricing_version,created_at,updated_at) VALUES('quote','omni101','Synthetic proposal','IN_REVIEW',1,?,?)").run(now,now);
 sqlite.prepare("INSERT INTO pricing_versions(id,organization_id,quote_id,version,input,calculation,created_by,created_at) VALUES('snap-essenziale','omni101','quote',2,'{}','{}','owner-r',?)").run(now);
 const evidence={pricingVersion:1,tiers:{ESSENZIALE:{pricingVersion:2,snapshotId:'snap-essenziale'}}};
 sqlite.prepare("INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,evidence,requested_by,version,created_at,updated_at) VALUES('approval','omni101','Review','PENDING','quotes','quote',?,'owner-r',1,?,?)").run(JSON.stringify(evidence),now,now);
 const wrap=(sql:string,params:unknown[]=[])=>({
  sql,params,bind(...values:unknown[]){return wrap(sql,values);},
  async first(){const row=sqlite.prepare(sql).get(...params as [])||null;if(afterQuoteRead&&sql.startsWith('SELECT status,pricing_version FROM quotes'))afterQuoteRead(sqlite);return row;},
  async all(){return {results:sqlite.prepare(sql).all(...params as [])};},
 });
 const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(statement=>{const result=sqlite.prepare(statement.sql).run(...statement.params as []);return {success:true,meta:{changes:Number(result.changes)}};});sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 return {sqlite,env:{DB,ORGANIZATION_ID:'omni101'} as unknown as Env};
}
function decide(env:Env,owner:string,decision:'APPROVED'|'REJECTED'){
 return handleApi(new Request('https://omni101.app/api/approvals/approval/decision',{method:'POST',headers:{Origin:'https://omni101.app',Cookie:'__Host-omni_session='+owner,'Content-Type':'application/json'},body:JSON.stringify({decision,reason:'Inspected actual evidence for guard test'})}),env);
}
const count=(sqlite:DatabaseSync,sql:string)=>Number(sqlite.prepare(sql).get()?.n);

describe('pricing decision(): conditional claim',()=>{
 it('two opposite decisions in sequence: one wins, the other gets 409, no second audit or tier approval',async()=>{
  const {sqlite,env}=await fixture();
  expect((await decide(env,'owner-a','APPROVED'))?.status).toBe(200);
  expect((await decide(env,'owner-b','REJECTED'))?.status).toBe(409);
  expect(sqlite.prepare("SELECT status,decided_by,version FROM approvals WHERE id='approval'").get()).toMatchObject({status:'APPROVED',decided_by:'owner-a',version:2});
  expect(count(sqlite,"SELECT count(*) n FROM audit_logs WHERE resource_type='approvals'")).toBe(1);
  expect(count(sqlite,"SELECT count(*) n FROM approvals WHERE id LIKE 'pricing:%'")).toBe(1);
  expect(count(sqlite,"SELECT count(*) n FROM audit_logs WHERE action='PRICING_TIER_APPROVED'")).toBe(1);
  expect(sqlite.prepare("SELECT status FROM quotes WHERE id='quote'").get()?.status).toBe('APPROVED');
 });
 it('rejection first: later approval gets 409 and creates no tier approval',async()=>{
  const {sqlite,env}=await fixture();
  expect((await decide(env,'owner-a','REJECTED'))?.status).toBe(200);
  expect((await decide(env,'owner-b','APPROVED'))?.status).toBe(409);
  expect(count(sqlite,"SELECT count(*) n FROM approvals WHERE id LIKE 'pricing:%'")).toBe(0);
  expect(count(sqlite,"SELECT count(*) n FROM audit_logs WHERE resource_type='approvals'")).toBe(1);
  expect(sqlite.prepare("SELECT status FROM quotes WHERE id='quote'").get()?.status).toBe('REJECTED');
 });
 it('expired claim: quote leaves IN_REVIEW after the pre-check -> 409, approval stays PENDING, nothing written',async()=>{
  const {sqlite,env}=await fixture(db=>{db.exec("UPDATE quotes SET status='DRAFT' WHERE id='quote'")});
  expect((await decide(env,'owner-a','APPROVED'))?.status).toBe(409);
  expect(sqlite.prepare("SELECT status,version FROM approvals WHERE id='approval'").get()).toMatchObject({status:'PENDING',version:1});
  expect(count(sqlite,"SELECT count(*) n FROM audit_logs")).toBe(0);
  expect(count(sqlite,"SELECT count(*) n FROM approvals WHERE id LIKE 'pricing:%'")).toBe(0);
  expect(sqlite.prepare("SELECT status FROM quotes WHERE id='quote'").get()?.status).toBe('DRAFT');
 });
 it('expired claim: new pricing version after the pre-check -> 409, nothing written',async()=>{
  const {sqlite,env}=await fixture(db=>{db.exec("UPDATE quotes SET pricing_version=2 WHERE id='quote'")});
  expect((await decide(env,'owner-a','REJECTED'))?.status).toBe(409);
  expect(sqlite.prepare("SELECT status FROM approvals WHERE id='approval'").get()?.status).toBe('PENDING');
  expect(count(sqlite,"SELECT count(*) n FROM audit_logs")).toBe(0);
 });
 it('requester cannot decide their own review',async()=>{
  const {sqlite,env}=await fixture();
  expect((await decide(env,'owner-r','APPROVED'))?.status).toBe(403);
  expect(sqlite.prepare("SELECT status FROM approvals WHERE id='approval'").get()?.status).toBe('PENDING');
 });
});
