import {describe,it,expect} from 'vitest';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {decodePrivateMandates,verifyPrivateRevisions,preflightPrivateMandates,scopedImportRecord} from '../scripts/private-mandates.mjs';
const body="Mandato sintetico: conserva l'originale e non inviare messaggi.";
const source={id:'synthetic-private',artifact_id:'art_test',sha256:createHash('sha256').update(body).digest('hex'),size_bytes:Buffer.byteLength(body),require_app_import:true};
const row={id:source.id,artifact_id:source.artifact_id,sha256:source.sha256,body};
const encode=(rows:unknown[])=>gzipSync(JSON.stringify({version:1,sources:rows})).toString('base64');
describe('private founder originals CI transport',()=>{
 it('accepts only a complete exact set with manifest provenance',()=>{
  expect(decodePrivateMandates(encode([row]),[source],{required:true})).toEqual([{source,body}]);
  expect(decodePrivateMandates('',[source])).toEqual([]);
  for(const payload of [encode([]),encode([row,row]),encode([{...row,body:body+' altered'}]),encode([{...row,artifact_id:'another'}]),'not-valid-base64'])expect(()=>decodePrivateMandates(payload,[source],{required:true})).toThrow();
  expect(()=>decodePrivateMandates('',[source],{required:true})).toThrow();
 });
 it('bounds decompression and verifies preserved v1 rather than a human-edited current record',()=>{
  expect(()=>decodePrivateMandates(gzipSync('x'.repeat(600000)).toString('base64'),[source],{required:true})).toThrow();
  const records=decodePrivateMandates(encode([row]),[source],{required:true});
  const revisions=[{id:'record:'+source.id,snapshot:JSON.stringify({body,source:source.artifact_id})}];
  expect(verifyPrivateRevisions(records,revisions,(id:string)=>'record:'+id)).toEqual({verifiedPrivateOriginals:1,originalTextPrinted:false});
  expect(()=>verifyPrivateRevisions(records,[{...revisions[0],snapshot:JSON.stringify({body:'changed',source:source.artifact_id})}],(id:string)=>'record:'+id)).toThrow();
 });
});

describe('private import release preflight and scope',()=>{
 it('requires complete transport and returns only bounded metadata',()=>{
  const result=preflightPrivateMandates(encode([row]),[source]);
  expect(result).toEqual({verifiedPrivateOriginals:1,privateOriginalsExpected:1,originalTextPrinted:false,mutations:false});
  expect(JSON.stringify(result)).not.toContain(body);
  for(const payload of ['',encode([]),encode([row,row]),encode([{...row,sha256:'bad'}]),encode([null])])expect(()=>preflightPrivateMandates(payload,[source])).toThrow();
 });
 it('defaults reviewed records to team and restricts private originals',()=>{
  expect(scopedImportRecord({name:'synthetic'})).toEqual({name:'synthetic',access_scope:'TEAM_INTERNAL'});
  expect(scopedImportRecord({name:'synthetic',access_scope:'TEAM_INTERNAL'},{privateOriginal:true})).toEqual({name:'synthetic',access_scope:'OWNER_ADMIN'});
 });
});

it('CLI preflight needs only manifest and transport, no database credentials or other seed files',()=>{
 const cwd=mkdtempSync(join(tmpdir(),'private-preflight-'));
 mkdirSync(join(cwd,'docs/operativo'),{recursive:true});
 writeFileSync(join(cwd,'docs/operativo/agent-context.json'),JSON.stringify({private_sources:[source]}));
 const encoded=encode([row]),script=resolve('scripts/seed-reviewed-context.mjs');
 const env={PATH:process.env.PATH,OMNI101_PRIVATE_MANDATES_GZIP_1:encoded.slice(0,10),OMNI101_PRIVATE_MANDATES_GZIP_2:encoded.slice(10)};
 const result=spawnSync(process.execPath,[script,'--preflight'],{cwd,env,encoding:'utf8'});
 expect(result.status).toBe(0);
 expect(JSON.parse(result.stdout)).toEqual({verifiedPrivateOriginals:1,privateOriginalsExpected:1,originalTextPrinted:false,mutations:false});
 expect(result.stderr).toBe('');
 const missing=spawnSync(process.execPath,[script,'--preflight'],{cwd,env:{PATH:process.env.PATH},encoding:'utf8'});
 expect(missing.status).not.toBe(0);
 expect(missing.stdout).toBe('');
 expect(missing.stderr).not.toContain(body);
});
