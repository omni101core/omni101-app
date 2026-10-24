import {describe,it,expect} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleApi} from '../apps/web/app/server/api';
import {type Env} from '../apps/web/app/server/auth';
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('packages/db/migrations').sort())sqlite.exec(readFileSync('packages/db/migrations/'+f,'utf8'));const wrap=(sql:string,params:unknown[]=[])=>({bind(...values:unknown[]){return wrap(sql,values)},async first(){return sqlite.prepare(sql).get(...params as [])||null},async all(){return {results:sqlite.prepare(sql).all(...params as []),success:true}},async run(){const out=sqlite.prepare(sql).run(...params as []);return {success:true,meta:{changes:Number(out.changes)}}},sql,params});const db={prepare:(sql:string)=>wrap(sql),async batch(statements:{sql:string;params:unknown[]}[]){sqlite.exec('BEGIN');try{const results=statements.map(s=>sqlite.prepare(s.sql).run(...s.params as []));sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}}};return {sqlite,env:{DB:db,PUBLIC_ORIGIN:'https://omni101.app',ORGANIZATION_ID:'omni101',TURNSTILE_SECRET_KEY:'server-test-only'} as unknown as Env}}
const post=(env:Env,path:string)=>handleApi(new Request('https://omni101.app'+path,{method:'POST',headers:{Origin:'https://omni101.app','Content-Type':'application/json','cf-connecting-ip':'203.0.113.9'},body:'{}'}),env);

describe('rate limit buckets are scoped per endpoint',()=>{
 it('draft saves do not use up the budget of the final intake submit',async()=>{
  const {env}=database();
  for(let i=0;i<13;i++)expect((await post(env,'/api/intake-drafts'))?.status).not.toBe(429);
  expect((await post(env,'/api/intake'))?.status).not.toBe(429);
 });
 it('the intake submit is still limited on its own bucket (12 a minute)',async()=>{
  const {env}=database();
  for(let i=0;i<12;i++)expect((await post(env,'/api/intake'))?.status).not.toBe(429);
  expect((await post(env,'/api/intake'))?.status).toBe(429);
 });
});
