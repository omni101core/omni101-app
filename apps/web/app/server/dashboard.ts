import {requireRole,type Env,type Identity,type Role} from './auth';
import {resources} from './schema';
const staff:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const finance:Role[]=['OWNER','ADMIN','FINANCE'];
const json=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
type Card={key:string;label:string;detail:string;resource:string;sql:string;href:string;money?:boolean;roles?:Role[]};
// Ogni numero ha la sua query e la lista di destinazione: href usa solo filtri che la lista sa applicare (?status=).
// ponytail: conteggi esatti da D1, nessuna cache. Se pesa, un solo SELECT con sotto-query.
export const CARDS:Card[]=[
 {key:'newLeads',label:'Nuovi lead',detail:'Da prendere in carico',resource:'leads',sql:"SELECT count(*) value FROM leads WHERE organization_id=? AND status='NEW'",href:'/admin/leads?status=NEW'},
 {key:'qualifyingLeads',label:'Lead in qualifica',detail:'In corso di valutazione',resource:'leads',sql:"SELECT count(*) value FROM leads WHERE organization_id=? AND status='QUALIFICATION'",href:'/admin/leads?status=QUALIFICATION'},
 {key:'pipelineValueCents',label:'Pipeline',detail:'Valore trattative aperte',resource:'deals',sql:"SELECT coalesce(sum(value_cents),0) value FROM deals WHERE organization_id=? AND status NOT IN ('WON','LOST')",href:'/admin/deals',money:true},
 {key:'quotesInReview',label:'Preventivi in revisione',detail:'Aspettano una decisione',resource:'proposals',sql:"SELECT count(*) value FROM quotes WHERE organization_id=? AND status='IN_REVIEW'",href:'/admin/proposals?status=IN_REVIEW'},
 {key:'activeProjects',label:'Progetti attivi',detail:'In fase di realizzazione',resource:'projects',sql:"SELECT count(*) value FROM projects WHERE organization_id=? AND status='ACTIVE'",href:'/admin/projects?status=ACTIVE'},
 {key:'openIssues',label:'Ticket aperti',detail:'Richieste di manutenzione',resource:'issues',sql:"SELECT count(*) value FROM issues WHERE organization_id=? AND status='OPEN'",href:'/admin/issues?status=OPEN'},
 {key:'pendingApprovals',label:'Da approvare',detail:'Decisioni necessarie',resource:'approvals',sql:"SELECT count(*) value FROM approvals WHERE organization_id=? AND status='PENDING'",href:'/admin/approvals?status=PENDING'},
 {key:'blockedTasks',label:'Task bloccati',detail:'Richiedono attenzione',resource:'tasks',sql:"SELECT count(*) value FROM tasks WHERE organization_id=? AND status='BLOCKED'",href:'/admin/tasks?status=BLOCKED'},
 {key:'runningAgents',label:'Agenti attivi',detail:'Esecuzioni in corso',resource:'agent-runs',sql:"SELECT count(*) value FROM agent_runs WHERE organization_id=? AND status='RUNNING'",href:'/admin/agent-runs?status=RUNNING'},
 {key:'revenueCents',label:'Ricavi registrati',detail:'Fatture pagate',resource:'invoices',sql:"SELECT coalesce(sum(amount_cents),0) value FROM invoices WHERE organization_id=? AND status='PAID'",href:'/admin/invoices?status=PAID',money:true,roles:finance},
 {key:'aiCostCents',label:'Costi AI',detail:'Consumi registrati',resource:'agent-runs',sql:"SELECT coalesce(sum(cost_cents),0) value FROM agent_runs WHERE organization_id=?",href:'/admin/agent-runs',money:true,roles:finance},
];
// Un ruolo vede solo le carte di cui può leggere la lista: il numero non scavalca i permessi della risorsa.
const allowed=(card:Card,role:Role)=>(card.roles||resources[card.resource]?.read||staff).includes(role);
export async function dashboard(env:Env,actor:Identity){
 requireRole(actor,staff);
 const visible=CARDS.filter(card=>allowed(card,actor.role));
 const [values,activity]=await Promise.all([
  Promise.all(visible.map(card=>env.DB.prepare(card.sql).bind(actor.orgId).first<{value:number}>())),
  env.DB.prepare('SELECT id,action,resource_type,created_at FROM audit_logs WHERE organization_id=? ORDER BY created_at DESC LIMIT 20').bind(actor.orgId).all(),
 ]);
 const cards=visible.map((card,i)=>({key:card.key,label:card.label,detail:card.detail,href:card.href,money:!!card.money,value:Number(values[i]?.value)||0}));
 const metrics=Object.fromEntries(CARDS.map(card=>[card.key,cards.find(c=>c.key===card.key)?.value??0]));
 return json({cards,metrics,activity:activity.results,integrations:{storage:!!env.MEDIA,ai:!!env.AI_API_KEY,identity:true}});
}
