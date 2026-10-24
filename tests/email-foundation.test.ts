import {describe,it,expect,vi,afterEach} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {digest,type Env} from '../apps/web/app/server/auth';
import {hasConsent,isSuppressed,recordConsent,sendEmail,suppress,unsubscribeLink} from '../apps/web/app/server/email-foundation';
// Il modulo esiste solo nel runtime del Worker: in node lo sostituiamo.
vi.mock('cloudflare:email',()=>({EmailMessage:class{constructor(public from:string,public to:string,public raw:string){}}}));
function setup(extra:Record<string,unknown>={}){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const DB={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const out=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return out}catch(e){sqlite.exec('ROLLBACK');throw e}}};const now=Date.now();sqlite.prepare('INSERT INTO agent_budgets(id,organization_id,period_start,period_end,limit_cents,created_at,updated_at) VALUES(?,?,?,?,0,?,?)').run('budget','omni101',now-1000,now+86400000,now,now);return {sqlite,env:{DB,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only',EMAIL_LINK_SECRET:'test-only-secret',LEAD_NOTIFY_TO:'founder@example.test',...extra} as unknown as Env}}
afterEach(()=>vi.unstubAllGlobals());
const T='giulia@example.test';
const grant=(env:Env,purpose:'marketing_email'|'richiesta_contatto'='marketing_email')=>recordConsent(env,{email:T,purpose,text:'Acconsento a ricevere novità',version:'v1',source:'test'});
const mail=(over:Record<string,unknown>={})=>({to:T,subject:'Novità',text:'Ciao',purpose:'marketing_email' as const,kind:'recipient' as const,...over});
const reasons=(sqlite:DatabaseSync)=>(sqlite.prepare("SELECT details FROM audit_logs WHERE action='EMAIL_REFUSED' ORDER BY rowid").all() as {details:string}[]).map(r=>JSON.parse(r.details).reason);

describe('registro consensi e suppression',()=>{
 it('il consenso e uno storico: ultimo evento vince, nessuna modifica, testo e versione salvati',async()=>{
  const {sqlite,env}=setup();
  expect(await hasConsent(env,T,'marketing_email')).toBe(false);
  await grant(env);expect(await hasConsent(env,T,'marketing_email')).toBe(true);
  expect(await hasConsent(env,T.toUpperCase(),'marketing_email')).toBe(true);
  expect(await hasConsent(env,T,'richiesta_contatto')).toBe(false);
  expect(sqlite.prepare('SELECT consent_text,text_version,source,status FROM email_consents').get()).toMatchObject({consent_text:'Acconsento a ricevere novità',text_version:'v1',source:'test',status:'GRANTED'});
  expect(()=>sqlite.exec("UPDATE email_consents SET status='WITHDRAWN'")).toThrow(/append-only/);
 });
 it('suppress e atomico e idempotente: blocca, ritira ogni finalita, audit senza email in chiaro',async()=>{
  const {sqlite,env}=setup();await grant(env);await grant(env,'richiesta_contatto');
  await suppress(env,T,'OPT_OUT','test');await suppress(env,T,'UNSUBSCRIBE','test');
  expect(await isSuppressed(env,T)).toBe(true);
  expect(await hasConsent(env,T,'marketing_email')).toBe(false);expect(await hasConsent(env,T,'richiesta_contatto')).toBe(false);
  expect(sqlite.prepare('SELECT count(*) n FROM email_suppressions').get()?.n).toBe(1);
  expect(sqlite.prepare('SELECT reason FROM email_suppressions').get()?.reason).toBe('OPT_OUT');
  const audit=sqlite.prepare("SELECT resource_id,details FROM audit_logs WHERE action LIKE 'EMAIL_%'").all() as {resource_id:string;details:string}[];
  expect(audit.length).toBeGreaterThanOrEqual(4);
  for(const a of audit){expect(a.resource_id).toBe(await digest(T));expect(a.details).not.toContain(T)}
 });
});

describe('adapter di invio unico',()=>{
 it('rifiuta senza consenso, con altra finalita, in suppression, senza segreto o trasporto: il trasporto non parte',async()=>{
  const {sqlite,env}=setup();const send=vi.fn(async()=>{});
  expect(await sendEmail(env,mail({to:'non una email'}),send)).toEqual({ok:false,reason:'INVALID_RECIPIENT'});
  expect(await sendEmail(env,mail(),send)).toEqual({ok:false,reason:'NO_CONSENT'});
  await grant(env,'richiesta_contatto');
  expect(await sendEmail(env,mail(),send)).toEqual({ok:false,reason:'NO_CONSENT'});
  await grant(env);
  expect(await sendEmail(env,mail())).toEqual({ok:false,reason:'NO_TRANSPORT'});
  expect(await sendEmail({...env,EMAIL_LINK_SECRET:undefined} as Env,mail(),send)).toEqual({ok:false,reason:'NO_LINK_SECRET'});
  await suppress(env,T,'OPT_OUT','test');await grant(env);
  expect(await sendEmail(env,mail(),send)).toEqual({ok:false,reason:'SUPPRESSED'});
  expect(send).not.toHaveBeenCalled();
  expect(reasons(sqlite)).toEqual(['INVALID_RECIPIENT','NO_CONSENT','NO_CONSENT','NO_TRANSPORT','NO_LINK_SECRET','SUPPRESSED']);
 });
 it('con consenso invia testo semplice con link firmato e List-Unsubscribe, nessun pixel',async()=>{
  const {sqlite,env}=setup();await grant(env);const send=vi.fn(async()=>{});
  expect(await sendEmail(env,mail({subject:'Ciao\r\nBcc: x@example.test'}),send)).toEqual({ok:true});
  expect(send).toHaveBeenCalledTimes(1);
  const m=(send.mock.calls[0] as unknown as [{to:string;raw:string}])[0];const head=m.raw.split('\r\n\r\n')[0];
  expect(m.to).toBe(T);expect(head).toContain('List-Unsubscribe: <https://omni101.app/api/email/unsubscribe?e=');expect(head).toContain('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  expect(head).not.toMatch(/\r\nBcc:/);expect(head).toContain('Content-Type: text/plain');expect(m.raw).not.toMatch(/<img|<html/i);
  const body=Buffer.from(m.raw.split('\r\n\r\n')[1].replace(/\r\n/g,''),'base64').toString('utf8');expect(body).toContain('/api/email/unsubscribe?e=');
  expect(sqlite.prepare("SELECT count(*) n FROM audit_logs WHERE action='EMAIL_SENT'").get()?.n).toBe(1);
 });
 it('il trasporto che fallisce da FAILED e viene registrato',async()=>{
  const {sqlite,env}=setup();await grant(env);vi.spyOn(console,'error').mockImplementation(()=>{});
  expect(await sendEmail(env,mail(),async()=>{throw new Error('x')})).toEqual({ok:false,reason:'FAILED'});expect(reasons(sqlite)).toEqual(['FAILED']);
 });
 it('kind founder: solo verso LEAD_NOTIFY_TO, senza consenso, via binding; altrimenti NOT_FOUNDER',async()=>{
  const send=vi.fn(async()=>{});const {env}=setup({NOTIFY_MAIL:{send}});
  expect(await sendEmail(env,mail({kind:'founder'}))).toEqual({ok:false,reason:'NOT_FOUNDER'});
  expect(await sendEmail(env,mail({kind:'founder',to:'Founder@example.test'}))).toEqual({ok:true});
  expect(send).toHaveBeenCalledTimes(1);
  const raw=(send.mock.calls[0] as unknown as [{raw:string}])[0].raw;expect(raw).not.toContain('List-Unsubscribe');
 });
});

describe('disiscrizione firmata',()=>{
 const call=(env:Env,url:string,method='GET',origin?:string)=>handleApi(new Request(url,{method,headers:origin?{Origin:origin}:{}}),env)!;
 it('GET non cambia nulla; POST senza Origin (one-click) sopprime; poi l adapter rifiuta',async()=>{
  const {env}=setup();await grant(env);const link=await unsubscribeLink(env,T);
  const get=await call(env,link);expect(get.status).toBe(200);expect(await get.text()).toContain('Conferma la disiscrizione');expect(await isSuppressed(env,T)).toBe(false);
  const post=await call(env,link,'POST');expect(post.status).toBe(200);expect(await isSuppressed(env,T)).toBe(true);
  expect(await sendEmail(env,mail(),async()=>{})).toEqual({ok:false,reason:'SUPPRESSED'});
 });
 it('firma alterata, email cambiata o segreto diverso: 400 e nessuna suppression',async()=>{
  const {env}=setup();const link=await unsubscribeLink(env,T);const u=new URL(link);
  const bad=[link.replace(/s=[0-9a-f]/,m=>m.slice(0,2)+(u.searchParams.get('s')![0]==='a'?'b':'a')),link.replace(/e=[^&]+/,'e='+Buffer.from('altro@example.test').toString('base64url')),link+'x'.repeat(0)+'&s=zz'];
  for(const b of bad)expect((await call(env,b,'POST')).status).toBe(400);
  const other=await unsubscribeLink({...env,EMAIL_LINK_SECRET:'altro-segreto'} as Env,T);expect((await call(env,other,'POST')).status).toBe(400);
  expect(await isSuppressed(env,T)).toBe(false);
 });
});

describe('intake registra il consenso',()=>{
 const ok=()=>vi.fn(async()=>new Response(JSON.stringify({success:true,hostname:'omni101.app',action:'intake'})));
 const post=(env:Env,message:string)=>handleApi(new Request('https://omni101.app/api/intake',{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json'},body:JSON.stringify({name:'Giulia Verdi',email:'Giulia@Example.test',message,services:['BUILD'],turnstileToken:'test-only',consent:true})}),env)!;
 it('una riga GRANTED con testo mostrato, versione e lead, in italiano e in inglese',async()=>{
  const {sqlite,env}=setup();vi.stubGlobal('fetch',ok());
  const it=await post(env,'Language: Italian\nGoal: più contatti dal sito');expect(it.status).toBe(201);const {leadId}=await it.json() as {leadId:string};
  expect(sqlite.prepare('SELECT * FROM email_consents').get()).toMatchObject({email:T,purpose:'richiesta_contatto',status:'GRANTED',text_version:'2026-10-22',source:'intake',source_ref:leadId});
  expect(sqlite.prepare('SELECT consent_text FROM email_consents').get()?.consent_text).toContain('Acconsento che OMNI101');
  const en=await post(env,'Language: English\nGoal: more leads from the site please');expect(en.status).toBe(201);
  expect((sqlite.prepare('SELECT consent_text FROM email_consents ORDER BY rowid DESC').get() as {consent_text:string}).consent_text).toContain('I agree that OMNI101');
  expect(await hasConsent(env,T,'marketing_email')).toBe(false);
 });
});
