import {z} from 'zod';
import {HttpError,digest,requireRole,type Env,type Identity} from './auth';
// Deterministic read-only tool operations.health: real tenant counts turned into priorities by declared rules. No LLM, no cost, no business writes, no notifications.
export const TOOL='operations.health',RULE_VERSION='operations.health/1',TIME_ZONE='Europe/Rome';
const SOURCES=['tasks','approvals','projects','workflow_runs'];
const STALE_RUNNING_MS=60000;
export type Metrics={openTasks:number;blockedTasks:number;openTasksWithDueDate:number;overdueTasks:number|null;pendingApprovals:number;activeProjects:number;activeProjectsWithoutOpenTasks:number|null;failedWorkflowRuns:number};
type Rule={id:string;priority:'HIGH'|'MEDIUM'|'LOW';applies:(m:Metrics)=>number|null;action:(n:number)=>string};
// Declared rules, in priority order. A rule fires only on a measured value; null (not measurable) never becomes zero.
export const RULES:Rule[]=[
 {id:'failed-workflows',priority:'HIGH',applies:m=>m.failedWorkflowRuns||null,action:n=>`Esaminare ${n} esecuzioni workflow fallite in /admin/agent-runs.`},
 {id:'blocked-tasks',priority:'HIGH',applies:m=>m.blockedTasks||null,action:n=>`Sbloccare ${n} attività bloccate.`},
 {id:'overdue-tasks',priority:'HIGH',applies:m=>m.overdueTasks||null,action:n=>`Ripianificare o chiudere ${n} attività scadute.`},
 {id:'pending-approvals',priority:'MEDIUM',applies:m=>m.pendingApprovals||null,action:n=>`Decidere ${n} approvazioni in attesa in /admin/approvals.`},
 {id:'idle-active-projects',priority:'MEDIUM',applies:m=>m.activeProjectsWithoutOpenTasks||null,action:n=>`Pianificare il prossimo passo per ${n} progetti attivi senza attività aperte.`},
 {id:'overdue-unmeasurable',priority:'LOW',applies:m=>m.openTasks>0&&m.openTasksWithDueDate===0?m.openTasks:null,action:n=>`Assegnare una scadenza a ${n} attività aperte: senza date i ritardi non sono misurabili.`},
];
export function localDate(at:number){return new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at))}
export async function measure(env:Env,org:string,at:number):Promise<{today:string;metrics:Metrics}>{
 const today=localDate(at),open="status<>'DONE'";
 // Every subquery is bound to the same organization, including the correlated one.
 const row=await env.DB.prepare(`SELECT
  (SELECT count(*) FROM tasks WHERE organization_id=? AND ${open}) AS openTasks,
  (SELECT count(*) FROM tasks WHERE organization_id=? AND status='BLOCKED') AS blockedTasks,
  (SELECT count(*) FROM tasks WHERE organization_id=? AND ${open} AND coalesce(due_date,'')<>'') AS openTasksWithDueDate,
  (SELECT count(*) FROM tasks WHERE organization_id=? AND ${open} AND coalesce(due_date,'')<>'' AND substr(due_date,1,10)<?) AS overdueTasks,
  (SELECT count(*) FROM approvals WHERE organization_id=? AND status='PENDING') AS pendingApprovals,
  (SELECT count(*) FROM projects WHERE organization_id=? AND status='ACTIVE') AS activeProjects,
  (SELECT count(*) FROM projects p WHERE p.organization_id=? AND p.status='ACTIVE' AND NOT EXISTS(SELECT 1 FROM tasks t WHERE t.organization_id=p.organization_id AND t.project_id=p.id AND t.${open})) AS activeProjectsWithoutOpenTasks,
  (SELECT count(*) FROM workflow_runs WHERE organization_id=? AND status IN ('FAILED','DISPATCH_FAILED')) AS failedWorkflowRuns`).bind(org,org,org,org,today,org,org,org,org).first<Record<string,number>>();
 if(!row)throw new Error('measure');
 const n=(k:string)=>Number(row[k]||0);
 return {today,metrics:{openTasks:n('openTasks'),blockedTasks:n('blockedTasks'),openTasksWithDueDate:n('openTasksWithDueDate'),overdueTasks:n('openTasksWithDueDate')?n('overdueTasks'):null,pendingApprovals:n('pendingApprovals'),activeProjects:n('activeProjects'),activeProjectsWithoutOpenTasks:n('activeProjects')?n('activeProjectsWithoutOpenTasks'):null,failedWorkflowRuns:n('failedWorkflowRuns')}};
}
export function recommend(metrics:Metrics){
 return RULES.flatMap(rule=>{const value=rule.applies(metrics);return value?[{rule:rule.id,priority:rule.priority,value,action:rule.action(value)}]:[]});
}
export async function checkup(env:Env,org:string,at:number){
 const {today,metrics}=await measure(env,org,at),recommendations=recommend(metrics);
 return {tool:TOOL,ruleVersion:RULE_VERSION,measuredAt:new Date(at).toISOString(),today,timeZone:TIME_ZONE,metrics,recommendations,attention:recommendations.filter(r=>r.priority!=='LOW').length,sources:SOURCES};
}
const asUuid=(hex:string)=>hex.slice(0,8)+'-'+hex.slice(8,12)+'-4'+hex.slice(13,16)+'-a'+hex.slice(17,20)+'-'+hex.slice(20,32);
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function body(request:Request){const raw=await request.text();if(raw.length>2000)throw new HttpError(413,'Contenuto troppo grande.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}
// POST /api/operations/checkup {requestKey}. Idempotent per organization+requestKey: the run id is derived from both, so a retry returns the stored result and never measures twice.
export async function runOperationsCheckup(request:Request,env:Env,actor:Identity,at=Date.now()){
 requireRole(actor,['OWNER','ADMIN','PROJECT_MANAGER']);
 const {requestKey}=z.object({requestKey:z.uuid()}).strict().parse(await body(request));
 const org=actor.orgId,runId=asUuid(await digest('operations.checkup:'+org+':'+requestKey)),artifactId=asUuid(await digest('operations.checkup:artifact:'+runId));
 const existing=await env.DB.prepare('SELECT status,requested_by,updated_at FROM agent_runs WHERE id=? AND organization_id=?').bind(runId,org).first<{status:string;requested_by:string|null;updated_at:number}>();
 if(existing&&existing.requested_by!==actor.id)throw new HttpError(409,'Chiave di richiesta già usata da un altro utente: generane una nuova.');
 if(existing?.status==='COMPLETED'){const artifact=await env.DB.prepare('SELECT content FROM agent_artifacts WHERE id=? AND organization_id=? AND run_id=?').bind(artifactId,org,runId).first<{content:string}>();if(!artifact)throw new HttpError(409,'Esecuzione completata senza risultato consultabile.');return json({runId,artifactId,replay:true,result:JSON.parse(artifact.content)})}
 // Each claim gets a fresh lease token stored in the run input. Every later write (completion, artifact, audit, failure) is fenced on that lease and status RUNNING,
 // so an abandoned attempt that wakes up after a reclaim can neither complete, fail nor audit the newer attempt's run.
 // ponytail: a RUNNING row older than 60 s is treated as abandoned and re-claimed; a lease expiry column would be the upgrade if checkups ever get slow.
 const lease=crypto.randomUUID(),fence="id=? AND organization_id=? AND status='RUNNING' AND json_extract(input,'$.lease')=?";
 const claim=existing
  ?await env.DB.prepare("UPDATE agent_runs SET status='RUNNING',error=NULL,input=json_set(input,'$.lease',?),updated_at=? WHERE id=? AND organization_id=? AND requested_by=? AND (status='FAILED' OR (status='RUNNING' AND updated_at<?))").bind(lease,at,runId,org,actor.id,at-STALE_RUNNING_MS).run()
  :await env.DB.prepare("INSERT OR IGNORE INTO agent_runs(id,organization_id,name,agent_id,status,input,output,cost_cents,reserved_cents,provider,model,tokens_used,requested_by,created_at,updated_at) VALUES(?,?,?,NULL,'RUNNING',?,NULL,0,0,'rules',?,0,?,?,?)").bind(runId,org,'Checkup operativo',JSON.stringify({tool:TOOL,requestKey,lease}),RULE_VERSION,actor.id,at,at).run();
 if(!claim.meta?.changes)throw new HttpError(409,'Checkup già in corso con questa chiave: riprova tra poco con la stessa chiave.');
 const mine="EXISTS(SELECT 1 FROM agent_runs WHERE id=? AND organization_id=? AND json_extract(input,'$.lease')=? AND status=?)";
 const audit=(action:string,details:unknown,condition:string,...params:unknown[])=>env.DB.prepare(`INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,'agent_runs',?,?,?,? WHERE ${condition}`).bind(crypto.randomUUID(),org,actor.id,action,runId,JSON.stringify(details),at,at,...params);
 // An attempt that lost its lease only records that it was superseded; the run belongs to the newer attempt.
 const superseded=(outcome:string)=>audit('OPERATIONS_CHECKUP_ATTEMPT_SUPERSEDED',{tool:TOOL,ruleVersion:RULE_VERSION,outcome},"NOT EXISTS(SELECT 1 FROM agent_runs WHERE id=? AND organization_id=? AND json_extract(input,'$.lease')=?)",runId,org,lease);
 const outcome=async()=>env.DB.prepare("SELECT status,json_extract(input,'$.lease') AS lease FROM agent_runs WHERE id=? AND organization_id=?").bind(runId,org).first<{status:string;lease:string|null}>();
 let result:Awaited<ReturnType<typeof checkup>>|undefined;
 try{
  result=await checkup(env,org,at);
  const content=JSON.stringify(result);
  // Completion first, then artifact and audit only if this lease is the one that completed: COMPLETED never exists without its stored result, and a stale success writes nothing.
  await env.DB.batch([
   env.DB.prepare(`UPDATE agent_runs SET status='COMPLETED',output=?,completed_at=?,updated_at=? WHERE ${fence}`).bind(JSON.stringify({artifactId,attention:result.attention,ruleVersion:RULE_VERSION}),at,at,runId,org,lease),
   env.DB.prepare(`INSERT INTO agent_artifacts(id,organization_id,run_id,name,kind,content,version,sha256,created_at,updated_at) SELECT ?,?,?,?,?,?,1,?,?,? WHERE ${mine}`).bind(artifactId,org,runId,'Checkup operativo · '+result.today,'TOOL_RESULT',content,await digest(content),at,at,runId,org,lease,'COMPLETED'),
   audit('OPERATIONS_CHECKUP_COMPLETED',{tool:TOOL,ruleVersion:RULE_VERSION,artifactId,attention:result.attention},mine,runId,org,lease,'COMPLETED'),
   superseded('success'),
  ]);
 }catch(error){
  await env.DB.batch([
   env.DB.prepare(`UPDATE agent_runs SET status='FAILED',error='Checkup non completato.',updated_at=? WHERE ${fence}`).bind(at,runId,org,lease),
   audit('OPERATIONS_CHECKUP_FAILED',{tool:TOOL,ruleVersion:RULE_VERSION},mine,runId,org,lease,'FAILED'),
   superseded('failure'),
  ]);
  if(error instanceof HttpError)throw error;
  throw new HttpError(503,'Checkup non completato: riprova con la stessa chiave.');
 }
 const after=await outcome();
 if(after?.status==='COMPLETED'&&after.lease===lease)return json({runId,artifactId,replay:false,result},201);
 // This attempt was superseded. If the newer attempt already completed, the key's stored result is the answer; otherwise the key is still in progress.
 if(after?.status==='COMPLETED'){const artifact=await env.DB.prepare('SELECT content FROM agent_artifacts WHERE id=? AND organization_id=? AND run_id=?').bind(artifactId,org,runId).first<{content:string}>();if(artifact)return json({runId,artifactId,replay:true,result:JSON.parse(artifact.content)})}
 throw new HttpError(409,'Tentativo superato da un nuovo tentativo con la stessa chiave: riprova con la stessa chiave.');
}
