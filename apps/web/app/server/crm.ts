import {z} from 'zod';
import {decodePathId,HttpError,requireRole,type Env,type Identity,type Role} from './auth';
import {resources} from './schema';
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const now=()=>Date.now();const id=()=>crypto.randomUUID();
const sales:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const readers:Role[]=[...sales,'FINANCE'];
const KINDS=['leads','deals'] as const;type Kind=typeof KINDS[number];
// Probabilità di chiusura per fase, in %. ponytail: tabella fissa; renderla configurabile per organizzazione solo se i soci la chiedono.
export const STAGE_WEIGHT:Record<string,number>={NEW:5,AI_TRIAGE:10,QUALIFICATION:20,DISCOVERY:30,PROPOSAL_DRAFT:40,PROPOSAL_SENT:55,NEGOTIATION:70,WON:100,LOST:0,ON_HOLD:0};
function stmt(env:Env,sql:string,...values:(string|number|null)[]){return env.DB.prepare(sql).bind(...values)}
async function body(request:Request){const raw=await request.text();if(raw.length>65536)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(raw) as unknown}catch{throw new HttpError(400,'JSON non valido.')}}
const moveSchema=z.object({status:z.string().min(1).max(40),lostReason:z.string().trim().min(5,'Scrivi il motivo della perdita (almeno 5 caratteri).').max(500).optional(),expectedUpdatedAt:z.number().int().min(0).optional()}).strict();

