import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const now=()=>Date.now();const id=()=>crypto.randomUUID();
const managers:Role[]=['OWNER','ADMIN','PROJECT_MANAGER'];
const staff:Role[]=[...managers,'DEVELOPER','DESIGNER','SALES','FINANCE'];
// A RUNNING agent call lives inside one request (timeout 25 s): beyond this age it is orphaned and may be cancelled.
export const STALE_RUNNING_MS=10*60*1000;
// Artifact content stays in D1 until R2 is activated; a D1 row cannot exceed 2 MB.
export const ARTIFACT_LIMIT_BYTES=900*1024;
export const missionCapabilities={pause:false,cancel:true,retry:true,resume:true,pauseReason:'Le chiamate agente sono singole richieste e i workflow durevoli si fermano da soli in attesa di approvazione: una pausa manuale non è supportata dal runtime.'};
const terminalWorkflow=['COMPLETED','CANCELLED'];
function stmt(env:Env,sql:string,...values:(string|number|null)[]){return env.DB.prepare(sql).bind(...values)}
type AgentRun={id:string;name:string|null;agent_id:string|null;status:string;provider:string|null;model:string|null;tokens_used:number;cost_cents:number;error:string|null;retry_of:string|null;created_at:number;updated_at:number};
type WorkflowRun={id:string;name:string|null;status:string;current_node:string|null;error:string|null;created_at:number;updated_at:number;approval_id?:string|null;approval_status?:string|null};
export function agentControls(run:{status:string;updated_at:number},at=now()){
 const stale=run.status==='RUNNING'&&at-run.updated_at>STALE_RUNNING_MS;
 return {canCancel:run.status==='QUEUED'||stale,canRetry:['FAILED','CANCELLED'].includes(run.status),canResume:false};
}
export function workflowControls(run:{status:string;approval_id?:string|null;approval_status?:string|null}){
 return {canCancel:!terminalWorkflow.includes(run.status),canRetry:false,canResume:run.status==='AWAITING_APPROVAL'?!!run.approval_id&&run.approval_status==='APPROVED':['FAILED','QUEUED','DISPATCH_FAILED'].includes(run.status),approvalId:run.status==='AWAITING_APPROVAL'?run.approval_id||null:null,approvalStatus:run.status==='AWAITING_APPROVAL'?run.approval_status||null:null};
}
export async function workflowRunControls(env:Env,orgId:string,run:{id:string;status:string;current_node:string|null}){
 const approval=run.status==='AWAITING_APPROVAL'&&run.current_node?await stmt(env,"SELECT id,status FROM approvals WHERE id=? AND organization_id=? AND resource_type='workflow_runs' AND resource_id=?",run.id+':'+run.current_node,orgId,run.id).first<{id:string;status:string}>():null;
 return workflowControls({...run,approval_id:approval?.id,approval_status:approval?.status});
}
async function overview(env:Env,actor:Identity){
 requireRole(actor,staff);
 const [agents,workflows,approvals]=await Promise.all([
  stmt(env,'SELECT id,name,agent_id,status,provider,model,tokens_used,cost_cents,error,retry_of,created_at,updated_at FROM agent_runs WHERE organization_id=? ORDER BY created_at DESC LIMIT 60',actor.orgId).all<AgentRun>(),
  stmt(env,"SELECT r.id,coalesce(d.name,'Workflow') name,r.status,r.current_node,r.error,r.created_at,r.updated_at,a.id approval_id,a.status approval_status FROM workflow_runs r LEFT JOIN workflow_definitions d ON d.id=r.definition_id AND d.organization_id=r.organization_id LEFT JOIN approvals a ON a.id=r.id||':'||r.current_node AND a.organization_id=r.organization_id AND a.resource_type='workflow_runs' AND a.resource_id=r.id WHERE r.organization_id=? ORDER BY r.created_at DESC LIMIT 60",actor.orgId).all<WorkflowRun>(),
  stmt(env,"SELECT count(*) n FROM approvals WHERE organization_id=? AND status='PENDING'",actor.orgId).first<{n:number}>()
 ]);
 const at=now();
 const rows=[
  ...agents.results.map(run=>({kind:'agent' as const,id:run.id,name:run.name||run.agent_id||'Agente',status:run.status,step:null as string|null,provider:run.provider,model:run.model,tokens:run.tokens_used||0,costCents:run.cost_cents||0,error:run.error,retryOf:run.retry_of,createdAt:run.created_at,updatedAt:run.updated_at,...agentControls(run,at)})),
  ...workflows.results.map(run=>({kind:'workflow' as const,id:run.id,name:run.name||'Workflow',status:run.status,step:run.current_node,provider:null as string|null,model:null as string|null,tokens:0,costCents:0,error:run.error,retryOf:null as string|null,createdAt:run.created_at,updatedAt:run.updated_at,...workflowControls(run)}))
 ].sort((a,b)=>b.createdAt-a.createdAt).slice(0,100);
 const count=(statuses:string[])=>rows.filter(run=>statuses.includes(run.status)).length;
 return {
  runs:rows,
  queue:{queued:count(['QUEUED','DISPATCHING']),running:count(['RUNNING']),awaitingApproval:count(['AWAITING_APPROVAL']),failed:count(['FAILED','DISPATCH_FAILED']),pendingApprovals:approvals?.n||0},
  capabilities:{...missionCapabilities,controlsEnabled:managers.includes(actor.role)},
  storage:{artifacts:'D1',r2:!!env.MEDIA,limitBytes:ARTIFACT_LIMIT_BYTES,note:env.MEDIA?'Storage R2 attivo.':'R2 non è attivo: metadati e contenuto degli artefatti restano in D1, fino a '+Math.round(ARTIFACT_LIMIT_BYTES/1024)+' KB ciascuno.'}
 };
}
async function workflowDetail(env:Env,actor:Identity,runId:string){
 requireRole(actor,staff);
 const run=await stmt(env,"SELECT r.id,coalesce(d.name,'Workflow') name,r.status,r.current_node,r.error,r.input,r.requested_by,r.created_at,r.updated_at FROM workflow_runs r LEFT JOIN workflow_definitions d ON d.id=r.definition_id AND d.organization_id=r.organization_id WHERE r.id=? AND r.organization_id=?",runId,actor.orgId).first<WorkflowRun&{input:string}>();
 if(!run)throw new HttpError(404,'Esecuzione non trovata.');
 const steps=(await stmt(env,'SELECT id,node_id,kind,status,output,error,attempts,duration_ms,created_at FROM workflow_run_steps WHERE run_id=? AND organization_id=? ORDER BY created_at',runId,actor.orgId).all<{id:string;node_id:string;kind:string;status:string;output:string|null;error:string|null;attempts:number;duration_ms:number|null;created_at:number}>()).results;
 // A step output that names a record is an artifact of the run: resolve it from the table that owns it.
 const owners:Record<string,[string,string,string]>={taskId:['TASK','tasks','/admin/tasks'],quoteId:['PROPOSAL','quotes','/admin/proposals'],notificationId:['NOTIFICATION','notifications','/admin/inbox'],approvalId:['APPROVAL','approvals','/admin/approvals']};
 const artifacts:{kind:string;id:string;name:string|null;status:string|null;route:string;stepNode:string}[]=[];
 for(const step of steps){
  let output:Record<string,unknown>={};try{output=JSON.parse(step.output||'{}')}catch{}
  for(const [key,[kind,table,route]] of Object.entries(owners)){
   const value=output[key];if(typeof value!=='string')continue;
   const row=await stmt(env,`SELECT id,name,status FROM ${table} WHERE id=? AND organization_id=?`,value,actor.orgId).first<{id:string;name:string|null;status:string|null}>();
   if(row)artifacts.push({kind,id:row.id,name:row.name,status:row.status,route:route+'?record='+encodeURIComponent(row.id),stepNode:step.node_id});
  }
 }
 const events=(await stmt(env,'SELECT id,action,details,created_at FROM audit_logs WHERE resource_id=? AND organization_id=? ORDER BY created_at',runId,actor.orgId).all()).results;
 return {run:{...run,kind:'workflow',...await workflowRunControls(env,actor.orgId,run)},steps,artifacts,events,storage:{artifacts:'D1',r2:!!env.MEDIA}};
}
async function cancelAgentRun(env:Env,actor:Identity,runId:string){
 requireRole(actor,managers);
 const run=await stmt(env,'SELECT status,updated_at FROM agent_runs WHERE id=? AND organization_id=?',runId,actor.orgId).first<{status:string;updated_at:number}>();
 if(!run)throw new HttpError(404,'Esecuzione non trovata.');
 if(!agentControls(run).canCancel)throw new HttpError(409,run.status==='RUNNING'?'La chiamata è ancora in corso: attendi l’esito o il timeout.':'Questa esecuzione non può essere annullata.');
 const t=now(),message='Annullata da '+actor.name;
 await env.DB.batch([
  // The reservation returns to the budget only while this run still holds it.
  stmt(env,"UPDATE agent_budgets SET reserved_cents=max(0,reserved_cents-coalesce((SELECT reserved_cents FROM agent_runs WHERE id=? AND organization_id=? AND status IN ('QUEUED','RUNNING')),0)),updated_at=? WHERE organization_id=? AND period_start<=? AND period_end>?",runId,actor.orgId,t,actor.orgId,t,t),
  stmt(env,"UPDATE agent_runs SET status='CANCELLED',error=?,reserved_cents=0,completed_at=?,updated_at=? WHERE id=? AND organization_id=? AND status IN ('QUEUED','RUNNING')",message,t,t,runId,actor.orgId),
  stmt(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'AGENT_CANCELLED','agent-runs',?,?,?,? WHERE EXISTS (SELECT 1 FROM agent_runs WHERE id=? AND organization_id=? AND status='CANCELLED' AND updated_at=?)",id(),actor.orgId,actor.id,runId,JSON.stringify({previous:run.status}),t,t,runId,actor.orgId,t)
 ]);
 const after=await stmt(env,'SELECT status,updated_at FROM agent_runs WHERE id=? AND organization_id=?',runId,actor.orgId).first<{status:string;updated_at:number}>();
 if(after?.status!=='CANCELLED'||after.updated_at!==t)throw new HttpError(409,'Esecuzione già cambiata da un’altra richiesta.');
 return {id:runId,status:'CANCELLED'};
}
async function cancelWorkflowRun(env:Env,actor:Identity,runId:string){
 requireRole(actor,managers);
 const run=await stmt(env,'SELECT status FROM workflow_runs WHERE id=? AND organization_id=?',runId,actor.orgId).first<{status:string}>();
 if(!run)throw new HttpError(404,'Esecuzione non trovata.');
 if(!workflowControls(run).canCancel)throw new HttpError(409,'Questa esecuzione è già conclusa.');
 const t=now(),message='Annullata da '+actor.name;
 const claim="EXISTS (SELECT 1 FROM workflow_runs WHERE id=? AND organization_id=? AND status='CANCELLED' AND updated_at=?)";
 await env.DB.batch([
  stmt(env,"UPDATE workflow_runs SET status='CANCELLED',error=?,updated_at=? WHERE id=? AND organization_id=? AND status NOT IN ('COMPLETED','CANCELLED')",message,t,runId,actor.orgId),
  // An approval waiting on a cancelled run can no longer unblock anything.
  stmt(env,"UPDATE approvals SET status='REJECTED',reason='Esecuzione annullata',decided_by=?,decided_at=?,updated_at=?,version=version+1 WHERE organization_id=? AND resource_type='workflow_runs' AND resource_id=? AND status='PENDING' AND "+claim,actor.id,t,t,actor.orgId,runId,runId,actor.orgId,t),
  stmt(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'WORKFLOW_CANCELLED','workflow_runs',?,?,?,? WHERE "+claim,id(),actor.orgId,actor.id,runId,JSON.stringify({previous:run.status}),t,t,runId,actor.orgId,t)
 ]);
 const after=await stmt(env,'SELECT status,updated_at FROM workflow_runs WHERE id=? AND organization_id=?',runId,actor.orgId).first<{status:string;updated_at:number}>();
 if(after?.status!=='CANCELLED'||after.updated_at!==t)throw new HttpError(409,'Esecuzione già cambiata da un’altra richiesta.');
 return {id:runId,status:'CANCELLED'};
}
export async function handleMission(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname,method=request.method;
 let match:RegExpMatchArray|null;
 if(method==='GET'&&path==='/api/mission-control')return json(await overview(env,actor));
 if(method==='GET'&&(match=path.match(/^\/api\/mission-control\/workflow\/([^/]+)$/)))return json(await workflowDetail(env,actor,match[1]));
 if(method==='POST'&&(match=path.match(/^\/api\/agent-runs\/([^/]+)\/cancel$/)))return json(await cancelAgentRun(env,actor,match[1]));
 if(method==='POST'&&(match=path.match(/^\/api\/workflow-runs\/([^/]+)\/cancel$/)))return json(await cancelWorkflowRun(env,actor,match[1]));
 return null;
}
