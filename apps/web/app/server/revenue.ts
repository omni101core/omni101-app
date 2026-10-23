import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const roles:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function input(request:Request){const text=await request.text();if(text.length>12000)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(text)}catch{throw new HttpError(400,'JSON non valido.')}}
type Lead={id:string;name:string;status:string;next_action?:string;owner_id?:string;estimated_value_cents?:number;message?:string;brief?:string};
export function qualification(lead:Lead){
 const checks=[{key:'stage',label:'Fase di qualificazione documentata',points:30,met:!['NEW','AI_TRIAGE','ON_HOLD'].includes(lead.status)},{key:'action',label:'Prossima azione definita',points:15,met:!!lead.next_action?.trim()},{key:'owner',label:'Responsabile assegnato',points:15,met:!!lead.owner_id},{key:'value',label:'Valore indicativo documentato',points:20,met:Number(lead.estimated_value_cents)>0},{key:'brief',label:'Contesto della richiesta documentato',points:20,met:(lead.brief||lead.message||'').trim().length>=60}];
 return {score:checks.reduce((sum,item)=>sum+(item.met?item.points:0),0),checks,method:'qualification-completeness-v1',meaning:'Completezza dei dati commerciali, non probabilità di acquisto o qualità della persona.'};
}
export async function handleRevenue(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/revenue/'))return null;requireRole(actor,roles);const org=actor.orgId,stamp=Date.now();
 const row=(table:string,id:string)=>env.DB.prepare(`SELECT id FROM ${table} WHERE id=? AND organization_id=?`).bind(id,org).first();
 if(url.pathname==='/api/revenue/overview'&&request.method==='GET'){
  const [campaigns,leads,links,events]=await Promise.all([
   env.DB.prepare('SELECT id,name,status,channel,objective,due_date FROM campaigns WHERE organization_id=? ORDER BY updated_at DESC LIMIT 101').bind(org).all(),
   env.DB.prepare("SELECT id,name,status,next_action,owner_id,estimated_value_cents,message,brief,source FROM leads WHERE organization_id=? AND status NOT IN ('WON','LOST') ORDER BY updated_at DESC LIMIT 101").bind(org).all<Lead>(),
   env.DB.prepare('SELECT campaign_id,resource_type,resource_id FROM campaign_links WHERE organization_id=? ORDER BY created_at DESC LIMIT 501').bind(org).all(),
   env.DB.prepare('SELECT id,type,description,campaign_id,lead_id,source,schema_version,created_by,created_at FROM revenue_events WHERE organization_id=? ORDER BY created_at DESC,id LIMIT 26').bind(org).all()
  ]);
  return json({campaigns:campaigns.results.slice(0,100),leads:leads.results.slice(0,100).map(lead=>({...lead,qualification:qualification(lead)})).sort((a,b)=>a.qualification.score-b.qualification.score||a.id.localeCompare(b.id)),links:links.results.slice(0,500),events:events.results.slice(0,25),truncated:{campaigns:campaigns.results.length>100,leads:leads.results.length>100,links:links.results.length>500,events:events.results.length>25},channels:{email:'NOT_CONNECTED',social:'NOT_CONNECTED',ads:'NOT_CONNECTED'},trackingEnabled:false,sendingEnabled:false});
 }
 if(url.pathname==='/api/revenue/calendar'&&request.method==='GET'){
  const start=z.iso.date().parse(url.searchParams.get('start')),end=z.iso.date().parse(url.searchParams.get('end'));if(start>end||Date.parse(end)-Date.parse(start)>93*86400000)throw new HttpError(400,'Scegli un intervallo ordinato di massimo 93 giorni.');
  const sources=[['campaigns','campaigns','Campagna'],['growth_plans','growth-plans','Iniziativa'],['tasks','tasks','Attività'],['milestones','milestones','Traguardo'],['activities','calendar','Evento']] as const;
  const results=await Promise.all(sources.map(async([table,resource,kind])=>{const found=await env.DB.prepare(`SELECT id,name,substr(due_date,1,10) AS date FROM ${table} WHERE organization_id=? AND substr(due_date,1,10)>=? AND substr(due_date,1,10)<=? ORDER BY due_date,id LIMIT 201`).bind(org,start,end).all<{id:string;name:string;date:string}>();return {kind,truncated:found.results.length>200,items:found.results.slice(0,200).map(item=>({...item,kind,resource,url:'/admin/'+resource+'?record='+encodeURIComponent(item.id)}))}}));
  return json({items:results.flatMap(r=>r.items).sort((a,b)=>a.date.localeCompare(b.date)||a.kind.localeCompare(b.kind)||a.id.localeCompare(b.id)),truncated:results.filter(r=>r.truncated).map(r=>r.kind),dateSemantics:'Date di calendario dei record originali, non orari di appuntamento. Nessuna data duplicata o esecuzione programmata.'});
 }
 if(url.pathname==='/api/revenue/links'&&request.method==='POST'){
  const data=z.object({campaignId:z.string().min(1).max(160),resourceType:z.enum(['LEAD','TASK','GROWTH_PLAN','CREATIVE_JOB']),resourceId:z.string().min(1).max(160)}).strict().parse(await input(request));
  const tables={LEAD:'leads',TASK:'tasks',GROWTH_PLAN:'growth_plans',CREATIVE_JOB:'creative_jobs'};if(!await row('campaigns',data.campaignId)||!await row(tables[data.resourceType],data.resourceId))throw new HttpError(404,'Campagna o record non disponibili nel workspace.');
  const id=crypto.randomUUID();await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO campaign_links(id,organization_id,campaign_id,resource_type,resource_id,created_by,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,org,data.campaignId,data.resourceType,data.resourceId,actor.id,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'CAMPAIGN_RECORD_LINKED','campaigns',?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,data.campaignId,JSON.stringify({resourceType:data.resourceType,resourceId:data.resourceId,source:'MANUAL'}),stamp,stamp)]);
  return json({linked:true,attribution:'MANUAL',note:'Collegamento operativo manuale, non attribuzione automatica di una conversione.'});
 }
 if(url.pathname==='/api/revenue/events'&&request.method==='POST'){
  const data=z.object({id:z.uuid(),campaignId:z.string().min(1).max(160).nullable(),leadId:z.string().min(1).max(160).nullable(),type:z.enum(['NOTE_ADDED','FOLLOW_UP_COMPLETED','QUALIFICATION_RECORDED']),description:z.string().trim().min(10).max(4000)}).strict().parse(await input(request));
  if(!data.campaignId&&!data.leadId)throw new HttpError(400,'Collega almeno una campagna o un lead.');if(data.campaignId&&!await row('campaigns',data.campaignId)||data.leadId&&!await row('leads',data.leadId))throw new HttpError(404,'Record non disponibile nel workspace.');
  const find=()=>env.DB.prepare('SELECT organization_id,campaign_id,lead_id,type,description,created_by FROM revenue_events WHERE id=?').bind(data.id).first<Record<string,unknown>>();
  const same=(r:Record<string,unknown>|null)=>r&&r.organization_id===org&&r.campaign_id===data.campaignId&&r.lead_id===data.leadId&&r.type===data.type&&r.description===data.description&&r.created_by===actor.id;
  const old=await find();if(old){if(!same(old))throw new HttpError(409,'Identificativo già utilizzato.');return json({id:data.id,duplicate:true});}
  await env.DB.batch([env.DB.prepare("INSERT OR IGNORE INTO revenue_events(id,organization_id,campaign_id,lead_id,type,description,source,schema_version,created_by,created_at) VALUES(?,?,?,?,?,?,'MANUAL',1,?,?)").bind(data.id,org,data.campaignId,data.leadId,data.type,data.description,actor.id,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'REVENUE_EVENT_RECORDED','revenue_events',?,'{}',?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,data.id,stamp,stamp)]);
  if(!same(await find()))throw new HttpError(409,'Modifica concorrente: ricarica il contesto.');return json({id:data.id,source:'MANUAL',schemaVersion:1},201);
 }
 throw new HttpError(405,'Operazione non supportata.');
}
