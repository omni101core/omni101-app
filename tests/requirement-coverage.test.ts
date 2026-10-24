import {describe,it,expect,afterAll} from 'vitest';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const script=resolve('scripts/reconcile-requirements.mjs');
const roots:string[]=[];
const output='docs/operativo/requirement-coverage.json';
const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
const put=(root:string,path:string,data:unknown)=>writeFileSync(join(root,path),typeof data==='string'?data:JSON.stringify(data));
const get=(root:string,path=output)=>JSON.parse(readFileSync(join(root,path),'utf8'));
const run=(root:string,check=false)=>execFileSync(process.execPath,[script,'--root',root,...(check?['--check']:[])],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
function fixture(){
 const root=mkdtempSync(join(tmpdir(),'omni-coverage-test-'));roots.push(root);
 for(const path of ['docs/mandati','docs/operativo','apps','tests'])mkdirSync(join(root,path),{recursive:true});
 const original='# Mandato\n\nParagrafo originale\ncontinuazione\n\n- Primo requisito\n- Secondo requisito\n\nFine\n';
 put(root,'docs/mandati/source.md',original);
 put(root,'docs/mandati/sources.json',[{id:'source-one',file:'docs/mandati/source.md',sha256:digest(original)}]);
 put(root,'docs/operativo/agent-context.json',{private_sources:[{id:'private-one',artifact_id:'art_20261023_abcdef',sha256:'a'.repeat(64)}]});
 put(root,'docs/operativo/mandate-backlog.json',[{key:'sample',source:'source-one',name:'Gruppo',acceptance:'Criterio macro',status:'IMPLEMENTED',remaining:'Manca verifica completa'}]);
 put(root,'apps/slice.ts','export const value=1;');put(root,'tests/slice.test.ts','it("slice",()=>{});');
 return root;
}
afterAll(()=>{for(const root of roots)rmSync(root,{recursive:true,force:true})});

describe('requirement coverage reconciliation',()=>{
 it('covers every nonblank original line once, without promoting macro labels or reading private originals',()=>{
  const root=fixture();run(root);const matrix=get(root),candidates=matrix.requirements.filter((row:any)=>!row.kind);
  expect(candidates).toHaveLength(5);
  const covered=candidates.flatMap((row:any)=>Array.from({length:row.source.endLine-row.source.startLine+1},(_,i)=>row.source.startLine+i));
  expect(covered).toEqual([1,3,4,6,7,9]);expect(new Set(covered).size).toBe(covered.length);
  expect(matrix.candidateDefaults.reviewNeeded).toBe(true);expect(matrix.candidateDefaults.implementationStatus).toBe('CAPTURED');
  expect(matrix.requirements.find((row:any)=>row.kind==='MACRO_GROUP').implementationStatus).toBe('CAPTURED');
  expect(matrix.summary.semanticCoverage).toBe('NOT_ESTABLISHED');expect(matrix.summary.unreviewedBlocks).toBe(5);
  expect(matrix.sources.find((source:any)=>source.id==='private-one')).toEqual({id:'private-one',artifactId:'art_20261023_abcdef',sha256:'a'.repeat(64),reviewStatus:'PRIVATE_ORIGINAL_CAPTURED_REVIEW_PENDING'});
  expect(run(root,true)).toContain('"mode":"check"');
 });
 it('detects source mutation and stale generated artifacts',()=>{
  const root=fixture();run(root);put(root,'docs/mandati/source.md','Changed original');
  expect(()=>run(root,true)).toThrow();
  const source=get(root,'docs/mandati/sources.json');source[0].sha256=digest('Changed original');put(root,'docs/mandati/sources.json',source);
  expect(()=>run(root,true)).toThrow();run(root);expect(()=>run(root,true)).not.toThrow();
  const matrix=get(root);matrix.requirements[0].reviewNeeded=false;put(root,output,matrix);expect(()=>run(root,true)).toThrow();
 });
 it('keeps content identities stable when source line positions change',()=>{
  const root=fixture();run(root);const before=get(root).requirements.filter((row:any)=>!row.kind).map((row:any)=>row.id);
  const original='\n'+readFileSync(join(root,'docs/mandati/source.md'),'utf8');put(root,'docs/mandati/source.md',original);
  const sources=get(root,'docs/mandati/sources.json');sources[0].sha256=digest(original);put(root,'docs/mandati/sources.json',sources);run(root);
  expect(get(root).requirements.filter((row:any)=>!row.kind).map((row:any)=>row.id)).toEqual(before);
 });
 it('rejects false VERIFIED, dangling evidence and proof paths outside repository',()=>{
  const root=fixture();
  const evidence={baseline:{revision:'a'.repeat(40),run:'123'},requirements:[{key:'sample',implementationStatus:'VERIFIED',operationalStatus:'CONNECTED',implementation:[],tests:[],release:null,verification:{status:'VERIFIED',reason:'Claim only'}}]};
  put(root,'docs/operativo/requirement-evidence.json',evidence);expect(()=>run(root)).toThrow();
  const row:any=evidence.requirements[0];row.implementationStatus='IMPLEMENTED';row.verification={status:'UNKNOWN',reason:'Not proven'};row.implementation=['../outside.ts'];
  put(root,'docs/operativo/requirement-evidence.json',evidence);expect(()=>run(root)).toThrow();
  row.implementation=['apps/slice.ts'];row.key='missing-key';put(root,'docs/operativo/requirement-evidence.json',evidence);expect(()=>run(root)).toThrow();
  row.key='sample';symlinkSync(join(root,'..'),join(root,'apps/escape'));row.implementation=['apps/escape/not-present'];put(root,'docs/operativo/requirement-evidence.json',evidence);expect(()=>run(root)).toThrow();
 });
 it('retains reviewed semantic gaps and separates evidence release from operational readiness',()=>{
  const root=fixture();
  put(root,'docs/operativo/requirement-evidence.json',{baseline:{revision:'a'.repeat(40),run:'123'},requirements:[{key:'sample',implementationStatus:'PARTIALLY_IMPLEMENTED',operationalStatus:'BLOCKED',implementation:['apps/slice.ts'],tests:['tests/slice.test.ts'],release:{revision:'a'.repeat(40),run:'123'},verification:{status:'TESTED',reason:'Draft slice tested; provider not connected'},gaps:['Provider missing']}]});
  put(root,'docs/operativo/mandate-reconciliation-findings.json',{requirements:[{id:'semantic-one',sourceId:'source-one',source:{path:'docs/mandati/source.md',startLine:6,endLine:7},requirement:'Draft and provider connection',acceptance:['Draft persists','Authorized provider connected'],backlogKeys:['sample'],implementationStatus:'PARTIALLY_IMPLEMENTED',operationalStatus:'BLOCKED',implementation:['apps/slice.ts'],tests:['tests/slice.test.ts'],verification:{status:'TESTED',reason:'Only draft tested'},gaps:[{description:'Provider missing',severity:'P0',confidence:1,value:3,dependency:2}]}]});
  run(root);const matrix=get(root),row=matrix.requirements.find((r:any)=>r.id==='semantic-one');
  expect(row.kind).toBe('REQUIREMENT');expect(row.operationalStatus).toBe('BLOCKED');expect(row.release).toBeNull();
  expect(matrix.summary.semanticRequirements).toBe(1);expect(matrix.summary.unreviewedBlocks).toBe(5);
  expect(matrix.gapQueue[0].mandatory).toBe(true);expect(matrix.gapQueue[0].score).toBe(5);expect(run(root,true)).toContain('"mode":"check"');
 });
 it('ingests the real findings schema with scalar criteria and never inherits macro VERIFIED',()=>{
  const root=fixture(),sources=get(root,'docs/mandati/sources.json');
  put(root,'docs/operativo/requirement-evidence.json',{baseline:{revision:'a'.repeat(40),run:'123'},requirements:[{key:'sample',implementationStatus:'IMPLEMENTED',operationalStatus:'VERIFIED',implementation:['apps/slice.ts'],tests:['tests/slice.test.ts'],release:{revision:'a'.repeat(40),run:'123'},verification:{status:'VERIFIED',reason:'Atomic macro slice proven'}}]});
  put(root,'docs/operativo/mandate-reconciliation-findings.json',{reviewedSources:[{id:'source-one',sha256:sources[0].sha256,complete:true}],findings:[{id:'REC-001',sourceId:'source-one',startLine:6,endLine:7,kind:'omission',requirement:'Deeper capability',acceptance:'Persist and connect provider',backlogKeys:['sample'],gap:'Provider missing',severity:'high',confidence:0.9,dependencies:[]}]});
  run(root);const matrix=get(root),row=matrix.requirements.find((r:any)=>r.id==='REC-001');
  expect(matrix.summary.semanticRequirements).toBe(1);expect(row.source.startLine).toBe(6);expect(row.acceptance).toEqual(['Persist and connect provider']);
  expect(row.implementationStatus).toBe('CAPTURED');expect(row.verification.status).toBe('UNKNOWN');expect(row.release).toBeNull();
  expect(row.findingKind).toBe('omission');expect(row.gaps[0].description).toBe('Provider missing');
  expect(matrix.summary.unreviewedBlocks).toBe(5);expect(matrix.sources[0].originalRead).toBe(true);
  const review=get(root,'docs/operativo/mandate-reconciliation-findings.json');review.reviewedSources[0].sha256='b'.repeat(64);put(root,'docs/operativo/mandate-reconciliation-findings.json',review);expect(()=>run(root)).toThrow();
 });
 it('rejects unsupported findings schemas, dangling dependencies and invalid original ranges',()=>{
  const root=fixture();put(root,'docs/operativo/mandate-reconciliation-findings.json',{unknown:[]});expect(()=>run(root)).toThrow();
  const finding={id:'REC-001',sourceId:'source-one',startLine:6,endLine:7,requirement:'Capability',acceptance:'Criterion',backlogKeys:['sample'],dependencies:['REC-missing']};
  put(root,'docs/operativo/mandate-reconciliation-findings.json',{findings:[finding]});expect(()=>run(root)).toThrow();
  finding.dependencies=[];finding.endLine=100;put(root,'docs/operativo/mandate-reconciliation-findings.json',{findings:[finding]});expect(()=>run(root)).toThrow();
 });

});

describe('coverage operational navigation from the real registry',()=>{
 it('links only registered task keys, original records and the canonical handoff without granting clients access',async()=>{
  const {handleRequirementCoverage}=await import('../apps/web/app/server/requirement-coverage');
  const backlog=JSON.parse(readFileSync('docs/operativo/mandate-backlog.json','utf8'));
  const context=JSON.parse(readFileSync('docs/operativo/agent-context.json','utf8'));
  const sources=JSON.parse(readFileSync('docs/mandati/sources.json','utf8'));
  const actor={id:'synthetic-owner',orgId:'omni101',role:'OWNER'} as any,env={ORGANIZATION_ID:'omni101'} as any;
  const read=async(query:string,who=actor)=>await handleRequirementCoverage(new Request('https://omni101.app/api/requirement-coverage'+query),env,who)!.json() as any;
  const page=await read('?kind=MACRO_GROUP');
  expect(page.navigation).toEqual({pipeline:'/admin/pipeline',handoff:context.handoff});
  expect(readFileSync(page.navigation.handoff,'utf8').length).toBeGreaterThan(0);
  for(const offset of [0,25,50])for(const row of (await read('?kind=MACRO_GROUP&offset='+offset)).records){
   expect(row.tasks.length).toBeGreaterThan(0);
   for(const task of row.tasks){const key=task.id.replace('mandate:omni101:','');expect(backlog.some((item:any)=>item.key===key&&item.name===task.name)).toBe(true);expect(task.href).toBe('/admin/tasks?record='+encodeURIComponent(task.id))}
  }
  const publicRow=(await read('?source='+sources[0].id+'&kind=CANDIDATE')).records[0];
  expect(publicRow.source.knowledgeRecordId).toBe(sources[0].record_id);
  const privateSource=context.private_sources.find((s:any)=>s.id==='commerce-engine-2026-10-24');
  for(const role of ['OWNER','ADMIN']){
   const row=(await read('?source='+privateSource.id,{...actor,role})).records[0];
   const hex=digest('omni101-context-v1:'+privateSource.id),id=hex.slice(0,8)+'-'+hex.slice(8,12)+'-4'+hex.slice(13,16)+'-a'+hex.slice(17,20)+'-'+hex.slice(20,32);
   expect(row.source.knowledgeHref).toBe('/admin/knowledge?record='+id);
   expect(row.source.knowledgeRecordId).toBe(id);
  }
  const team=(await read('?source='+privateSource.id,{...actor,role:'DEVELOPER'})).records[0];
  expect(team.source.knowledgeHref).toBeUndefined();expect(team.source.knowledgeRecordId).toBeUndefined();expect(team.source.body).toBeUndefined();
  const unlinked=(await read('?kind=REQUIREMENT&q=REC-020')).records.find((r:any)=>r.id==='REC-020');expect(unlinked.tasks).toEqual([]);
  try{handleRequirementCoverage(new Request('https://omni101.app/api/requirement-coverage'),env,{...actor,role:'CLIENT'});throw new Error('Client unexpectedly allowed')}catch(error){expect((error as {status:number}).status).toBe(403)}
 });
});
