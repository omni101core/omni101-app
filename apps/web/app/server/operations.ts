import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const staff:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const finance=['OWNER','ADMIN','FINANCE'];
const json=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const rank:Record<string,number>={URGENT:0,HIGH:1,NORMAL:2,LOW:3};
export function prioritize<T extends {priority?:unknown;due_date?:unknown;status?:unknown}>(tasks:T[],today:string){
 return [...tasks].sort((a,b)=>{
  const overdue=(x:T)=>typeof x.due_date==='string'&&x.due_date<today&&x.status!=='DONE';
  return Number(overdue(b))-Number(overdue(a))||(rank[String(a.priority)]??2)-(rank[String(b.priority)]??2)||String(a.due_date||'9999').localeCompare(String(b.due_date||'9999'));
 });
}
export async function operations(env:Env,actor:Identity){
 requireRole(actor,staff);const today=new Date().toISOString().slice(0,10),org=actor.orgId;
 const query=(sql:string)=>env.DB.prepare(sql).bind(org).all();
 const [tasks,projects,notifications,failed,approvals]=await Promise.all([
  query("SELECT t.id,t.name,t.status,t.priority,t.due_date,t.project_id,t.assignee_id,p.name AS project_name,u.name AS assignee_name FROM tasks t LEFT JOIN projects p ON p.id=t.project_id AND p.organization_id=t.organization_id LEFT JOIN users u ON u.id=t.assignee_id WHERE t.organization_id=? AND t.status<>'DONE' ORDER BY t.created_at DESC LIMIT 500"),
  query("SELECT p.id,p.name,p.status,p.due_date,(SELECT count(*) FROM tasks t WHERE t.organization_id=p.organization_id AND t.project_id=p.id AND t.kind='WORK') total_tasks,(SELECT count(*) FROM tasks t WHERE t.organization_id=p.organization_id AND t.project_id=p.id AND t.kind='WORK' AND t.status='DONE') done_tasks FROM projects p WHERE p.organization_id=? AND p.status<>'COMPLETED' ORDER BY p.due_date IS NULL,p.due_date LIMIT 100"),
  query("SELECT id,name,body,status,created_at FROM notifications WHERE organization_id=? AND status='UNREAD' ORDER BY created_at DESC LIMIT 30"),
  query("SELECT id,name,status,error,updated_at FROM agent_runs WHERE organization_id=? AND status IN ('FAILED','QUEUED') ORDER BY updated_at DESC LIMIT 20"),
  query("SELECT id,name,status,reason,created_at FROM approvals WHERE organization_id=? AND status='PENDING' ORDER BY created_at LIMIT 20"),
 ]);
 const ordered=prioritize(tasks.results,today);const money:Record<string,unknown>|null=finance.includes(actor.role)?{}:null;
 if(money){
  const [balance,margins]=await Promise.all([
   env.DB.prepare("SELECT (SELECT coalesce(sum(amount_cents),0) FROM invoices WHERE organization_id=? AND status='PAID') received_cents,(SELECT coalesce(sum(amount_cents),0) FROM invoices WHERE organization_id=? AND status IN ('RECORDED','OVERDUE')) receivable_cents,(SELECT coalesce(sum(amount_cents),0) FROM expenses WHERE organization_id=? AND status='PAID') paid_expenses_cents,(SELECT coalesce(sum(cost_cents),0) FROM agent_runs WHERE organization_id=?) ai_cost_cents").bind(org,org,org,org).first(),
   query("SELECT p.id,p.name,p.budget_cents,(SELECT coalesce(sum(i.amount_cents),0) FROM invoices i WHERE i.organization_id=p.organization_id AND i.project_id=p.id AND i.status='PAID') received_cents,(SELECT coalesce(sum(e.amount_cents),0) FROM expenses e WHERE e.organization_id=p.organization_id AND e.project_id=p.id AND e.status IN ('RECORDED','PAID')) recorded_expenses_cents FROM projects p WHERE p.organization_id=? ORDER BY p.updated_at DESC LIMIT 100"),
  ]);money.balance=balance;money.projects=margins.results;money.note='Incassi e spese dai registri. Differenza incassi/spese, non utile fiscale: lavoro interno e altri costi non registrati esclusi. Costo AI totale separato, non attribuito ai progetti.';
 }
 return json({today,priorities:ordered.slice(0,25),overdueCount:ordered.filter(t=>typeof t.due_date==='string'&&t.due_date<today).length,projects:projects.results,notifications:notifications.results,failedRuns:failed.results,approvals:approvals.results,finance:money,limits:{tasks:500,projects:100},algorithm:'Scadute prima; poi urgenza; poi data. Nessuna decisione AI.'});
}
export async function markNotification(env:Env,actor:Identity,id:string){requireRole(actor,staff);const row=await env.DB.prepare('SELECT id FROM notifications WHERE id=? AND organization_id=?').bind(id,actor.orgId).first();if(!row)throw new HttpError(404,'Notifica non trovata.');await env.DB.prepare("UPDATE notifications SET status='READ',updated_at=? WHERE id=? AND organization_id=?").bind(Date.now(),id,actor.orgId).run();return json({read:true});}
