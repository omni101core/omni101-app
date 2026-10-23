import {describe,it,expect} from 'vitest';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {decodePrivateMandates,verifyPrivateRevisions} from '../scripts/private-mandates.mjs';
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
