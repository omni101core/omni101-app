import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';

const writers:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
type Fields={subject:string;preheader:string;body:string;ctaLabel:string;ctaUrl:string;campaignId:string|null};
type Row={id:string;campaign_id:string|null;version:number;status:'DRAFT'|'IN_REVIEW'|'APPROVED';subject:string;preheader:string;body:string;cta_label:string;cta_url:string;updated_at:number};

export function escapeHtml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
export function httpsOnly(value:string){
 let url:URL;try{url=new URL(value)}catch{throw new HttpError(400,'Il pulsante accetta solo un indirizzo https, senza credenziali.')}
 if(url.protocol!=='https:'||url.username||url.password||!url.hostname)throw new HttpError(400,'Il pulsante accetta solo un indirizzo https, senza credenziali.');
 return url.href;
}
export function renderEmailDraft(draft:{subject:string;preheader:string;body:string;ctaLabel:string;ctaUrl:string}){
 const subject=escapeHtml(draft.subject),preheader=escapeHtml(draft.preheader),body=escapeHtml(draft.body),href=draft.ctaUrl?escapeHtml(draft.ctaUrl):'',label=escapeHtml(draft.ctaLabel);
 const cta=href?`<p><a href="${href}">${label}</a></p>`:'';
 const html='<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src \'none\'; script-src \'none\'"><title>'+subject+'</title></head><body><div style="display:none;max-height:0;overflow:hidden">'+preheader+'</div><h1>'+subject+'</h1><pre style="white-space:pre-wrap;font:16px/1.5 sans-serif">'+body+'</pre>'+cta+'</body></html>';
 const text=[draft.subject,draft.preheader,draft.body,draft.ctaLabel&&draft.ctaUrl?draft.ctaLabel+'\n'+draft.ctaUrl:''].filter(part=>part.length>0).join('\n\n');
 return {html,text};
}
function view(row:Row){
 return {id:row.id,version:row.version,status:row.status,subject:row.subject,preheader:row.preheader,body:row.body,ctaLabel:row.cta_label,ctaUrl:row.cta_url,campaignId:row.campaign_id,updatedAt:row.updated_at,provider:null,sendingEnabled:false,account:null,savedIsApproval:false};
}
async function input(request:Request){const raw=await request.text();if(raw.length>40000)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}
const shape={subject:z.string().trim().min(1).max(200),preheader:z.string().trim().max(180).default(''),body:z.string().trim().min(1).max(20000),ctaLabel:z.string().trim().max(80).default(''),ctaUrl:z.string().trim().max(2000).default(''),campaignId:z.union([z.uuid(),z.literal(''),z.null()]).optional()};
function fieldsOf(raw:unknown,withVersion:boolean):Fields&{version?:number}{
 const data=z.object({...shape,...(withVersion?{version:z.number().int().min(1).max(1000000000)}:{})}).strict().parse(raw) as {subject:string;preheader:string;body:string;ctaLabel:string;ctaUrl:string;campaignId?:string|null;version?:number};
 if(!!data.ctaLabel!==!!data.ctaUrl)throw new HttpError(400,'Etichetta e indirizzo del pulsante vanno insieme.');
 return {subject:data.subject,preheader:data.preheader,body:data.body,ctaLabel:data.ctaLabel,ctaUrl:data.ctaUrl?httpsOnly(data.ctaUrl):'',campaignId:data.campaignId||null,version:data.version};
}
async function campaignOwned(env:Env,org:string,campaignId:string|null){if(!campaignId)return;if(!await env.DB.prepare('SELECT id FROM campaigns WHERE id=? AND organization_id=?').bind(campaignId,org).first())throw new HttpError(404,'Campagna non disponibile in questo workspace.')}
function load(env:Env,org:string,id:string){return env.DB.prepare('SELECT id,campaign_id,version,status,subject,preheader,body,cta_label,cta_url,updated_at FROM email_drafts WHERE id=? AND organization_id=?').bind(id,org).first<Row>()}
function kept(row:Row){return json({error:'Versione superata o bozza non modificabile. Il testo nel modulo resta quello che stai scrivendo.',draft:view(row),localKept:true},409)}
function file(body:string,kind:'html'|'text'){
 const type=kind==='html'?'text/html; charset=utf-8':'text/plain; charset=utf-8';
 return new Response(body,{headers:{'content-type':type,'content-disposition':'attachment; filename="bozza-email.'+(kind==='html'?'html':'txt')+'"','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; script-src 'none'"}});
}
export async function handleEmailDrafts(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname;if(!path.startsWith('/api/email-drafts'))return null;
 requireRole(actor,writers);const org=actor.orgId,stamp=Date.now();
 if(path==='/api/email-drafts'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT id,version,status,subject,campaign_id,updated_at FROM email_drafts WHERE organization_id=? ORDER BY updated_at DESC LIMIT 100').bind(org).all<{id:string;version:number;status:Row['status'];subject:string;campaign_id:string|null;updated_at:number}>();
  return json({drafts:rows.results.map(row=>({id:row.id,version:row.version,status:row.status,subject:row.subject,campaignId:row.campaign_id,updatedAt:row.updated_at})),provider:null,sendingEnabled:false,account:null});
 }
 if(path==='/api/email-drafts'&&request.method==='POST'){
  const data=fieldsOf(await input(request),false);await campaignOwned(env,org,data.campaignId);const id=crypto.randomUUID();
  await env.DB.batch([
   env.DB.prepare('INSERT INTO email_drafts(id,organization_id,campaign_id,version,status,subject,preheader,body,cta_label,cta_url,updated_by,created_at,updated_at) VALUES(?,?,?,1,\'DRAFT\',?,?,?,?,?,?,?,?)').bind(id,org,data.campaignId,data.subject,data.preheader,data.body,data.ctaLabel,data.ctaUrl,actor.id,stamp,stamp),
   env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'EMAIL_DRAFT_SAVED','email_drafts',?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,id,JSON.stringify({version:1}),stamp,stamp),
  ]);
  const row=await load(env,org,id);if(!row)throw new HttpError(409,'Bozza non registrata.');return json(view(row),201);
 }
 const match=path.match(/^\/api\/email-drafts\/([0-9a-f-]{36})(\/preview|\/export|\/review)?$/i);if(!match)throw new HttpError(404,'Percorso non disponibile.');
 const id=match[1],tail=match[2]||'',row=await load(env,org,id);if(!row)throw new HttpError(404,'Bozza non disponibile.');
 if(tail==='/preview'&&request.method==='GET'){const rendered=renderEmailDraft({subject:row.subject,preheader:row.preheader,body:row.body,ctaLabel:row.cta_label,ctaUrl:row.cta_url});return json({...rendered,status:row.status,version:row.version,provider:null,sendingEnabled:false,account:null})}
 if(tail==='/export'&&request.method==='GET'){
  const format=new URL(request.url).searchParams.get('format');if(format!=='html'&&format!=='text')throw new HttpError(400,'Formato di export non disponibile.');
  const rendered=renderEmailDraft({subject:row.subject,preheader:row.preheader,body:row.body,ctaLabel:row.cta_label,ctaUrl:row.cta_url});
  return file(format==='html'?rendered.html:rendered.text,format);
 }
 if(tail==='/review'&&request.method==='POST'){
  const data=z.object({version:z.number().int().min(1).max(1000000000)}).strict().parse(await input(request));
  if(row.version!==data.version)return kept(row);
  const pending=await env.DB.prepare("SELECT id FROM approvals WHERE organization_id=? AND resource_type='email_drafts' AND resource_id=? AND status='PENDING'").bind(org,id).first<{id:string}>();
  if(row.status==='IN_REVIEW'&&pending)return json({...view(row),approvalId:pending.id,duplicate:true});
  if(row.status!=='DRAFT')throw new HttpError(409,'Solo una bozza può andare in revisione. Il salvataggio non è un’approvazione.');
  const approvalId=crypto.randomUUID();
  await env.DB.batch([
   env.DB.prepare("UPDATE email_drafts SET status='IN_REVIEW',updated_at=? WHERE id=? AND organization_id=? AND status='DRAFT' AND version=?").bind(stamp,id,org,data.version),
   env.DB.prepare("INSERT INTO approvals(id,organization_id,name,status,resource_type,resource_id,evidence,requested_by,version,created_at,updated_at) SELECT ?,?,?,'PENDING','email_drafts',?,?,?,1,?,? WHERE changes()=1").bind(approvalId,org,'Bozza email / '+row.subject.slice(0,120),id,JSON.stringify({version:data.version}),actor.id,stamp,stamp),
   env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'EMAIL_DRAFT_REVIEW_REQUESTED','email_drafts',?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,id,JSON.stringify({version:data.version,approvalId}),stamp,stamp),
  ]);
  const next=await load(env,org,id);const approval=await env.DB.prepare('SELECT id,status FROM approvals WHERE id=? AND organization_id=?').bind(approvalId,org).first<{id:string;status:string}>();
  if(!next||next.status!=='IN_REVIEW'||!approval)throw new HttpError(409,'Revisione non aperta: il testo non è cambiato.');
  return json({...view(next),approvalId:approval.id,savedIsApproval:false},201);
 }
 if(tail===''&&request.method==='GET')return json(view(row));
 if(tail===''&&request.method==='PATCH'){
  const data=fieldsOf(await input(request),true);if(row.version!==data.version||row.status!=='DRAFT')return kept(row);
  await campaignOwned(env,org,data.campaignId);const nextVersion=row.version+1;
  const results=await env.DB.batch([
   env.DB.prepare("UPDATE email_drafts SET campaign_id=?,version=?,subject=?,preheader=?,body=?,cta_label=?,cta_url=?,updated_by=?,updated_at=? WHERE id=? AND organization_id=? AND version=? AND status='DRAFT'").bind(data.campaignId,nextVersion,data.subject,data.preheader,data.body,data.ctaLabel,data.ctaUrl,actor.id,stamp,id,org,data.version),
   env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'EMAIL_DRAFT_SAVED','email_drafts',?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,id,JSON.stringify({version:nextVersion}),stamp,stamp),
  ]);
  if(results[0]?.meta?.changes!==1)return kept(await load(env,org,id)??row);
  const next=await load(env,org,id);if(!next)return kept(row);return json(view(next));
 }
 throw new HttpError(405,'Operazione non supportata.');
}
