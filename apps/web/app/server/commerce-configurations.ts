import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity} from './auth';

const httpsUrl=z.string().max(2000).refine(value=>{
 if(/[\u0000-\u0020\u007f]/.test(value))return false;
 try{const url=new URL(value);return url.protocol==='https:'&&!!url.hostname&&!url.username&&!url.password}catch{return false}
},'Indirizzo HTTPS senza credenziali richiesto.');
export const landingConfigurationSchema=z.object({
 version:z.literal(1),theme:z.enum(['studio','hospitality','professional']),
 businessName:z.string().trim().min(2).max(100),headline:z.string().trim().min(5).max(160),
 description:z.string().trim().min(10).max(1200),ctaLabel:z.string().trim().min(2).max(60),ctaUrl:httpsUrl,
 features:z.array(z.object({title:z.string().trim().min(2).max(80),description:z.string().trim().min(2).max(400)}).strict()).min(1).max(6),
}).strict();
export type LandingConfiguration=z.infer<typeof landingConfigurationSchema>;
type Row={id:string;version:number;configuration:string;created_at:number;updated_at:number};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const view=(row:Row)=>({id:row.id,version:row.version,configuration:JSON.parse(row.configuration) as LandingConfiguration,createdAt:row.created_at,updatedAt:row.updated_at});
// Limit bytes while reading, including requests without Content-Length.
async function input(request:Request){
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'JSON richiesto.');
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new HttpError(413,'Richiesta troppo grande.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)) as unknown}catch{throw new HttpError(400,'JSON non valido.')}
}
function parse<T>(schema:z.ZodType<T>,raw:unknown):T{const result=schema.safeParse(raw);if(!result.success)throw new HttpError(400,'Configurazione non valida.');return result.data}
export async function handleCommerceConfigurations(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname,base='/api/commerce/configurations';
 if(path!==base&&!path.startsWith(base+'/'))return null;
 requireRole(actor,['OWNER','ADMIN','CLIENT']);
 const client=actor.role==='CLIENT';if(client&&!actor.clientId)throw new HttpError(403,'Cliente non associato.');
 if(client&&!await env.DB.prepare('SELECT id FROM clients WHERE id=? AND organization_id=?').bind(actor.clientId,actor.orgId).first())throw new HttpError(403,'Cliente non associato.');
 const scope='organization_id=?'+(client?' AND owner_user_id=? AND client_id=?':'');
 const args=client?[actor.orgId,actor.id,actor.clientId]:[actor.orgId];
 const columns='id,version,configuration,created_at,updated_at';
 const load=(id:string)=>env.DB.prepare(`SELECT ${columns} FROM commerce_configurations WHERE id=? AND ${scope}`).bind(id,...args).first<Row>();
 const audit=(id:string,version:number,stamp:number,action:string)=>env.DB.prepare("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,'commerce_configurations',?,?,?,? WHERE changes()=1").bind(crypto.randomUUID(),actor.orgId,actor.id,action,id,JSON.stringify({version}),stamp,stamp);
 if(path===base){
  if(request.method==='GET'){const rows=await env.DB.prepare(`SELECT ${columns} FROM commerce_configurations WHERE ${scope} ORDER BY updated_at DESC,id LIMIT 100`).bind(...args).all<Row>();return json({configurations:rows.results.map(view)})}
  if(request.method!=='POST')throw new HttpError(405,'Operazione non supportata.');
  const data=parse(z.object({configuration:landingConfigurationSchema}).strict(),await input(request));
  const id=crypto.randomUUID(),stamp=Date.now();
  await env.DB.batch([env.DB.prepare('INSERT INTO commerce_configurations(id,organization_id,owner_user_id,client_id,version,configuration,created_at,updated_at) VALUES(?,?,?,?,1,?,?,?)').bind(id,actor.orgId,actor.id,client?actor.clientId:null,JSON.stringify(data.configuration),stamp,stamp),audit(id,1,stamp,'COMMERCE_CONFIGURATION_CREATED')]);
  const row=await load(id);if(!row)throw new HttpError(409,'Configurazione non registrata.');return json(view(row),201);
 }
 const match=path.match(/^\/api\/commerce\/configurations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
 if(!match)throw new HttpError(404,'Configurazione non disponibile.');
 const id=match[1],row=await load(id);if(!row)throw new HttpError(404,'Configurazione non disponibile.');
 if(request.method==='GET')return json(view(row));
 if(request.method!=='PATCH')throw new HttpError(405,'Operazione non supportata.');
 const data=parse(z.object({expectedVersion:z.number().int().min(1).max(2147483646),configuration:landingConfigurationSchema}).strict(),await input(request));
 const conflict=(current:Row)=>json({error:'Versione superata. Ricarica la configurazione salvata.',current:view(current)},409);
 if(data.expectedVersion!==row.version)return conflict(row);
 const nextVersion=row.version+1,stamp=Date.now();
 const result=await env.DB.batch([env.DB.prepare(`UPDATE commerce_configurations SET configuration=?,version=?,updated_at=? WHERE id=? AND ${scope} AND version=?`).bind(JSON.stringify(data.configuration),nextVersion,stamp,id,...args,data.expectedVersion),audit(id,nextVersion,stamp,'COMMERCE_CONFIGURATION_UPDATED')]);
 if(result[0]?.meta?.changes!==1)return conflict(await load(id)??row);
 const next=await load(id);if(!next)throw new HttpError(404,'Configurazione non disponibile.');return json(view(next));
}
