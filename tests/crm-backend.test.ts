import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
afterEach(()=>vi.unstubAllGlobals());

const seedOrg=(sqlite:DatabaseSync,id:string)=>{const t=Date.now();sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run(id,id,id,t,t)};
const json=async(r:Response|null)=>await r?.json() as any;

describe('crm backend contract',()=>{
 it('refuses a same-organization duplicate contact by email or phone digits, without merging',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);
  const post=(data:object)=>handleApi(req('/api/records/contacts',cookie,'POST',data),env);
  const first=await post({name:'Mario Rossi',email:'Mario@Example.TEST',phone:'333 123 4567'});expect(first?.status).toBe(201);const firstId=(await json(first)).record.id;
  const byEmail=await post({name:'Altro Mario',email:'mario@example.test'});expect(byEmail?.status).toBe(409);expect(await json(byEmail)).toEqual({error:'Possibile duplicato',duplicateId:firstId,resource:'contacts',overridable:false});
  const byPhone=await post({name:'Altro',email:'altro@example.test',phone:'333-123-4567'});expect(byPhone?.status).toBe(409);const phoneBody=await json(byPhone);expect(phoneBody.duplicateId).toBe(firstId);expect(phoneBody.overridable).toBe(true);
  expect((await post({name:'Corto uno',email:'c1@example.test',phone:'123'}))?.status).toBe(201);expect((await post({name:'Corto due',email:'c2@example.test',phone:'123'}))?.status).toBe(201);
  expect(sqlite.prepare('SELECT count(*) n FROM contacts').get()?.n).toBe(3);
 });

 it('lets an explicit confirmDuplicate create a same-phone contact, never a same-email one, and audits it',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);const post=(data:object)=>handleApi(req('/api/records/contacts',cookie,'POST',data),env);
  expect((await post({name:'Primo',email:'a@example.test',phone:'333 111 2222'}))?.status).toBe(201);
  const same={name:'Secondo',email:'b@example.test',phone:'3331112222'};
  const refused=await post(same);expect(refused?.status).toBe(409);expect((await json(refused)).overridable).toBe(true);
  expect((await post({...same,confirmDuplicate:'yes'}))?.status).toBe(400);
  const forced=await post({...same,confirmDuplicate:true});expect(forced?.status).toBe(201);const id=(await json(forced)).record.id;
  const mail=await post({name:'Stessa email',email:'A@example.test',confirmDuplicate:true});expect(mail?.status).toBe(409);expect((await json(mail)).overridable).toBe(false);
  expect(sqlite.prepare('SELECT count(*) n FROM contacts').get()?.n).toBe(2);expect(JSON.parse(sqlite.prepare("SELECT details FROM audit_logs WHERE action='CREATE' AND resource_id=?").get(id)?.details as string)).toMatchObject({confirmDuplicate:true});
  const plain=await json(await post({name:'Terzo',email:'terzo@example.test'}));expect(JSON.parse(sqlite.prepare("SELECT details FROM audit_logs WHERE action='CREATE' AND resource_id=?").get(plain.record.id)?.details as string)).not.toHaveProperty('confirmDuplicate');
 });

 it('does not treat another organization as a duplicate',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedOrg(sqlite,'crm-foreign');const foreign=await owner(sqlite,'crm-foreign','OWNER','crm-foreign-owner');
  expect((await handleApi(req('/api/records/contacts',foreign,'POST',{name:'Altra org',email:'same@example.test',phone:'333 999 8888'}),{...env,ORGANIZATION_ID:'crm-foreign'}))?.status).toBe(201);
  expect((await handleApi(req('/api/records/contacts',cookie,'POST',{name:'Nostra org',email:'same@example.test',phone:'333 999 8888'}),env))?.status).toBe(201);
 });

 it('rejects a stale PATCH with the current record and keeps the write atomic',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),t=Date.now();
  sqlite.prepare('INSERT INTO contacts(id,organization_id,name,email,created_at,updated_at) VALUES(?,?,?,?,?,?)').run('crm-c1','omni101','Originale','o@example.test',1000,1000);
  const ok=await handleApi(req('/api/records/contacts/crm-c1',cookie,'PATCH',{name:'Primo',expectedUpdatedAt:1000}),env);expect(ok?.status).toBe(200);const saved=(await json(ok)).record;expect(saved.updated_at).toBeGreaterThanOrEqual(t);
  const stale=await handleApi(req('/api/records/contacts/crm-c1',cookie,'PATCH',{name:'Secondo',expectedUpdatedAt:1000}),env);expect(stale?.status).toBe(409);const body=await json(stale);expect(body.error).toBe('Record modificato da un altro socio. Ricarica.');expect(body.current).toMatchObject({id:'crm-c1',name:'Primo',updated_at:saved.updated_at});
  expect(sqlite.prepare('SELECT name FROM contacts WHERE id=?').get('crm-c1')?.name).toBe('Primo');
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='UPDATE' AND resource_id='crm-c1'").get()?.n).toBe(1);
  expect((await handleApi(req('/api/records/contacts/crm-c1',cookie,'PATCH',{name:'Con ricarica',expectedUpdatedAt:saved.updated_at}),env))?.status).toBe(200);
  expect((await handleApi(req('/api/records/contacts/crm-c1',cookie,'PATCH',{name:'Senza campo'}),env))?.status).toBe(200);
  expect((await handleApi(req('/api/records/contacts/crm-c1',cookie,'PATCH',{name:'X',expectedUpdatedAt:'1000'}),env))?.status).toBe(400);
 });

 it('builds a bounded, organization-isolated timeline for contacts and companies',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);seedOrg(sqlite,'crm-foreign');const q=(sql:string,...p:unknown[])=>sqlite.prepare(sql).run(...p as []);
  q('INSERT INTO companies(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)','tl-co','omni101','Azienda',1,1);
  q('INSERT INTO contacts(id,organization_id,name,email,company_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?)','tl-c','omni101','Contatto','t@example.test','tl-co',1,1);
  q('INSERT INTO leads(id,organization_id,name,contact_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)','tl-l','omni101','Lead','tl-c','QUALIFICATION',2000,2000);
  q('INSERT INTO deals(id,organization_id,name,lead_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)','tl-d','omni101','Trattativa','tl-l','NEGOTIATION',4000,4000);
  q('INSERT INTO interactions(id,organization_id,contact_id,channel,direction,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)','tl-i','omni101','tl-c','EMAIL','IN','ciao',3000,3000);
  q('INSERT INTO notes(id,organization_id,resource_type,resource_id,content,created_at,updated_at) VALUES(?,?,?,?,?,?,?)','tl-n','omni101','contacts','tl-c','Nota interna',1000,1000);
  q('INSERT INTO interactions(id,organization_id,contact_id,channel,direction,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)','tl-x','crm-foreign','tl-c','EMAIL','IN','altra org',9000,9000);
  q('INSERT INTO contacts(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)','tl-f','crm-foreign','Esterno',1,1);
  const get=(path:string,c=cookie)=>handleApi(req(path,c),env);
  const contact=await json(await get('/api/records/contacts/tl-c/timeline'));expect(contact.items.map((i:any)=>[i.type,i.id,i.at])).toEqual([['deal','tl-d',4000],['interaction','tl-i',3000],['lead','tl-l',2000],['note','tl-n',1000]]);expect(contact.items[0]).toEqual({type:'deal',id:'tl-d',title:'Trattativa',status:'NEGOTIATION',at:4000});expect(contact.items[1].status).toBeNull();
  const company=await json(await get('/api/records/companies/tl-co/timeline'));expect(company.items.map((i:any)=>i.id)).toEqual(['tl-d','tl-i','tl-l']);
  expect((await get('/api/records/contacts/tl-f/timeline'))?.status).toBe(404);expect((await get('/api/records/contacts/missing/timeline'))?.status).toBe(404);
  const insert=sqlite.prepare('INSERT INTO interactions(id,organization_id,contact_id,channel,direction,body,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)');for(let i=0;i<105;i++)insert.run('tl-bulk-'+i,'omni101','tl-c','NOTE','OUT','x',5000+i,5000+i);
  const many=await json(await get('/api/records/contacts/tl-c/timeline'));expect(many.items).toHaveLength(100);expect(many.items[0].at).toBe(5104);
 });

 it('refuses roles that cannot read CRM records',async()=>{
  const {sqlite,env}=database();await owner(sqlite);sqlite.prepare("INSERT INTO contacts(id,organization_id,name,created_at,updated_at) VALUES('tl-r','omni101','R',1,1)").run();
  const client=await owner(sqlite,'omni101','CLIENT','crm-client');
  for(const kind of ['contacts','companies'])expect((await handleApi(req('/api/records/'+kind+'/tl-r/timeline',client),env))?.status).toBe(403);
 });
});
