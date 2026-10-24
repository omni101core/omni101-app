import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
import {resources} from './schema';
const staff:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
const sales:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES'];
const json=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
type Row={id:string;title:string;date:string|number;status:string|null;project_id:string|null;campaign_id?:string|null;lead_id?:string|null};
type Item={type:string;id:string;title:string;start:string;date:string;allDay:boolean;end:null;status:string|null;link:string;projectId:string|null};
type Source={key:string;table:string;date:string;project:string;person?:string;instant?:boolean};
const sources:Source[]=[
 {key:'tasks',table:'tasks',date:'due_date',project:'project_id',person:'assignee_id'},
 {key:'milestones',table:'milestones',date:'due_date',project:'project_id'},
 {key:'projects',table:'projects',date:'due_date',project:'id',person:'owner_id'},
 {key:'campaigns',table:'campaigns',date:'due_date',project:'project_id'},
 {key:'growth-plans',table:'growth_plans',date:'due_date',project:'project_id'},
 {key:'calendar',table:'activities',date:'due_date',project:'NULL'},
 {key:'revenue',table:'revenue_events',date:'created_at',project:'NULL'},
 {key:'reviews',table:'qa_reviews',date:'created_at',project:'project_id'},
 {key:'approvals',table:'approvals',date:'created_at',project:'NULL'},
 {key:'proposals',table:'quotes',date:'valid_until',project:'project_id'},
 {key:'deliverables',table:'deliverables',date:'delivered_at',project:'project_id',instant:true}
];
export async function handleCalendar(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const url=new URL(request.url);if(url.pathname!=='/api/calendar')return null;requireRole(actor,staff);if(request.method!=='GET')throw new HttpError(405,'Metodo non supportato.');
 const from=z.iso.date().parse(url.searchParams.get('from')),to=z.iso.date().parse(url.searchParams.get('to'));if(from>to||Date.parse(to)-Date.parse(from)>92*86400000)throw new HttpError(400,'Scegli un intervallo ordinato di massimo 92 giorni.');
 const type=url.searchParams.get('type'),project=url.searchParams.get('project'),person=url.searchParams.get('person'),ics=url.searchParams.get('format')==='ics';if(type&&!sources.some(s=>s.key===type))throw new HttpError(400,'Tipo non valido.');
 // No organization timezone setting exists yet; use the organization default.
 const timeZone='Europe/Rome',formatter=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
 const readable=(key:string)=>key==='revenue'||key==='campaigns'||key==='growth-plans'?sales.includes(actor.role):key==='approvals'?['OWNER','ADMIN'].includes(actor.role):key==='reviews'?['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER'].includes(actor.role):!resources[key].read||resources[key].read!.includes(actor.role);
 let truncated=false;const items=new Map<string,Item>();
 for(const s of sources.filter(s=>(!type||s.key===type)&&readable(s.key)&&(!person||s.person))){
  const instant=s.instant||s.date==='created_at',date=instant?`datetime(${s.date}/1000,'unixepoch')`:s.date;
  const title=s.key==='revenue'?'description':s.key==='reviews'?"'Revisione QA'":'name',status=['calendar','revenue'].includes(s.key)?'NULL':'status';
  const rows=(await env.DB.prepare(`SELECT id,${title} AS title,${s.date} AS date,${status} AS status,${s.project} AS project_id${s.key==='revenue'?',campaign_id,lead_id':''} FROM ${s.table} WHERE organization_id=? AND julianday(${date})>=julianday(?)-2 AND julianday(${date})<julianday(?)+3${project?` AND ${s.project}=?`:''}${person?` AND ${s.person}=?`:''} ORDER BY ${s.date},id LIMIT 501`).bind(actor.orgId,from,to,...(project?[project]:[]),...(person?[person]:[])).all<Row>()).results;
  if(rows.length>500)truncated=true;
  for(const row of rows){
   const allDay=typeof row.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(row.date),stamp=new Date(row.date),start=allDay?String(row.date):Number.isFinite(stamp.getTime())?stamp.toISOString():null;if(!start)continue;
   const parts=allDay?[]:formatter.formatToParts(stamp),day=allDay?start:['year','month','day'].map(k=>parts.find(p=>p.type===k)!.value).join('-');if(day<from||day>to)continue;
   const link=s.key==='reviews'?'/admin/pipeline?project='+encodeURIComponent(row.project_id||''):s.key==='revenue'?(row.campaign_id?'/admin/campaigns?record='+encodeURIComponent(row.campaign_id):row.lead_id?'/admin/leads?record='+encodeURIComponent(row.lead_id):'/admin/revenue'):'/admin/'+s.key+'?record='+encodeURIComponent(row.id);
   items.set(s.key+':'+row.id,{type:s.key,id:row.id,title:row.title,start,date:day,allDay,end:null,status:row.status,link,projectId:row.project_id});
  }
 }
 const sorted=[...items.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)||a.type.localeCompare(b.type)||a.id.localeCompare(b.id));
 if(ics)return icsResponse(sorted.slice(0,500),from,to);
 return json({items:sorted.slice(0,500),truncated:truncated||sorted.length>500,timeZone});
}

// ponytail: RFC 5545 minimal (no VTIMEZONE, no recurrence); timed events in UTC. Fold only if a client rejects long lines.
const esc=(v:string)=>v.replace(/[\\;,]/g,m=>'\\'+m).replace(/\r?\n/g,'\\n');
function icsResponse(items:Item[],from:string,to:string){
 const stamp=new Date().toISOString().replace(/[-:]|\.\d{3}/g,''),lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OMNI101//Calendario operativo//IT','CALSCALE:GREGORIAN'];
 for(const i of items){
  const day=i.date.replace(/-/g,''),next=new Date(Date.parse(i.date)+86400000).toISOString().slice(0,10).replace(/-/g,'');
  lines.push('BEGIN:VEVENT','UID:'+i.type+'-'+i.id+'@omni101.app','DTSTAMP:'+stamp,i.allDay?'DTSTART;VALUE=DATE:'+day:'DTSTART:'+i.start.replace(/[-:]|\.\d{3}/g,''));
  if(i.allDay)lines.push('DTEND;VALUE=DATE:'+next);
  lines.push('SUMMARY:'+esc(i.title||'Senza titolo'),'CATEGORIES:'+esc(i.type));
  if(i.status)lines.push('STATUS:'+(i.status==='CANCELLED'?'CANCELLED':'CONFIRMED'));
  lines.push('END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 return new Response(lines.join('\r\n')+'\r\n',{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':`attachment; filename="calendario-${from}_${to}.ics"`,'Cache-Control':'no-store'}});
}
