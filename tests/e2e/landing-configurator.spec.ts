import {test,expect,type Page} from '@playwright/test';
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
async function authenticator(page:Page){const cdp=await page.context().newCDPSession(page);await cdp.send('WebAuthn.enable');await cdp.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true}})}
function d1(sql:string){
 // Same fixture as owners.spec: retry only the local D1 access, never the assertions.
 for(let attempt=0;;attempt++){
  try{execFileSync(resolve('node_modules/.bin/wrangler'),['d1','execute','DB','--local','--config','wrangler.jsonc','--env','test','--command',sql],{cwd:resolve('apps/web'),stdio:'pipe',timeout:30000});return}
  catch(error){const text=String((error as {stderr?:unknown}).stderr||'')+String((error as Error).message);if(attempt>=8||!/SQLITE_BUSY|database is locked/.test(text))throw error;Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,400+attempt*400)}
 }
}
function ownerInvitation(){const token=randomBytes(32).toString('hex'),hash=createHash('sha256').update(token).digest('hex'),now=Date.now();d1(`INSERT INTO invitations(id,organization_id,email,role,client_id,token_hash,expires_at,created_at,updated_at) VALUES('${randomUUID()}','omni101','owner-${randomUUID()}@example.test','OWNER',NULL,'${hash}',${now+600000},${now},${now});`);return token}

test('landing configurator: form, live preview, validation error, mobile 375',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Virtual WebAuthn is exercised once on desktop Chromium; mobile is checked by resizing.');
 test.setTimeout(90000);
 await authenticator(page);
 await page.goto('/portal/invite?token='+ownerInvitation());
 await page.getByRole('button',{name:'Attiva il tuo account'}).click();
 await expect(page).toHaveURL(/\/admin$/,{timeout:20000});
 await page.getByRole('link',{name:'Configuratore landing'}).first().click();
 await expect(page).toHaveURL(/\/admin\/landing-configurator$/);
 await expect(page.getByRole('heading',{name:'Configuratore landing'})).toBeVisible();
 await expect(page.getByText('Salvare non crea ordini, pagamenti o pubblicazioni')).toBeVisible();

 const preview=page.getByLabel('Anteprima dal vivo');
 await page.getByLabel('Nome attività').fill('Studio Verdi');
 await page.getByLabel('Titolo',{exact:true}).fill('Una landing chiara per Verdi');
 await expect(preview.getByRole('heading',{level:1})).toHaveText('Una landing chiara per Verdi');
 await expect(preview.getByText('Studio Verdi').first()).toBeVisible();
 await page.getByLabel('Tema').selectOption('hospitality');
 await expect(preview.locator('.landing-product-hospitality')).toBeVisible();
 await page.getByRole('button',{name:'Aggiungi funzione'}).click();
 await expect(page.getByLabel('Titolo funzione 2')).toBeVisible();

 // Validation error: client feedback, nothing sent.
 await page.getByLabel('Titolo',{exact:true}).fill('no');
 await expect(page.getByRole('alert')).toContainText('Titolo');
 await expect(preview.getByText('Correggi i campi')).toBeVisible();
 await page.getByLabel('Titolo',{exact:true}).fill('Una landing chiara per Verdi');
 await expect(page.getByRole('alert')).toHaveCount(0);

 await page.setViewportSize({width:375,height:812});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});
