import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101'} as unknown as Env}}
async function person(sqlite:DatabaseSync,name:string,role='OWNER',clientId:string|null=null){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,client_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,role,clientId,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
async function call(env:Env,cookie:string,method:string,path:string,payload?:unknown){const response=await handleApi(new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload!==undefined?{body:JSON.stringify(payload)}:{})}),env);return {status:response!.status,body:await response!.json() as any}}
const one=(sqlite:DatabaseSync,sql:string,...params:unknown[])=>sqlite.prepare(sql).get(...params as [])as any;
async function seed(env:Env,owner:string){
 const client=(await call(env,owner,'POST','/api/records/clients',{name:'Cliente A',status:'ACTIVE'})).body.record.id as string;
 const project=(await call(env,owner,'POST','/api/records/projects',{name:'Sito vetrina A',status:'ACTIVE',client_id:client})).body.record.id as string;
 const task=(await call(env,owner,'POST','/api/records/tasks',{name:'Home page',project_id:project,status:'IN_PROGRESS',priority:'HIGH'})).body.record.id as string;
 return {client,project,task};
}
async function ship(env:Env,owner:string,sqlite:DatabaseSync,project:string,task:string){
 const asked=await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{});
 await call(env,owner,'POST','/api/qa/'+asked.body.reviewId+'/outcome',{outcome:'PASS',notes:'Verificato su desktop e mobile.'});
 const deliverable=(await call(env,owner,'POST','/api/projects/'+project+'/deliverables',{name:'Sito consegnato',body:'Link e istruzioni di pubblicazione.'})).body.id as string;
 const delivered=await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{});
 return {deliverable,delivered,sqlite};
}
describe('closed delivery pipeline: QA',()=>{
 it('sends a rejected QA back to IN_PROGRESS and closes the task only on a passing review',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');const {project,task}=await seed(env,owner);
  const asked=await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{});
  expect(asked.status).toBe(201);
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',task).status).toBe('REVIEW');
  const qa=one(sqlite,'SELECT kind,qa_for,project_id,status FROM tasks WHERE id=?',asked.body.qaTaskId);
  expect([qa.kind,qa.qa_for,qa.project_id,qa.status]).toEqual(['QA',task,project,'TODO']);
  expect((await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/qa/'+asked.body.reviewId+'/outcome',{outcome:'REJECT',notes:'no'})).status).toBe(400);
  expect(one(sqlite,'SELECT status FROM qa_reviews WHERE id=?',asked.body.reviewId).status).toBe('PENDING');
  const rejected=await call(env,owner,'POST','/api/qa/'+asked.body.reviewId+'/outcome',{outcome:'REJECT',notes:'Il menu non si apre su mobile.'});
  expect(rejected.status).toBe(200);
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',task).status).toBe('IN_PROGRESS');
  expect(one(sqlite,'SELECT description FROM tasks WHERE id=?',task).description).toContain('QA rifiutata: Il menu non si apre su mobile.');
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',asked.body.qaTaskId).status).toBe('DONE');
  expect((await call(env,owner,'POST','/api/qa/'+asked.body.reviewId+'/outcome',{outcome:'PASS',notes:'Ci ripenso, va bene.'})).status).toBe(409);
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',task).status).toBe('IN_PROGRESS');
  const again=await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{});
  expect(again.status).toBe(201);
  expect((await call(env,owner,'POST','/api/qa/'+again.body.reviewId+'/outcome',{outcome:'PASS',notes:'Menu corretto su mobile.'})).status).toBe(200);
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',task).status).toBe('DONE');
  const events=sqlite.prepare("SELECT event_type FROM pipeline_events WHERE stage='QA' ORDER BY rowid").all().map((r:any)=>r.event_type);
  expect(events).toEqual(['QA_REQUESTED','QA_REJECTED','QA_REQUESTED','QA_PASSED']);
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action IN ('QA_REQUESTED','QA_REJECTED','QA_PASSED')").n).toBe(4);
 });
 it('keeps QA tasks, roles and task states under control',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner'),sales=await person(sqlite,'seller','SALES'),dev=await person(sqlite,'dev','DEVELOPER');const {project,task}=await seed(env,owner);
  expect((await call(env,sales,'POST','/api/tasks/'+task+'/request-qa',{})).status).toBe(403);
  const todo=(await call(env,owner,'POST','/api/records/tasks',{name:'Footer',project_id:project,status:'TODO',priority:'NORMAL'})).body.record.id;
  expect((await call(env,owner,'POST','/api/tasks/'+todo+'/request-qa',{})).status).toBe(409);
  const loose=(await call(env,owner,'POST','/api/records/tasks',{name:'Senza progetto',status:'IN_PROGRESS',priority:'NORMAL'})).body.record.id;
  expect((await call(env,owner,'POST','/api/tasks/'+loose+'/request-qa',{})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/tasks/missing/request-qa',{})).status).toBe(404);
  const asked=await call(env,dev,'POST','/api/tasks/'+task+'/request-qa',{});
  expect(asked.status).toBe(201);
  // A QA task is closed by recording its outcome, never by dragging it on the board.
  expect((await call(env,owner,'PATCH','/api/records/tasks/'+asked.body.qaTaskId,{status:'DONE',description:'Fatto'})).status).toBe(409);
  expect((await call(env,owner,'POST','/api/tasks/'+asked.body.qaTaskId+'/request-qa',{})).status).toBe(409);
  expect(one(sqlite,'SELECT status FROM tasks WHERE id=?',asked.body.qaTaskId).status).toBe('TODO');
 });
});
describe('closed delivery pipeline: delivery gate and client portal',()=>{
 it('blocks delivery until work is done, QA passed and a client is attached',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner'),dev=await person(sqlite,'dev','DEVELOPER');const {project,task}=await seed(env,owner);
  const deliverable=(await call(env,owner,'POST','/api/projects/'+project+'/deliverables',{name:'Sito consegnato',body:'Link e istruzioni.'})).body.id;
  expect((await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{})).body.error).toContain('1 attività non completate');
  const asked=await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{});
  expect((await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{})).body.error).toContain('QA è ancora in attesa');
  await call(env,owner,'POST','/api/qa/'+asked.body.reviewId+'/outcome',{outcome:'REJECT',notes:'Contrasto insufficiente.'});
  expect((await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{})).body.error).toContain('1 attività non completate');
  const second=await call(env,owner,'POST','/api/tasks/'+task+'/request-qa',{});
  await call(env,owner,'POST','/api/qa/'+second.body.reviewId+'/outcome',{outcome:'PASS',notes:'Contrasto corretto.'});
  expect((await call(env,dev,'POST','/api/deliverables/'+deliverable+'/deliver',{})).status).toBe(403);
  expect(one(sqlite,'SELECT status,client_visible FROM deliverables WHERE id=?',deliverable)).toEqual({status:'DRAFT',client_visible:0});
  const delivered=await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{});
  expect(delivered.status).toBe(200);
  expect(one(sqlite,'SELECT status,client_visible,delivered_at FROM deliverables WHERE id=?',deliverable).client_visible).toBe(1);
  expect(one(sqlite,'SELECT status,visibility FROM projects WHERE id=?',project)).toEqual({status:'REVIEW',visibility:'CLIENT'});
  expect((await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{})).status).toBe(409);
  // Work marked done by hand is not verified work: without a passing QA review the delivery stays blocked.
  const unverified=(await call(env,owner,'POST','/api/records/projects',{name:'Senza QA',status:'ACTIVE',client_id:one(sqlite,'SELECT client_id FROM projects WHERE id=?',project).client_id})).body.record.id;
  await call(env,owner,'POST','/api/records/tasks',{name:'Fatto a mano',project_id:unverified,status:'DONE',priority:'NORMAL',description:'Chiuso senza verifica.'});
  const unverifiedDeliverable=(await call(env,owner,'POST','/api/projects/'+unverified+'/deliverables',{name:'Bozza senza QA',body:'x'})).body.id;
  expect((await call(env,owner,'POST','/api/deliverables/'+unverifiedDeliverable+'/deliver',{})).body.error).toContain('Nessuna QA superata');
  expect(one(sqlite,'SELECT status FROM deliverables WHERE id=?',unverifiedDeliverable).status).toBe('DRAFT');
  const orphan=(await call(env,owner,'POST','/api/records/projects',{name:'Senza cliente',status:'ACTIVE'})).body.record.id;
  const orphanDeliverable=(await call(env,owner,'POST','/api/projects/'+orphan+'/deliverables',{name:'Bozza',body:'x'})).body.id;
  expect((await call(env,owner,'POST','/api/deliverables/'+orphanDeliverable+'/deliver',{})).body.error).toContain('Associa un cliente');
  const view=await call(env,owner,'GET','/api/projects/'+project+'/pipeline');
  expect(view.body.stages.map((s:any)=>s.key+':'+s.state)).toEqual(['PLANNING:DONE','EXECUTION:DONE','QA:DONE','DELIVERY:ACTIVE','MAINTENANCE:WAITING']);
 });
 it('shows delivered work only to the owning client, who approves or asks for changes',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');const {client,project,task}=await seed(env,owner);
  const other=(await call(env,owner,'POST','/api/records/clients',{name:'Cliente B segreto',status:'ACTIVE'})).body.record.id;
  const otherProject=(await call(env,owner,'POST','/api/records/projects',{name:'Progetto B riservato',status:'ACTIVE',client_id:other})).body.record.id;
  const t=Date.now();
  sqlite.prepare("UPDATE projects SET visibility='CLIENT' WHERE id=?").run(otherProject);
  sqlite.prepare("INSERT INTO deliverables(id,organization_id,name,project_id,status,version,body,client_visible,created_at,updated_at) VALUES('d-b','omni101','Consegna B riservata',?,'DELIVERED',1,'contenuto B',1,?,?)").run(otherProject,t,t);
  sqlite.prepare("INSERT INTO quotes(id,organization_id,name,client_id,status,summary,created_at,updated_at) VALUES('q-b','omni101','Preventivo B riservato',?,'APPROVED','sintesi B',?,?)").run(other,t,t);
  sqlite.prepare("INSERT INTO invoices(id,organization_id,name,client_id,status,amount_cents,created_at,updated_at) VALUES('i-b','omni101','Fattura B riservata',?,'RECORDED',1000,?,?)").run(other,t,t);
  sqlite.prepare("INSERT INTO contracts(id,organization_id,name,client_id,status,created_at,updated_at) VALUES('c-b','omni101','Contratto B riservato',?,'APPROVED',?,?)").run(other,t,t);
  const a=await person(sqlite,'client-a','CLIENT',client),b=await person(sqlite,'client-b','CLIENT',other);
  expect((await call(env,a,'GET','/api/portal')).body.deliverables).toHaveLength(0);
  const {deliverable,delivered}=await ship(env,owner,sqlite,project,task);
  expect(delivered.status).toBe(200);
  const portalA=await call(env,a,'GET','/api/portal');
  expect(portalA.body.deliverables.map((d:any)=>d.id)).toEqual([deliverable]);
  expect(portalA.body.projects.map((p:any)=>p.name)).toEqual(['Sito vetrina A']);
  const everything=JSON.stringify(portalA.body);
  for(const secret of ['Cliente B','Progetto B','Consegna B','Preventivo B','Fattura B','Contratto B','contenuto B'])expect(everything).not.toContain(secret);
  const portalB=await call(env,b,'GET','/api/portal');
  expect(portalB.body.deliverables.map((d:any)=>d.id)).toEqual(['d-b']);
  expect(JSON.stringify(portalB.body)).not.toContain('Sito vetrina A');
  // Another client's deliverable is indistinguishable from a missing one.
  expect((await call(env,a,'POST','/api/portal/deliverables/d-b/decision',{decision:'APPROVED'})).status).toBe(404);
  expect((await call(env,b,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'APPROVED'})).status).toBe(404);
  expect(one(sqlite,'SELECT status FROM deliverables WHERE id=?','d-b').status).toBe('DELIVERED');
  expect((await call(env,owner,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'APPROVED'})).status).toBe(403);
  expect((await call(env,a,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'CHANGES_REQUESTED'})).status).toBe(400);
  const changes=await call(env,a,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'CHANGES_REQUESTED',note:'Il logo va spostato a sinistra.'});
  expect(changes.status).toBe(200);
  expect(one(sqlite,'SELECT status,client_note,approved_by FROM deliverables WHERE id=?',deliverable)).toEqual({status:'CHANGES_REQUESTED',client_note:'Il logo va spostato a sinistra.',approved_by:'client-a'});
  const revision=one(sqlite,"SELECT status,kind,description FROM tasks WHERE project_id=? AND name LIKE 'Revisione cliente%'",project);
  expect([revision.status,revision.kind,revision.description]).toEqual(['TODO','WORK','Il logo va spostato a sinistra.']);
  expect(one(sqlite,'SELECT status FROM projects WHERE id=?',project).status).toBe('ACTIVE');
  expect((await call(env,a,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'APPROVED'})).status).toBe(409);
  // The revision must be done and verified before a new version reaches the client.
  expect((await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{})).status).toBe(409);
  sqlite.prepare("UPDATE tasks SET status='DONE' WHERE project_id=? AND name LIKE 'Revisione cliente%'").run(project);
  const redelivered=await call(env,owner,'POST','/api/deliverables/'+deliverable+'/deliver',{});
  expect(redelivered.body).toEqual({id:deliverable,status:'DELIVERED',version:2});
  const approved=await call(env,a,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'APPROVED'});
  expect(approved.status).toBe(200);
  expect(one(sqlite,'SELECT status,approved_by FROM deliverables WHERE id=?',deliverable)).toEqual({status:'APPROVED',approved_by:'client-a'});
  expect(one(sqlite,'SELECT status FROM projects WHERE id=?',project).status).toBe('COMPLETED');
  expect((await call(env,a,'POST','/api/portal/deliverables/'+deliverable+'/decision',{decision:'CHANGES_REQUESTED',note:'Troppo tardi per cambiare idea.'})).status).toBe(409);
  const types=sqlite.prepare("SELECT event_type FROM pipeline_events WHERE stage='DELIVERY' ORDER BY rowid").all().map((r:any)=>r.event_type);
  expect(types).toEqual(['DELIVERABLE_DRAFTED','DELIVERED','CLIENT_CHANGES_REQUESTED','DELIVERED','CLIENT_APPROVED']);
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action IN ('DELIVERABLE_DELIVERED','DELIVERABLE_APPROVED_BY_CLIENT','DELIVERABLE_CHANGES_REQUESTED')").n).toBe(4);
 });
 it('opens maintenance tickets only on the client’s own shared projects and keeps them private',async()=>{
  const {sqlite,env}=database();const owner=await person(sqlite,'owner');const {client,project,task}=await seed(env,owner);
  const other=(await call(env,owner,'POST','/api/records/clients',{name:'Cliente B',status:'ACTIVE'})).body.record.id;
  const otherProject=(await call(env,owner,'POST','/api/records/projects',{name:'Progetto B',status:'ACTIVE',client_id:other})).body.record.id;
  sqlite.prepare("UPDATE projects SET visibility='CLIENT' WHERE id=?").run(otherProject);
  const a=await person(sqlite,'client-a','CLIENT',client),b=await person(sqlite,'client-b','CLIENT',other),dev=await person(sqlite,'dev','DEVELOPER');
  const ticket={projectId:project,name:'Il form non invia',description:'Dopo la consegna il modulo contatti non invia le email.',priority:'HIGH'};
  // Not yet shared: the project is invisible to its own client until delivery.
  expect((await call(env,a,'POST','/api/portal/tickets',ticket)).status).toBe(404);
  await ship(env,owner,sqlite,project,task);
  expect((await call(env,a,'POST','/api/portal/tickets',{...ticket,description:'corto'})).status).toBe(400);
  expect((await call(env,a,'POST','/api/portal/tickets',{...ticket,projectId:otherProject})).status).toBe(404);
  expect((await call(env,owner,'POST','/api/portal/tickets',ticket)).status).toBe(403);
  const opened=await call(env,a,'POST','/api/portal/tickets',ticket);
  expect(opened.status).toBe(201);
  expect(one(sqlite,'SELECT status,client_id,created_by,priority,project_id FROM issues WHERE id=?',opened.body.id)).toEqual({status:'OPEN',client_id:client,created_by:'client-a',priority:'HIGH',project_id:project});
  expect((await call(env,a,'GET','/api/portal')).body.tickets.map((t:any)=>t.id)).toEqual([opened.body.id]);
  expect((await call(env,b,'GET','/api/portal')).body.tickets).toHaveLength(0);
  expect((await call(env,b,'GET','/api/records/issues')).body.records).toHaveLength(0);
  expect((await call(env,a,'GET','/api/records/issues')).body.records.map((t:any)=>t.id)).toEqual([opened.body.id]);
  expect((await call(env,dev,'GET','/api/records/issues')).body.records.map((t:any)=>t.id)).toEqual([opened.body.id]);
  expect((await call(env,a,'PATCH','/api/records/issues/'+opened.body.id,{status:'CLOSED'})).status).toBe(403);
  expect((await call(env,dev,'PATCH','/api/records/issues/'+opened.body.id,{status:'IN_PROGRESS'})).status).toBe(200);
  const view=await call(env,owner,'GET','/api/projects/'+project+'/pipeline');
  expect(view.body.tickets.map((t:any)=>t.status)).toEqual(['IN_PROGRESS']);
  expect(view.body.stages.find((s:any)=>s.key==='MAINTENANCE').state).toBe('ACTIVE');
  expect(one(sqlite,"SELECT count(*) n FROM pipeline_events WHERE event_type='TICKET_OPENED'").n).toBe(1);
  expect(one(sqlite,"SELECT count(*) n FROM audit_logs WHERE action='TICKET_OPENED'").n).toBe(1);
  expect(one(sqlite,"SELECT count(*) n FROM notifications WHERE name LIKE 'Ticket cliente%'").n).toBe(1);
  // Staff-only surfaces stay closed to clients.
  expect((await call(env,a,'GET','/api/projects/'+project+'/pipeline')).status).toBe(403);
  expect((await call(env,a,'GET','/api/records/deliverables')).status).toBe(403);
  expect((await call(env,a,'GET','/api/mission-control')).status).toBe(403);
 });
});
