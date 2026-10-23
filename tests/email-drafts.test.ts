import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
import {renderEmailDraft} from '../apps/web/app/server/email-drafts';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));let sync:{before:()=>Promise<number>;after:(slot:number)=>void}|undefined;const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){const slot=sync?await sync.before():0;sqlite.exec('BEGIN');try{const results=statements.map(s=>{const out=sqlite.prepare(s.sql).run(...s.params as []);return {success:true,meta:{changes:Number(out.changes)}}});sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}finally{if(sync)sync.after(slot)}}};return {sqlite,hold(next:{before:()=>Promise<number>;after:(slot:number)=>void}){sync=next},env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
function pairGate(){let n=0,goFirst:()=>void=()=>{},goSecond:()=>void=()=>{};const first=new Promise<void>(resolve=>{goFirst=resolve}),second=new Promise<void>(resolve=>{goSecond=resolve});return {async before(){const slot=++n;if(slot===1)await first;if(slot===2){goFirst();await second}return slot},after(slot:number){if(slot===1)goSecond()}}}
async function owner(sqlite:DatabaseSync,org='omni101',role='OWNER',name='owner'){const t=Date.now();sqlite.prepare('INSERT INTO users(id,email,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(name,name+'@example.test',name,t,t);sqlite.prepare('INSERT INTO memberships(id,organization_id,user_id,role,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(name,org,name,role,t,t);const token='test-session-'+name;sqlite.prepare('INSERT INTO sessions(id,organization_id,user_id,token_hash,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(name,org,name,await digest(token),t+3600000,t,t);return '__Host-omni_session='+token}
const req=(path:string,cookie:string,method='GET',payload?:unknown)=>new Request('https://omni101.app'+path,{method,headers:{Origin:'https://omni101.app','Content-Type':'application/json',Cookie:cookie},...(payload?{body:JSON.stringify(payload)}:{})});
const draft=(extra:Record<string,unknown>={})=>({subject:'Oggetto di prova',preheader:'Anteprima breve',body:'Testo della bozza, senza destinatari.',ctaLabel:'Apri',ctaUrl:'https://omni101.app/start-project',campaignId:null,...extra});
describe('bozze email',()=>{
 it('crea, riapre, aggiorna e tiene il testo salvato se la versione è vecchia',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);
  const created=await handleApi(req('/api/email-drafts',cookie,'POST',draft()),env);
  expect(created?.status).toBe(201);
  const first=await created?.json() as {id:string;version:number;status:string;provider:null;sendingEnabled:boolean;savedIsApproval:boolean;subject:string};
  expect(first).toMatchObject({version:1,status:'DRAFT',provider:null,sendingEnabled:false,savedIsApproval:false,subject:'Oggetto di prova'});
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='EMAIL_DRAFT_SAVED'").get()?.n).toBe(1);
  const reopened=await (await handleApi(req('/api/email-drafts/'+first.id,cookie),env))?.json() as {body:string;version:number};
  expect(reopened.body).toBe('Testo della bozza, senza destinatari.');expect(reopened.version).toBe(1);
  const saved=await handleApi(req('/api/email-drafts/'+first.id,cookie,'PATCH',draft({body:'Testo aggiornato',version:1})),env);
  expect(saved?.status).toBe(200);expect((await saved?.json() as {version:number;body:string}).version).toBe(2);
  const stale=await handleApi(req('/api/email-drafts/'+first.id,cookie,'PATCH',draft({body:'Testo locale non salvato',version:1})),env);
  expect(stale?.status).toBe(409);
  const conflict=await stale?.json() as {localKept:boolean;draft:{body:string;version:number}};
  expect(conflict.localKept).toBe(true);expect(conflict.draft.body).toBe('Testo aggiornato');expect(conflict.draft.version).toBe(2);
  expect(sqlite.prepare('SELECT body FROM email_drafts WHERE id=?').get(first.id)?.body).toBe('Testo aggiornato');
 });
 it('due PATCH letti prima della scrittura: uno solo vince e il 409 non sostituisce il testo locale',async()=>{
  const gate=pairGate(),{sqlite,env,hold}=database(),cookie=await owner(sqlite);
  const created=await (await handleApi(req('/api/email-drafts',cookie,'POST',draft()),env))?.json() as {id:string};
  hold(gate);
  const path='/api/email-drafts/'+created.id;
  const [a,b]=await Promise.all([
   handleApi(req(path,cookie,'PATCH',draft({body:'Testo di A',version:1})),env),
   handleApi(req(path,cookie,'PATCH',draft({body:'Testo di B',version:1})),env),
  ]);
  const winner=a?.status===200?a:b,loser=a?.status===409?a:b;
  expect([a?.status,b?.status].sort()).toEqual([200,409]);
  const won=await winner?.json() as {body:string;version:number};
  const lost=await loser?.json() as {localKept:boolean;draft:{body:string;version:number}};
  expect(lost.localKept).toBe(true);expect(lost.draft.body).toBe(won.body);expect(lost.draft.version).toBe(2);
  expect(won.body==='Testo di A'||won.body==='Testo di B').toBe(true);
  expect(sqlite.prepare('SELECT body,version FROM email_drafts WHERE id=?').get(created.id)).toEqual({body:won.body,version:2});
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='EMAIL_DRAFT_SAVED'").get()?.n).toBe(2);
 });
 it('isola il tenant, rifiuta il ruolo cliente e non accetta uno stato impostato dal client',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),stamp=Date.now();
  const created=await handleApi(req('/api/email-drafts',cookie,'POST',draft({subject:'Solo questo workspace'})),env);
  const id=(await created?.json() as {id:string}).id;
  sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('draft-foreign','Other','draft-foreign',stamp,stamp);
  const foreign=await owner(sqlite,'draft-foreign','OWNER','draft-foreign-owner'),foreignEnv={...env,ORGANIZATION_ID:'draft-foreign'};
  const hidden=await handleApi(req('/api/email-drafts/'+id,foreign),foreignEnv);
  expect(hidden?.status).toBe(404);expect(await hidden?.text()).not.toContain('Solo questo workspace');
  const client=await owner(sqlite,'omni101','CLIENT','draft-client');
  expect((await handleApi(req('/api/email-drafts',client),env))?.status).toBe(403);
  expect((await handleApi(req('/api/email-drafts',client,'POST',draft()),env))?.status).toBe(403);
  const sales=await owner(sqlite,'omni101','SALES','draft-sales');
  expect((await handleApi(req('/api/email-drafts',sales,'POST',draft({subject:'Bozza commerciale'})),env))?.status).toBe(201);
  expect((await handleApi(req('/api/email-drafts',cookie,'POST',draft({status:'APPROVED'})),env))?.status).toBe(400);
  expect(sqlite.prepare("SELECT count(*) n FROM email_drafts WHERE status='APPROVED'").get()?.n).toBe(0);
 });
 it('accetta solo https, solo una campagna del tenant, ed esporta senza script o immagini',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite),stamp=Date.now(),campaign='11111111-1111-4111-8111-111111111111',foreignCampaign='22222222-2222-4222-8222-222222222222';
  sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,?,?)').run('draft-other','Other','draft-other',stamp,stamp);
  sqlite.prepare('INSERT INTO campaigns(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(campaign,'omni101','Campagna interna',stamp,stamp);
  sqlite.prepare('INSERT INTO campaigns(id,organization_id,name,created_at,updated_at) VALUES(?,?,?,?,?)').run(foreignCampaign,'draft-other','Campagna altrui',stamp,stamp);
  expect((await handleApi(req('/api/email-drafts',cookie,'POST',draft({ctaUrl:'http://omni101.app/start-project'})),env))?.status).toBe(400);
  expect((await handleApi(req('/api/email-drafts',cookie,'POST',draft({ctaUrl:'javascript:alert(1)',ctaLabel:'Apri'})),env))?.status).toBe(400);
  expect((await handleApi(req('/api/email-drafts',cookie,'POST',draft({ctaLabel:'Solo etichetta',ctaUrl:''})),env))?.status).toBe(400);
  expect((await handleApi(req('/api/email-drafts',cookie,'POST',draft({campaignId:foreignCampaign})),env))?.status).toBe(404);
  expect(sqlite.prepare('SELECT count(*) n FROM email_drafts').get()?.n).toBe(0);
  const created=await handleApi(req('/api/email-drafts',cookie,'POST',draft({campaignId:campaign,body:'Ciao </pre><script>alert(1)</script><img src="http://evil.test/a.png">'})),env);
  expect(created?.status).toBe(201);
  const saved=await created?.json() as {id:string;campaignId:string};
  expect(saved.campaignId).toBe(campaign);
  const id=saved.id;
  const htmlRes=await handleApi(req('/api/email-drafts/'+id+'/export?format=html',cookie),env);
  expect(htmlRes?.status).toBe(200);
  expect(htmlRes?.headers.get('content-type')).toContain('text/html');
  expect(htmlRes?.headers.get('content-disposition')).toContain('attachment');
  const html=await htmlRes?.text()||'';
  expect(html).not.toMatch(/<script/i);expect(html).not.toMatch(/<img/i);expect(html).not.toMatch(/\ssrc\s*=/i);
  expect(html).toContain('&lt;script');expect(html).toContain('&lt;img');expect(html).toContain('href="https://omni101.app/start-project"');
  expect(html).not.toContain('fetch(');
  const textRes=await handleApi(req('/api/email-drafts/'+id+'/export?format=text',cookie),env);
  expect(textRes?.headers.get('content-type')).toContain('text/plain');
  expect(await textRes?.text()).toContain('Oggetto di prova');
  const preview=await (await handleApi(req('/api/email-drafts/'+id+'/preview',cookie),env))?.json() as {html:string;sendingEnabled:boolean;provider:null};
  expect(preview.provider).toBeNull();expect(preview.sendingEnabled).toBe(false);expect(preview.html).toBe(html);
  const rendered=renderEmailDraft({subject:'<b>',preheader:'',body:'x',ctaLabel:'',ctaUrl:''});
  expect(rendered.html).toContain('&lt;b&gt;');expect(rendered.html).not.toContain('<b>');
 });
 it('chiede revisione nel registro approvazioni e non tratta il salvataggio come approvazione',async()=>{
  const {sqlite,env}=database(),cookie=await owner(sqlite);
  const created=await (await handleApi(req('/api/email-drafts',cookie,'POST',draft()),env))?.json() as {id:string;version:number};
  const review=await handleApi(req('/api/email-drafts/'+created.id+'/review',cookie,'POST',{version:1}),env);
  expect(review?.status).toBe(201);
  const asked=await review?.json() as {status:string;approvalId:string;savedIsApproval:boolean;body:string};
  expect(asked.status).toBe('IN_REVIEW');expect(asked.savedIsApproval).toBe(false);
  expect(sqlite.prepare("SELECT status FROM approvals WHERE id=?").get(asked.approvalId)?.status).toBe('PENDING');
  const blocked=await handleApi(req('/api/email-drafts/'+created.id,cookie,'PATCH',draft({body:'Non deve sostituire',version:1})),env);
  expect(blocked?.status).toBe(409);
  expect(sqlite.prepare('SELECT body,status FROM email_drafts WHERE id=?').get(created.id)).toMatchObject({body:'Testo della bozza, senza destinatari.',status:'IN_REVIEW'});
  const approved=await handleApi(req('/api/approvals/'+asked.approvalId+'/decision',cookie,'POST',{decision:'APPROVED',reason:'Testo controllato in prova.'}),env);
  expect(approved?.status).toBe(200);
  const after=await (await handleApi(req('/api/email-drafts/'+created.id,cookie),env))?.json() as {status:string;sendingEnabled:boolean};
  expect(after.status).toBe('APPROVED');expect(after.sendingEnabled).toBe(false);
  expect((await handleApi(req('/api/email-drafts/'+created.id,cookie,'PATCH',draft({version:1})),env))?.status).toBe(409);
  const second=await (await handleApi(req('/api/email-drafts',cookie,'POST',draft({subject:'Seconda bozza'})),env))?.json() as {id:string};
  const secondReview=await (await handleApi(req('/api/email-drafts/'+second.id+'/review',cookie,'POST',{version:1}),env))?.json() as {approvalId:string};
  expect((await handleApi(req('/api/approvals/'+secondReview.approvalId+'/decision',cookie,'POST',{decision:'REJECTED',reason:'Da riscrivere in prova.'}),env))?.status).toBe(200);
  expect(sqlite.prepare('SELECT status FROM email_drafts WHERE id=?').get(second.id)?.status).toBe('DRAFT');
  expect(sqlite.prepare('SELECT status FROM approvals WHERE id=?').get(secondReview.approvalId)?.status).toBe('REJECTED');
 });
});
