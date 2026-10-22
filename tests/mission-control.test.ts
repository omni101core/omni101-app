import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {executeWorkflowRun} from '../apps/web/app/server/workflow-runtime';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(origin='https://omni101.app'){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:origin,ORGANIZATION_ID:'omni101',AI_PROVIDER:'nvidia',AI_MODEL:'verified-free-model',AI_API_KEY:'test-only',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0'} as unknown as Env}}
async function person(sqlite:DatabaseSync,name:string,role='OWNER'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,'omni101',name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
async function call(env:Env,cookie:string,method:string,path:string,payload?:unknown){const response=await handleApi(new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload!==undefined?{body:JSON.stringify(payload)}:{})}),env);return {status:response!.status,body:await response!.json() as any}}
const one=(sqlite:DatabaseSync,sql:string,...params:unknown[])=>sqlite.prepare(sql).get(...params as [])as any;
const node=(id:string,type:string,label:string,x=0)=>({id,type,position:{x,y:0},data:{label}});
const chain=(...ids:string[])=>ids.slice(1).map((target,i)=>({id:ids[i]+'-'+target,source:ids[i],target}));
function lead(sqlite:DatabaseSync){const t=Date.now();sqlite.prepare("INSERT INTO leads(id,organization_id,name,status,message,brief,created_at,updated_at) VALUES('lead-1','omni101','Lead di prova','QUALIFICATION','Richiesta reale','Brief reale',?,?)").run(t,t);return 'lead-1'}
async function definition(env:Env,owner:string,name:string,nodes:unknown[],ids:string[]){return (await call(env,owner,'POST','/api/workflows',{name,active:true,graph:{nodes,edges:chain(...ids)}})).body.id as string}
afterEach(()=>vi.unstubAllGlobals());
describe('Mission Control: real durable runs',()=>{
 it('executes a real workflow run, lists it and resolves its artifacts, with controls matching the state',async()=>{
  const {sqlite,env}=database('http://localhost:4174');const owner=await person(sqlite,'owner');const leadId=lead(sqlite);
  const id=await definition(env,owner,'Triage veloce',[node('start','TRIGGER','Avvio'),node('task','CREATE_TASK','Task Mission Control'),node('end','END','Fine')],['start','task','end']);
  const created=await call(env,owner,'POST','/api/workflow-runs',{definitionId:id,leadId,idempotencyKey:'mission-run-0001'});
  expect(created.status).toBe(202);
  const run=one(sqlite,'SELECT id,status FROM workflow_runs');
  expect(run.status).toBe('COMPLETED');
  const overview=await call(env,owner,'GET','/api/mission-control');
  expect(overview.status).toBe(200);
  const listed=overview.body.runs.find((r:any)=>r.id===run.id);
  expect([listed.kind,listed.name,listed.status,listed.canCancel,listed.canResume]).toEqual(['workflow','Triage veloce','COMPLETED',false,false]);
  expect(overview.body.capabilities.pause).toBe(false);
  expect(overview.body.capabilities.pauseReason).toContain('non è supportata');
  expect(overview.body.storage).toMatchObject({artifacts:'D1',r2:false});
  expect(overview.body.storage.note).toContain('R2 non è attivo');
  const detail=await call(env,owner,'GET','/api/mission-control/workflow/'+run.id);
  expect(detail.body.steps.map((s:any)=>s.node_id+':'+s.status)).toEqual(['start:COMPLETED','task:COMPLETED','end:COMPLETED']);
  expect(detail.body.artifacts).toHaveLength(1);
  expect([detail.body.artifacts[0].kind,detail.body.artifacts[0].name,detail.body.artifacts[0].route]).toEqual(['TASK','Task Mission Control','/admin/tasks']);
  expect(one(sqlite,"SELECT count(*) n FROM tasks WHERE name='Task Mission Control'").n).toBe(1);
  expect((await call(env,owner,'GET','/api/mission-control/workflow/missing')).status).toBe(404);
 });
 it('never executes inline on a public origin: without the durable binding the run stays queued',async()=>{
  const {sqlite,env}=database('https://omni101.app');const owner=await person(sqlite,'owner');const leadId=lead(sqlite);
  const id=await definition(env,owner,'Triage veloce',[node('start','TRIGGER','Avvio'),node('task','CREATE_TASK','Task'),node('end','END','Fine')],['start','task','end']);
  const created=await call(env,owner,'POST','/api/workflow-runs',{definitionId:id,leadId,idempotencyKey:'mission-run-0002'});
  expect(created.status).toBe(503);
  expect(one(sqlite,'SELECT status FROM workflow_runs').status).toBe('QUEUED');
  expect(one(sqlite,'SELECT count(*) n FROM workflow_run_steps').n).toBe(0);
  expect(one(sqlite,'SELECT count(*) n FROM tasks').n).toBe(0);
 });
 it('cancels a run waiting for approval, rejects its approval and refuses to resume it',async()=>{
  const {sqlite,env}=database('http://localhost:4174');const owner=await person(sqlite,'owner'),dev=await person(sqlite,'dev','DEVELOPER');const leadId=lead(sqlite);
  const id=await definition(env,owner,'Con approvazione',[node('start','TRIGGER','Avvio'),node('review','HUMAN_APPROVAL','Revisione del socio'),node('end','END','Fine')],['start','review','end']);
  await call(env,owner,'POST','/api/workflow-runs',{definitionId:id,leadId,idempotencyKey:'mission-run-0003'});
  const run=one(sqlite,'SELECT id,status FROM workflow_runs');
  expect(run.status).toBe('AWAITING_APPROVAL');
  expect(one(sqlite,"SELECT count(*) n FROM approvals WHERE status='PENDING'").n).toBe(1);
  const listed=(await call(env,owner,'GET','/api/mission-control')).body.runs.find((r:any)=>r.id===run.id);
  expect([listed.canCancel,listed.canResume]).toEqual([true,true]);
  const viewer=(await call(env,dev,'GET','/api/mission-control')).body;
  expect(viewer.capabilities.controlsEnabled).toBe(false);
  expect((await call(env,dev,'POST','/api/workflow-runs/'+run.id+'/cancel',{})).status).toBe(403);
  expect(one(sqlite,'SELECT status FROM workflow_runs WHERE id=?',run.id).status).toBe('AWAITING_APPROVAL');
  expect((await call(env,owner,'POST','/api/workflow-runs/'+run.id+'/cancel',{})).status).toBe(200);
  expect(one(sqlite,'SELECT status FROM workflow_runs WHERE id=?',run.id).status).toBe('CANCELLED');
  expect(one(sqlite,"SELECT status,reason FROM approvals WHERE resource_id=?",run.id)).toEqual({status:'REJECTED',reason:'Esecuzione annullata'});
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action='WORKFLOW_CANCELLED' AND resource_id=?",run.id).n).toBe(1);
  expect((await call(env,owner,'POST','/api/workflow-runs/'+run.id+'/cancel',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/workflow-runs/'+run.id+'/resume',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/workflow-runs/missing/cancel',{})).status).toBe(404);
  const approvalId=one(sqlite,'SELECT id FROM approvals WHERE resource_id=?',run.id).id;
  expect((await call(env,owner,'POST','/api/approvals/'+approvalId+'/decision',{decision:'APPROVED',reason:'Approvo comunque.'})).status).toBe(409);
 });
 it('stops a run cancelled between two nodes without letting a late step overwrite the cancellation',async()=>{
  const {sqlite,env}=database('http://localhost:4174');const owner=await person(sqlite,'owner');const leadId=lead(sqlite);
  const id=await definition(env,owner,'Tre passi',[node('start','TRIGGER','Avvio'),node('pause','TRANSFORM','Passo intermedio'),node('task','CREATE_TASK','Mai creato'),node('end','END','Fine')],['start','pause','task','end']);
  const run=(await call(env,owner,'POST','/api/workflow-runs',{definitionId:id,leadId,idempotencyKey:'mission-run-0004'})).body;
  sqlite.prepare("UPDATE workflow_runs SET status='QUEUED' WHERE id=?").run(run.id);
  sqlite.prepare('DELETE FROM workflow_run_steps WHERE run_id=?').run(run.id);
  sqlite.prepare("DELETE FROM tasks WHERE name='Mai creato'").run();
  const durable={async do<T>(name:string,callback:()=>Promise<T>){const value=await callback();if(name==='node-pause')sqlite.prepare("UPDATE workflow_runs SET status='CANCELLED',error='Annullata da test' WHERE id=?").run(run.id);return value}};
  await executeWorkflowRun(env,run.id,'omni101',durable);
  expect(one(sqlite,'SELECT status FROM workflow_runs WHERE id=?',run.id).status).toBe('CANCELLED');
  expect(sqlite.prepare('SELECT node_id FROM workflow_run_steps WHERE run_id=? ORDER BY rowid').all(run.id).map((r:any)=>r.node_id)).toEqual(['start','pause']);
  expect(one(sqlite,"SELECT count(*) n FROM tasks WHERE name='Mai creato'").n).toBe(0);
 });
});
describe('Mission Control: agent runs',()=>{
 function agentRun(sqlite:DatabaseSync,idValue:string,status:string,ageMs=0,extra:Record<string,unknown>={}){const t=Date.now()-ageMs;const t0=Date.now();sqlite.prepare("INSERT OR IGNORE INTO agent_definitions(id,organization_id,name,specialization,provider,model,scope,created_at,updated_at) VALUES('omni101:discovery-analyst','omni101','AI Discovery Analyst','Requisiti','nvidia','verified-free-model','authorized-brief-only',?,?)").run(t0,t0);sqlite.prepare('INSERT INTO agent_runs(id,organization_id,name,agent_id,status,input,reserved_cents,provider,model,error,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(idValue,'omni101','AI Discovery Analyst','omni101:discovery-analyst',status,JSON.stringify({brief:'Brief reale del cliente: portale prenotazioni con calendario.'}),Number(extra.reserved??50),'nvidia','verified-free-model',(extra.error as string)||null,t,t)}
 function budget(sqlite:DatabaseSync,reserved=50){const t=Date.now();sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,reserved_cents,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('budget','omni101',t-1000,t+86400000,500,reserved,t,t)}
 const reserved=(sqlite:DatabaseSync)=>one(sqlite,'SELECT reserved_cents r FROM agent_budgets').r as number;
 it('cancels only queued or orphaned runs, returns the reservation once and audits the decision',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner'),dev=await person(sqlite,'dev','DEVELOPER');budget(sqlite,150);
  agentRun(sqlite,'queued','QUEUED');agentRun(sqlite,'fresh','RUNNING');agentRun(sqlite,'orphan','RUNNING',11*60*1000);agentRun(sqlite,'done','AWAITING_APPROVAL');
  const rows=(await call(env,owner,'GET','/api/mission-control')).body.runs;
  const flags=(key:string)=>{const r=rows.find((x:any)=>x.id===key);return [r.canCancel,r.canRetry]};
  expect([flags('queued'),flags('fresh'),flags('orphan'),flags('done')]).toEqual([[true,false],[false,false],[true,false],[false,false]]);
  expect((await call(env,dev,'POST','/api/agent-runs/queued/cancel',{})).status).toBe(403);
  expect(reserved(sqlite)).toBe(150);
  expect((await call(env,owner,'POST','/api/agent-runs/fresh/cancel',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/agent-runs/done/cancel',{})).status).toBe(409);
  expect(reserved(sqlite)).toBe(150);
  expect((await call(env,owner,'POST','/api/agent-runs/queued/cancel',{})).status).toBe(200);
  expect(reserved(sqlite)).toBe(100);
  expect((await call(env,owner,'POST','/api/agent-runs/orphan/cancel',{})).status).toBe(200);
  expect(reserved(sqlite)).toBe(50);
  expect((await call(env,owner,'POST','/api/agent-runs/queued/cancel',{})).status).toBe(409);
  expect(reserved(sqlite)).toBe(50);
  expect(one(sqlite,"SELECT status,reserved_cents,error FROM agent_runs WHERE id='queued'")).toEqual({status:'CANCELLED',reserved_cents:0,error:'Annullata da owner'});
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action='AGENT_CANCELLED'").n).toBe(2);
  expect((await call(env,owner,'POST','/api/agent-runs/missing/cancel',{})).status).toBe(404);
 });
 it('retries a failed run through the ordinary agent path, links it and refuses duplicates',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner'),dev=await person(sqlite,'dev','DEVELOPER');budget(sqlite,0);
  agentRun(sqlite,'failed','FAILED',0,{error:'Il provider ha risposto HTTP 500',reserved:0});agentRun(sqlite,'waiting','AWAITING_APPROVAL');
  const provider=vi.fn(async(_url:string,_options?:RequestInit)=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({summary:'Requisiti chiari',deliverable:'Documento di discovery con requisiti e rischi.',risks:['Integrazione calendario'],nextSteps:['Conferma firma']})}}],usage:{prompt_tokens:120,completion_tokens:40}})));vi.stubGlobal('fetch',provider);
  expect((await call(env,dev,'POST','/api/agent-runs/failed/retry',{})).status).toBe(403);
  expect((await call(env,owner,'POST','/api/agent-runs/waiting/retry',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/agent-runs/missing/retry',{})).status).toBe(404);
  expect(provider).not.toHaveBeenCalled();
  const retried=await call(env,owner,'POST','/api/agent-runs/failed/retry',{});
  expect(retried.status).toBe(201);
  expect(provider).toHaveBeenCalledOnce();
  expect(JSON.parse(provider.mock.calls[0][1]!.body as string).messages[1].content).toContain('Brief reale del cliente');
  expect(retried.body.status).toBe('AWAITING_APPROVAL');
  expect(one(sqlite,'SELECT retry_of,status,tokens_used FROM agent_runs WHERE id=?',retried.body.id)).toEqual({retry_of:'failed',status:'AWAITING_APPROVAL',tokens_used:160});
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action='AGENT_RETRIED'").n).toBe(1);
  expect((await call(env,owner,'POST','/api/agent-runs/failed/retry',{})).status).toBe(409);
  expect(provider).toHaveBeenCalledOnce();
  const rows=(await call(env,owner,'GET','/api/mission-control')).body.runs;
  expect(rows.find((r:any)=>r.id===retried.body.id).retryOf).toBe('failed');
  // Artifact metadata is explicit about where the content lives until R2 is active.
  const detail=await call(env,owner,'GET','/api/agent-runs/'+retried.body.id);
  expect(detail.body.artifacts).toHaveLength(1);
  expect(detail.body.artifacts[0].size_bytes).toBeGreaterThan(0);
  const artifact=await call(env,owner,'GET','/api/artifacts/'+detail.body.artifacts[0].id);
  expect(artifact.body).toMatchObject({storage:'D1',limitBytes:921600});
  expect(artifact.body.content).toContain('Documento di discovery');
 });
 it('records a provider failure on retry without hiding it as success',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');budget(sqlite,0);agentRun(sqlite,'failed','FAILED',0,{reserved:0});
  vi.stubGlobal('fetch',vi.fn(async()=>new Response('upstream',{status:500})));
  const retried=await call(env,owner,'POST','/api/agent-runs/failed/retry',{});
  expect(retried.status).toBe(502);
  expect(one(sqlite,"SELECT count(*) n FROM agent_runs WHERE status='FAILED'").n).toBe(2);
  expect(one(sqlite,"SELECT count(*) n FROM agent_runs WHERE status='AWAITING_APPROVAL'").n).toBe(0);
 });
});
