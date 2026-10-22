import {test,expect,type Page} from '@playwright/test';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

// Infrastructure fixture only: a unique individual Owner in the isolated local test D1.
// All product operations below use real passkey authentication and HTTP persistence.
async function owner(page:Page,baseURL:string){
 if(new URL(baseURL).hostname!=='localhost')throw new Error('Workspace fixtures are restricted to localhost.');
 const org='omni101',fixtureId='workspace-e2e-'+randomUUID(),token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),now=Date.now();
 const sql=`INSERT INTO invitations(id,organization_id,email,role,token_hash,expires_at,created_at,updated_at) VALUES('${randomUUID()}','${org}','${fixtureId}@example.test','OWNER','${hash}',${now+600000},${now},${now});`;
 execFileSync(resolve('node_modules/.bin/wrangler'),['d1','execute','DB','--local','--config','wrangler.jsonc','--env','test','--command',sql],{cwd:resolve('apps/web'),stdio:'pipe',timeout:20000});
 const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}});
 await page.goto('/portal/invite?token='+token);await page.getByRole('button',{name:'Attiva il tuo account'}).click();await expect(page).toHaveURL(/\/admin$/,{timeout:20000});await expect(page.getByRole('heading',{name:'Una visione chiara.'})).toBeVisible();
}

test('workspace persists board changes, rolls back failures, finds records and validates versioned workflows',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');test.setTimeout(90000);await owner(page,baseURL!);
 const projectName='Persistent board '+randomUUID().slice(0,8);
 await page.goto('/admin/projects');await page.getByRole('button',{name:'Nuovo',exact:true}).click();await page.getByRole('dialog').getByLabel('Progetto').fill(projectName);await page.getByRole('button',{name:'Salva nel workspace'}).click();await expect(page.getByRole('table')).toContainText(projectName);
 await page.getByRole('button',{name:'Board',exact:true}).click();const card=page.locator('.os-kanban-card').filter({hasText:projectName});await card.getByRole('combobox').selectOption('ACTIVE');await expect(page.getByRole('status')).toContainText('Stato aggiornato');await page.reload();await page.getByRole('button',{name:'Board',exact:true}).click();await expect(page.getByRole('region',{name:'ACTIVE',exact:true}).locator('.os-kanban-card')).toContainText(projectName);
 // A failed write must restore the visible persisted status, rather than leave a phantom move.
 await page.route('**/api/records/projects/*',async route=>{if(route.request().method()==='PATCH')await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'Conflitto di verifica'})});else await route.continue()});
 await card.getByRole('combobox').selectOption('REVIEW');await expect(page.getByRole('alert')).toContainText('Spostamento non salvato');await expect(card.getByRole('combobox')).toHaveValue('ACTIVE');await page.unroute('**/api/records/projects/*');
 // Real drag-and-drop follows the same persistence path as the keyboard/touch selector.
 await card.dragTo(page.getByRole('region',{name:'REVIEW',exact:true}));await expect(page.getByRole('region',{name:'REVIEW',exact:true}).locator('.os-kanban-card')).toContainText(projectName);await expect(card.getByRole('combobox')).toHaveValue('REVIEW');
 await page.keyboard.press('Control+k');const search=page.getByRole('dialog');await search.getByRole('textbox',{name:'Cerca pagine e record'}).fill(projectName);await search.getByRole('button',{name:new RegExp(projectName)}).click();await expect(page).toHaveURL(/\/admin\/projects\?record=/);await expect(page.getByRole('dialog').getByLabel('Progetto')).toHaveValue(projectName);await page.getByRole('dialog').getByRole('button',{name:'Chiudi',exact:true}).click();
 await page.goto('/admin/agent-runs');await expect(page.getByRole('heading',{name:'Mission Control'})).toBeVisible();await expect(page.getByRole('heading',{name:'Nessuna esecuzione registrata.'})).toBeVisible();const runs=await page.request.get('/api/records/agent-runs');expect(runs.ok()).toBeTruthy();expect((await runs.json()).records).toEqual([]);
 await page.goto('/admin/automations');await expect(page.getByRole('heading',{name:'Workflow Builder'})).toBeVisible();await expect(page.locator('.react-flow__node')).toHaveCount(5);const workflowName='Versioned verification '+randomUUID().slice(0,8);await page.getByRole('textbox',{name:'Nome workflow'}).fill(workflowName);await page.getByRole('button',{name:'Salva versione'}).click();await expect(page.getByRole('status')).toContainText('Versione 1 salvata');await page.getByRole('button',{name:'Valida senza eseguire'}).click();await expect(page.getByRole('status')).toContainText('Validazione riuscita');const definitions=await page.request.get('/api/workflows');expect(definitions.ok()).toBeTruthy();expect((await definitions.json()).records).toEqual(expect.arrayContaining([expect.objectContaining({name:workflowName,version:1,status:'DRAFT'})]));const workflowRuns=await page.request.get('/api/workflow-runs');expect((await workflowRuns.json()).records).toEqual([]);await page.reload();await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption({label:workflowName+' · v1'});await expect(page.getByRole('textbox',{name:'Nome workflow'})).toHaveValue(workflowName);
});
