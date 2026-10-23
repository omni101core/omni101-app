#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync,realpathSync,statSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const matrixPath='docs/operativo/requirement-coverage.json';
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=message=>{throw new Error(message)};
const implementationStates=new Set(['NOT_CAPTURED','CAPTURED','NEEDS_DECISION','PLANNED','IN_PROGRESS','PARTIALLY_IMPLEMENTED','IMPLEMENTED','CONFIGURED','CONNECTED','TESTED','RELEASED','VERIFIED','BLOCKED','SUPERSEDED']);
const defaults={kind:'CANDIDATE',requirement:null,acceptance:[],backlogKeys:[],captureStatus:'CAPTURED',implementationStatus:'CAPTURED',operationalStatus:'NOT_CONNECTED',implementation:[],tests:[],release:null,verification:{status:'UNKNOWN',reason:'Source block preserved; semantic review pending. Capture is not requirement completion.'},gaps:[],reviewNeeded:true};

// Public files only. Realpath prevents symlink escape; never follows private artifact pointers.
export function scopedFile(root,path){
 if(typeof path!=='string'||!path||isAbsolute(path)||path.includes('\\')||path.split('/').some(p=>p==='..'||p==='.'||(p.startsWith('.')&&p!=='.github')))fail(`Invalid public path: ${path}`);
 const abs=resolve(root,path),rel=relative(realpathSync(root),realpathSync(abs));
 if(rel.startsWith('..')||isAbsolute(rel))fail(`Path escapes repository: ${path}`);
 if(!statSync(abs).isFile())fail(`Expected public file: ${path}`);
 return abs;
}
const json=(root,path,optional=false)=>{if(optional&&!existsSync(resolve(root,path)))return null;return JSON.parse(readFileSync(scopedFile(root,path),'utf8'))};

