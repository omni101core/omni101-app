import {z} from 'zod';
import {digest,HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const marketing:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const privacy:Role[]=['OWNER','ADMIN'];
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
async function input(request:Request){const raw=await request.text();if(raw.length>10000)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}
const emailSchema=z.email().max(254).transform(value=>value.trim().toLowerCase());
export async function marketingEligibility(env:Env,org:string,email:string){
 const hash=await digest(org+':'+email.trim().toLowerCase());
 const [suppressed,consent]=await Promise.all([env.DB.prepare('SELECT reason FROM marketing_suppressions WHERE organization_id=? AND subject_hash=?').bind(org,hash).first<{reason:string}>(),env.DB.prepare('SELECT state FROM marketing_consent_records WHERE organization_id=? AND subject_hash=? ORDER BY created_at DESC,rowid DESC LIMIT 1').bind(org,hash).first<{state:string}>()]);
 return {suppressed:!!suppressed,reason:suppressed?.reason||null,consent:consent?.state||'NOT_RECORDED',hasDocumentedConsent:consent?.state==='GRANTED',canSend:false,note:'Nessun canale di invio collegato. La registrazione del consenso non attiva campagne e non rimuove un blocco.'};
}
export async function handleGrowth(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname;if(!path.startsWith('/api/growth/'))return null;
 requireRole(actor,marketing);const org=actor.orgId,stamp=Date.now();
 if(path==='/api/growth/overview'&&request.method==='GET'){
  const [plans,campaigns,suppressionCount,consentCount,privacyCount]=await Promise.all([
   env.DB.prepare('SELECT id,name,kind,status,description,success_metric,due_date FROM growth_plans WHERE organization_id=? ORDER BY updated_at DESC LIMIT 100').bind(org).all(),
   env.DB.prepare('SELECT id,name,channel,status,objective,due_date FROM campaigns WHERE organization_id=? ORDER BY updated_at DESC LIMIT 100').bind(org).all(),
   env.DB.prepare('SELECT count(*) total FROM marketing_suppressions WHERE organization_id=?').bind(org).first(),
   privacy.includes(actor.role)?env.DB.prepare('SELECT count(*) total FROM marketing_consent_records WHERE organization_id=?').bind(org).first():Promise.resolve(null),
   privacy.includes(actor.role)?env.DB.prepare("SELECT count(*) total FROM privacy_requests WHERE organization_id=? AND status NOT IN ('COMPLETED','CLOSED')").bind(org).first():Promise.resolve(null),
  ]);
  return json({plans:plans.results,campaigns:campaigns.results,suppressionCount,consentCount,privacyCount,canManagePrivacy:privacy.includes(actor.role),channelsConnected:[],sendingEnabled:false,measurementEnabled:false,limits:{plans:100,campaigns:100},readiness:{seo:'Metadati, sitemap e dati strutturati derivati dalle pagine pubbliche.',sem:'Pianificazione interna: nessun account pubblicitario collegato e nessuna spesa.',geo:'Contenuti SSR, descrizioni e provenienza: nessuna promessa di citazioni o posizionamento.',privacy:'Registri operativi; identità legale, retention, fornitori e procedure da verificare.'}});
 }
 if(path==='/api/growth/eligibility'&&request.method==='POST'){const data=z.object({email:emailSchema}).strict().parse(await input(request));return json(await marketingEligibility(env,org,data.email));}
 if(path==='/api/growth/suppressions'&&request.method==='POST'){
  const data=z.object({email:emailSchema,reason:z.enum(['OPT_OUT','HARD_BOUNCE','COMPLAINT','MANUAL'])}).strict().parse(await input(request));const hash=await digest(org+':'+data.email),id=crypto.randomUUID();
  await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO marketing_suppressions(id,organization_id,subject_hash,reason,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id,org,hash,data.reason,actor.id,stamp,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'MARKETING_SUPPRESSED','marketing_suppressions',?,'{}',?,? WHERE changes()=1").bind(crypto.randomUUID(),org,actor.id,id,stamp,stamp)]);
  return json({suppressed:true,sendingEnabled:false},201);
 }
 if(path==='/api/growth/consents'&&request.method==='POST'){
  requireRole(actor,privacy);const data=z.object({email:emailSchema,state:z.enum(['GRANTED','WITHDRAWN']),source:z.string().trim().min(5).max(300),policyVersion:z.string().trim().min(1).max(64),requestId:z.uuid()}).strict().parse(await input(request));const hash=await digest(org+':'+data.email);
  const find=()=>env.DB.prepare('SELECT organization_id,subject_hash,state,source,policy_version,created_by FROM marketing_consent_records WHERE id=?').bind(data.requestId).first<{organization_id:string;subject_hash:string;state:string;source:string;policy_version:string;created_by:string}>();
  const same=(row:Awaited<ReturnType<typeof find>>)=>row&&row.organization_id===org&&row.subject_hash===hash&&row.state===data.state&&row.source===data.source&&row.policy_version===data.policyVersion&&row.created_by===actor.id;
  const old=await find();if(old){if(!same(old))throw new HttpError(409,'Identificativo già utilizzato.');return json({id:data.requestId,duplicate:true})}
  const claim=crypto.randomUUID();
  await env.DB.batch([env.DB.prepare('INSERT OR IGNORE INTO marketing_consent_records(id,organization_id,subject_hash,state,source,policy_version,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(data.requestId,org,hash,data.state,data.source,data.policyVersion,actor.id,stamp,stamp),env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,'CONSENT_RECORDED','marketing_consent_records',?,'{}',?,? WHERE changes()=1").bind(claim,org,actor.id,data.requestId,stamp,stamp),...(data.state==='WITHDRAWN'?[env.DB.prepare("INSERT OR IGNORE INTO marketing_suppressions(id,organization_id,subject_hash,reason,created_by,created_at,updated_at) SELECT ?,?,?,'OPT_OUT',?,?,? WHERE EXISTS(SELECT 1 FROM audit_logs WHERE id=?)").bind(crypto.randomUUID(),org,hash,actor.id,stamp,stamp,claim)]:[])]);
  if(!same(await find()))throw new HttpError(409,'Identificativo già utilizzato.');return json({id:data.requestId,sendingEnabled:false},201);
 }
 throw new HttpError(405,'Operazione non supportata.');
}
