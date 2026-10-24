import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';

function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101'} as unknown as Env}}
async function member(sqlite:DatabaseSync,role:string,name:string,clientId:string|null=null){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,client_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,role,clientId,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,'omni101',name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const get=(path:string,cookie:string)=>new Request('https://omni101.app'+path,{headers:{Cookie:cookie}});

// Fixture: SQL reale, nessun mock. Una org, clienti A e B, org estranea; per A righe pubbliche e interne.
function seed(sqlite:DatabaseSync){
 const t=Date.now(),ins=(table:string,row:Record<string,unknown>)=>{const k=Object.keys(row);sqlite.prepare(`INSERT INTO ${table}(${k.join(',')},created_at,updated_at) VALUES(${k.map(()=>'?').join(',')},?,?)`).run(...Object.values(row) as [],t,t)};
 // omni101 la crea gia' la migrazione 0001; la fixture aggiunge solo cio' che manca.
 for(const o of ['omni101','estranea'])if(!sqlite.prepare('SELECT 1 FROM organizations WHERE id=?').get(o))ins('organizations',{id:o,name:o,slug:o});
 for(const [id,org] of [['cliA','omni101'],['cliB','omni101'],['cliX','estranea']])ins('clients',{id,organization_id:org,name:id});
 const proj=(id:string,client:string,vis:string,org='omni101')=>ins('projects',{id,organization_id:org,name:'P-'+id,client_id:client,visibility:vis,budget_cents:999900,description:'d-'+id,status:'ACTIVE'});
 proj('pA-client','cliA','CLIENT');proj('pA-team','cliA','TEAM');proj('pB-client','cliB','CLIENT');proj('pX-client','cliX','CLIENT','estranea');
 for(const [id,client,status,org] of [['qA-draft','cliA','DRAFT','omni101'],['qA-ok','cliA','APPROVED','omni101'],['qB-ok','cliB','APPROVED','omni101'],['qX-ok','cliX','APPROVED','estranea']])ins('quotes',{id,organization_id:org,name:'Q-'+id,client_id:client,status,exclusions:'riservato-'+id,amount_cents:100});
 for(const [id,client,status,org] of [['cA-draft','cliA','DRAFT','omni101'],['cA-ok','cliA','APPROVED','omni101'],['cB-ok','cliB','APPROVED','omni101'],['cX-ok','cliX','APPROVED','estranea']])ins('contracts',{id,organization_id:org,name:'C-'+id,client_id:client,status,body:'corpo-'+id});
 for(const [id,client,status,org] of [['iA-draft','cliA','DRAFT','omni101'],['iA-ok','cliA','RECORDED','omni101'],['iB-ok','cliB','RECORDED','omni101'],['iX-ok','cliX','RECORDED','estranea']])ins('invoices',{id,organization_id:org,name:'I-'+id,client_id:client,status,amount_cents:100,external_reference:'ext-'+id});
 ins('issues',{id:'tA',organization_id:'omni101',name:'T-A',client_id:'cliA',project_id:'pA-client',created_by:'x'});
 ins('issues',{id:'tB',organization_id:'omni101',name:'T-B',client_id:'cliB',project_id:'pB-client',created_by:'x'});
}
// ids per risorsa: [collection generica, id interno di A, id di B, id estraneo]
const targets:[string,string,string,string][]=[['projects','pA-team','pB-client','pX-client'],['proposals','qA-draft','qB-ok','qX-ok'],['contracts','cA-draft','cB-ok','cX-ok'],['invoices','iA-draft','iB-ok','iX-ok'],['issues','tA','tB','tA']];

describe('CLIENT non legge il generico /api/records',()=>{
 it.each(targets)('%s: collection e ID negati a CLIENT A, nessun dato nel corpo',async(res,own,otherClient,foreign)=>{
  const {sqlite,env}=database();seed(sqlite);const cookie=await member(sqlite,'CLIENT','clienteA','cliA');
  for(const path of ['/api/records/'+res,'/api/records/'+res+'/'+own,'/api/records/'+res+'/'+otherClient,'/api/records/'+res+'/'+foreign]){
   const r=await handleApi(get(path,cookie),env);const text=await r!.text();
   expect(r!.status,path).toBe(403);expect(text,path).not.toMatch(/budget_cents|riservato-|corpo-|ext-|visibility|"records"/);
  }
 });
 it('CLIENT negato anche su risorse non client (clients, contacts)',async()=>{
  const {sqlite,env}=database();seed(sqlite);const cookie=await member(sqlite,'CLIENT','clienteA','cliA');
  for(const res of ['clients','contacts','leads'])expect((await handleApi(get('/api/records/'+res,cookie),env))!.status).toBe(403);
 });
});

describe('portale CLIENT invariato',()=>{
 it('mostra solo righe di A pubbliche, con colonne proiettate',async()=>{
  const {sqlite,env}=database();seed(sqlite);const cookie=await member(sqlite,'CLIENT','clienteA','cliA');
  const r=await handleApi(get('/api/portal',cookie),env);expect(r!.status).toBe(200);const data=await r!.json() as Record<string,{id:string}[]>;
  expect(data.projects.map(x=>x.id)).toEqual(['pA-client']);
  expect(data.proposals.map(x=>x.id)).toEqual(['qA-ok']);
  expect(data.contracts.map(x=>x.id)).toEqual(['cA-ok']);
  expect(data.invoices.map(x=>x.id)).toEqual(['iA-ok']);
  expect(data.tickets.map(x=>x.id)).toEqual(['tA']);
  expect(JSON.stringify(data)).not.toMatch(/budget_cents|riservato-|corpo-|ext-|visibility|owner_id|pB-|pX-|qB-|cB-|iB-|tB/);
 });
});

describe('staff invariato',()=>{
 it.each(targets.slice(0,4))('OWNER legge %s collection e ID con colonne private e bozze',async(res,own)=>{
  const {sqlite,env}=database();seed(sqlite);const cookie=await member(sqlite,'OWNER','owner');
  const list=await handleApi(get('/api/records/'+res,cookie),env);expect(list!.status).toBe(200);
  const rows=(await list!.json() as {records:{id:string;organization_id:string}[]}).records;
  expect(rows.map(x=>x.id)).toContain(own);expect(rows.every(x=>x.organization_id==='omni101')).toBe(true);expect(rows.some(x=>x.id.startsWith(own[0]+'X'))).toBe(false);
  const one=await handleApi(get('/api/records/'+res+'/'+own,cookie),env);expect(one!.status).toBe(200);
  const rec=(await one!.json() as {records:Record<string,unknown>[]}).records;expect(rec).toHaveLength(1);expect(rec[0].id).toBe(own);
  if(res==='projects')expect(rec[0]).toMatchObject({visibility:'TEAM',budget_cents:999900});
 });
});
