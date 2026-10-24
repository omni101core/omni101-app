import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleMiniDemo} from '../apps/web/app/server/mini-demo';
import {handleApi} from '../apps/web/app/server/api';
import {HttpError,type Env,type Identity} from '../apps/web/app/server/auth';

afterEach(()=>vi.unstubAllGlobals());
function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 const wrap=(sql:string,params:unknown[]=[])=>({sql,params,bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])??null},async all(){return {results:sqlite.prepare(sql).all(...params as [])}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {meta:{changes:Number(out.changes)}}}});
 const env={ORGANIZATION_ID:'org-a',AI_PROVIDER:'nvidia',AI_API_KEY:'test-key',AI_MODEL:'test-model',AI_INPUT_CENTS_PER_MILLION:'0',AI_OUTPUT_CENTS_PER_MILLION:'0',DB:{prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>({meta:{changes:Number(sqlite.prepare(s.sql).run(...s.params as []).changes)}}));sqlite.exec('COMMIT');return out}catch(error){sqlite.exec('ROLLBACK');throw error}}}} as unknown as Env;
 for(const org of ['org-a','org-b'])sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,1,1)').run(org,org,org);
 sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,created_at,updated_at) VALUES(?,?,?,?,?,1,1)').run('budget','org-a',0,9e15,100);
 const actor=(id:string,role:Identity['role'],orgId='org-a'):Identity=>{sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,1,1)').run(id,id+'@example.test',id);return {id,email:id+'@example.test',name:id,role,clientId:null,orgId}};
 const lead=(id:string,message:string,orgId='org-a')=>sqlite.prepare("INSERT INTO leads(id,organization_id,name,message,brief,status,created_at,updated_at) VALUES(?,?,?,?,?,'NEW',1,1)").run(id,orgId,'Mario Rossi',message,'Richiesta originale: '+message);
 return {sqlite,env,actor,lead};
}
const draft=(extra:Record<string,unknown>={})=>({theme:'hospitality',businessName:'Trattoria Verde',headline:'Tavoli prenotabili in un tocco',description:'Una pagina semplice per presentare il locale e raccogliere le prenotazioni.',ctaLabel:'Prenota',features:[{title:'Menu',description:'Il menu del giorno sempre aggiornato.'}],...extra});
const llm=(content:unknown,ok=true)=>{const fn=vi.fn(async()=>new Response(JSON.stringify({choices:[{message:{content:typeof content==='string'?content:JSON.stringify(content)}}]}),{status:ok?200:500}));vi.stubGlobal('fetch',fn);return fn};
const call=async(env:Env,actor:Identity,path:string,method='GET')=>{try{return await handleMiniDemo(new Request('https://omni101.app'+path,{method}),env,actor)}catch(error){if(error instanceof HttpError)return new Response(JSON.stringify({error:error.message}),{status:error.status});throw error}};
const IT='Business or site: trattoriaverde.it\nGoal: più prenotazioni. Scrivetemi a mario@example.com o 333 1234567';

