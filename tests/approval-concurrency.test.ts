import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';

async function fixture(resource:'quotes'|'leads'|'agent_runs'|'workflow_runs',synchronize=true){
 const sqlite=new DatabaseSync(':memory:');for(const file of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 const now=Date.now();
 for(const user of ['owner-a','owner-b']){
  sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(user,user+'@example.test',user,now,now);
  sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(user,'omni101',user,'OWNER',now,now);
  sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(user,'omni101',user,await digest(user),now+60000,now,now);
 }
 sqlite.prepare("INSERT INTO leads(id,organization_id,name,status,created_at,updated_at) VALUES('lead','omni101','Synthetic lead','PROPOSAL_DRAFT',?,?)").run(now,now);
 sqlite.prepare("INSERT INTO quotes(id,organization_id,name,status,created_at,updated_at) VALUES('quote','omni101','Synthetic proposal','DRAFT',?,?)").run(now,now);
 sqlite.prepare("INSERT INTO agent_runs(id,organization_id,name,input,status,created_at,updated_at) VALUES('run','omni101','Synthetic run','{}','AWAITING_APPROVAL',?,?)").run(now,now);
 sqlite.prepare("INSERT INTO workflow_executions(id,organization_id,name,lead_id,status,current_step,created_at,updated_at) VALUES('workflow','omni101','Synthetic workflow','lead','AWAITING_APPROVAL','WAITING',?,?)").run(now,now);
 sqlite.prepare("INSERT INTO workflow_runs(id,organization_id,version,graph,input,status,idempotency_key,created_at,updated_at) VALUES('workflow-run','omni101',1,'{}','{}','AWAITING_APPROVAL','synthetic-review',?,?)").run(now,now);
 const resourceId=resource==='quotes'?'quote':resource==='leads'?'lead':resource==='workflow_runs'?'workflow-run':'run';
 sqlite.prepare("INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,evidence,version,created_at,updated_at) VALUES('approval','omni101','Review','PENDING',?,?,?,1,?,?)").run(resource,resourceId,JSON.stringify({runId:'run',leadId:'lead',quoteId:'quote',workflowRunId:'workflow-run'}),now,now);
 let reads=0,release:()=>void=()=>{};
 const barrier=new Promise<void>(resolve=>{release=resolve;});
 const wrap=(sql:string,params:unknown[]=[])=>({
  sql,params,bind(...values:unknown[]){return wrap(sql,values);},
  async first(){
   // Capture both PENDING snapshots before either decision batch can claim it.
   const row=sqlite.prepare(sql).get(...params as [])||null;
   if(synchronize&&sql.startsWith('SELECT * FROM approvals')){reads++;if(reads===2)release();await barrier;}
   return row;
  },
  async all(){return {results:sqlite.prepare(sql).all(...params as [])};},
 });
 const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(statement=>{const result=sqlite.prepare(statement.sql).run(...statement.params as []);return {success:true,meta:{changes:Number(result.changes)}};});sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 return {sqlite,env:{DB,ORGANIZATION_ID:'omni101'} as unknown as Env};
}
function decide(env:Env,owner:string,decision:'APPROVED'|'REJECTED'){
 return handleApi(new Request('https://omni101.app/api/approvals/approval/decision',{method:'POST',headers:{Origin:'https://omni101.app',Cookie:'__Host-omni_session='+owner,'Content-Type':'application/json'},body:JSON.stringify({decision,reason:'Inspected actual evidence for concurrency test'})}),env);
}
describe('approval decisions claim one transactional winner',()=>{
 for(const resource of ['quotes','leads','agent_runs','workflow_runs'] as const)it(`does not let stale opposite decisions overwrite ${resource} or produce a second audit`,async()=>{
  const {sqlite,env}=await fixture(resource);
  const results=await Promise.all([decide(env,'owner-a','APPROVED'),decide(env,'owner-b','REJECTED')]);
  expect(results.map(result=>result?.status).sort()).toEqual([200,409]);
  const approval=sqlite.prepare("SELECT status,decided_by,version FROM approvals WHERE id='approval'").get()!;
  const winner=results[0]?.status===200?'APPROVED':'REJECTED';
  expect(approval.status).toBe(winner);expect(approval.decided_by).toBe(results[0]?.status===200?'owner-a':'owner-b');expect(approval.version).toBe(2);
  const audits=sqlite.prepare("SELECT user_id,action FROM audit_logs WHERE resource_type='approvals' AND resource_id='approval'").all();
  expect(audits).toHaveLength(1);expect(audits[0].user_id).toBe(approval.decided_by);expect(audits[0].action).toBe('APPROVAL_'+winner);
  expect(sqlite.prepare("SELECT status FROM agent_runs WHERE id='run'").get()?.status).toBe(resource==='workflow_runs'?'AWAITING_APPROVAL':winner);
  if(resource==='quotes'||resource==='workflow_runs')expect(sqlite.prepare("SELECT status FROM quotes WHERE id='quote'").get()?.status).toBe(winner);
  if(resource!=='agent_runs'&&resource!=='workflow_runs')expect(sqlite.prepare("SELECT status FROM workflow_executions WHERE id='workflow'").get()?.status).toBe(winner==='APPROVED'?(resource==='quotes'?'READY_FOR_COMMERCIAL_DECISION':'READY_FOR_DISCOVERY'):'NEEDS_HUMAN_REVIEW');
  if(resource==='workflow_runs'){expect(sqlite.prepare("SELECT status FROM workflow_runs WHERE id='workflow-run'").get()?.status).toBe('AWAITING_APPROVAL');expect(sqlite.prepare('SELECT count(*) n FROM projects').get()?.n).toBe(0);expect(sqlite.prepare('SELECT count(*) n FROM tasks').get()?.n).toBe(0);}
 });
 it('claims only once for concurrent identical decisions from the same Owner',async()=>{
  const {sqlite,env}=await fixture('quotes');
  const results=await Promise.all([decide(env,'owner-a','APPROVED'),decide(env,'owner-a','APPROVED')]);
  expect(results.map(result=>result?.status).sort()).toEqual([200,409]);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE resource_type='approvals'").get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT version FROM approvals WHERE id='approval'").get()?.version).toBe(2);
 });
 it('rolls back the claim and decision if a downstream resource write fails',async()=>{
  const {sqlite,env}=await fixture('quotes',false);
  sqlite.exec("CREATE TRIGGER synthetic_resource_failure BEFORE UPDATE ON quotes BEGIN SELECT RAISE(ABORT,'synthetic write failure'); END");
  const response=await decide(env,'owner-a','APPROVED');expect(response?.status).toBe(500);
  expect(sqlite.prepare("SELECT status FROM approvals WHERE id='approval'").get()?.status).toBe('PENDING');
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE resource_type='approvals'").get()?.n).toBe(0);
  expect(sqlite.prepare("SELECT status FROM agent_runs WHERE id='run'").get()?.status).toBe('AWAITING_APPROVAL');
 });
});
