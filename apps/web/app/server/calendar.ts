import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
import {resources} from './schema';
const staff:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const sales:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
type Row={id:string;title:string;date:string;status:string|null;campaign_id?:string|null;lead_id?:string|null};
type Item={type:string;id:string;title:string;start:string;end:string|null;status:string|null;link:string};
type Source={key:string;base:string;col:string};
const sources:Source[]=[
 {key:'tasks',base:'SELECT id,name AS title,substr(due_date,1,10) AS date,status FROM tasks',col:'substr(due_date,1,10)'},
 {key:'milestones',base:'SELECT id,name AS title,substr(due_date,1,10) AS date,status FROM milestones',col:'substr(due_date,1,10)'},
 {key:'projects',base:'SELECT id,name AS title,substr(due_date,1,10) AS date,status FROM projects',col:'substr(due_date,1,10)'},
 {key:'calendar',base:'SELECT id,name AS title,substr(due_date,1,10) AS date,NULL AS status FROM activities',col:'substr(due_date,1,10)'},
 {key:'revenue',base:"SELECT id,description AS title,date(created_at/1000,'unixepoch') AS date,NULL AS status,campaign_id,lead_id FROM revenue_events",col:"date(created_at/1000,'unixepoch')"}
];
export async function handleCalendar(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const url=new URL(request.url);if(url.pathname!=='/api/calendar')return null;requireRole(actor,staff);if(request.method!=='GET')throw new HttpError(405,'Metodo non supportato.');
 const from=z.iso.date().parse(url.searchParams.get('from')),to=z.iso.date().parse(url.searchParams.get('to'));if(from>to||Date.parse(to)-Date.parse(from)>92*86400000)throw new HttpError(400,'Scegli un intervallo ordinato di massimo 92 giorni.');
 const org=actor.orgId,role=actor.role;
 const readable=(key:string)=>{if(key==='revenue')return sales.includes(role);const r=resources[key];return !r.read||r.read.includes(role)};
 const link=(key:string,row:Row)=>key==='revenue'?(row.campaign_id?'/admin/campaigns?record='+encodeURIComponent(row.campaign_id):row.lead_id?'/admin/leads?record='+encodeURIComponent(row.lead_id):''):'/admin/'+key+'?record='+encodeURIComponent(row.id);
 const grouped=await Promise.all(sources.filter(s=>readable(s.key)).map(async s=>({key:s.key,rows:(await env.DB.prepare(s.base+' WHERE organization_id=? AND '+s.col+'>=? AND '+s.col+'<=? ORDER BY date,id LIMIT 501').bind(org,from,to).all<Row>()).results})));
 const items:Item[]=grouped.flatMap(g=>g.rows.map(r=>({type:g.key,id:r.id,title:r.title,start:r.date,end:null,status:r.status,link:link(g.key,r)})));
 items.sort((a,b)=>a.start.localeCompare(b.start)||a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
 return json({items:items.slice(0,500),truncated:items.length>500});
}
