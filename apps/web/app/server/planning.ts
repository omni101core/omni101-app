import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const staff:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const managers:Role[]=['OWNER','ADMIN','PROJECT_MANAGER'];
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
type Task={id:string;name:string;status:string;estimate_minutes:number;[key:string]:unknown};
type Edge={task_id:string;depends_on_task_id:string};
export function criticalPath(tasks:Task[],edges:Edge[]){
 const ids=new Set(tasks.map(t=>t.id)),incoming=new Map(tasks.map(t=>[t.id,0])),children=new Map(tasks.map(t=>[t.id,[] as string[]])),start=new Map(tasks.map(t=>[t.id,0])),duration=new Map(tasks.map(t=>[t.id,t.status==='DONE'?0:Math.max(0,Number(t.estimate_minutes)||0)]));
 for(const e of edges){if(!ids.has(e.task_id)||!ids.has(e.depends_on_task_id))throw new HttpError(409,'Dipendenza non appartenente al progetto.');incoming.set(e.task_id,incoming.get(e.task_id)!+1);children.get(e.depends_on_task_id)!.push(e.task_id)}
 const queue=tasks.filter(t=>incoming.get(t.id)===0).map(t=>t.id),order:string[]=[];
 for(let i=0;i<queue.length;i++){const id=queue[i];order.push(id);const finish=start.get(id)!+duration.get(id)!;for(const child of children.get(id)!){start.set(child,Math.max(start.get(child)!,finish));incoming.set(child,incoming.get(child)!-1);if(!incoming.get(child))queue.push(child)}}
 if(order.length!==tasks.length)throw new HttpError(409,'Le dipendenze contengono un ciclo.');
 const total=Math.max(0,...order.map(id=>start.get(id)!+duration.get(id)!)),latest=new Map(order.map(id=>[id,total-duration.get(id)!]));
 for(const id of [...order].reverse())for(const child of children.get(id)!)latest.set(id,Math.min(latest.get(id)!,latest.get(child)!-duration.get(id)!));
 return {remainingMinutes:total,order,items:tasks.map(t=>({id:t.id,startMinutes:start.get(t.id),finishMinutes:start.get(t.id)!+duration.get(t.id)!,slackMinutes:latest.get(t.id)!-start.get(t.id)!,critical:t.status!=='DONE'&&latest.get(t.id)===start.get(t.id)}))};
}
async function body(request:Request){const text=await request.text();if(text.length>20000)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(text)}catch{throw new HttpError(400,'JSON non valido.')}}
export async function handlePlanning(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const match=new URL(request.url).pathname.match(/^\/api\/projects\/([^/]+)\/planning(?:\/(dependencies|comments))?$/);if(!match)return null;
 requireRole(actor,staff);const projectId=match[1],action=match[2],org=actor.orgId;
 const project=await env.DB.prepare('SELECT id,name,due_date,status FROM projects WHERE id=? AND organization_id=?').bind(projectId,org).first();if(!project)throw new HttpError(404,'Progetto non trovato.');
 if(request.method==='GET'&&!action){
  const [tasks,dependencies,milestones,comments,version]=await Promise.all([
   env.DB.prepare("SELECT * FROM tasks WHERE project_id=? AND organization_id=? AND kind='WORK' ORDER BY created_at,id").bind(projectId,org).all<Task>(),
   env.DB.prepare('SELECT d.task_id,d.depends_on_task_id FROM task_dependencies d JOIN tasks t ON t.id=d.task_id JOIN tasks p ON p.id=d.depends_on_task_id WHERE d.active=1 AND t.project_id=? AND t.organization_id=? AND p.organization_id=t.organization_id AND p.project_id=t.project_id').bind(projectId,org).all<Edge>(),
   env.DB.prepare('SELECT * FROM milestones WHERE project_id=? AND organization_id=? ORDER BY due_date,position').bind(projectId,org).all(),
   env.DB.prepare("SELECT n.id,n.content,n.created_at,u.name AS author FROM notes n LEFT JOIN users u ON n.created_by=u.id WHERE n.resource_type='projects' AND n.resource_id=? AND n.organization_id=? ORDER BY n.created_at DESC LIMIT 100").bind(projectId,org).all(),
   env.DB.prepare('SELECT version FROM project_plans WHERE project_id=? AND organization_id=?').bind(projectId,org).first<{version:number}>(),
  ]);
  return json({project,tasks:tasks.results,dependencies:dependencies.results,milestones:milestones.results,comments:comments.results,version:version?.version||0,schedule:criticalPath(tasks.results,dependencies.results)});
 }
 if(request.method==='POST'&&action==='comments'){
  const data=z.object({content:z.string().trim().min(1).max(4000),requestId:z.uuid()}).strict().parse(await body(request));const stamp=Date.now();
  const old=await env.DB.prepare('SELECT organization_id,resource_id,created_by,content FROM notes WHERE id=?').bind(data.requestId).first<{organization_id:string;resource_id:string;created_by:string;content:string}>();
  if(old){if(old.organization_id!==org||old.resource_id!==projectId||old.created_by!==actor.id||old.content!==data.content)throw new HttpError(409,'Identificativo già utilizzato.');return json({id:data.requestId,duplicate:true})}
  await env.DB.batch([env.DB.prepare("INSERT INTO notes(id,organization_id,resource_type,resource_id,content,created_by,created_at,updated_at) VALUES(?,?,'projects',?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(data.requestId,org,projectId,data.content,actor.id,stamp,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'COMMENT_CREATED','projects',?,'{}',?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,projectId,stamp,stamp)]);return json({id:data.requestId},201);
 }
 if(request.method==='POST'&&action==='dependencies'){
  requireRole(actor,managers);const data=z.object({taskId:z.string().min(1).max(100),dependsOn:z.array(z.string().min(1).max(100)).max(20),expectedVersion:z.number().int().min(0)}).strict().parse(await body(request));
  const ids=[data.taskId,...new Set(data.dependsOn)];if(ids.slice(1).includes(data.taskId))throw new HttpError(409,'Un’attività non può dipendere da sé.');
  const scoped=await env.DB.prepare("SELECT id FROM tasks WHERE project_id=? AND organization_id=? AND kind='WORK' AND id IN ("+ids.map(()=>'?').join(',')+")").bind(projectId,org,...ids).all();if(scoped.results.length!==ids.length)throw new HttpError(400,'Attività non appartenente al progetto.');
  const claim=crypto.randomUUID(),stamp=Date.now(),exists='EXISTS(SELECT 1 FROM project_plans WHERE project_id=? AND organization_id=? AND request_id=?)';
  const writes=[env.DB.prepare('INSERT OR IGNORE INTO project_plans(project_id,organization_id,version,updated_at) VALUES(?,?,0,?)').bind(projectId,org,stamp),env.DB.prepare('UPDATE project_plans SET version=version+1,request_id=?,updated_at=? WHERE project_id=? AND organization_id=? AND version=?').bind(claim,stamp,projectId,org,data.expectedVersion),env.DB.prepare('UPDATE task_dependencies SET active=0 WHERE task_id=? AND '+exists).bind(data.taskId,projectId,org,claim),...ids.slice(1).map(parent=>env.DB.prepare('INSERT INTO task_dependencies(task_id,depends_on_task_id,active) SELECT ?,?,1 WHERE '+exists+' ON CONFLICT(task_id,depends_on_task_id) DO UPDATE SET active=1').bind(data.taskId,parent,projectId,org,claim)),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'DEPENDENCIES_UPDATED','tasks',?,?,?,? WHERE "+exists).bind(crypto.randomUUID(),org,actor.id,data.taskId,JSON.stringify({dependsOn:ids.slice(1)}),stamp,stamp,projectId,org,claim)];
  await env.DB.batch(writes);const saved=await env.DB.prepare('SELECT version,request_id FROM project_plans WHERE project_id=? AND organization_id=?').bind(projectId,org).first<{version:number;request_id:string}>();if(saved?.request_id!==claim)throw new HttpError(409,'Piano aggiornato da un collega. Ricarica prima di salvare.');return json({version:saved.version});
 }
 throw new HttpError(405,'Metodo non supportato.');
}