// Sposta un lead/trattativa di fase. Motivo obbligatorio per LOST, lock ottimistico, evento di storico e audit nella stessa batch.
async function move(request:Request,env:Env,actor:Identity,kind:Kind,recordId:string){
 requireRole(actor,sales);
 const data=moveSchema.parse(await body(request));
 const options=resources[kind].fields.find(f=>f.key==='status')?.options||[];
 if(!options.includes(data.status))throw new HttpError(400,'Fase non valida.');
 if(data.status==='LOST'&&!data.lostReason)throw new HttpError(400,'Il motivo della perdita è obbligatorio.');
 if(data.status!=='LOST'&&data.lostReason)throw new HttpError(400,'Il motivo si indica solo passando a «Perso».');
 const existing=await stmt(env,`SELECT * FROM ${kind} WHERE id=? AND organization_id=?`,recordId,actor.orgId).first<Record<string,unknown>>();
 if(!existing)throw new HttpError(404,'Record non trovato.');
 const stale=()=>json({error:'Record modificato da un altro socio. Ricarica.',current:existing},409);
 if(data.expectedUpdatedAt!==undefined&&existing.updated_at!==data.expectedUpdatedAt)return stale();
 if(existing.status===data.status)return json({record:{id:recordId,status:data.status,updated_at:existing.updated_at}});
 const base=existing.updated_at as number,stamp=Math.max(now(),base+1),auditId=id();
 const lost=data.status==='LOST';
 // Il WHERE su updated_at è il lock: una corsa persa non cambia nulla e non lascia audit.
 await env.DB.batch([
  stmt(env,`UPDATE ${kind} SET status=?,lost_reason=?,lost_at=?,updated_at=? WHERE id=? AND organization_id=? AND updated_at=?`,data.status,lost?data.lostReason!:null,lost?stamp:null,stamp,recordId,actor.orgId,base),
  stmt(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'MOVE',?,?,?,?,? WHERE changes()=1",auditId,actor.orgId,actor.id,kind,recordId,JSON.stringify({from:existing.status,to:data.status,...(lost?{lostReason:data.lostReason}:{})}),stamp,stamp),
  stmt(env,'UPDATE crm_stage_events SET actor_id=? WHERE organization_id=? AND resource_type=? AND resource_id=? AND created_at=? AND actor_id IS NULL',actor.id,actor.orgId,kind,recordId,stamp)
 ]);
 if(!await stmt(env,'SELECT id FROM audit_logs WHERE id=? AND organization_id=?',auditId,actor.orgId).first()){
  const current=await stmt(env,`SELECT * FROM ${kind} WHERE id=? AND organization_id=?`,recordId,actor.orgId).first();
  return json({error:'Record modificato da un altro socio. Ricarica.',current},409);
 }
 return json({record:{id:recordId,status:data.status,lost_reason:lost?data.lostReason:null,lost_at:lost?stamp:null,updated_at:stamp}});
}

type PipelineRow={id:string;name:string|null;status:string;estimated_value_cents:number|null;quote_cents:number|null;lost_reason:string|null};
// Valore atteso: importo del preventivo collegato (ultima versione di calcolo, non rifiutato), altrimenti la stima del lead; pesato per fase.
async function pipeline(env:Env,actor:Identity){
 requireRole(actor,readers);
 const rows=await stmt(env,`SELECT l.id,l.name,l.status,l.estimated_value_cents,l.lost_reason,
  COALESCE(
   (SELECT q.amount_cents FROM pricing_versions p JOIN quotes q ON q.id=p.quote_id AND q.organization_id=p.organization_id WHERE p.lead_id=l.id AND p.organization_id=l.organization_id AND q.status!='REJECTED' ORDER BY p.created_at DESC LIMIT 1),
   (SELECT q.amount_cents FROM lead_project_links k JOIN quotes q ON q.id=k.quote_id AND q.organization_id=k.organization_id WHERE k.lead_id=l.id AND k.organization_id=l.organization_id AND q.status!='REJECTED')
  ) AS quote_cents
  FROM leads l WHERE l.organization_id=? ORDER BY l.created_at DESC LIMIT 1000`,actor.orgId).all<PipelineRow>();
 const stages:Record<string,{status:string;count:number;valueCents:number;weightedCents:number}>={};
 const leads=rows.results.map(r=>{
  const valueCents=r.quote_cents??r.estimated_value_cents??0,source=r.quote_cents!=null?'quote':'estimate';
  const expectedCents=Math.round(valueCents*(STAGE_WEIGHT[r.status]??0)/100);
  const s=stages[r.status]??=({status:r.status,count:0,valueCents:0,weightedCents:0});
  s.count++;s.valueCents+=valueCents;s.weightedCents+=expectedCents;
  return {id:r.id,name:r.name,status:r.status,valueCents,expectedCents,source,lostReason:r.lost_reason};
 });
 const open=Object.values(stages).filter(s=>!['WON','LOST','ON_HOLD'].includes(s.status));
 return json({leads,stages:Object.values(stages),openValueCents:open.reduce((a,s)=>a+s.valueCents,0),expectedCents:open.reduce((a,s)=>a+s.weightedCents,0),wonCents:stages.WON?.valueCents??0,lostCount:stages.LOST?.count??0});
}

// Storico attività di una scheda: cambi di fase (con chi e perché), note, creazione. Più recente prima.
async function history(env:Env,actor:Identity,kind:Kind,recordId:string){
 requireRole(actor,readers);
 const rec=await stmt(env,`SELECT id,name,created_at FROM ${kind} WHERE id=? AND organization_id=?`,recordId,actor.orgId).first<{id:string;name:string|null;created_at:number}>();
 if(!rec)throw new HttpError(404,'Record non trovato.');
 const org=actor.orgId;
 const rows=await stmt(env,`SELECT 'stage' AS type,e.id,COALESCE(e.from_status,'—')||' → '||e.to_status AS title,e.reason AS detail,u.name AS actor,e.created_at AS at
  FROM crm_stage_events e LEFT JOIN users u ON u.id=e.actor_id WHERE e.organization_id=? AND e.resource_type=? AND e.resource_id=?
  UNION ALL SELECT 'note',n.id,'Nota',substr(n.content,1,300),u.name,n.created_at FROM notes n LEFT JOIN users u ON u.id=n.created_by WHERE n.organization_id=? AND n.resource_type=? AND n.resource_id=?
  ORDER BY at DESC LIMIT 100`,org,kind,recordId,org,kind,recordId).all();
 return json({items:[...rows.results,{type:'created',id:rec.id,title:'Creato',detail:rec.name,actor:null,at:rec.created_at}]});
}

export async function handleCrm(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname;
 if(!path.startsWith('/api/crm/'))return null;
 if(path==='/api/crm/pipeline'&&request.method==='GET')return await pipeline(env,actor);
 const m=path.match(/^\/api\/crm\/(leads|deals)\/([^/]+)\/(move|history)$/);
 if(!m)return null;
 const kind=m[1] as Kind,recordId=decodePathId(m[2]);
 if(m[3]==='move'&&request.method==='POST')return await move(request,env,actor,kind,recordId);
 if(m[3]==='history'&&request.method==='GET')return await history(env,actor,kind,recordId);
 return null;
}
