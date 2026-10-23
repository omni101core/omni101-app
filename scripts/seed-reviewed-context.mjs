// Idempotent, additive import of explicitly supplied founder mandates. No agents, invitations or external sends.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const target=process.argv[2];
if(!['staging','production','--dry-run','--sql'].includes(target))throw new Error('Specify staging, production, --dry-run or --sql.');
const stamp=Date.now(),org='omni101',actor='system:founder-mandate-import',project='operating:omni101:project';
const sources=JSON.parse(readFileSync('docs/mandati/sources.json','utf8')),backlog=JSON.parse(readFileSync('docs/operativo/mandate-backlog.json','utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const uid=key=>{const hex=hash('omni101-context-v1:'+key);return hex.slice(0,8)+'-'+hex.slice(8,12)+'-4'+hex.slice(13,16)+'-a'+hex.slice(17,20)+'-'+hex.slice(20,32)};
const value=v=>v===null?'NULL':typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'";
const insert=(table,row)=>`INSERT OR IGNORE INTO ${table}(${Object.keys(row).join(',')}) VALUES(${Object.values(row).map(value).join(',')});`;
const batches=[],syncs=[];
const fields=['name','kind','status','body','source','acceptance','evidence','source_id','task_id'];
function record(key,data){
 const id=uid(key),row={id,organization_id:org,...data,version:1,created_by:actor,updated_by:actor,created_at:stamp,updated_at:stamp};
 const revision=uid(key+':v1'),audit=uid(key+':audit');
 // Each insert is independently repeatable; a partial API failure can be resumed without overwriting edits.
 batches.push(insert('knowledge_records',row));
 batches.push(`INSERT OR IGNORE INTO knowledge_revisions(id,organization_id,record_id,version,snapshot,author_id,created_at) SELECT ${[revision,org,id,1,JSON.stringify({...data,id,version:1}),actor,stamp].map(value).join(',')} WHERE EXISTS(SELECT 1 FROM knowledge_records WHERE id=${value(id)} AND organization_id=${value(org)} AND created_by=${value(actor)});`+`INSERT OR IGNORE INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ${[audit,org,null,'MANDATE_CONTEXT_IMPORTED','knowledge_records',id,JSON.stringify({source:data.source,revision:process.env.GITHUB_SHA||'local-dry-run'}),stamp,stamp].map(value).join(',')} WHERE EXISTS(SELECT 1 FROM knowledge_revisions WHERE id=${value(revision)});`);
 // Conservative sync: only rows still owned by the importer (updated_by=actor; any API edit sets updated_by to the human). Revision and audit are state-based, so a replay changes nothing.
 const scope=`id=${value(id)} AND organization_id=${value(org)}`;
 syncs.push(`UPDATE knowledge_records SET ${fields.map(k=>k+'='+value(data[k])).join(',')},version=version+1,updated_at=${stamp} WHERE ${scope} AND updated_by=${value(actor)} AND (${fields.map(k=>k+' IS NOT '+value(data[k])).join(' OR ')});`+
  `INSERT INTO knowledge_revisions(id,organization_id,record_id,version,snapshot,author_id,created_at) SELECT lower(hex(randomblob(16))),organization_id,id,version,json_object(${fields.map(k=>`'${k}',${k}`).join(',')},'id',id,'version',version),updated_by,updated_at FROM knowledge_records k WHERE ${scope} AND updated_by=${value(actor)} AND NOT EXISTS(SELECT 1 FROM knowledge_revisions r WHERE r.record_id=k.id AND r.version=k.version);`+
  `INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT lower(hex(randomblob(16))),organization_id,NULL,'MANDATE_CONTEXT_SYNCED','knowledge_records',id,json_object('version',version,'source',source,'revision',${value(process.env.GITHUB_SHA||'local-dry-run')}),${stamp},${stamp} FROM knowledge_records k WHERE ${scope} AND updated_by=${value(actor)} AND version>1 AND NOT EXISTS(SELECT 1 FROM audit_logs a WHERE a.resource_id=k.id AND a.action='MANDATE_CONTEXT_SYNCED' AND json_extract(a.details,'$.version')=k.version);`);
 return id;
}
batches.push(insert('projects',{id:project,organization_id:org,name:'OMNI101 · Sviluppo piattaforma',description:'Backlog interno da mandati founder. Nessuna esecuzione automatica.',status:'PLANNING',visibility:'TEAM',created_at:stamp,updated_at:stamp}));
for(const source of sources){
 if(!/^docs\/mandati\/[a-z0-9-]+\.md$/.test(source.file))throw new Error('Unrecognized source path.');
 const original=readFileSync(source.file);if(hash(original)!==source.sha256)throw new Error('Original source hash changed.');
 if(source.record_id&&source.record_id!==uid(source.id))throw new Error('Source identity mismatch.');
 record(source.id,{name:source.title||source.id,kind:'MANDATE',status:'CAPTURED',body:original.toString('utf8'),source:source.source+' · '+source.file+' · sha256:'+source.sha256,acceptance:'Conservare originale e provenienza; verificare separatamente la copertura dei requisiti.',evidence:'',source_id:null,task_id:null});
}
const origins=new Map();
for(const o of new Set(backlog.filter(i=>!sources.some(s=>s.id===i.source)).map(i=>i.origin)))origins.set(o,record('reference:'+o,{name:o.replace(/^docs\/operativo\//,''),kind:'REFERENCE',status:'CAPTURED',body:readFileSync(o,'utf8'),source:o,acceptance:'Conservare originale e provenienza; verificare separatamente la copertura dei requisiti.',evidence:'',source_id:null,task_id:null}));
for(const item of backlog){
 const task='mandate:'+org+':'+item.key,known=sources.some(s=>s.id===item.source);
 if(!known&&!/^docs\/operativo\/[a-z0-9-]+\.md$/.test(item.origin||''))throw new Error('Backlog item without mandate source needs a docs/operativo origin.');
 const taskRow={id:task,organization_id:org,project_id:project,name:item.name,priority:item.priority||'HIGH',description:item.acceptance+'\nDa completare: '+item.remaining+'\nFonte: docs/operativo/mandate-backlog.json. Nessun agente avviato.',status:{IMPLEMENTED:'REVIEW',BLOCKED:'BLOCKED',IN_PROGRESS:'IN_PROGRESS'}[item.status]||'TODO',kind:'WORK',estimate_minutes:0,created_at:stamp,updated_at:stamp};
 batches.push(insert('tasks',taskRow));
 // tasks have no updated_by: every writer (API PATCH, pipeline) bumps updated_at, so updated_at=created_at means untouched by humans. The sync keeps it that way.
 syncs.push(`UPDATE tasks SET name=${value(taskRow.name)},priority=${value(taskRow.priority)},description=${value(taskRow.description)},status=${value(taskRow.status)} WHERE id=${value(task)} AND organization_id=${value(org)} AND updated_at=created_at AND NOT EXISTS(SELECT 1 FROM task_dependencies d WHERE d.task_id=tasks.id AND d.active=1) AND (name IS NOT ${value(taskRow.name)} OR priority IS NOT ${value(taskRow.priority)} OR description IS NOT ${value(taskRow.description)} OR status IS NOT ${value(taskRow.status)});`);
 record('requirement:'+item.key,{name:item.name,kind:'REQUIREMENT',status:item.status,body:item.acceptance+'\nLimiti e prossima azione: '+item.remaining,source:known?'Founder mandate · docs/mandati/'+item.source+'.md':'Review backend · '+item.origin,acceptance:item.acceptance,evidence:item.evidence||(item.status==='IMPLEMENTED'?'Codice e test in CI (revisione nel registro audit). Revisione umana e limiti residui ancora aperti.':''),source_id:known?uid(item.source):origins.get(item.origin),task_id:task});
}
for(const [key,name,url,note] of [
 ['codrops','Codrops Cinematic 3D Scroll','https://tympanus.net/Tutorials/Cinematic3DScroll/','Reference esplicita del founder: narrativa cinematica, mobile e reduced motion; verificare licenza e differenze prima del riuso.'],
 ['openhands','OpenHands — agenti coding','https://github.com/OpenHands/OpenHands','Reference del founder da valutare: adapter multiprovider. Nessuna integrazione dichiarata attiva.'],
 ['sandbox','Cloudflare Agent Sandboxes','https://developers.cloudflare.com/agents/tools/sandbox/','Reference del founder da valutare per isolamento, rete, credenziali, persistenza e costi. Non attivare servizi a pagamento.']])record('reference:'+key,{name,kind:'REFERENCE',status:'CAPTURED',body:note,source:url,acceptance:'Verifica tecnica, licenza e costi prima di collegare una implementazione.',evidence:'',source_id:null,task_id:'mandate:'+org+':'+(key==='codrops'?'brand':'coding-agents')});
batches.push(...syncs);
if(target==='--sql'){writeFileSync(1,batches.join('\n'));process.exit(0)}
if(target==='--dry-run'){console.log(JSON.stringify({sources:sources.length,requirements:backlog.length,references:3+origins.size,tasks:backlog.length,syncStatements:{knowledgeRecords:backlog.length+sources.length+3+origins.size,tasks:backlog.length},syncNote:'upper bound; each UPDATE is conditional on importer-owned and changed rows',batches:batches.length,originalHashesVerified:true,mutations:false}));process.exit(0)}
const token=process.env.CLOUDFLARE_API_TOKEN;if(!token)throw new Error('CI secret unavailable.');
const database=target==='staging'?'28dfa732-5f93-4b10-8c7d-542d8ccdb9e1':'1887a135-05be-4b2e-a764-8ab5b3018a00';
const endpoint=`https://api.cloudflare.com/client/v4/accounts/179e35741ac5e7a9e2c3be26f5a482b8/d1/database/${database}/query`;
for(const sql of batches){const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({sql}),signal:AbortSignal.timeout(45000)});const result=await response.json();if(!response.ok||!result.success||result.result.some(row=>!row.success))throw new Error('Context import not confirmed; no credential or response body printed. Rerun safely after diagnosis.');}
console.log(JSON.stringify({target,originalSources:sources.length,requirements:backlog.length,references:3+origins.size,insertOrIgnore:true,conservativeSync:true,executionsStarted:0}));
