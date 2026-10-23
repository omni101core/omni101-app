import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
const sql=()=>execFileSync('node',['scripts/seed-reviewed-context.mjs','--sql'],{encoding:'utf8',maxBuffer:64e6});
const database=()=>{const db=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())db.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const t=Date.now();db.prepare('INSERT OR IGNORE INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('omni101','OMNI101','omni101',t,t);return db};
const snapshot=(db:DatabaseSync)=>JSON.stringify(['knowledge_records','knowledge_revisions','audit_logs','tasks'].map(t=>db.prepare(`SELECT * FROM ${t} ORDER BY id`).all()));
const one=(db:DatabaseSync,q:string,...p:string[])=>db.prepare(q).get(...p) as Record<string,unknown>;
const pricing='mandate:omni101:pricing',actor='system:founder-mandate-import';
// Simulates the production rows imported before the sync existed.
const stale=(db:DatabaseSync)=>{db.exec(`UPDATE tasks SET status='TODO',priority='HIGH',description='vecchia' WHERE id='${pricing}'`);db.exec(`UPDATE knowledge_records SET status='PLANNED',evidence='',body='vecchio' WHERE kind='REQUIREMENT' AND task_id='${pricing}'`)};
describe('seed-reviewed-context conservative sync',()=>{
 it('scopes every sync UPDATE to importer-owned, actually changed rows',()=>{
  const out=sql(),count=(re:RegExp)=>(out.match(re)||[]).length;
  expect(count(/UPDATE knowledge_records SET /g)).toBeGreaterThan(0);
  expect(count(/UPDATE knowledge_records SET /g)).toBe(count(new RegExp(`WHERE id='[^']+' AND organization_id='omni101' AND updated_by='${actor}' AND \\(name IS NOT `,'g')));
  expect(count(/UPDATE tasks SET /g)).toBeGreaterThan(0);
  expect(count(/UPDATE tasks SET /g)).toBe(count(/AND updated_at=created_at AND NOT EXISTS\(SELECT 1 FROM task_dependencies d WHERE d\.task_id=tasks\.id AND d\.active=1\) AND \(name IS NOT /g));
 });
 it('second run on a fresh import changes nothing',()=>{
  const db=database();db.exec(sql());const first=snapshot(db);db.exec(sql());expect(snapshot(db)).toBe(first);
 });
 it('brings importer-owned stale rows up to date once, with version, revision and audit',()=>{
  const db=database();db.exec(sql());stale(db);
  const before=one(db,'SELECT version FROM knowledge_records WHERE task_id=? AND kind=?',pricing,'REQUIREMENT').version as number;
  db.exec(sql());
  const task=one(db,'SELECT status,priority FROM tasks WHERE id=?',pricing);
  expect(task.status).toBe('IN_PROGRESS');expect(task.priority).toBe('HIGH');
  const record=one(db,'SELECT id,status,version,updated_by FROM knowledge_records WHERE task_id=? AND kind=?',pricing,'REQUIREMENT');
  expect(record.status).toBe('IN_PROGRESS');expect(record.version).toBe(before+1);expect(record.updated_by).toBe(actor);
  expect(one(db,'SELECT count(*) n FROM knowledge_revisions WHERE record_id=? AND version=?',record.id as string,String(before+1)).n).toBe(1);
  expect(one(db,"SELECT count(*) n FROM audit_logs WHERE resource_id=? AND action='MANDATE_CONTEXT_SYNCED'",record.id as string).n).toBe(1);
  const settled=snapshot(db);db.exec(sql());expect(snapshot(db)).toBe(settled);
 });
 it('never touches rows edited by a human',()=>{
  const db=database();db.exec(sql());stale(db);
  const record=one(db,'SELECT id FROM knowledge_records WHERE task_id=? AND kind=?',pricing,'REQUIREMENT').id as string;
  // Same shape as the API: PATCH sets updated_by to the person and bumps version/updated_at; task PATCH bumps updated_at.
  db.prepare("UPDATE knowledge_records SET status='VERIFIED',evidence='prova umana consultabile',version=version+1,updated_by='user-1',updated_at=updated_at+1 WHERE id=?").run(record);
  db.prepare("UPDATE tasks SET status='DONE',updated_at=updated_at+1 WHERE id=?").run(pricing);
  const edited=[one(db,'SELECT * FROM knowledge_records WHERE id=?',record),one(db,'SELECT * FROM tasks WHERE id=?',pricing)];
  db.exec(sql());
  expect(one(db,'SELECT * FROM knowledge_records WHERE id=?',record)).toEqual(edited[0]);
  expect(one(db,'SELECT * FROM tasks WHERE id=?',pricing)).toEqual(edited[1]);
 });
});
