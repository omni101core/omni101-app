import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const now=()=>Date.now();const id=()=>crypto.randomUUID();
const managers:Role[]=['OWNER','ADMIN','PROJECT_MANAGER'];
const makers:Role[]=[...managers,'DEVELOPER','DESIGNER'];
const staff:Role[]=[...makers,'SALES','FINANCE'];
type Stage='PLANNING'|'EXECUTION'|'QA'|'DELIVERY'|'MAINTENANCE';
function stmt(env:Env,sql:string,...values:(string|number|null)[]){return env.DB.prepare(sql).bind(...values)}
async function readBody(request:Request){
 const raw=await request.text();if(raw.length>65536)throw new HttpError(413,'Richiesta troppo grande.');
 if(!raw.trim())return {};
 try{return JSON.parse(raw) as unknown}catch{throw new HttpError(400,'JSON non valido.')}
}
function audit(env:Env,actor:Identity,action:string,resource:string,resourceId:string,details:unknown={}){
 return stmt(env,'INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',id(),actor.orgId,actor.id,action,resource,resourceId,JSON.stringify(details),now(),now());
}
function pipelineEvent(env:Env,actor:Identity,projectId:string,stage:Stage,type:string,details:unknown={}){
 return stmt(env,'INSERT INTO pipeline_events(id,organization_id,project_id,stage,event_type,actor_id,details,created_at) VALUES(?,?,?,?,?,?,?,?)',id(),actor.orgId,projectId,stage,type,actor.id,JSON.stringify(details),now());
}
function notify(env:Env,org:string,name:string,text:string){
 return stmt(env,"INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) VALUES(?,?,?,?,'UNREAD',?,?)",id(),org,name,text,now(),now());
}
// A decision writes under a claim: later statements only apply while this exact decision owns the row.
const reviewClaim="EXISTS (SELECT 1 FROM qa_reviews WHERE id=? AND organization_id=? AND status=? AND reviewer_id=? AND decided_at=?)";

async function requestQa(request:Request,env:Env,actor:Identity,taskId:string){
 requireRole(actor,makers);
 const data=z.object({notes:z.string().trim().max(1000).optional()}).strict().parse(await readBody(request));
 const task=await stmt(env,'SELECT id,name,project_id,status,kind FROM tasks WHERE id=? AND organization_id=?',taskId,actor.orgId).first<{id:string;name:string;project_id:string|null;status:string;kind:string}>();
 if(!task)throw new HttpError(404,'Attività non trovata.');
 if(task.kind!=='WORK')throw new HttpError(409,'Le attività di QA non richiedono un’altra QA.');
 if(!task.project_id)throw new HttpError(409,'Associa l’attività a un progetto prima della QA.');
 if(!['IN_PROGRESS','REVIEW'].includes(task.status))throw new HttpError(409,'Porta l’attività in lavorazione prima di richiedere la QA.');
 const project=await stmt(env,'SELECT id FROM projects WHERE id=? AND organization_id=?',task.project_id,actor.orgId).first();
 if(!project)throw new HttpError(409,'Progetto dell’attività non disponibile.');
 const reviewId=id(),qaTaskId=id(),t=now();
 try{
  await env.DB.batch([
   stmt(env,"UPDATE tasks SET status='REVIEW',updated_at=? WHERE id=? AND organization_id=?",t,taskId,actor.orgId),
   stmt(env,"INSERT INTO tasks(id,organization_id,name,project_id,priority,description,status,kind,qa_for,created_at,updated_at) VALUES(?,?,?,?,'HIGH',?,'TODO','QA',?,?,?)",qaTaskId,actor.orgId,'QA / '+task.name,task.project_id,'Verifica «'+task.name+'» sui criteri di accettazione. Esito: superata o rifiutata, sempre motivato.'+(data.notes?'\nNote del richiedente: '+data.notes:''),taskId,t,t),
   stmt(env,"INSERT INTO qa_reviews(id,organization_id,project_id,task_id,qa_task_id,status,requested_by,created_at,updated_at) VALUES(?,?,?,?,?,'PENDING',?,?,?)",reviewId,actor.orgId,task.project_id,taskId,qaTaskId,actor.id,t,t),
   pipelineEvent(env,actor,task.project_id,'QA','QA_REQUESTED',{taskId,qaTaskId,reviewId}),
   audit(env,actor,'QA_REQUESTED','qa_reviews',reviewId,{taskId,qaTaskId}),
   notify(env,actor.orgId,'QA richiesta / '+task.name,'Una verifica QA attende un esito motivato.')
  ]);
 }catch(error){
  if(await stmt(env,"SELECT id FROM qa_reviews WHERE task_id=? AND organization_id=? AND status='PENDING'",taskId,actor.orgId).first())throw new HttpError(409,'Esiste già una QA in attesa per questa attività.');
  throw error;
 }
 return {reviewId,qaTaskId,status:'PENDING'};
}

