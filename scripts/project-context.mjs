// Progressive loading: a small routing packet, no agents, installs, network or task mutations.
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const registry=JSON.parse(readFileSync(resolve(root,'docs/operativo/agent-context.json'),'utf8'));
const domain=process.argv[2]||'growth';const selected=registry.domains[domain];
if(!selected){console.error('Unknown domain. Choose: '+Object.keys(registry.domains).join(', '));process.exitCode=2}else{
 const files=[...registry.entrypoints,registry.state,registry.sources,registry.requirements,registry.handoff,...selected.docs,...selected.code,...selected.tests];
 const missing=files.filter(file=>!existsSync(resolve(root,file)));
 if(missing.length){console.error('Missing context references: '+missing.join(', '));process.exitCode=1}else{
  console.log(JSON.stringify({format:'omni101-agent-context-v1',domain,risk:selected.risk,read_order:[...new Set(files)],skills:selected.skills.map(name=>({name,...registry.skill_catalog[name],available_locally:existsSync(resolve(process.env.HOME||root,'.codex/skills',name,'SKILL.md')),instruction:'Load only when relevant; existence does not prove runtime activation.'})),sources:registry.sources,requirements:registry.requirements,handoff_fields:registry.handoff_fields,permission_rule:'This packet does not grant permissions, spend, execute agents or authorize release. Preserve founder instructions and verify the current task.',context_measurement:{referenced_files:new Set(files).size,canonical_contents_inlined:0,token_savings:'NOT_MEASURED'},candidate_policy:registry.candidate_policy},null,2));
 }
}
