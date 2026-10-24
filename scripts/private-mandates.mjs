// Encrypted CI transport only: originals never belong in this public repository.
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const sha256=body=>createHash('sha256').update(body).digest('hex');
export function decodePrivateMandates(encoded,registry,{required=false}={}){
 const expected=registry.filter(s=>s.require_app_import);
 if(!encoded){if(required&&expected.length)throw new Error('Private mandate transport missing; import not confirmed.');return []}
 if(encoded.length>100000||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded))throw new Error('Invalid private mandate transport.');
 let payload;try{payload=JSON.parse(gunzipSync(Buffer.from(encoded,'base64'),{maxOutputLength:512000}).toString('utf8'))}catch{throw new Error('Invalid private mandate payload.')}
 if(!payload||payload.version!==1||!Array.isArray(payload.sources)||payload.sources.length>12)throw new Error('Invalid private mandate envelope.');
 const seen=new Set(),records=[];
 for(const row of payload.sources){
  const source=registry.find(s=>s.id===row?.id);
  if(!row||!source||seen.has(row.id)||typeof row.body!=='string'||row.body.length>60000||row.sha256!==source.sha256||row.artifact_id!==source.artifact_id||sha256(row.body)!==source.sha256||Buffer.byteLength(row.body)!==source.size_bytes)throw new Error('Private mandate provenance or integrity mismatch.');
  seen.add(row.id);records.push({source,body:row.body});
 }
 if(required&&expected.some(s=>!seen.has(s.id)))throw new Error('Private mandate set incomplete; import not confirmed.');
 return records;
}
export function verifyPrivateRevisions(records,rows,uid){
 for(const {source} of records){
  const row=rows.find(r=>r.id===uid(source.id));let original;
  try{original=JSON.parse(row?.snapshot||'null')}catch{}
  if(typeof original?.body!=='string'||sha256(original.body)!==source.sha256||!original.source?.includes(source.artifact_id))throw new Error('Private mandate original revision not verified.');
 }
 return {verifiedPrivateOriginals:records.length,originalTextPrinted:false};
}

export function preflightPrivateMandates(encoded,registry){
 const records=decodePrivateMandates(encoded,registry,{required:true});
 return {verifiedPrivateOriginals:records.length,privateOriginalsExpected:registry.filter(s=>s.require_app_import).length,originalTextPrinted:false,mutations:false};
}
export function scopedImportRecord(data,{privateOriginal=false}={}){
 return {...data,access_scope:privateOriginal?'OWNER_ADMIN':'TEAM_INTERNAL'};
}
