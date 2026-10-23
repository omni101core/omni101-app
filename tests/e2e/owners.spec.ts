import {test,expect,type Page} from '@playwright/test';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
async function authenticator(page:Page){const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}})}
test('two independent Owners use verified passkeys, invite and persist projects',async({page,browser},testInfo)=>{test.skip(testInfo.project.name!=='desktop','Shared invitation fixture is used once in isolated Chromium test');await authenticator(page);await page.goto('/portal/invite?token=local-test-invitation-owner-only-0000000000000000');await page.getByRole('button',{name:'Attiva il tuo account'}).click();await expect(page).toHaveURL(/\/admin$/,{timeout:20000});await expect(page.getByRole('heading',{name:'Oggi nello studio'})).toBeVisible();await page.getByRole('link',{name:'Progetti',exact:true}).click();await page.getByRole('button',{name:'Nuovo',exact:true}).click();await page.getByRole('dialog').getByLabel('Progetto').fill('Cloud delivery verification');await page.getByRole('button',{name:'Salva nel workspace'}).click();await expect(page.getByRole('table')).toContainText('Cloud delivery verification');await page.getByRole('link',{name:'Impostazioni',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('owner-two@example.test');await page.getByRole('button',{name:'Crea invito sicuro'}).click();const notice=page.locator('.os-panel .os-notice');const inviteLink=notice.getByRole('link',{name:'Apri invito personale'});await expect(inviteLink).toBeVisible();const link=await inviteLink.getAttribute('href');if(!link)throw new Error('Invito personale non disponibile');const context=await browser.newContext();const second=await context.newPage();await authenticator(second);await second.goto(link);await second.getByRole('button',{name:'Attiva il tuo account'}).click();await expect(second).toHaveURL(/\/admin$/,{timeout:20000});await second.getByRole('link',{name:'Progetti',exact:true}).click();await expect(second.getByRole('table')).toContainText('Cloud delivery verification');await second.getByRole('button',{name:'Nuovo',exact:true}).click();await second.getByRole('dialog').getByLabel('Progetto').fill('Second Owner delivery');await second.getByRole('button',{name:'Salva nel workspace'}).click();await expect(second.getByRole('table')).toContainText('Second Owner delivery');await second.screenshot({path:'test-results/two-owner-workspace.png',fullPage:true});await context.close()});

function d1(sql:string){
 // Concurrent wrangler/workerd access to the local D1 file can answer SQLITE_BUSY: retry the fixture, never the assertions.
 for(let attempt=0;;attempt++){
  try{execFileSync(resolve('node_modules/.bin/wrangler'),['d1','execute','DB','--local','--config','wrangler.jsonc','--env','test','--command',sql],{cwd:resolve('apps/web'),stdio:'pipe',timeout:30000});return}
  catch(error){const text=String((error as {stderr?:unknown}).stderr||'')+String((error as Error).message);if(attempt>=8||!/SQLITE_BUSY|database is locked/.test(text))throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,400+attempt*400)}
 }
}

// Infrastructure fixtures only (localhost D1): a unique individual Owner and individual CLIENT invitations.
// Everything the test asserts goes through real passkey sign-in and the HTTP API.
function invitation(role:'OWNER'|'CLIENT',clientId?:string){const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),now=Date.now();d1(`INSERT INTO invitations(id,organization_id,email,role,client_id,token_hash,expires_at,created_at,updated_at) VALUES('${randomUUID()}','omni101','${role.toLowerCase()}-${randomUUID()}@example.test','${role}',${clientId?`'${clientId}'`:'NULL'},'${hash}',${now+600000},${now},${now});`);return token}
async function api(page:Page,method:string,path:string,body?:unknown){return page.evaluate(async([method,path,body])=>{const response=await fetch(path as string,{method:method as string,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,body:await response.json().catch(()=>null) as any}},[method,path,body] as [string,string,unknown])}
async function delivered(page:Page,label:string){
 const client=(await api(page,'POST','/api/records/clients',{name:'Cliente '+label,status:'ACTIVE'})).body.record.id as string;
 const project=(await api(page,'POST','/api/records/projects',{name:'Progetto '+label,status:'ACTIVE',client_id:client})).body.record.id as string;
 const task=(await api(page,'POST','/api/records/tasks',{name:'Attività '+label,project_id:project,status:'IN_PROGRESS',priority:'HIGH'})).body.record.id as string;
 const qa=await api(page,'POST','/api/tasks/'+task+'/request-qa',{});
 expect((await api(page,'POST','/api/qa/'+qa.body.reviewId+'/outcome',{outcome:'PASS',notes:'Verificato per '+label+'.'})).status).toBe(200);
 const deliverable=(await api(page,'POST','/api/projects/'+project+'/deliverables',{name:'Consegna '+label,body:'Contenuto riservato di '+label})).body.id as string;
 expect((await api(page,'POST','/api/deliverables/'+deliverable+'/deliver',{})).status).toBe(200);
 return {client,project,deliverable,label};
}

test('client portal: each invited client sees only their own project and delivery',async({page,browser},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');
 test.setTimeout(120000);
 await authenticator(page);
 await page.goto('/portal/invite?token='+invitation('OWNER'));
 await page.getByRole('button',{name:'Attiva il tuo account'}).click();
 await expect(page).toHaveURL(/\/admin$/,{timeout:20000});
 const key=randomUUID().slice(0,8),a=await delivered(page,'Alfa '+key),b=await delivered(page,'Beta '+key);
 const sessions=[] as {context:Awaited<ReturnType<typeof browser.newContext>>;page:Page;own:typeof a;other:typeof a}[];
 for(const [own,other] of [[a,b],[b,a]] as const){
  const context=await browser.newContext(),portal=await context.newPage();
  await authenticator(portal);
  await portal.goto('/portal/invite?token='+invitation('CLIENT',own.client));
  await portal.getByRole('button',{name:'Attiva il tuo account'}).click();
  await expect(portal).toHaveURL(/\/portal$/,{timeout:20000});
  await expect(portal.getByRole('heading',{name:'I tuoi progetti'})).toBeVisible();
  await expect(portal.locator('#portal-projects').getByText('Progetto '+own.label)).toBeVisible();
  await expect(portal.locator('#portal-deliverables').getByText('Consegna '+own.label)).toBeVisible();
  const text=await portal.locator('main').innerText();
  expect(text).not.toContain(other.label);
  const mine=await api(portal,'GET','/api/portal');
  expect(mine.status).toBe(200);
  expect(JSON.stringify(mine.body)).not.toContain(other.label);
  expect(mine.body.deliverables.map((d:any)=>d.id)).toEqual([own.deliverable]);
  // Direct requests for the other client's records are indistinguishable from missing ones.
  expect((await api(portal,'POST','/api/portal/deliverables/'+other.deliverable+'/decision',{decision:'APPROVED'})).status).toBe(404);
  expect((await api(portal,'POST','/api/portal/tickets',{projectId:other.project,name:'Richiesta intrusa',description:'Un cliente non può aprire ticket sul progetto di un altro.'})).status).toBe(404);
  expect((await api(portal,'GET','/api/records/projects/'+other.project)).body.records).toEqual([]);
  for(const staffOnly of ['/api/mission-control','/api/projects/'+own.project+'/pipeline','/api/records/deliverables','/api/team'])expect((await api(portal,'GET',staffOnly)).status).toBe(403);
  await portal.screenshot({path:'test-results/portal-'+own.label.split(' ')[0].toLowerCase()+'.png',fullPage:true});
  sessions.push({context,page:portal,own,other});
 }
 // Each client acts on their own delivery; the other client's delivery stays untouched.
 await sessions[0].page.getByRole('button',{name:'Approva consegna'}).click();
 await expect(sessions[0].page.locator('#portal-deliverables .os-badge')).toHaveText('Approvato');
 const first=await api(page,'GET','/api/records/deliverables'),status=(id:string)=>first.body.records.find((r:any)=>r.id===id).status;
 expect([status(a.deliverable),status(b.deliverable)]).toEqual(['APPROVED','DELIVERED']);
 expect((await api(sessions[1].page,'GET','/api/portal')).body.deliverables[0].status).toBe('DELIVERED');
 for(const session of sessions)await session.context.close();
});
