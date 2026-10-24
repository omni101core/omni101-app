import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleIntakeDrafts} from '../apps/web/app/server/intake-drafts';
import {HttpError,type Env} from '../apps/web/app/server/auth';
import {composeMessage,emptyDraft,isEmpty,parseDraft,questionsFor} from '../apps/web/app/components/public/intake/intake-draft';

function fixture(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('packages/db/migrations').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync('packages/db/migrations/'+file,'utf8'));
 sqlite.prepare('INSERT INTO organizations(id,name,slug,created_at,updated_at) VALUES(?,?,?,1,1)').run('org-a','org-a','org-a');
 const wrap=(sql:string,params:unknown[]=[])=>({sql,params,bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])??null},async run(){sqlite.prepare(sql).run(...params as []);return {success:true}}});
 const env={ORGANIZATION_ID:'org-a',DB:{prepare:(sql:string)=>wrap(sql)}} as unknown as Env;
 return {sqlite,env};
}
const call=async(env:Env,path:string,method='GET',body?:unknown)=>{try{return await handleIntakeDrafts(new Request('https://omni101.app'+path,{method,body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)}),env)}catch(e){if(e instanceof HttpError)return new Response(JSON.stringify({error:e.message}),{status:e.status});throw e}};
const draft={...emptyDraft,projectType:'sito',message:'Mi serve un sito per il mio studio',answers:{pages:'Fino a 5'}};

describe('intake-drafts server',()=>{
 it('create → resume roundtrip drops name, email and consent, stores only the token hash',async()=>{
  const {sqlite,env}=fixture();
  const res=await call(env,'/api/intake-drafts','POST',{draft:{...draft,name:'Luca',email:'luca@example.test',consent:true}});
  expect(res?.status).toBe(201);const {token}=await res!.json() as {token:string};expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  const got=await call(env,'/api/intake-drafts/'+token);expect(got?.status).toBe(200);
  const body=await got!.json() as {draft:Record<string,unknown>};
  expect(body.draft.message).toBe(draft.message);expect(body.draft).not.toHaveProperty('email');expect(body.draft).not.toHaveProperty('name');expect(body.draft).not.toHaveProperty('consent');
  const row=sqlite.prepare('SELECT * FROM intake_drafts').get() as {token_hash:string;payload:string};
  expect(row.token_hash).not.toBe(token);expect(JSON.stringify(row)).not.toContain(token);expect(row.payload).not.toContain('luca@example.test');
 });
 it('update with the same token keeps one row; unknown or expired token is 404 and a new draft is created on update',async()=>{
  const {sqlite,env}=fixture();
  const {token}=await (await call(env,'/api/intake-drafts','POST',{draft}))!.json() as {token:string};
  const again=await call(env,'/api/intake-drafts','POST',{token,draft:{...draft,message:'Aggiornato'}});
  expect(again?.status).toBe(200);expect((await again!.json() as {token:string}).token).toBe(token);
  expect(sqlite.prepare('SELECT count(*) AS n FROM intake_drafts').get()).toEqual({n:1});
  expect((await call(env,'/api/intake-drafts/'+'a'.repeat(43)))?.status).toBe(404);
  expect((await call(env,'/api/intake-drafts/corto'))?.status).toBe(404);
  sqlite.prepare('UPDATE intake_drafts SET expires_at=1').run();
  expect((await call(env,'/api/intake-drafts/'+token))?.status).toBe(404);
  const fresh=await call(env,'/api/intake-drafts','POST',{token,draft});expect(fresh?.status).toBe(201);expect((await fresh!.json() as {token:string}).token).not.toBe(token);
  expect(sqlite.prepare('SELECT count(*) AS n FROM intake_drafts').get()).toEqual({n:1});
 });
 it('rejects invalid, oversize and malformed bodies; delete removes the draft',async()=>{
  const {sqlite,env}=fixture();
  expect((await call(env,'/api/intake-drafts','POST',{draft:{...draft,message:'x'.repeat(10001)}}))?.status).toBe(400);
  expect((await call(env,'/api/intake-drafts','POST',{draft:{v:2}}))?.status).toBe(400);
  expect((await call(env,'/api/intake-drafts','POST','non json'))?.status).toBe(400);
  expect((await call(env,'/api/intake-drafts','POST',{draft,pad:'x'.repeat(20001)}))?.status).toBe(413);
  const {token}=await (await call(env,'/api/intake-drafts','POST',{draft}))!.json() as {token:string};
  expect((await call(env,'/api/intake-drafts/'+token,'DELETE'))?.status).toBe(200);
  expect(sqlite.prepare('SELECT count(*) AS n FROM intake_drafts').get()).toEqual({n:0});
  expect((await call(env,'/api/intake-drafts/'+token))?.status).toBe(404);
 });
 it('other paths and methods fall through',async()=>{
  const {env}=fixture();
  expect(await call(env,'/api/intake','POST',{})).toBeNull();
  expect(await call(env,'/api/intake-drafts','GET')).toBeNull();
 });
});

describe('intake draft helpers',()=>{
 it('adaptive questions follow the type, deterministically',()=>{
  expect(questionsFor('')).toEqual([]);expect(questionsFor('nope')).toEqual([]);
  expect(questionsFor('ecommerce').map(q=>q.id)).toEqual(['products','channel','when']);
  expect(questionsFor('sito')).toEqual(questionsFor('sito'));
 });
 it('parseDraft prunes answers of another type and rejects garbage',()=>{
  expect(parseDraft({...draft,answers:{pages:'Una sola',products:'Oltre 200'}})?.answers).toEqual({pages:'Una sola'});
  expect(parseDraft(null)).toBeNull();expect(parseDraft({v:1})).toBeNull();
  expect(isEmpty(emptyDraft)).toBe(true);expect(isEmpty({...emptyDraft,message:'  '})).toBe(true);expect(isEmpty(draft)).toBe(false);
 });
 it('composeMessage appends answers, stays under the server cap, express is untouched',()=>{
  const m=composeMessage({...draft,answers:{pages:'Fino a 5',when:'Entro 1 mese'}});
  expect(m).toContain('Tipo di progetto: Sito o landing');expect(m).toContain('Quante pagine ti immagini? Fino a 5');expect(m).toContain('Entro quando ti serve? Entro 1 mese');
  expect(composeMessage({...draft,message:'x'.repeat(10000)}).length).toBeLessThanOrEqual(10000);
  expect(composeMessage({...draft,express:true})).toBe(draft.message);
  expect(composeMessage({...emptyDraft,message:'solo testo'})).toBe('solo testo');
 });
});