describe('mini-demo',()=>{
 it('roles and tenant: only OWNER/ADMIN/SALES of the same org',async()=>{
  const {env,actor,lead}=fixture();lead('lead-a',IT);lead('lead-b',IT,'org-b');
  const fn=llm(draft());
  for(const role of ['PROJECT_MANAGER','FINANCE','DEVELOPER','CLIENT'] as const)expect((await call(env,actor('u-'+role,role),'/api/leads/lead-a/mini-demo','POST'))?.status).toBe(403);
  expect((await call(env,actor('sales','SALES'),'/api/leads/lead-b/mini-demo','POST'))?.status).toBe(404);
  expect((await call(env,actor('other','OWNER','org-b'),'/api/leads/lead-a/mini-demo','GET'))?.status).toBe(404);
  expect(fn).not.toHaveBeenCalled();
 });
 it('generates a draft linked to the lead, masks contacts for the model, no personal data stored, audited',async()=>{
  const {env,actor,lead,sqlite}=fixture();lead('lead-a',IT);const fn=llm(draft());
  const response=await call(env,actor('sales','SALES'),'/api/leads/lead-a/mini-demo','POST');
  expect(response?.status).toBe(201);const created=await response!.json() as {id:string};
  const sent=JSON.stringify(((fn.mock.calls[0] as unknown[])[1] as {body:string}).body);
  expect(sent).not.toMatch(/mario@example|333 1234567|Mario Rossi/);
  const row=sqlite.prepare('SELECT lead_id,language,share_token_hash,configuration FROM commerce_configurations WHERE id=?').get(created.id) as {lead_id:string;language:string;share_token_hash:string|null;configuration:string};
  expect(row).toMatchObject({lead_id:'lead-a',language:'it',share_token_hash:null});
  expect(JSON.parse(row.configuration)).toMatchObject({version:1,ctaUrl:'https://omni101.app/start-project',businessName:'Trattoria Verde'});
  expect(row.configuration).not.toMatch(/Mario|mario@|333/);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='MINI_DEMO_GENERATED'").get()?.n).toBe(1);
  expect((await (await call(env,actor('s2','SALES'),'/api/leads/lead-a/mini-demo'))!.json() as {demo:{id:string;shared:boolean}}).demo).toMatchObject({id:created.id,shared:false});
  expect((await call(env,actor('s3','SALES'),'/api/leads/lead-a/mini-demo','POST'))?.status).toBe(409);
 });
 it('English lead gets language en',async()=>{
  const {env,actor,lead,sqlite}=fixture();lead('lead-en','Lead magnet: Free personalized mini-demo\nLanguage: English\nBusiness or site: harbour-cafe.com\nGoal: more bookings');llm(draft({businessName:'Harbour Cafe'}));
  expect((await call(env,actor('o','OWNER'),'/api/leads/lead-en/mini-demo','POST'))?.status).toBe(201);
  expect(sqlite.prepare('SELECT language FROM commerce_configurations').get()?.language).toBe('en');
 });
 it('LLM failure or invalid JSON: 502 and nothing saved',async()=>{
  const {env,actor,lead,sqlite}=fixture();lead('lead-a',IT);const owner=actor('o','OWNER');
  const cases:[string,()=>unknown][]=[['http error',()=>llm('x',false)],['not json',()=>llm('non è json')],['schema',()=>llm({theme:'neon'})],['extra key',()=>llm(draft({extra:1}))],['network',()=>vi.stubGlobal('fetch',vi.fn(async()=>{throw new Error('down')}))],
   ['invented number',()=>llm(draft({headline:'Oltre 500 clienti soddisfatti'}))],['quotes',()=>llm(draft({description:'“Il migliore della città” dicono tutti, davvero.'}))],['markup',()=>llm(draft({headline:'Titolo <b>forte</b> qui'}))]];
  for(const [,setup] of cases){setup();expect((await call(env,owner,'/api/leads/lead-a/mini-demo','POST'))?.status).toBe(502)}
  expect(sqlite.prepare('SELECT count(*) n FROM commerce_configurations').get()?.n).toBe(0);
  expect(sqlite.prepare('SELECT count(*) n FROM audit_logs').get()?.n).toBe(0);
 });
 it('fails closed without the free provider',async()=>{
  const {env,actor,lead}=fixture();lead('lead-a',IT);const fn=llm(draft());
  expect((await call({...env,AI_INPUT_CENTS_PER_MILLION:'5'} as Env,actor('o','OWNER'),'/api/leads/lead-a/mini-demo','POST'))?.status).toBe(503);
  expect(fn).not.toHaveBeenCalled();
 });
 it('share creates a private token stored only as hash; public read is minimal; rotate and revoke kill old links',async()=>{
  const {env,actor,lead,sqlite}=fixture();lead('lead-a',IT);llm(draft());const owner=actor('o','OWNER');
  const {id}=await (await call(env,owner,'/api/leads/lead-a/mini-demo','POST'))!.json() as {id:string};
  expect((await call(env,actor('sales','SALES'),'/api/mini-demos/'+id+'/share','POST'))?.status).toBe(403);
  expect((await call(env,actor('o2','OWNER','org-b'),'/api/mini-demos/'+id+'/share','POST'))?.status).toBe(404);
  const first=await (await call(env,owner,'/api/mini-demos/'+id+'/share','POST'))!.json() as {token:string;path:string};
  expect(first.path).toBe('/demo/'+first.token);
  const stored=JSON.stringify(sqlite.prepare('SELECT * FROM commerce_configurations').all());
  expect(stored).not.toContain(first.token);
  const read=(token:string)=>handleApi(new Request('https://omni101.app/api/demo/'+token),env);
  const ok=await read(first.token);expect(ok?.status).toBe(200);
  expect(ok?.headers.get('x-robots-tag')).toContain('noindex');
  const body=await ok!.json() as Record<string,unknown>;
  expect(Object.keys(body).sort()).toEqual(['configuration','language']);
  expect(JSON.stringify(body)).not.toMatch(/Mario|mario@|lead-a/);
  const second=await (await call(env,owner,'/api/mini-demos/'+id+'/share','POST'))!.json() as {token:string};
  expect((await read(first.token))?.status).toBe(404);expect((await read(second.token))?.status).toBe(200);
  expect((await call(env,owner,'/api/mini-demos/'+id+'/share','DELETE'))?.status).toBe(200);
  expect((await read(second.token))?.status).toBe(404);
  expect((await read(crypto.randomUUID()))?.status).toBe(404);
  expect((await read('not-a-token'))?.status).toBe(404);
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action IN ('MINI_DEMO_SHARED','MINI_DEMO_REVOKED')").get()?.n).toBe(3);
 });
 it('a normal configuration is never shareable or public',async()=>{
  const {env,actor,sqlite}=fixture();const owner=actor('o','OWNER');
  sqlite.prepare("INSERT INTO commerce_configurations(id,organization_id,owner_user_id,version,configuration,created_at,updated_at) VALUES('11111111-1111-4111-8111-111111111111','org-a','o',1,'{}',1,1)").run();
  expect((await call(env,owner,'/api/mini-demos/11111111-1111-4111-8111-111111111111/share','POST'))?.status).toBe(404);
 });
});
