import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const roles:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const kinds=['REQUIREMENT','IDEA','DECISION','REFERENCE','PROMPT','HANDOFF','LEARNING','MANDATE','RISK'] as const;
const statuses=['CAPTURED','NEEDS_CLARIFICATION','APPROVED','PLANNED','IN_PROGRESS','BLOCKED','IMPLEMENTED','VERIFIED','DEFERRED','REJECTED','SUPERSEDED','ARCHIVED'] as const;
const fields=z.object({name:z.string().trim().min(2).max(180),kind:z.enum(kinds),status:z.enum(statuses),body:z.string().trim().min(1).max(40000),source:z.string().trim().min(3).max(1000),acceptance:z.string().max(4000).default(''),evidence:z.string().max(4000).default(''),source_id:z.string().max(160).nullable().default(null),task_id:z.string().max(160).nullable().default(null)}).strict();
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function body(request:Request){const raw=await request.text();if(raw.length>60000)throw new HttpError(413,'Contenuto troppo grande.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}
export async function handleKnowledge(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const url=new URL(request.url),match=url.pathname.match(/^\/api\/knowledge(?:\/([a-zA-Z0-9-]+))?$/);if(!match)return null;
 requireRole(actor,roles);const org=actor.orgId,rid=match[1],stamp=Date.now();
 const find=(id:string)=>env.DB.prepare('SELECT * FROM knowledge_records WHERE id=? AND organization_id=?').bind(id,org).first<Record<string,unknown>>();
 if(request.method==='GET'&&!rid){const q=(url.searchParams.get('q')||'').trim().slice(0,160),kind=url.searchParams.get('kind')||'',status=url.searchParams.get('status')||'';
  const result=await env.DB.prepare("SELECT * FROM knowledge_records WHERE organization_id=? AND (?='' OR instr(lower(name||' '||body||' '||source),lower(?))>0) AND (?='' OR kind=?) AND (?='' OR status=?) ORDER BY updated_at DESC,id LIMIT 101").bind(org,q,q,kind,kind,status,status).all();
  return json({records:result.results.slice(0,100),hasMore:result.results.length>100,limit:100,policy:'TEAM_INTERNAL',semanticSearch:false,kinds,statuses});
 }
 if(request.method==='GET'&&rid){const record=await find(rid);if(!record)throw new HttpError(404,'Elemento non trovato.');const selected=url.searchParams.has('version')?z.coerce.number().int().min(1).max(1000000).parse(url.searchParams.get('version')):null;const history=await env.DB.prepare('SELECT version,snapshot,author_id,created_at FROM knowledge_revisions WHERE record_id=? AND organization_id=?'+(selected?' AND version=?':'')+' ORDER BY version DESC LIMIT 50').bind(rid,org,...(selected?[selected]:[])).all();if(selected&&!history.results.length)throw new HttpError(404,'Versione non trovata.');return json({record,revisions:history.results,historyLimit:50});}
 if(!['POST','PATCH'].includes(request.method)||request.method==='PATCH'&&!rid||request.method==='POST'&&rid)throw new HttpError(405,'Operazione non supportata.');
 const input=z.object({id:z.uuid(),version:z.number().int().min(0),record:fields}).strict().parse(await body(request));
 const data=input.record,id=rid||input.id;if(rid&&rid!==input.id)throw new HttpError(400,'Identificativo non coerente.');
 if(data.status==='VERIFIED'&&(!data.acceptance.trim()||data.evidence.trim().length<20))throw new HttpError(400,'Una verifica richiede criteri di accettazione e una prova consultabile.');
 if(data.source_id){if(data.source_id===id)throw new HttpError(400,'Una fonte deve essere un elemento distinto.');if(!await find(data.source_id))throw new HttpError(400,'Fonte non appartenente al workspace.');}
 if(data.task_id&&!await env.DB.prepare('SELECT id FROM tasks WHERE id=? AND organization_id=?').bind(data.task_id,org).first())throw new HttpError(400,'Attività non appartenente al workspace.');
 const old=await find(id);if(request.method==='PATCH'&&!old)throw new HttpError(404,'Elemento non trovato.');
 if(request.method==='POST'&&old){if(old.created_by===actor.id&&Object.entries(data).every(([key,value])=>old[key]===value))return json({record:old,duplicate:true});throw new HttpError(409,'Identificativo già utilizzato.');}
 if(input.version!==(old?Number(old.version):0))throw new HttpError(409,'Elemento aggiornato da un collega. Ricarica prima di salvare.');
 const keys=Object.keys(data),values=Object.values(data),next=input.version+1,revision=crypto.randomUUID();
 const write=old?env.DB.prepare(`UPDATE knowledge_records SET ${keys.map(k=>k+'=?').join(',')},version=?,updated_by=?,updated_at=? WHERE id=? AND organization_id=? AND version=?`).bind(...values,next,actor.id,stamp,id,org,input.version):env.DB.prepare(`INSERT OR IGNORE INTO knowledge_records(id,organization_id,${keys.join(',')},version,created_by,updated_by,created_at,updated_at) VALUES(${Array(keys.length+7).fill('?').join(',')})`).bind(id,org,...values,next,actor.id,actor.id,stamp,stamp);
 const snapshot=JSON.stringify({...data,id,version:next});
 await env.DB.batch([write,env.DB.prepare('INSERT INTO knowledge_revisions(id,organization_id,record_id,version,snapshot,author_id,created_at) SELECT ?,?,?,?,?,?,? WHERE changes()=1').bind(revision,org,id,next,snapshot,actor.id,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'KNOWLEDGE_SAVED','knowledge_records',?,?,?,? WHERE EXISTS(SELECT 1 FROM knowledge_revisions WHERE id=?)").bind(crypto.randomUUID(),org,actor.id,id,JSON.stringify({version:next}),stamp,stamp,revision)]);
 if(!await env.DB.prepare('SELECT id FROM knowledge_revisions WHERE id=?').bind(revision).first())throw new HttpError(409,'Modifica concorrente: ricarica prima di salvare.');
 return json({record:await find(id)},old?200:201);
}