// Every nonblank line belongs to exactly one candidate. List items/headings start new blocks.
export function sourceBlocks(text){
 const lines=text.split('\n'),blocks=[];let current=null;
 for(let i=0;i<lines.length;i++){
  const line=lines[i];if(!line.trim()){current=null;continue}
  const boundary=/^\s*(?:#{1,6}\s|[-*•]\s|\d+[.)]\s)/.test(line);
  if(!current||boundary){current={startLine:i+1,endLine:i+1,text:line};blocks.push(current)}
  else{current.endLine=i+1;current.text+='\n'+line}
  if(boundary)current=null;
 }
 return blocks;
}
function proofPaths(root,proof,label){
 if(!Array.isArray(proof))fail(`${label} must be an array`);
 for(const entry of proof){const path=typeof entry==='string'?entry:entry?.path;scopedFile(root,path)}
}
function validateRow(root,row,sources,keys){
 if(!implementationStates.has(row.implementationStatus))fail(`Invalid implementation status: ${row.id}`);
 for(const key of row.backlogKeys||[])if(!keys.has(key))fail(`Dangling backlog key ${key}`);
 if(row.sourceId&&!sources.has(row.sourceId))fail(`Dangling source ${row.sourceId}`);
 const source=sources.get(row.sourceId);
 if(row.source?.path){scopedFile(root,row.source.path);if(source?.path&&source.path!==row.source.path)fail(`Source/path mismatch: ${row.id}`)}
 if(row.source?.startLine!=null){if(!source?.lineCount||!Number.isInteger(row.source.startLine)||!Number.isInteger(row.source.endLine)||row.source.startLine<1||row.source.endLine<row.source.startLine||row.source.endLine>source.lineCount)fail(`Invalid source bounds: ${row.id}`)}
 proofPaths(root,row.implementation||[],`Implementation ${row.id}`);proofPaths(root,row.tests||[],`Tests ${row.id}`);
 if(row.implementationStatus==='VERIFIED'||row.operationalStatus==='VERIFIED'||row.verification?.status==='VERIFIED'){
  if(!Array.isArray(row.acceptance)||!row.acceptance.some(criterion=>typeof criterion==='string'&&criterion.trim())||!row.implementation?.length||!row.tests?.length||!row.release?.revision||!row.release?.run||row.verification?.status!=='VERIFIED'||!row.verification.reason)fail(`VERIFIED without acceptance, implementation, tests, release and verification: ${row.id}`);
 }
}
export function reconcile(root){
 const manifest=json(root,'docs/mandati/sources.json'),context=json(root,'docs/operativo/agent-context.json'),backlog=json(root,'docs/operativo/mandate-backlog.json');
 const evidence=json(root,'docs/operativo/requirement-evidence.json',true),findings=json(root,'docs/operativo/mandate-reconciliation-findings.json',true);
 const sources=[],requirements=[],ids=new Set(),sourceMap=new Map(),keys=new Set(backlog.map(x=>x.key));
 const add=row=>{if(ids.has(row.id))fail(`Duplicate requirement ${row.id}`);ids.add(row.id);requirements.push(row)};
 for(const item of manifest){
  const raw=readFileSync(scopedFile(root,item.file));if(sha(raw)!==item.sha256)fail(`Source hash mismatch: ${item.id}`);
  const text=raw.toString('utf8'),id=sha(item.id).slice(0,8),source={id,originalId:item.id,path:item.file,sha256:item.sha256,lineCount:text.split('\n').length,reviewStatus:'PENDING_SEMANTIC_REVIEW'};
  if(sourceMap.has(id))fail(`Source identifier collision ${id}`);sourceMap.set(id,source);sourceMap.set(item.id,source);sources.push(source);
  const occurrences=new Map();for(const block of sourceBlocks(text)){
   const hash=sha(`${item.id}\0${block.text}`).slice(0,16),occurrence=(occurrences.get(hash)||0)+1;occurrences.set(hash,occurrence);
   add({id:`b:${hash}:${occurrence}`,sourceId:id,source:{startLine:block.startLine,endLine:block.endLine}});
  }
 }
 for(const item of context.private_sources||[]){
  if(!item.id||!/^art_[A-Za-z0-9_]+$/.test(item.artifact_id)||!/^[a-f0-9]{64}$/.test(item.sha256))fail('Invalid private source metadata');
  const source={id:item.id,artifactId:item.artifact_id,sha256:item.sha256,reviewStatus:'PRIVATE_ORIGINAL_CAPTURED_REVIEW_PENDING'};
  if(sourceMap.has(source.id))fail(`Duplicate source ${source.id}`);sources.push(source);sourceMap.set(source.id,source);
 }
 const evidenceRows=evidence?.requirements||evidence?.groups||[];const evidenceMap=new Map();
 for(const row of evidenceRows){const key=row.key||row.backlogKey;if(!keys.has(key)||evidenceMap.has(key))fail(`Unknown or duplicate evidence key ${key}`);evidenceMap.set(key,row)}
 for(const group of backlog){
  const proof=evidenceMap.get(group.key),source=sourceMap.get(group.source);
  if(group.source&&!source&&!group.origin)fail(`Dangling macro source ${group.source}`);
  const row={...defaults,id:`group:${group.key}`,sourceId:source?.id||null,source:source?{...(source.path?{path:source.path}:{artifactId:source.artifactId})}:(group.origin?{path:group.origin}:null),kind:'MACRO_GROUP',requirement:group.name,acceptance:[group.acceptance].filter(Boolean),backlogKeys:[group.key],implementationStatus:proof?.implementationStatus||'CAPTURED',operationalStatus:proof?.operationalStatus||'UNKNOWN',implementation:proof?.implementation||[],tests:proof?.tests||[],release:proof?.release||null,verification:proof?.verification||{status:'UNKNOWN',reason:'Macro group has no reviewed evidence. Legacy status is not imported as proof.'},gaps:proof?.gaps||[group.remaining||'Evidence review pending'],reviewNeeded:!proof};
  if(group.origin)scopedFile(root,group.origin);validateRow(root,row,sourceMap,keys);add(row);
 }
 if(findings&&!Array.isArray(findings.requirements)&&!Array.isArray(findings.semanticRequirements)&&!Array.isArray(findings.findings))fail('Findings file has no supported requirement collection');
 for(const review of findings?.reviewedSources||[]){
  const source=sourceMap.get(review.id);
  if(!source||source.sha256!==review.sha256)fail(`Reviewed source hash mismatch: ${review.id}`);
  // Reading an original is evidence of retrieval, not complete requirement interpretation.
  source.originalRead=review.complete===true;source.reviewStatus='FINDINGS_EXTRACTED_SEMANTIC_COVERAGE_PENDING';
 }
 const semantic=findings?.requirements||findings?.semanticRequirements||findings?.findings||[];
 const semanticIds=new Set(semantic.map(item=>item.id));
 for(const finding of semantic){
  const sourceId=finding.sourceId||finding.source?.sourceId,source=sourceMap.get(sourceId);
  const extractedGap=finding.gap?[{description:finding.gap,severity:finding.severity||'UNASSESSED',confidence:finding.confidence??null,dependencies:finding.dependencies||[]}]:[];
  const row={...defaults,...finding,id:finding.id,kind:'REQUIREMENT',sourceId:source?.id||sourceId,
   source:finding.source||{...(source?.path?{path:source.path}:{artifactId:source?.artifactId}),startLine:finding.startLine,endLine:finding.endLine},
   acceptance:typeof finding.acceptance==='string'?[finding.acceptance]:finding.acceptance,
   gaps:finding.gaps||extractedGap,reviewNeeded:finding.reviewNeeded??false};
  if(finding.kind&&finding.kind!=='REQUIREMENT')row.findingKind=finding.kind;
  for(const dependency of finding.dependencies||[])if(!semanticIds.has(dependency))fail(`Dangling finding dependency ${dependency}`);
  // Related macro evidence is deliberately not inherited: it cannot prove a finer clause.
  delete row.startLine;delete row.endLine;delete row.gap;
  if(!row.id||!source||!row.requirement||!row.acceptance?.length)fail('Semantic requirement requires id, source and acceptance criteria');
  validateRow(root,row,sourceMap,keys);add(row);
 }
 const gapQueue=[];
 for(const row of requirements.filter(x=>x.kind))for(const [index,gap]of(row.gaps||[]).entries()){
  const detail=typeof gap==='string'?{description:gap}:gap;
  const severity=String(detail.severity||'UNASSESSED').toUpperCase(),mandatory=severity==='CRITICAL'||severity==='P0'||detail.mandatory===true;
  const confidence=detail.confidence??null,value=detail.value??null,dependency=detail.dependency??null;
  // Unknown dimensions stay unknown; only explicit reviewed numeric values affect ordering.
  const score=[confidence,value,dependency].every(v=>typeof v==='number')?confidence*(value+dependency):null;
  gapQueue.push({id:`${row.id}:gap:${index+1}`,requirementId:row.id,...detail,severity,mandatory,confidence,value,dependency,score});
 }
 const severityRank={CRITICAL:0,P0:0,HIGH:1,P1:1,MEDIUM:2,P2:2,LOW:3,P3:3,UNASSESSED:4};
 gapQueue.sort((a,b)=>Number(b.mandatory)-Number(a.mandatory)||(severityRank[String(a.severity).toUpperCase()]??4)-(severityRank[String(b.severity).toUpperCase()]??4)||(b.score??-1)-(a.score??-1)||a.id.localeCompare(b.id));
 const candidates=requirements.filter(r=>!r.kind).length;
 return {version:1,baseline:evidence?.baseline||{revision:null,run:null},candidateDefaults:defaults,encoding:{candidate:'Rows without kind inherit candidateDefaults; source.path is inherited from sources[sourceId]. Public source aliases map to originalId. No original body is copied.',gapScoring:'Mandatory CRITICAL/P0 gates first, then explicit severity HIGH/MEDIUM/LOW, then reviewed confidence*(value+dependency), otherwise unscored; stable id breaks ties.'},summary:{publicSources:manifest.length,privateSources:sources.length-manifest.length,sourceBlocks:candidates,semanticRequirements:semantic.length,unreviewedBlocks:candidates,macroGroups:backlog.length,gaps:gapQueue.length,pendingInputs:[...(!evidence?['requirement-evidence.json']:[]),...(!findings?['mandate-reconciliation-findings.json']:[])],missingEvidenceGroups:backlog.filter(g=>!evidenceMap.has(g.key)).map(g=>g.key),semanticCoverage:'NOT_ESTABLISHED'},sources,requirements,gapQueue};
}
export function verifyMatrix(root,matrix){
 const expected=reconcile(root);if(JSON.stringify(matrix)!==JSON.stringify(expected))fail('Requirement coverage is stale or modified; regenerate and review');return expected;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),rootIndex=args.indexOf('--root'),root=rootIndex>=0?resolve(args[rootIndex+1]):process.cwd();if(args.some((a,i)=>a!=='--check'&&a!=='--root'&&i!==rootIndex+1))fail('Usage: reconcile-requirements.mjs [--check] [--root repository]');
 const output=JSON.stringify(reconcile(root))+'\n';if(Buffer.byteLength(output)>=1_000_000)fail(`Coverage exceeds publisher limit (${Buffer.byteLength(output)} bytes)`);
 if(args.includes('--check'))verifyMatrix(root,json(root,matrixPath));else writeFileSync(resolve(root,matrixPath),output);
 console.log(JSON.stringify({mode:args.includes('--check')?'check':'generate',bytes:Buffer.byteLength(output),...JSON.parse(output).summary}));
 }catch(error){console.error(error.message);process.exitCode=1}
}
