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
 d1(sql);
 const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}});
 await page.goto('/portal/invite?token='+token);await page.getByRole('button',{name:'Attiva il tuo account'}).click();await expect(page).toHaveURL(/\/admin$/,{timeout:20000});await expect(page.getByRole('heading',{name:'Oggi nello studio'})).toBeVisible();
}

test('workspace persists board changes, rolls back failures, finds records and validates versioned workflows',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');test.setTimeout(90000);await owner(page,baseURL!);
 const projectName='Persistent board '+randomUUID().slice(0,8);
 await page.goto('/admin/projects');await page.getByRole('button',{name:'Nuovo',exact:true}).click();await page.getByRole('dialog').getByLabel('Progetto').fill(projectName);await page.getByRole('button',{name:'Salva nel workspace'}).click();await expect(page.getByRole('table')).toContainText(projectName);
 await page.getByRole('button',{name:'Board',exact:true}).click();const card=page.locator('.os-kanban-card').filter({hasText:projectName});await card.getByRole('combobox').selectOption('ACTIVE');await expect(page.getByRole('status')).toContainText('Stato aggiornato');await page.reload();await page.getByRole('button',{name:'Board',exact:true}).click();await expect(page.getByRole('region',{name:'ACTIVE',exact:true}).locator('.os-kanban-card',{hasText:projectName})).toContainText(projectName);
 // A failed write must restore the visible persisted status, rather than leave a phantom move.
 await page.route('**/api/records/projects/*',async route=>{if(route.request().method()==='PATCH')await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'Conflitto di verifica'})});else await route.continue()});
 await card.getByRole('combobox').selectOption('REVIEW');await expect(page.getByRole('alert')).toContainText('Spostamento non salvato');await expect(card.getByRole('combobox')).toHaveValue('ACTIVE');await page.unroute('**/api/records/projects/*');
 // Real drag-and-drop follows the same persistence path as the keyboard/touch selector.
 await card.dragTo(page.getByRole('region',{name:'REVIEW',exact:true}));await expect(page.getByRole('region',{name:'REVIEW',exact:true}).locator('.os-kanban-card',{hasText:projectName})).toContainText(projectName);await expect(card.getByRole('combobox')).toHaveValue('REVIEW');
 await page.keyboard.press('Control+k');const search=page.getByRole('dialog');await search.getByRole('combobox',{name:'Cerca pagine e record'}).fill(projectName);await search.getByRole('button',{name:new RegExp(projectName)}).click();await expect(page).toHaveURL(/\/admin\/projects\?record=/);await expect(page.getByRole('dialog').getByLabel('Progetto')).toHaveValue(projectName);await page.getByRole('dialog').getByRole('button',{name:'Chiudi',exact:true}).click();
 await page.goto('/admin/agent-runs');await expect(page.getByRole('heading',{name:'Mission Control'})).toBeVisible();await page.getByRole('button',{name:'Agenti AI',exact:true}).click();await expect(page.getByRole('heading',{name:'Nessuna esecuzione registrata.'})).toBeVisible();const runs=await page.request.get('/api/records/agent-runs');expect(runs.ok()).toBeTruthy();expect((await runs.json()).records).toEqual([]);
 await page.goto('/admin/automations');await expect(page.getByRole('heading',{name:'Workflow Builder'})).toBeVisible();await expect(page.locator('.react-flow__node')).toHaveCount(5);const workflowName='Versioned verification '+randomUUID().slice(0,8);await page.getByRole('textbox',{name:'Nome workflow'}).fill(workflowName);await page.getByRole('button',{name:'Salva versione'}).click();await expect(page.getByRole('status')).toContainText('Versione 1 salvata');await page.getByRole('button',{name:'Valida senza eseguire'}).click();await expect(page.getByRole('status')).toContainText('Validazione riuscita');const definitions=await page.request.get('/api/workflows');expect(definitions.ok()).toBeTruthy();const definitionRecords=(await definitions.json()).records as {id:string;name:string}[];expect(definitionRecords).toEqual(expect.arrayContaining([expect.objectContaining({name:workflowName,version:1,status:'DRAFT'})]));const workflowRuns=await page.request.get('/api/workflow-runs');expect(((await workflowRuns.json()).records as {definition_id:string}[]).filter(run=>run.definition_id===definitionRecords.find(definition=>definition.name===workflowName)!.id)).toEqual([]);await page.reload();await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption({label:workflowName+' · v1'});await expect(page.getByRole('textbox',{name:'Nome workflow'})).toHaveValue(workflowName);
});

