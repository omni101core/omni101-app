import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env,type Identity} from '../apps/web/app/server/auth';
import {checkup,localDate,runOperationsCheckup,RULE_VERSION} from '../apps/web/app/server/operations-checkup';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function member(sqlite:DatabaseSync,role:string,name:string,org='omni101'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const identity=(id:string,role:string,orgId='omni101')=>({id,email:id+'@example.test',name:id,orgId,role,clientId:null}) as Identity;
const post=(payload:unknown,cookie='')=>new Request('https://omni101.app/api/operations/checkup',{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(payload)});
const get=(path:string,cookie:string)=>new Request('https://omni101.app'+path,{headers:{Origin:'https://omni101.app',Cookie:cookie}});
const AT=Date.UTC(2026,9,24,10,0,0);
function fixtures(sqlite:DatabaseSync){
 const t=AT,org=(id:string)=>sqlite.prepare('INSERT OR IGNORE INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run(id,id,id,t,t);org('other');org('empty');
 const project=(id:string,o:string,status:string)=>sqlite.prepare('INSERT INTO projects(id,organization_id,name,status,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id,o,'SECRET_PROJECT_NAME '+id,status,t,t);
 const task=(id:string,o:string,project:string|null,status:string,due:string|null)=>sqlite.prepare('INSERT INTO tasks(id,organization_id,name,project_id,status,due_date,description,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,o,'SECRET_TASK_NAME '+id,project,status,due,'SECRET_DESCRIPTION',t,t);
 const approval=(id:string,o:string,status:string)=>sqlite.prepare('INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run(id,o,'SECRET_APPROVAL',status,'quotes',id,t,t);
 const workflow=(id:string,o:string,status:string)=>sqlite.prepare('INSERT INTO workflow_runs(id,organization_id,version,graph,input,status,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,o,1,'{}','{}',status,id,t,t);
 project('a-active-busy','omni101','ACTIVE');project('a-active-idle','omni101','ACTIVE');project('a-planning','omni101','PLANNING');
 task('a-overdue','omni101','a-active-busy','TODO','2026-10-20');task('a-blocked','omni101','a-active-busy','BLOCKED',null);task('a-today','omni101','a-active-busy','IN_PROGRESS','2026-10-24');
 task('a-done-late','omni101','a-active-idle','DONE','2026-09-01');
 approval('a-p1','omni101','PENDING');approval('a-p2','omni101','PENDING');approval('a-ok','omni101','APPROVED');
 workflow('a-f1','omni101','FAILED');workflow('a-f2','omni101','DISPATCH_FAILED');workflow('a-c1','omni101','COMPLETED');
 // The other tenant is noisy on purpose, and one of its open tasks points at tenant A's idle project: an unscoped correlated subquery would hide that idle project.
 project('b-active','other','ACTIVE');
 for(const i of [1,2,3,4,5])task('b-blocked-'+i,'other','b-active','BLOCKED','2026-01-01');
 task('b-cross','other','a-active-idle','TODO','2026-01-01');
 approval('b-p1','other','PENDING');workflow('b-f1','other','FAILED');
 project('e-planning','empty','PLANNING');
}
afterEach(()=>vi.unstubAllGlobals());

describe('operations.health deterministic tool',()=>{
 it('counts real tenant data with fixed time, applies declared rules and never leaks names or other tenants',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  const a=await checkup(env,'omni101',AT);
  expect(a.metrics).toEqual({openTasks:3,blockedTasks:1,openTasksWithDueDate:2,overdueTasks:1,pendingApprovals:2,activeProjects:2,activeProjectsWithoutOpenTasks:1,failedWorkflowRuns:2});
  expect(a.recommendations.map(r=>[r.rule,r.priority,r.value])).toEqual([['failed-workflows','HIGH',2],['blocked-tasks','HIGH',1],['overdue-tasks','HIGH',1],['pending-approvals','MEDIUM',2],['idle-active-projects','MEDIUM',1]]);
  expect(a).toMatchObject({today:'2026-10-24',ruleVersion:RULE_VERSION,attention:5,timeZone:'Europe/Rome'});
  expect(await checkup(env,'omni101',AT)).toEqual(a);
  const text=JSON.stringify(a);for(const secret of ['SECRET_','example.test','b-'])expect(text).not.toContain(secret);
  expect((await checkup(env,'other',AT)).metrics).toMatchObject({blockedTasks:5,overdueTasks:6,pendingApprovals:1,failedWorkflowRuns:1,activeProjects:1,activeProjectsWithoutOpenTasks:0});
 });

 it('keeps not-measurable apart from zero and uses the Rome calendar day',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  const empty=await checkup(env,'empty',AT);
  expect(empty.metrics).toMatchObject({openTasks:0,overdueTasks:null,activeProjects:0,activeProjectsWithoutOpenTasks:null});expect(empty.recommendations).toEqual([]);
  sqlite.prepare("INSERT INTO tasks(id,organization_id,name,status,created_at,updated_at) VALUES('e-1','empty','x','TODO',?,?)").run(AT,AT);
  const undated=await checkup(env,'empty',AT);
  expect(undated.metrics.overdueTasks).toBeNull();expect(undated.recommendations).toEqual([expect.objectContaining({rule:'overdue-unmeasurable',priority:'LOW',value:1})]);expect(undated.attention).toBe(0);
  expect(localDate(Date.UTC(2026,9,23,22,30))).toBe('2026-10-24');
  sqlite.prepare("UPDATE tasks SET due_date='2026-10-23' WHERE id='e-1'").run();
  expect((await checkup(env,'empty',Date.UTC(2026,9,23,21,59))).metrics.overdueTasks).toBe(0);
  expect((await checkup(env,'empty',Date.UTC(2026,9,23,22,0))).metrics.overdueTasks).toBe(1);
 });

 it('runs through the API for Owner, replays the same key without a second measurement and denies other roles',async()=>{
  const fetchSpy=vi.fn();vi.stubGlobal('fetch',fetchSpy);
  const {sqlite,env}=database();fixtures(sqlite);
  const owner=await member(sqlite,'OWNER','ops-owner'),client=await member(sqlite,'CLIENT','ops-client'),dev=await member(sqlite,'DEVELOPER','ops-dev');
  const requestKey=crypto.randomUUID();
  const first=await handleApi(post({requestKey},owner),env);expect(first?.status).toBe(201);const created=await first?.json() as {runId:string;artifactId:string;replay:boolean;result:unknown};
  expect(created.replay).toBe(false);
  sqlite.prepare("INSERT INTO approvals(id,organization_id,status,resource_type,resource_id,created_at,updated_at) VALUES('later','omni101','PENDING','quotes','later',?,?)").run(AT,AT);
  const again=await handleApi(post({requestKey},owner),env);expect(again?.status).toBe(200);const replay=await again?.json() as typeof created;
  expect(replay).toEqual({...created,replay:true});
  expect(sqlite.prepare('SELECT count(*) n FROM agent_runs WHERE id=?').get(created.runId)?.n).toBe(1);
  expect(sqlite.prepare('SELECT count(*) n FROM agent_artifacts WHERE run_id=?').get(created.runId)?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE resource_id=? AND action='OPERATIONS_CHECKUP_COMPLETED'").get(created.runId)?.n).toBe(1);
  expect({...sqlite.prepare('SELECT status,provider,model,cost_cents,tokens_used,agent_id FROM agent_runs WHERE id=?').get(created.runId)}).toEqual({status:'COMPLETED',provider:'rules',model:RULE_VERSION,cost_cents:0,tokens_used:0,agent_id:null});
  const detail=await handleApi(get('/api/agent-runs/'+created.runId,owner),env);expect(detail?.status).toBe(200);
  const artifact=await handleApi(get('/api/artifacts/'+created.artifactId,owner),env),stored=await artifact?.json() as {content:string;kind:string};
  expect(stored.kind).toBe('TOOL_RESULT');expect(JSON.parse(stored.content)).toEqual(created.result);
  expect((await handleApi(post({requestKey:crypto.randomUUID()},client),env))?.status).toBe(403);
  expect((await handleApi(post({requestKey:crypto.randomUUID()},dev),env))?.status).toBe(403);
  expect(fetchSpy).not.toHaveBeenCalled();
 });

 it('allows Admin and PM, rejects loose bodies, and never lets another actor reuse a key',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  for(const [id,role] of [['adm','ADMIN'],['pm','PROJECT_MANAGER'],['own2','OWNER'],['ext','OWNER']] as const)await member(sqlite,role,id,id==='ext'?'other':'omni101');
  const key=crypto.randomUUID();
  expect((await runOperationsCheckup(post({requestKey:key}),env,identity('adm','ADMIN'),AT)).status).toBe(201);
  expect((await runOperationsCheckup(post({requestKey:crypto.randomUUID()}),env,identity('pm','PROJECT_MANAGER'),AT)).status).toBe(201);
  await expect(runOperationsCheckup(post({requestKey:key}),env,identity('own2','OWNER'),AT)).rejects.toMatchObject({status:409});
  expect((await runOperationsCheckup(post({requestKey:key}),env,identity('ext','OWNER','other'),AT)).status).toBe(201);
  await expect(runOperationsCheckup(post({requestKey:key,extra:true}),env,identity('adm','ADMIN'),AT)).rejects.toThrow();
  await expect(runOperationsCheckup(post({requestKey:'not-a-uuid'}),env,identity('adm','ADMIN'),AT)).rejects.toThrow();
 });

 it('records a failure, leaves no artifact, then retries the same key exactly once',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);await member(sqlite,'OWNER','fail-owner');
  const actor=identity('fail-owner','OWNER'),key=crypto.randomUUID();
  const brokenMeasure={...env,DB:{...env.DB,prepare:(sql:string)=>sql.includes('AS openTasks')?{bind:()=>({first:async()=>{throw new Error('database unavailable')}})}:env.DB.prepare(sql)}} as unknown as Env;
  await expect(runOperationsCheckup(post({requestKey:key}),brokenMeasure,actor,AT)).rejects.toMatchObject({status:503});
  const run=()=>({...sqlite.prepare("SELECT status,error FROM agent_runs WHERE requested_by='fail-owner'").get()}) as {status:string;error:string};
  expect(run()).toEqual({status:'FAILED',error:'Checkup non completato.'});
  expect(sqlite.prepare('SELECT count(*) n FROM agent_artifacts').get()?.n).toBe(0);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='OPERATIONS_CHECKUP_FAILED'").get()?.n).toBe(1);
  let calls=0;const brokenOnce={...env,DB:{...env.DB,batch:async(s:unknown[])=>{if(calls++===0)throw new Error('commit failed');return env.DB.batch(s as never)}}} as unknown as Env;
  await expect(runOperationsCheckup(post({requestKey:key}),brokenOnce,actor,AT+1000)).rejects.toMatchObject({status:503});
  expect(run().status).toBe('FAILED');expect(sqlite.prepare('SELECT count(*) n FROM agent_artifacts').get()?.n).toBe(0);
  const ok=await runOperationsCheckup(post({requestKey:key}),env,actor,AT+2000);expect(ok.status).toBe(201);
  const replay=await runOperationsCheckup(post({requestKey:key}),env,actor,AT+3000);expect(replay.status).toBe(200);expect((await replay.json() as {replay:boolean}).replay).toBe(true);
  expect(run().status).toBe('COMPLETED');expect(sqlite.prepare('SELECT count(*) n FROM agent_artifacts').get()?.n).toBe(1);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='OPERATIONS_CHECKUP_COMPLETED'").get()?.n).toBe(1);
 });

 // A gated measurement lets a test interleave attempts: each attempt waits on its own gate, then succeeds or fails.
 function gated(env:Env,fail=false){let release!:()=>void;const gate=new Promise<void>(r=>{release=r});const db={...env.DB,prepare:(sql:string)=>{const stmt=env.DB.prepare(sql);if(!sql.includes('AS openTasks'))return stmt;return {bind:(...v:unknown[])=>({first:async()=>{await gate;if(fail)throw new Error('measure failed late');return stmt.bind(...v).first()}})}}};return {env:{...env,DB:db} as unknown as Env,release}}
 const counts=(sqlite:DatabaseSync,runId:string)=>({
  run:{...sqlite.prepare('SELECT status FROM agent_runs WHERE id=?').get(runId)},
  artifacts:Number(sqlite.prepare('SELECT count(*) n FROM agent_artifacts WHERE run_id=?').get(runId)?.n),
  completed:Number(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE resource_id=? AND action='OPERATIONS_CHECKUP_COMPLETED'").get(runId)?.n),
  failed:Number(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE resource_id=? AND action='OPERATIONS_CHECKUP_FAILED'").get(runId)?.n),
  superseded:(sqlite.prepare("SELECT details FROM audit_logs WHERE resource_id=? AND action='OPERATIONS_CHECKUP_ATTEMPT_SUPERSEDED'").all(runId) as {details:string}[]).map(r=>JSON.parse(r.details).outcome),
 });
 async function abandoned(sqlite:DatabaseSync,env:Env,name:string,failOld:boolean){
  await member(sqlite,'OWNER',name);const actor=identity(name,'OWNER'),key=crypto.randomUUID();
  const old=gated(env,failOld),oldAttempt=runOperationsCheckup(post({requestKey:key}),old.env,actor,AT);
  await vi.waitFor(()=>expect(sqlite.prepare('SELECT status FROM agent_runs WHERE requested_by=?').get(name)?.status).toBe('RUNNING'));
  const runId=String(sqlite.prepare('SELECT id FROM agent_runs WHERE requested_by=?').get(name)?.id);
  await expect(runOperationsCheckup(post({requestKey:key}),env,actor,AT)).rejects.toMatchObject({status:409});
  // Abandon the first attempt, then reclaim at the SAME timestamp it used: only the lease can tell the two attempts apart.
  sqlite.prepare('UPDATE agent_runs SET updated_at=? WHERE id=?').run(AT-61000,runId);
  const fresh=gated(env),newAttempt=runOperationsCheckup(post({requestKey:key}),fresh.env,actor,AT);
  await vi.waitFor(()=>expect(sqlite.prepare('SELECT updated_at FROM agent_runs WHERE id=?').get(runId)?.updated_at).toBe(AT));
  return {actor,key,runId,old,oldAttempt,fresh,newAttempt};
 }

 it('ignores an abandoned attempt that fails after the reclaim and before the new attempt finishes',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  const t=await abandoned(sqlite,env,'late-failure',true);
  t.old.release();await expect(t.oldAttempt).rejects.toMatchObject({status:503});
  expect(counts(sqlite,t.runId)).toEqual({run:{status:'RUNNING'},artifacts:0,completed:0,failed:0,superseded:['failure']});
  t.fresh.release();expect((await t.newAttempt).status).toBe(201);
  expect(counts(sqlite,t.runId)).toEqual({run:{status:'COMPLETED'},artifacts:1,completed:1,failed:0,superseded:['failure']});
 });

 it('ignores an abandoned attempt that succeeds after the reclaim and stores only the new result',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  const t=await abandoned(sqlite,env,'late-success',false);
  t.old.release();await expect(t.oldAttempt).rejects.toMatchObject({status:409});
  expect(counts(sqlite,t.runId)).toEqual({run:{status:'RUNNING'},artifacts:0,completed:0,failed:0,superseded:['success']});
  // Data changes between the two measurements, so the stored result proves which attempt wrote it.
  sqlite.prepare("INSERT INTO approvals(id,organization_id,status,resource_type,resource_id,created_at,updated_at) VALUES('between','omni101','PENDING','quotes','between',?,?)").run(AT,AT);
  t.fresh.release();const done=await t.newAttempt;expect(done.status).toBe(201);
  expect(((await done.json()) as {result:{metrics:{pendingApprovals:number}}}).result.metrics.pendingApprovals).toBe(3);
  expect(JSON.parse(String(sqlite.prepare('SELECT content FROM agent_artifacts WHERE run_id=?').get(t.runId)?.content)).metrics.pendingApprovals).toBe(3);
  expect(counts(sqlite,t.runId)).toEqual({run:{status:'COMPLETED'},artifacts:1,completed:1,failed:0,superseded:['success']});
 });

 it('answers a stale attempt with the stored result when the newer attempt finished first',async()=>{
  const {sqlite,env}=database();fixtures(sqlite);
  const t=await abandoned(sqlite,env,'newer-first',false);
  t.fresh.release();const done=await t.newAttempt;expect(done.status).toBe(201);const stored=(await done.json()) as {result:unknown};
  t.old.release();const late=await t.oldAttempt;expect(late.status).toBe(200);
  expect((await late.json()) as {replay:boolean;result:unknown}).toMatchObject({replay:true,result:stored.result});
  expect(counts(sqlite,t.runId)).toEqual({run:{status:'COMPLETED'},artifacts:1,completed:1,failed:0,superseded:['success']});
  const failing=await abandoned(sqlite,env,'newer-first-fail',true);
  failing.fresh.release();expect((await failing.newAttempt).status).toBe(201);
  failing.old.release();await expect(failing.oldAttempt).rejects.toMatchObject({status:503});
  expect(counts(sqlite,failing.runId)).toEqual({run:{status:'COMPLETED'},artifacts:1,completed:1,failed:0,superseded:['failure']});
 });

 it('retries a failed checkup through the generic agent-run retry route without a provider, and refuses other agentless runs',async()=>{
  const fetchSpy=vi.fn();vi.stubGlobal('fetch',fetchSpy);
  const {sqlite,env}=database();fixtures(sqlite);
  const owner=await member(sqlite,'OWNER','retry-owner'),other=await member(sqlite,'OWNER','retry-other');
  const broken={...env,DB:{...env.DB,prepare:(sql:string)=>sql.includes('AS openTasks')?{bind:()=>({first:async()=>{throw new Error('down')}})}:env.DB.prepare(sql)}} as unknown as Env;
  await expect(runOperationsCheckup(post({requestKey:crypto.randomUUID()}),broken,identity('retry-owner','OWNER'),AT)).rejects.toMatchObject({status:503});
  const runId=String(sqlite.prepare("SELECT id FROM agent_runs WHERE requested_by='retry-owner'").get()?.id);
  const retry=(cookie:string,id=runId)=>handleApi(new Request('https://omni101.app/api/agent-runs/'+id+'/retry',{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},body:'{}'}),env);
  expect((await retry(other))?.status).toBe(409);
  const ok=await retry(owner);expect(ok?.status).toBe(201);expect(((await ok?.json()) as {runId:string}).runId).toBe(runId);
  expect(counts(sqlite,runId)).toMatchObject({run:{status:'COMPLETED'},artifacts:1,completed:1,failed:1});
  expect(Number(sqlite.prepare('SELECT count(*) n FROM agent_runs WHERE requested_by=?').get('retry-owner')?.n)).toBe(1);
  sqlite.prepare("INSERT INTO agent_runs(id,organization_id,name,agent_id,status,input,provider,requested_by,created_at,updated_at) VALUES('orphan','omni101','Orphan',NULL,'FAILED','{}',NULL,'retry-owner',?,?)").run(AT,AT);
  expect((await retry(owner,'orphan'))?.status).toBe(409);
  expect(fetchSpy).not.toHaveBeenCalled();
 });
});