async function decideQa(request:Request,env:Env,actor:Identity,reviewId:string){
 requireRole(actor,makers);
 const data=z.object({outcome:z.enum(['PASS','REJECT']),notes:z.string().trim().min(5).max(2000)}).strict().parse(await readBody(request));
 const review=await stmt(env,'SELECT id,project_id,task_id,qa_task_id,status FROM qa_reviews WHERE id=? AND organization_id=?',reviewId,actor.orgId).first<{id:string;project_id:string;task_id:string;qa_task_id:string;status:string}>();
 if(!review)throw new HttpError(404,'QA non trovata.');
 if(review.status!=='PENDING')throw new HttpError(409,'Questa QA ha già un esito.');
 const t=now(),pass=data.outcome==='PASS',claimArgs=[reviewId,actor.orgId,data.outcome,actor.id,t];
 const label=pass?'QA superata: ':'QA rifiutata: ';
 await env.DB.batch([
  stmt(env,"UPDATE qa_reviews SET status=?,notes=?,reviewer_id=?,decided_at=?,updated_at=? WHERE id=? AND organization_id=? AND status='PENDING'",data.outcome,data.notes,actor.id,t,t,reviewId,actor.orgId),
  // Rejection sends the work back to IN_PROGRESS; approval is the only path that closes it as DONE.
  stmt(env,"UPDATE tasks SET status=?,description=trim(coalesce(description,'')||char(10)||?),updated_at=? WHERE id=? AND organization_id=? AND "+reviewClaim,pass?'DONE':'IN_PROGRESS',label+data.notes,t,review.task_id,actor.orgId,...claimArgs),
  stmt(env,"UPDATE tasks SET status='DONE',description=?,updated_at=? WHERE id=? AND organization_id=? AND "+reviewClaim,'Esito: '+(pass?'SUPERATA':'RIFIUTATA')+'. '+data.notes,t,review.qa_task_id,actor.orgId,...claimArgs),
  stmt(env,"INSERT INTO pipeline_events(id,organization_id,project_id,stage,event_type,actor_id,details,created_at) SELECT ?,?,?,'QA',?,?,?,? WHERE "+reviewClaim,id(),actor.orgId,review.project_id,pass?'QA_PASSED':'QA_REJECTED',actor.id,JSON.stringify({taskId:review.task_id,reviewId,notes:data.notes}),t,...claimArgs),
  stmt(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,'qa_reviews',?,?,?,? WHERE "+reviewClaim,id(),actor.orgId,actor.id,pass?'QA_PASSED':'QA_REJECTED',reviewId,JSON.stringify({taskId:review.task_id,notes:data.notes}),t,t,...claimArgs),
  stmt(env,"INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) SELECT ?,?,?,?,'UNREAD',?,? WHERE "+reviewClaim,id(),actor.orgId,(pass?'QA superata':'QA rifiutata')+' / '+reviewId.slice(0,8),data.notes,t,t,...claimArgs)
 ]);
 const decided=await stmt(env,'SELECT status,reviewer_id,decided_at FROM qa_reviews WHERE id=? AND organization_id=?',reviewId,actor.orgId).first<{status:string;reviewer_id:string|null;decided_at:number|null}>();
 if(!decided||decided.status!==data.outcome||decided.reviewer_id!==actor.id||decided.decided_at!==t)throw new HttpError(409,'QA già decisa da un’altra richiesta.');
 return {reviewId,outcome:data.outcome,taskStatus:pass?'DONE':'IN_PROGRESS'};
}

async function createDeliverable(request:Request,env:Env,actor:Identity,projectId:string){
 requireRole(actor,makers);
 const data=z.object({name:z.string().trim().min(2).max(160),body:z.string().trim().min(1).max(30000)}).strict().parse(await readBody(request));
 const project=await stmt(env,'SELECT id FROM projects WHERE id=? AND organization_id=?',projectId,actor.orgId).first();
 if(!project)throw new HttpError(404,'Progetto non trovato.');
 const deliverableId=id(),t=now();
 await env.DB.batch([
  stmt(env,"INSERT INTO deliverables(id,organization_id,name,project_id,status,version,body,client_visible,created_at,updated_at) VALUES(?,?,?,?,'DRAFT',1,?,0,?,?)",deliverableId,actor.orgId,data.name,projectId,data.body,t,t),
  pipelineEvent(env,actor,projectId,'DELIVERY','DELIVERABLE_DRAFTED',{deliverableId,name:data.name}),
  audit(env,actor,'DELIVERABLE_DRAFTED','deliverables',deliverableId,{projectId})
 ]);
 return {id:deliverableId,status:'DRAFT'};
}

async function deliver(env:Env,actor:Identity,deliverableId:string){
 requireRole(actor,managers);
 const row=await stmt(env,'SELECT d.id,d.name,d.status,d.project_id,p.client_id FROM deliverables d JOIN projects p ON p.id=d.project_id AND p.organization_id=d.organization_id WHERE d.id=? AND d.organization_id=?',deliverableId,actor.orgId).first<{id:string;name:string;status:string;project_id:string;client_id:string|null}>();
 if(!row)throw new HttpError(404,'Deliverable non trovato.');
 if(!['DRAFT','CHANGES_REQUESTED'].includes(row.status))throw new HttpError(409,'Questa consegna è già stata inviata al cliente.');
 if(!row.client_id)throw new HttpError(409,'Associa un cliente al progetto prima della consegna.');
 const gates=await stmt(env,"SELECT (SELECT count(*) FROM tasks WHERE organization_id=? AND project_id=? AND kind='WORK' AND status<>'DONE') openWork,(SELECT count(*) FROM qa_reviews WHERE organization_id=? AND project_id=? AND status='PENDING') pendingQa,(SELECT count(*) FROM qa_reviews WHERE organization_id=? AND project_id=? AND status='PASS') passedQa",actor.orgId,row.project_id,actor.orgId,row.project_id,actor.orgId,row.project_id).first<{openWork:number;pendingQa:number;passedQa:number}>();
 if(gates?.pendingQa)throw new HttpError(409,'La QA è ancora in attesa di un esito.');
 if(gates?.openWork)throw new HttpError(409,'Restano '+gates.openWork+' attività non completate: consegna bloccata.');
 if(!gates?.passedQa)throw new HttpError(409,'Nessuna QA superata: la consegna richiede almeno una verifica.');
 const t=now();
 await env.DB.batch([
  stmt(env,"UPDATE deliverables SET status='DELIVERED',client_visible=1,delivered_at=?,version=version+(CASE WHEN status='CHANGES_REQUESTED' THEN 1 ELSE 0 END),updated_at=? WHERE id=? AND organization_id=? AND status IN ('DRAFT','CHANGES_REQUESTED')",t,t,deliverableId,actor.orgId),
  stmt(env,"UPDATE projects SET visibility='CLIENT',status=CASE WHEN status IN ('PLANNING','ACTIVE') THEN 'REVIEW' ELSE status END,updated_at=? WHERE id=? AND organization_id=?",t,row.project_id,actor.orgId),
  pipelineEvent(env,actor,row.project_id,'DELIVERY','DELIVERED',{deliverableId}),
  audit(env,actor,'DELIVERABLE_DELIVERED','deliverables',deliverableId,{projectId:row.project_id})
 ]);
 const after=await stmt(env,'SELECT status,delivered_at,version FROM deliverables WHERE id=? AND organization_id=?',deliverableId,actor.orgId).first<{status:string;delivered_at:number|null;version:number}>();
 if(after?.status!=='DELIVERED'||after.delivered_at!==t)throw new HttpError(409,'Consegna già gestita da un’altra richiesta.');
 return {id:deliverableId,status:'DELIVERED',version:after.version};
}

async function clientDecision(request:Request,env:Env,actor:Identity,deliverableId:string){
 if(actor.role!=='CLIENT'||!actor.clientId)throw new HttpError(403,'Questo spazio è riservato ai clienti invitati.');
 const data=z.object({decision:z.enum(['APPROVED','CHANGES_REQUESTED']),note:z.string().trim().max(2000).optional()}).strict().parse(await readBody(request));
 if(data.decision==='CHANGES_REQUESTED'&&(data.note||'').length<5)throw new HttpError(400,'Indica cosa va modificato.');
 // Foreign or hidden deliverables are indistinguishable from missing ones.
 const row=await stmt(env,'SELECT d.id,d.name,d.status,d.project_id FROM deliverables d JOIN projects p ON p.id=d.project_id AND p.organization_id=d.organization_id WHERE d.id=? AND d.organization_id=? AND p.client_id=? AND d.client_visible=1',deliverableId,actor.orgId,actor.clientId).first<{id:string;name:string;status:string;project_id:string}>();
 if(!row)throw new HttpError(404,'Deliverable non trovato.');
 if(row.status!=='DELIVERED')throw new HttpError(409,'Questo deliverable non attende una tua decisione.');
 const t=now(),approved=data.decision==='APPROVED';
 const claim="EXISTS (SELECT 1 FROM deliverables WHERE id=? AND organization_id=? AND status=? AND approved_by=? AND approved_at=?)",claimArgs=[deliverableId,actor.orgId,data.decision,actor.id,t];
 const statements=[
  stmt(env,"UPDATE deliverables SET status=?,approved_by=?,approved_at=?,client_note=?,updated_at=? WHERE id=? AND organization_id=? AND status='DELIVERED'",data.decision,actor.id,t,data.note||null,t,deliverableId,actor.orgId),
  stmt(env,"INSERT INTO pipeline_events(id,organization_id,project_id,stage,event_type,actor_id,details,created_at) SELECT ?,?,?,'DELIVERY',?,?,?,? WHERE "+claim,id(),actor.orgId,row.project_id,approved?'CLIENT_APPROVED':'CLIENT_CHANGES_REQUESTED',actor.id,JSON.stringify({deliverableId,note:data.note||null}),t,...claimArgs),
  stmt(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,'deliverables',?,?,?,? WHERE "+claim,id(),actor.orgId,actor.id,approved?'DELIVERABLE_APPROVED_BY_CLIENT':'DELIVERABLE_CHANGES_REQUESTED',deliverableId,JSON.stringify({projectId:row.project_id}),t,t,...claimArgs),
  stmt(env,"INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) SELECT ?,?,?,?,'UNREAD',?,? WHERE "+claim,id(),actor.orgId,(approved?'Consegna approvata / ':'Modifiche richieste / ')+row.name,data.note||'Il cliente ha approvato la consegna.',t,t,...claimArgs)
 ];
 if(approved)statements.push(stmt(env,"UPDATE projects SET status='COMPLETED',updated_at=? WHERE id=? AND organization_id=? AND NOT EXISTS (SELECT 1 FROM deliverables WHERE project_id=? AND organization_id=? AND status<>'APPROVED') AND "+claim,t,row.project_id,actor.orgId,row.project_id,actor.orgId,...claimArgs));
 else statements.push(
  stmt(env,"INSERT INTO tasks(id,organization_id,name,project_id,priority,description,status,kind,created_at,updated_at) SELECT ?,?,?,?,'HIGH',?,'TODO','WORK',?,? WHERE "+claim,id(),actor.orgId,'Revisione cliente / '+row.name,row.project_id,data.note||'',t,t,...claimArgs),
  stmt(env,"UPDATE projects SET status='ACTIVE',updated_at=? WHERE id=? AND organization_id=? AND "+claim,t,row.project_id,actor.orgId,...claimArgs)
 );
 await env.DB.batch(statements);
 const after=await stmt(env,'SELECT status,approved_by,approved_at FROM deliverables WHERE id=? AND organization_id=?',deliverableId,actor.orgId).first<{status:string;approved_by:string|null;approved_at:number|null}>();
 if(after?.status!==data.decision||after.approved_by!==actor.id||after.approved_at!==t)throw new HttpError(409,'Decisione già registrata da un’altra richiesta.');
 return {id:deliverableId,status:data.decision};
}

async function openTicket(request:Request,env:Env,actor:Identity){
 if(actor.role!=='CLIENT'||!actor.clientId)throw new HttpError(403,'Questo spazio è riservato ai clienti invitati.');
 const data=z.object({projectId:z.string().min(1).max(200),name:z.string().trim().min(3).max(120),description:z.string().trim().min(10).max(4000),priority:z.enum(['LOW','NORMAL','HIGH']).default('NORMAL')}).strict().parse(await readBody(request));
 const project=await stmt(env,"SELECT id,name FROM projects WHERE id=? AND organization_id=? AND client_id=? AND visibility='CLIENT'",data.projectId,actor.orgId,actor.clientId).first<{id:string;name:string}>();
 if(!project)throw new HttpError(404,'Progetto non trovato.');
 const open=await stmt(env,"SELECT count(*) n FROM issues WHERE organization_id=? AND client_id=? AND status IN ('OPEN','IN_PROGRESS')",actor.orgId,actor.clientId).first<{n:number}>();
 if((open?.n||0)>=20)throw new HttpError(429,'Hai già molte richieste aperte. Attendi la risposta dello studio.');
 const ticketId=id(),t=now();
 await env.DB.batch([
  stmt(env,"INSERT INTO issues(id,organization_id,project_id,name,description,status,client_id,created_by,priority,created_at,updated_at) VALUES(?,?,?,?,?,'OPEN',?,?,?,?,?)",ticketId,actor.orgId,project.id,data.name,data.description,actor.clientId,actor.id,data.priority,t,t),
  stmt(env,'INSERT INTO pipeline_events(id,organization_id,project_id,stage,event_type,actor_id,details,created_at) VALUES(?,?,?,?,?,?,?,?)',id(),actor.orgId,project.id,'MAINTENANCE','TICKET_OPENED',actor.id,JSON.stringify({ticketId,priority:data.priority}),t),
  audit(env,actor,'TICKET_OPENED','issues',ticketId,{projectId:project.id,priority:data.priority}),
  notify(env,actor.orgId,'Ticket cliente / '+project.name,data.name)
 ]);
 return {id:ticketId,status:'OPEN'};
}

async function pipelineOf(env:Env,actor:Identity,projectId:string){
 requireRole(actor,staff);
 const project=await stmt(env,'SELECT id,name,status,visibility,client_id,description FROM projects WHERE id=? AND organization_id=?',projectId,actor.orgId).first<{id:string;name:string;status:string;visibility:string;client_id:string|null}>();
 if(!project)throw new HttpError(404,'Progetto non trovato.');
 const [tasks,reviews,deliverables,tickets,events,link]=await Promise.all([
  stmt(env,'SELECT id,name,status,kind,qa_for,priority FROM tasks WHERE organization_id=? AND project_id=? ORDER BY created_at LIMIT 200',actor.orgId,projectId).all<{id:string;name:string;status:string;kind:string;qa_for:string|null}>(),
  stmt(env,'SELECT id,task_id,qa_task_id,status,notes,decided_at,created_at FROM qa_reviews WHERE organization_id=? AND project_id=? ORDER BY created_at DESC LIMIT 100',actor.orgId,projectId).all<{status:string}>(),
  stmt(env,'SELECT id,name,status,version,client_visible,delivered_at,approved_at,client_note FROM deliverables WHERE organization_id=? AND project_id=? ORDER BY created_at DESC LIMIT 50',actor.orgId,projectId).all<{status:string}>(),
  stmt(env,'SELECT id,name,status,priority,created_at FROM issues WHERE organization_id=? AND project_id=? ORDER BY created_at DESC LIMIT 50',actor.orgId,projectId).all<{status:string}>(),
  stmt(env,'SELECT id,stage,event_type,actor_id,details,created_at FROM pipeline_events WHERE organization_id=? AND project_id=? ORDER BY created_at DESC LIMIT 60',actor.orgId,projectId).all(),
  stmt(env,'SELECT lead_id,quote_id FROM lead_project_links WHERE organization_id=? AND project_id=?',actor.orgId,projectId).first<{lead_id:string;quote_id:string|null}>()
 ]);
 const work=tasks.results.filter(task=>task.kind==='WORK'),done=work.filter(task=>task.status==='DONE').length;
 const pending=reviews.results.filter(review=>review.status==='PENDING').length,passed=reviews.results.filter(review=>review.status==='PASS').length;
 const delivered=deliverables.results.filter(item=>item.status==='DELIVERED').length,approved=deliverables.results.filter(item=>item.status==='APPROVED').length;
 const openTickets=tickets.results.filter(item=>['OPEN','IN_PROGRESS'].includes(item.status)).length;
 const state=(complete:boolean,active:boolean)=>complete?'DONE':active?'ACTIVE':'WAITING';
 const stages=[
  {key:'PLANNING',label:'Pianificazione',state:state(work.length>0,false),detail:link?'Lead convertito in progetto':'Progetto creato manualmente'},
  {key:'EXECUTION',label:'Esecuzione',state:state(work.length>0&&done===work.length,done<work.length&&work.length>0),detail:done+' di '+work.length+' attività completate'},
  {key:'QA',label:'QA',state:state(passed>0&&pending===0,pending>0),detail:pending+' in attesa · '+passed+' superate'},
  {key:'DELIVERY',label:'Consegna',state:state(approved>0&&delivered===0,delivered>0||deliverables.results.length>0),detail:deliverables.results.length+' deliverable · '+delivered+' attendono il cliente · '+approved+' approvati'},
  {key:'MAINTENANCE',label:'Manutenzione',state:state(approved>0&&openTickets===0,openTickets>0),detail:openTickets+' ticket aperti'}
 ];
 return {project,stages,tasks:tasks.results,reviews:reviews.results,deliverables:deliverables.results,tickets:tickets.results,events:events.results,sharedWithClient:project.visibility==='CLIENT'};
}

export async function handlePipeline(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname,method=request.method;
 let match:RegExpMatchArray|null;
 if(method==='POST'&&(match=path.match(/^\/api\/tasks\/([^/]+)\/request-qa$/)))return json(await requestQa(request,env,actor,match[1]),201);
 if(method==='POST'&&(match=path.match(/^\/api\/qa\/([^/]+)\/outcome$/)))return json(await decideQa(request,env,actor,match[1]));
 if(method==='GET'&&(match=path.match(/^\/api\/projects\/([^/]+)\/pipeline$/)))return json(await pipelineOf(env,actor,match[1]));
 if(method==='POST'&&(match=path.match(/^\/api\/projects\/([^/]+)\/deliverables$/)))return json(await createDeliverable(request,env,actor,match[1]),201);
 if(method==='POST'&&(match=path.match(/^\/api\/deliverables\/([^/]+)\/deliver$/)))return json(await deliver(env,actor,match[1]));
 if(method==='POST'&&(match=path.match(/^\/api\/portal\/deliverables\/([^/]+)\/decision$/)))return json(await clientDecision(request,env,actor,match[1]));
 if(method==='POST'&&path==='/api/portal/tickets')return json(await openTicket(request,env,actor),201);
 return null;
}