async function authenticator(page:Page){const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}})}

function d1(sql:string){
 // Concurrent wrangler/workerd access to the local D1 file can answer SQLITE_BUSY: retry the fixture, never the assertions.
 for(let attempt=0;;attempt++){
  try{execFileSync(resolve('node_modules/.bin/wrangler'),['d1','execute','DB','--local','--config','wrangler.jsonc','--env','test','--command',sql],{cwd:resolve('apps/web'),stdio:'pipe',timeout:30000});return}
  catch(error){const text=String((error as {stderr?:unknown}).stderr||'')+String((error as Error).message);if(attempt>=8||!/SQLITE_BUSY|database is locked/.test(text))throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,400+attempt*400)}
 }
}

// Same-origin fetch from the signed-in page: the browser adds the Origin and the session cookie, as the workspace UI does.
async function api(page:Page,method:string,path:string,body?:unknown){return page.evaluate(async([method,path,body])=>{const response=await fetch(path as string,{method:method as string,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,body:await response.json().catch(()=>null) as any}},[method,path,body] as [string,string,unknown])}
const node=(id:string,type:string,label:string)=>({id,type,position:{x:0,y:0},data:{label}});
const chain=(...ids:string[])=>ids.slice(1).map((target,i)=>({id:ids[i]+'-'+target,source:ids[i],target}));
async function workflowRun(page:Page,name:string,nodes:unknown[],ids:string[],leadId:string){
 const definition=await api(page,'POST','/api/workflows',{name,active:true,graph:{nodes,edges:chain(...ids)}});
 expect(definition.status).toBe(201);
 const run=await api(page,'POST','/api/workflow-runs',{definitionId:definition.body.id,leadId,idempotencyKey:'e2e-'+randomUUID()});
 expect(run.status).toBe(202);
 return run.body.id as string;
}

test('Mission Control shows real durable runs with steps and artifacts, and cancels a run waiting for approval',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');
 test.setTimeout(90000);
 await owner(page,baseURL!);
 const key=randomUUID().slice(0,8),done='Esecuzione reale '+key,waiting='Con approvazione '+key,taskName='Task del run '+key;
 const lead=await api(page,'POST','/api/records/leads',{name:'Lead Mission '+key,status:'QUALIFICATION',message:'Richiesta reale per Mission Control '+key});
 expect(lead.status).toBe(201);
 const doneRun=await workflowRun(page,done,[node('start','TRIGGER','Avvio'),node('task','CREATE_TASK',taskName),node('end','END','Fine')],['start','task','end'],lead.body.record.id);
 const waitingRun=await workflowRun(page,waiting,[node('start','TRIGGER','Avvio'),node('review','HUMAN_APPROVAL','Revisione del socio'),node('end','END','Fine')],['start','review','end'],lead.body.record.id);
 expect((await api(page,'GET','/api/workflow-runs/'+doneRun)).body.run.status).toBe('COMPLETED');
 expect((await api(page,'GET','/api/workflow-runs/'+waitingRun)).body.run.status).toBe('AWAITING_APPROVAL');

 await page.goto('/admin/agent-runs');
 await expect(page.getByRole('heading',{name:'Mission Control'})).toBeVisible();
 await page.getByRole('button',{name:new RegExp(done)}).click();
 const detail=page.locator('section.os-panel[aria-live="polite"]');
 await expect(detail.getByRole('heading',{name:done})).toBeVisible();
 await expect(detail.locator('.os-run-steps li')).toHaveCount(3);
 await expect(detail.locator('.os-run-steps')).toContainText('COMPLETED');
 await expect(detail.getByRole('link',{name:new RegExp('TASK · '+taskName)})).toBeVisible();
 await expect(detail.locator('[data-storage="D1"]')).toContainText('R2 non è attivo');
 await expect(detail.getByRole('button',{name:'Pausa non disponibile'})).toBeDisabled();
 await expect(detail.getByRole('button',{name:'Annulla esecuzione'})).toHaveCount(0);

 await page.getByRole('button',{name:new RegExp(waiting)}).click();
 await expect(detail.getByRole('heading',{name:waiting})).toBeVisible();
 await expect(detail.getByRole('button',{name:'Riprendi',exact:true})).toHaveCount(0);
 await expect(detail.getByRole('link',{name:'Apri approvazione richiesta ↗'})).toBeVisible();
 await detail.getByRole('button',{name:'Annulla esecuzione'}).click();
 await detail.getByRole('button',{name:/^Conferma · Annulla esecuzione/}).click();
 await expect(page.getByRole('status').filter({hasText:'Esecuzione annullata'})).toBeVisible();
 await expect(detail.locator('.os-badge').first()).toHaveText('CANCELLED');
 await expect(detail.getByRole('button',{name:'Annulla esecuzione'})).toHaveCount(0);
 expect((await api(page,'GET','/api/workflow-runs/'+waitingRun)).body.run.status).toBe('CANCELLED');
 await page.screenshot({path:'test-results/mission-control.png',fullPage:true});

 // The agent filter stays empty: no AI provider runs exist in the isolated environment, and nothing is invented.
 await page.getByRole('button',{name:'Agenti AI',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Nessuna esecuzione registrata.'})).toBeVisible();
});

function clientInvitation(clientId:string){
 const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),now=Date.now();
 const sql=`INSERT INTO invitations(id,organization_id,email,role,client_id,token_hash,expires_at,created_at,updated_at) VALUES('${randomUUID()}','omni101','client-${randomUUID()}@example.test','CLIENT','${clientId}','${hash}',${now+600000},${now},${now});`;
 d1(sql);
 return token;
}

test('delivery pipeline runs from QA rejection to client approval and maintenance ticket',async({page,browser,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');
 test.setTimeout(120000);
 await owner(page,baseURL!);
 const key=randomUUID().slice(0,8),projectName='Pipeline '+key,taskName='Landing '+key,deliverableName='Sito pubblicato '+key;
 const client=await api(page,'POST','/api/records/clients',{name:'Cliente '+key,status:'ACTIVE'});
 const project=await api(page,'POST','/api/records/projects',{name:projectName,status:'ACTIVE',client_id:client.body.record.id});
 const task=await api(page,'POST','/api/records/tasks',{name:taskName,project_id:project.body.record.id,status:'IN_PROGRESS',priority:'HIGH'});
 expect([client.status,project.status,task.status]).toEqual([201,201,201]);

 await page.goto('/admin/pipeline?project='+project.body.record.id);
 await expect(page.getByRole('heading',{name:'Pipeline di progetto'})).toBeVisible();
 await expect(page.getByLabel('Progetto',{exact:true})).toHaveValue(project.body.record.id);
 const row=page.getByRole('row',{name:new RegExp(taskName)});
 await row.getByRole('button',{name:'Richiedi QA'}).click();
 await expect(page.getByRole('status').filter({hasText:'QA richiesta'})).toBeVisible();
 await expect(page.getByRole('article').filter({hasText:'PENDING'})).toHaveCount(1);
 // A rejection needs a reason, then sends the work back to IN_PROGRESS.
 await expect(page.getByRole('button',{name:'Rifiuta QA'})).toBeDisabled();
 await page.getByLabel('Motivazione dell’esito').fill('Contrasto insufficiente nella sezione hero.');
 await page.getByRole('button',{name:'Rifiuta QA'}).click();
 await expect(page.getByRole('status').filter({hasText:'torna in lavorazione'})).toBeVisible();
 await expect(row.locator('.os-badge')).toHaveText('IN_PROGRESS');
 await row.getByRole('button',{name:'Richiedi QA'}).click();
 await page.getByLabel('Motivazione dell’esito').fill('Contrasto corretto, verificato su desktop e mobile.');
 await page.getByRole('button',{name:'Supera QA'}).click();
 await expect(row.locator('.os-badge')).toHaveText('DONE');

 await page.getByLabel('Nome del deliverable').fill(deliverableName);
 await page.getByLabel('Contenuto per il cliente').fill('Il sito è online: link, credenziali di prova e istruzioni.');
 await page.getByRole('button',{name:'Prepara deliverable'}).click();
 await expect(page.getByText(deliverableName)).toBeVisible();
 await page.getByRole('button',{name:'Consegna al cliente'}).click();
 await expect(page.getByRole('status').filter({hasText:'il cliente lo vede nel portale'})).toBeVisible();
 await expect(page.locator('.os-stages li[data-state="ACTIVE"]')).toContainText('Consegna');
 await page.screenshot({path:'test-results/pipeline-admin.png',fullPage:true});

 // The client signs in with a personal passkey from an invitation and sees only the delivered work.
 const context=await browser.newContext(),portal=await context.newPage();
 await authenticator(portal);
 await portal.goto('/portal/invite?token='+clientInvitation(client.body.record.id));
 await portal.getByRole('button',{name:'Attiva il tuo account'}).click();
 await expect(portal).toHaveURL(/\/portal$/,{timeout:20000});
 await expect(portal.getByRole('heading',{name:'Consegne'})).toBeVisible();
 await expect(portal.locator('#portal-deliverables').getByText(deliverableName)).toBeVisible();
 await expect(portal.locator('#portal-projects').getByText(projectName)).toBeVisible();
 await portal.screenshot({path:'test-results/portal-delivery.png',fullPage:true});
 await portal.getByRole('button',{name:'Approva consegna'}).click();
 await expect(portal.getByRole('status').filter({hasText:'Consegna approvata'})).toBeVisible();
 await expect(portal.locator('#portal-deliverables .os-badge')).toHaveText('Approvato');
 await portal.getByLabel('Titolo della richiesta').fill('Aggiornare il footer '+key);
 await portal.getByLabel('Descrizione',{exact:true}).fill('Il footer mostra ancora l’anno scorso: va aggiornato.');
 await portal.getByRole('button',{name:'Invia richiesta'}).click();
 await expect(portal.getByRole('status').filter({hasText:'Richiesta inviata allo studio'})).toBeVisible();
 await expect(portal.locator('#portal-tickets')).toContainText('Aggiornare il footer '+key);
 await context.close();

 await page.goto('/admin/pipeline?project='+project.body.record.id);
 await expect(page.locator('.os-stages li[data-state="DONE"]').filter({hasText:'Consegna'})).toBeVisible();
 await expect(page.locator('.os-stages li[data-state="ACTIVE"]')).toContainText('Manutenzione');
 await expect(page.getByText('Aggiornare il footer '+key)).toBeVisible();
 await expect(page.getByText('CLIENT_APPROVED')).toBeVisible();
 expect((await api(page,'GET','/api/projects/'+project.body.record.id+'/pipeline')).body.project.status).toBe('COMPLETED');
});

test('Owner prepares a persistent operating backlog and leaves a project handoff comment',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Passkey fixture runs on desktop.');test.setTimeout(90000);await owner(page,baseURL!);
 await page.goto('/admin/operations');await expect(page.getByRole('heading',{name:'Centro operativo',exact:true,level:2})).toBeVisible();
 await page.getByRole('button',{name:'Prepara backlog operativo'}).click();
 await expect(page.locator('.os-project-progress').filter({hasText:'OMNI101 · Sviluppo piattaforma'})).toBeVisible();
 const response=await page.request.post('/api/setup/operating-backlog',{headers:{Origin:new URL(baseURL!).origin},data:{}});expect(response.ok()).toBeTruthy();const prepared=await response.json();expect(prepared.executionsStarted).toBe(0);
 await page.goto('/admin/planning?project='+encodeURIComponent(prepared.projectId));
 await expect(page.locator('.os-table').getByRole('link',{name:'Sbloccare deploy CI Cloudflare ↗',exact:true})).toBeVisible();
 const comment='Passaggio di consegne verificato '+randomUUID();
 await page.getByLabel('Commento al progetto').fill(comment);
 await page.getByRole('button',{name:'Aggiungi commento'}).click();await expect(page.getByText(comment,{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByText(comment,{exact:true})).toBeVisible();
});

test('Owner captures a versioned requirement, reloads its provenance and creates a campaign link without sending',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Real private workflow verified once with an isolated WebAuthn Owner.');test.setTimeout(60000);await owner(page,baseURL!);
 await page.goto('/admin/knowledge');await page.getByRole('button',{name:'Capture to OMNI101'}).click();
 const title='Requirement '+randomUUID().slice(0,8);
 await page.getByLabel('Titolo',{exact:true}).fill(title);await page.getByLabel('Tipo elemento',{exact:true}).selectOption('REQUIREMENT');await page.getByLabel('Origine / riferimento originale').fill('Synthetic browser acceptance source');await page.getByLabel('Contenuto originale o nota').fill('Preserve the original source and make the next action recoverable.');await page.getByRole('button',{name:'Salva versione'}).click();await expect(page.getByRole('status')).toContainText('Elemento salvato');
 await page.reload();await page.getByRole('button',{name:new RegExp(title)}).click();await expect(page.getByLabel('Contenuto originale o nota')).toHaveValue('Preserve the original source and make the next action recoverable.');
 await page.getByLabel('Criteri di accettazione').fill('Reloaded source must be intact.');await page.getByLabel('Prova e riferimenti verificabili').fill('Browser acceptance: original source was recovered after reload.');await page.getByLabel('Stato elemento',{exact:true}).selectOption('VERIFIED');await page.getByRole('button',{name:'Salva versione'}).click();await expect(page.getByRole('status')).toContainText('Elemento salvato');await expect(page.getByRole('button',{name:new RegExp(title)})).toContainText('VERIFIED');
 const response=await page.request.get('/api/knowledge?q='+encodeURIComponent(title));const record=(await response.json()).records[0];const history=await page.request.get('/api/knowledge/'+record.id);expect((await history.json()).revisions).toHaveLength(2);
 await page.goto('/admin/growth');await page.getByLabel('Sorgente',{exact:true}).fill('google');await page.getByLabel('Mezzo',{exact:true}).fill('cpc');await page.getByLabel('Nome campagna').fill('Owner test');await page.getByRole('button',{name:'Genera link UTM'}).click();await expect(page.getByLabel('Link generato')).toHaveValue(/utm_campaign=owner_test/);await expect(page.getByText('Nessun invio o spesa pubblicitaria',{exact:true})).toBeVisible();
});

test('Revenue workspace persists campaign links, manual activity and the shared calendar',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Isolated authenticated revenue flow is verified on desktop.');test.setTimeout(60000);await owner(page,baseURL!);
 const suffix=randomUUID().slice(0,8),name='SYNTHETIC campaign '+suffix;
 const lead=await page.request.post('/api/records/leads',{headers:{Origin:baseURL!},data:{name:'SYNTHETIC lead '+suffix,status:'NEW',message:'Synthetic browser verification of a commercial request; no customer or real communication.'}});expect(lead.status()).toBe(201);const leadId=(await lead.json()).record.id;
 await page.goto('/admin/revenue');
 const primary=page.getByRole('button',{name:'Nuova campagna',exact:true});
 const contrast=await primary.evaluate(element=>{const color=getComputedStyle(element).color;let parent:Element|null=element,bg='';while(parent){bg=getComputedStyle(parent).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;parent=parent.parentElement}const luminance=(value:string)=>{const channels=(value.match(/[\d.]+/g)||[]).slice(0,3).map(v=>Number(v)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};const a=luminance(color),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
 expect(contrast,'Primary campaign action must remain readable in its real ancestor background').toBeGreaterThanOrEqual(4.5);
 await primary.click();const dialog=page.getByRole('dialog');await dialog.getByLabel('Nome campagna',{exact:true}).fill(name);await dialog.getByLabel('Obiettivo campagna').fill('Validate an integrated planning journey without sending.');await dialog.getByLabel('Scadenza campagna').fill('2026-11-10');await dialog.getByRole('button',{name:'Salva campagna in bozza'}).click();await expect(dialog).not.toBeVisible();
 await page.getByLabel('Cerca campagna').fill(name);await page.getByRole('article').filter({hasText:name}).getByRole('button',{name:'Apri campagna'}).click();await dialog.getByLabel('Lead da collegare').selectOption(leadId);await dialog.getByRole('button',{name:'Collega lead',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('Lead collegato manualmente');
 await dialog.getByLabel('Esito documentato').fill('Synthetic internal review completed; no customer contacted.');await dialog.getByRole('button',{name:'Registra attività',exact:true}).click();await expect(dialog.locator('.os-revenue-event')).toContainText('Synthetic internal review completed');await dialog.getByRole('button',{name:'Chiudi campagna'}).click();
 await page.reload();await page.getByLabel('Cerca campagna').fill(name);await expect(page.getByRole('article').filter({hasText:name}).locator('dd').last()).toHaveText('1');await page.getByRole('button',{name:'Agenda',exact:true}).click();await page.getByLabel('Mese agenda').fill('2026-11');await expect(page.locator('.os-revenue-agenda')).toContainText(name);
 await page.getByRole('button',{name:'Qualificazione',exact:true}).click();await expect(page.getByRole('article').filter({hasText:'SYNTHETIC lead '+suffix})).toContainText('Completezza');
});

test('pricing saves a calculated version and requests a real approval without sending',async({page,baseURL,browser},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Isolated passkey pricing flow runs once on desktop.');test.setTimeout(150000);await owner(page,baseURL!);
 await page.goto('/admin/estimates');await expect(page.getByRole('heading',{name:'Preventivatore',exact:true})).toBeVisible();await page.getByRole('button',{name:'Nuova stima',exact:true}).click();
 const name='SYNTHETIC calculated proposal '+randomUUID().slice(0,8);await page.getByLabel('Nome stima',{exact:true}).fill(name);await page.getByLabel('Ambito incluso',{exact:true}).fill('Documented website scope and delivery acceptance criteria.');await page.getByLabel('Condizioni di pagamento e validità').fill('Internal commercial terms to review.');await page.getByLabel('Assunzioni, rischi ed esclusioni').fill('Costs based on documented staff estimate.');await page.getByLabel('Voce 1',{exact:true}).fill('Development');await page.getByLabel('Quantità',{exact:true}).fill('10');await page.getByLabel('Costo unitario EUR',{exact:true}).fill('50');await page.getByLabel('Margine target %',{exact:true}).fill('50');
 await page.getByRole('button',{name:'Calcola anteprima'}).click();const result=page.getByRole('region',{name:'Calcolo verificabile'});await expect(result).toContainText(/1\.?000,00/);await expect(page.getByRole('button',{name:'Salva versione',exact:true})).toBeDisabled();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Salva versione',exact:true}).click();await expect(page.getByRole('status')).toContainText('Snapshot salvato');
 await page.reload();await page.getByRole('button',{name:new RegExp(name)}).click();await expect(page.getByRole('region',{name:'Calcolo verificabile'})).toContainText(/1\.?000,00/);await page.getByRole('button',{name:'Richiedi approvazione'}).click();await expect(page.getByRole('status')).toContainText('centro approvazioni');await expect(page.getByRole('button',{name:'Modifica nuova versione'})).toHaveCount(0);
 const list=await (await page.request.get('/api/pricing')).json();const quote=list.records.find((r:{name:string})=>r.name===name);expect(quote.status).toBe('IN_REVIEW');expect(list.sendingEnabled).toBe(false);const approvals=await (await page.request.get('/api/records/approvals')).json();expect(approvals.records).toEqual(expect.arrayContaining([expect.objectContaining({resource_type:'quotes',resource_id:quote.id,status:'PENDING'})]));
 await page.screenshot({path:'test-results/pricing-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await expect(page.getByRole('heading',{name:'Preventivatore',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'test-results/pricing-mobile.png',fullPage:true});
 // Separation of duties: the requester is refused, then a second Owner (own passkey and browser context) records the decision.
 await page.goto('/admin/approvals');await page.getByRole('row').filter({hasText:name}).getByRole('button',{name:'Revisiona'}).click();const own=page.getByRole('dialog');await own.getByLabel('Motivo della decisione').fill('Revise the delivery scope before client approval.');await own.getByRole('button',{name:'Richiedi revisione'}).click();await expect(page.getByText(/Separazione dei compiti/).first()).toBeVisible();
 // The reviewer must write a real reason; a rejection is visible back in the estimator.
 const reviewerContext=await browser.newContext({baseURL:baseURL!}),reviewer=await reviewerContext.newPage();await owner(reviewer,baseURL!);
 await reviewer.goto('/admin/approvals');await reviewer.getByRole('row').filter({hasText:name}).getByRole('button',{name:'Revisiona'}).click();const decision=reviewer.getByRole('dialog');await expect(decision.getByRole('button',{name:'Richiedi revisione'})).toBeDisabled();await decision.getByLabel('Motivo della decisione').fill('Revise the delivery scope before client approval.');await decision.getByRole('button',{name:'Richiedi revisione'}).click();await expect(reviewer.getByRole('status')).toContainText('Decisione registrata');await reviewerContext.close();
 await page.goto('/admin/estimates?quote='+quote.id);await expect(page.getByRole('region',{name:'Decisioni e feedback'})).toContainText('Revise the delivery scope');await page.getByRole('button',{name:'Modifica nuova versione'}).click();await page.getByRole('button',{name:'Calcola anteprima'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Salva versione',exact:true}).click();await expect(page.getByRole('status')).toContainText('Snapshot salvato');await page.getByRole('button',{name:'Richiedi approvazione'}).click();await expect(page.getByRole('status')).toContainText('centro approvazioni');
 // A Sales user can inspect the request but must not see actions their backend role forbids.
 const session=await (await page.request.get('/api/session')).json();d1("UPDATE memberships SET role='SALES' WHERE user_id='"+String(session.user.id).replaceAll("'","''")+"' AND organization_id='omni101'");
 await page.goto('/admin/approvals');await page.getByRole('row').filter({hasText:name}).filter({hasText:'PENDING'}).getByRole('button',{name:'Revisiona'}).click();await expect(page.getByRole('dialog').getByRole('button',{name:'Approva questa versione'})).toHaveCount(0);await expect(page.getByRole('dialog').getByRole('button',{name:'Richiedi revisione'})).toHaveCount(0);
});

test('email draft reopens after reload, isolates preview and export, and keeps local text on a delayed save and a 409',async({page,baseURL},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Isolated email draft composer runs once on desktop.');test.setTimeout(90000);await owner(page,baseURL!);
 let releaseOverview=()=>{};const overviewHeld=new Promise<void>(resolve=>{releaseOverview=resolve});
 await page.route('**/api/growth/overview',async route=>{await overviewHeld;await route.continue()});
 await page.goto('/admin/growth');
 await expect(page.getByRole('heading',{name:'Marketing, ricerca e fiducia'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Bozze email'})).toHaveCount(0);
 releaseOverview();
 await expect(page.getByRole('heading',{name:'Bozze email'})).toBeVisible();
 await page.unroute('**/api/growth/overview');
 const suffix=randomUUID().slice(0,8),subject='Bozza sintetica '+suffix,body='Testo locale della bozza '+suffix;
 await page.getByLabel('Oggetto',{exact:true}).fill(subject);await page.getByLabel('Testo',{exact:true}).fill(body);await page.getByLabel('Etichetta del pulsante',{exact:true}).fill('Apri');await page.getByLabel('Indirizzo https del pulsante',{exact:true}).fill('https://omni101.app/start-project');
 await page.getByRole('button',{name:'Salva bozza',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Bozza salvata'})).toBeVisible();
 await page.reload();await page.getByRole('button',{name:new RegExp(subject)}).click();
 await expect(page.getByLabel('Oggetto',{exact:true})).toHaveValue(subject);await expect(page.getByLabel('Testo',{exact:true})).toHaveValue(body);
 const frame=page.locator('iframe[title="Anteprima isolata della bozza"]');await expect(frame).toHaveAttribute('sandbox','');
 const srcdoc=await frame.getAttribute('srcdoc');expect(srcdoc||'').toContain(body);expect(srcdoc||'').not.toContain('<script');expect(srcdoc||'').not.toContain('<img');
 const href=await page.getByRole('link',{name:'Scarica HTML'}).getAttribute('href');expect(href).toBeTruthy();
 const exported=await page.request.get(href!);expect(exported.ok()).toBeTruthy();const html=await exported.text();expect(html).toContain(body);expect(html).not.toContain('<script');expect(html).not.toContain('<img');
 const draftId=decodeURIComponent(href!.split('/')[3]);
 const other=await api(page,'POST','/api/email-drafts',{subject:'Altra bozza '+suffix,body:'Corpo separato '+suffix,preheader:'',ctaLabel:'',ctaUrl:''});expect(other.status).toBe(201);
 let releaseSave=()=>{};const saveHeld=new Promise<void>(resolve=>{releaseSave=resolve});
 await page.route('**/api/email-drafts/*',async route=>{if(route.request().method()==='PATCH')await saveHeld;await route.continue()});
 const typed=body+' ancora nel modulo';await page.getByLabel('Testo',{exact:true}).fill(typed);
 const pendingSave=page.getByRole('button',{name:'Salva bozza',exact:true}).click();
 await expect(page.getByLabel('Testo',{exact:true})).toBeDisabled();await expect(page.getByLabel('Oggetto',{exact:true})).toBeDisabled();
 await expect(page.getByRole('button',{name:'Nuova bozza'})).toBeDisabled();await expect(page.getByRole('button',{name:new RegExp(subject)})).toBeDisabled();
 releaseSave();await pendingSave;await expect(page.getByRole('status').filter({hasText:'Bozza salvata'})).toBeVisible();await expect(page.getByLabel('Testo',{exact:true})).toHaveValue(typed);await page.unroute('**/api/email-drafts/*');
 const serverBody='Testo salvato sul server '+suffix;
 await page.route('**/api/email-drafts/*',async route=>{if(route.request().method()!=='PATCH')return route.continue();await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({error:'Versione superata o bozza non modificabile. Il testo nel modulo resta quello che stai scrivendo.',localKept:true,draft:{id:draftId,version:9,status:'DRAFT',subject,preheader:'',body:serverBody,ctaLabel:'Apri',ctaUrl:'https://omni101.app/start-project',campaignId:null,provider:null,sendingEnabled:false,account:null,savedIsApproval:false}})})});
 const kept=typed+' e non sostituito';await page.getByLabel('Testo',{exact:true}).fill(kept);await page.getByRole('button',{name:'Salva bozza',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Il testo nel modulo resta quello che stai scrivendo.');await expect(page.getByLabel('Testo',{exact:true})).toHaveValue(kept);
 async function refuse(name:string|RegExp){const messages:string[]=[];page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.dismiss()});await page.getByRole('button',{name}).click();expect(messages[0]||'').toContain('non salvate');await expect(page.getByLabel('Testo',{exact:true})).toHaveValue(kept)}
 await refuse('Carica la versione salvata');await refuse('Nuova bozza');await page.unroute('**/api/email-drafts/*');
 await page.reload();await page.getByRole('button',{name:new RegExp(subject)}).click();await expect(page.getByLabel('Testo',{exact:true})).toHaveValue(typed);
 await page.getByLabel('Testo',{exact:true}).fill(kept);await refuse(new RegExp('Altra bozza '+suffix));await expect(page.getByLabel('Oggetto',{exact:true})).toHaveValue(subject);
});
