import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {CAPABILITIES,ROLE_TEMPLATES,templateScope,type RoleTemplate,type TemplateName} from '../apps/web/app/server/auth';
import {resources} from '../apps/web/app/server/schema';
const names=Object.keys(ROLE_TEMPLATES) as TemplateName[];
const scope=(n:TemplateName,starter?:TemplateName)=>templateScope(ROLE_TEMPLATES[n],resources,starter?ROLE_TEMPLATES[starter]:undefined);
const clients:TemplateName[]=['clientOwner','clientAdmin','clientMember','reviewer','partner'];
const internalOnly=Object.keys(resources).filter(k=>!resources[k].client);
const money=['expenses','subscriptions','privacy-requests','approvals','agent-runs','automations'];
describe('role templates',()=>{
 it('covers every category of REC-018',()=>{expect(names.length).toBe(18);expect(new Set(names.map(n=>ROLE_TEMPLATES[n].label)).size).toBe(18)});
 it('names only resources and capabilities that exist',()=>{
  for(const n of names){const t:RoleTemplate=ROLE_TEMPLATES[n];for(const l of [t.read,t.write])if(l!=='*')for(const k of l)expect(resources[k],n+':'+k).toBeDefined();for(const c of t.caps)expect(CAPABILITIES[c],n+':'+c).toBeDefined()}
 });
 it('never grants more than the base role',()=>{
  for(const n of names){const t:RoleTemplate=ROLE_TEMPLATES[n];const full=templateScope({...t,read:'*',write:'*',caps:Object.keys(CAPABILITIES) as RoleTemplate['caps']},resources,ROLE_TEMPLATES.owner);if(t.base!=='AGENT_SERVICE_ACCOUNT')for(const s of scope(n))expect(full).toContain(s)}
 });
 it('keeps capabilities of Owner-only operations away from every other template',()=>{
  for(const n of names.filter(x=>x!=='owner'))for(const c of ['invite','revoke','budget','backlog'])expect(scope(n)).not.toContain('cap:'+c);
 });
 it('AI Agent scope is strictly inside the Owner that starts it',()=>{
  const owner=scope('owner');const agent=scope('aiAgent','owner');
  expect(agent.length).toBeGreaterThan(0);expect(agent.length).toBeLessThan(owner.length);
  for(const s of agent)expect(owner).toContain(s);
  expect(agent.filter(s=>s.startsWith('cap:')||s.startsWith('write:'))).toEqual([]);
 });
 it('Workflow Identity scope is strictly inside the Owner that starts it',()=>{
  const owner=scope('owner');const wf=scope('workflowIdentity','owner');
  expect(wf.length).toBeGreaterThan(0);expect(wf.length).toBeLessThan(owner.length);
  for(const s of wf)expect(owner).toContain(s);
  expect(wf.filter(s=>s.startsWith('cap:'))).toEqual([]);
 });
 it('delegated identities inherit nothing without a starter or from another agent',()=>{
  expect(scope('aiAgent')).toEqual([]);expect(scope('workflowIdentity')).toEqual([]);expect(scope('serviceAccount','owner')).toEqual([]);expect(scope('aiAgent','aiAgent')).toEqual([]);
 });
 it('an agent never exceeds a narrower starter',()=>{
  const sales=scope('sales');for(const s of scope('aiAgent','sales'))expect(sales).toContain(s);
  expect(scope('aiAgent','sales')).not.toContain('read:projects');
 });
 it('agents never touch finance, privacy or admin records even under an Owner',()=>{
  for(const n of ['aiAgent','workflowIdentity'] as TemplateName[])for(const k of [...money,'invoices','contracts','proposals'])for(const a of ['read','write'])expect(scope(n,'owner')).not.toContain(a+':'+k);
 });
 it('client templates see no internal or finance data',()=>{
  for(const n of clients){const s=scope(n);expect(s.filter(x=>x.startsWith('cap:')||x.startsWith('write:'))).toEqual([]);for(const k of [...internalOnly,...money])expect(s,n+':'+k).not.toContain('read:'+k)}
 });
 it('only the Client Owner reads its own billing documents',()=>{
  for(const n of names.filter(x=>x.startsWith('client')||x==='reviewer'||x==='partner')){const s=scope(n);for(const k of ['invoices','contracts'])n==='clientOwner'?expect(s).toContain('read:'+k):expect(s).not.toContain('read:'+k)}
 });
 it('only finance-capable templates reach money, expenses and subscriptions',()=>{
  const allowed:TemplateName[]=['owner','admin','finance'];
  for(const n of names.filter(x=>!allowed.includes(x)))for(const k of ['read:expenses','read:subscriptions','write:expenses','cap:money','cap:finance-approve'])expect(scope(n),n+':'+k).not.toContain(k);
 });
 it('keeps the capabilities table in step with the code that enforces it',()=>{
  const api=readFileSync('apps/web/app/server/api.ts','utf8');
  expect(api).toContain("requireRole(actor,['OWNER','ADMIN','PROJECT_MANAGER'])");expect(api).toContain("requireRole(actor,['OWNER','FINANCE'])");
  expect(CAPABILITIES['agent-run']).toEqual(['OWNER','ADMIN','PROJECT_MANAGER']);expect(CAPABILITIES['finance-approve']).toEqual(['OWNER','FINANCE']);
 });
});
