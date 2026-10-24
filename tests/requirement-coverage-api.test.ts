import {describe,it,expect} from 'vitest';
import {handleRequirementCoverage} from '../apps/web/app/server/requirement-coverage';
import backlog from '../docs/operativo/mandate-backlog.json';
import {handleApi} from '../apps/web/app/server/api';
import type {Env,Identity} from '../apps/web/app/server/auth';
const env={ORGANIZATION_ID:'omni101'} as Env;
const actor={id:'synthetic-owner',orgId:'omni101',role:'OWNER'} as Identity;
const request=(query='')=>new Request('https://omni101.app/api/requirement-coverage'+query);
describe('requirement coverage access and fidelity',()=>{
 it('rejects anonymous API requests, clients, and another organization',async()=>{
  const anonymous=(await handleApi(request(),env))!;expect([401,503]).toContain(anonymous.status);expect(await anonymous.text()).not.toContain('records'); // senza DB l'API risponde 503 prima dell'autenticazione: in ogni caso nessun dato all'anonimo
  expect(()=>handleRequirementCoverage(request(),env,{...actor,role:'CLIENT'} as Identity)).toThrow();
  expect(()=>handleRequirementCoverage(request(),env,{...actor,orgId:'another-tenant'})).toThrow();
  expect(()=>handleRequirementCoverage(new Request(request(),{method:'POST'}),env,actor)).toThrow();
 });
 it('paginates real macro evidence and expands source candidates without claiming verification',async()=>{
  const res=handleRequirementCoverage(request('?kind=MACRO_GROUP'),env,actor)!;
  const data=await res.json() as any;
  expect(res.headers.get('cache-control')).toBe('no-store');expect(data.total).toBe(backlog.length);expect(data.records.length).toBe(25);expect(data.hasMore).toBe(true);
  const next=await handleRequirementCoverage(request('?kind=MACRO_GROUP&offset=25'),env,actor)!.json() as any;
  expect(next.records.length).toBe(Math.min(25,backlog.length-25));expect(next.hasMore).toBe(backlog.length>50);expect(new Set([...data.records,...next.records].map((r:any)=>r.id)).size).toBe(Math.min(50,backlog.length));
  const candidates=await handleRequirementCoverage(request('?kind=CANDIDATE'),env,actor)!.json() as any;
  expect(candidates.total).toBeGreaterThan(100);
  for(const r of candidates.records){expect(r.reviewNeeded).toBe(true);expect(r.verification.status).not.toBe('VERIFIED');expect(r.source.startLine).toBeGreaterThan(0);expect(r.source.path).toMatch(/^docs\/mandati\//);expect(Array.isArray(r.gaps)).toBe(true)}
  const first=candidates.records[0];const filtered=await handleRequirementCoverage(request('?source='+encodeURIComponent(first.sourceId)),env,actor)!.json() as any;
  expect(filtered.records.every((r:any)=>r.sourceId===first.sourceId)).toBe(true);
 });
 it('bounds filters and never interpolates source paths into filesystem reads',async()=>{
  for(const q of ['?offset=-1','?offset=1.5','?kind=COMPLETED','?source=../../secrets','?q='+('x'.repeat(161))])expect(()=>handleRequirementCoverage(request(q),env,actor)).toThrow();
  expect(handleRequirementCoverage(new Request('https://omni101.app/api/unrelated'),env,actor)).toBeNull();
 });
});
