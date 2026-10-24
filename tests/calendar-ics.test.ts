import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleCalendar} from '../apps/web/app/server/calendar';
import {type Env,HttpError} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
const actor=(role='OWNER')=>({id:'owner',orgId:'omni101',role}) as unknown as Parameters<typeof handleCalendar>[2];
const ask=(env:Env,qs:string,role?:string)=>handleCalendar(new Request('https://omni101.app/api/calendar?from=2026-11-01&to=2026-11-30&'+qs),env,actor(role));
const seed=(db:DatabaseSync)=>{const t=Date.now();
 db.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run('u1','u1@example.test','Persona Uno',t,t);
 db.prepare('INSERT INTO tasks(id,organization_id,name,status,priority,due_date,assignee_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run('t1','omni101','Task di u1','TODO','HIGH','2026-11-10','u1',t,t);
 db.prepare('INSERT INTO tasks(id,organization_id,name,status,priority,due_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('t2','omni101','Task libero, senza owner','TODO','HIGH','2026-11-11',t,t);
 db.prepare('INSERT INTO quotes(id,organization_id,name,valid_until,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run('q1','omni101','Preventivo; scade','2026-11-20','DRAFT',t,t);
 db.prepare('INSERT INTO projects(id,organization_id,name,status,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('p1','omni101','Progetto','PLANNING',t,t);
 db.prepare('INSERT INTO deliverables(id,organization_id,name,project_id,status,delivered_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').run('d1','omni101','Consegna','p1','DELIVERED',Date.parse('2026-11-15T10:00:00Z'),t,t)};
describe('calendar: quotes, deliverables, person filter, ics',()=>{
 it('adds quote expiry and deliveries to the agenda',async()=>{const {sqlite,env}=database();seed(sqlite);const body=await (await ask(env,'')) !.json() as {items:{type:string;id:string}[]};expect(body.items.map(i=>i.type+':'+i.id)).toEqual(expect.arrayContaining(['proposals:q1','deliverables:d1','tasks:t1']))});
 it('filters by person only on sources that have an owner',async()=>{const {sqlite,env}=database();seed(sqlite);const body=await (await ask(env,'person=u1'))!.json() as {items:{type:string;id:string}[]};expect(body.items.map(i=>i.id)).toEqual(['t1'])});
 it('hides quotes from roles that cannot read proposals',async()=>{const {sqlite,env}=database();seed(sqlite);const body=await (await ask(env,'type=proposals','DEVELOPER'))!.json() as {items:unknown[]};expect(body.items).toEqual([])});
 it('refuses a CLIENT account, also for the .ics export',async()=>{const {sqlite,env}=database();seed(sqlite);for(const qs of ['','format=ics'])await expect(ask(env,qs,'CLIENT')).rejects.toMatchObject({status:403})});
 it('exports a valid escaped .ics',async()=>{const {sqlite,env}=database();seed(sqlite);const res=(await ask(env,'format=ics'))!,text=await res.text();expect(res.headers.get('Content-Type')).toContain('text/calendar');expect(text.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);expect(text).toContain('DTSTART;VALUE=DATE:20261120');expect(text).toContain('DTSTART:20261115T100000Z');expect(text).toContain('SUMMARY:Task libero\\, senza owner');expect(text).toContain('SUMMARY:Preventivo\\; scade');expect(text.endsWith('END:VCALENDAR\r\n')).toBe(true)});
});
