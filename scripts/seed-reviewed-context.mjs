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
const batches=[];
function record(key,data){
 const id=uid(key),row={id,organization_id:org,...data,version:1,created_by:actor,updated_by:actor,created_at:stamp,updated_at:stamp};
 const revision=uid(key+':v1'),audit=uid(key+':audit');
 // Each insert is independently repeatable; a partial API failure can be resumed without overwriting edits.
 batches.push(insert('knowledge_records',row));
 batches.push(`INSERT OR IGNORE INTO knowledge_revisions(id,organization_id,record_id,version,snapshot,author_id,created_at) SELECT ${[revision,org,id,1,JSON.stringify({...data,id,version:1}),actor,stamp].map(value).join(',')} WHERE EXISTS(SELECT 1 FROM knowledge_records WHERE id=${value(id)} AND organization_id=${value(org)} AND created_by=${value(actor)});`+`INSERT OR IGNORE INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ${[audit,org,null,'MANDATE_CONTEXT_IMPORTED','knowledge_records',id,JSON.stringify({source:data.source,revision:process.env.GITHUB_SHA||'local-dry-run'}),stamp,stamp].map(value).join(',')} WHERE EXISTS(SELECT 1 FROM knowledge_revisions WHERE id=${value(revision)});`);
 return id;
}
batches.push(insert('projects',{id:project,organization_id:org,name:'OMNI101 · Sviluppo piattaforma',description:'Backlog interno da mandati founder. Nessuna esecuzione automatica.',status:'PLANNING',visibility:'TEAM',created_at:stamp,updated_at:stamp}));
for(const source of sources){
 if(!/^docs\/mandati\/[a-z0-9-]+\.md$/.test(source.file))throw new Error('Unrecognized source path.');
 const original=readFileSync(source.file);if(hash(original)!==source.sha256)throw new Error('Original source hash changed.');
 if(source.record_id&&source.record_id!==uid(source.id))throw new Error('Source identity mismatch.');
 record(source.id,{name:source.title||source.id,kind:'MANDATE',status:'CAPTURED',body:original.toString('utf8'),source:source.source+' · '+source.file+' · sha256:'+source.sha256,acceptance:'Conservare originale e provenienza; verificare separatamente la copertura dei requisiti.',evidence:'',source_id:null,task_id:null});
}
for(const item of backlog){
 const task='mandate:'+org+':'+item.key;
 batches.push(insert('tasks',{id:task,organization_id:org,project_id:project,name:item.name,priority:'HIGH',description:item.acceptance+'\nDa completare: '+item.remaining+'\nFonte: docs/operativo/mandate-backlog.json. Nessun agente avviato.',status:item.status==='IMPLEMENTED'?'REVIEW':'TODO',kind:'WORK',estimate_minutes:0,created_at:stamp,updated_at:stamp}));
 record('requirement:'+item.key,{name:item.name,kind:'REQUIREMENT',status:item.status,body:item.acceptance+'\nLimiti e prossima azione: '+item.remaining,source:'Founder mandate · docs/mandati/'+item.source+'.md',acceptance:item.acceptance,evidence:item.status==='IMPLEMENTED'?'Codice e test CI della revisione '+(process.env.GITHUB_SHA||'da verificare')+'. Revisione umana e limiti residui ancora aperti.':'',source_id:uid(item.source),task_id:task});
}
for(const [key,name,url,note] of [
 ['codrops','Codrops Cinematic 3D Scroll','https://tympanus.net/Tutorials/Cinematic3DScroll/','Reference esplicita del founder: narrativa cinematica, mobile e reduced motion; verificare licenza e differenze prima del riuso.'],
 ['openhands','OpenHands — agenti coding','https://github.com/OpenHands/OpenHands','Reference del founder da valutare: adapter multiprovider. Nessuna integrazione dichiarata attiva.'],
 ['sandbox','Cloudflare Agent Sandboxes','https://developers.cloudflare.com/agents/tools/sandbox/','Reference del founder da valutare per isolamento, rete, credenziali, persistenza e costi. Non attivare servizi a pagamento.']])record('reference:'+key,{name,kind:'REFERENCE',status:'CAPTURED',body:note,source:url,acceptance:'Verifica tecnica, licenza e costi prima di collegare una implementazione.',evidence:'',source_id:null,task_id:'mandate:'+org+':'+(key==='codrops'?'brand':'coding-agents')});
if(target==='--sql'){writeFileSync(1,batches.join('\n'));process.exit(0)}
if(target==='--dry-run'){console.log(JSON.stringify({sources:sources.length,requirements:backlog.length,references:3,tasks:backlog.length,batches:batches.length,originalHashesVerified:true,mutations:false}));process.exit(0)}
const token=process.env.CLOUDFLARE_API_TOKEN;if(!token)throw new Error('CI secret unavailable.');
const database=target==='staging'?'28dfa732-5f93-4b10-8c7d-542d8ccdb9e1':'1887a135-05be-4b2e-a764-8ab5b3018a00';
const endpoint=`https://api.cloudflare.com/client/v4/accounts/179e35741ac5e7a9e2c3be26f5a482b8/d1/database/${database}/query`;
for(const sql of batches){const response=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({sql}),signal:AbortSignal.timeout(45000)});const result=await response.json();if(!response.ok||!result.success||result.result.some(row=>!row.success))throw new Error('Context import not confirmed; no credential or response body printed. Rerun safely after diagnosis.');}
console.log(JSON.stringify({target,originalSources:sources.length,requirements:backlog.length,references:3,insertOrIgnore:true,executionsStarted:0}));
