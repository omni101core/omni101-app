import {test,expect,type Page} from '@playwright/test';

const hydrated=async(page:Page)=>{await expect(page.locator('[data-hydrated="true"]')).toBeVisible()};
const paidServices=/elevenlabs|heygen|synthesia|runway|tripo|adobe|vapi|retell|openai|anthropic/i;
async function arm(page:Page){
 const outside:string[]=[];
 page.on('request',request=>{if(paidServices.test(request.url()))outside.push(request.url())});
 await page.addInitScript(()=>{
  const host=window as unknown as {__omniCalls:string[]};
  host.__omniCalls=[];
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{host.__omniCalls.push('getUserMedia');throw new DOMException('blocked','NotAllowedError')};
 });
 return outside;
}
const calls=(page:Page)=>page.evaluate(()=>(window as unknown as {__omniCalls:string[]}).__omniCalls);
const station=(page:Page,id:string)=>page.locator(`[data-station="${id}"]`);

test('BancoVoce: scene and language change the line, play works without a microphone',async({page})=>{
 const outside=await arm(page);
 await page.goto('/explore/voice');await hydrated(page);
 const banco=page.locator('[data-showcase="banco-voce"]');
 await expect(banco).toHaveAttribute('data-fase','fermo');
 await expect(banco).toContainText('OPERATIVA');
 await expect(banco.locator('.sc-battuta')).toContainText('lo studio è chiuso');
 await banco.getByRole('button',{name:'Locale',exact:true}).click();
 await expect(banco.locator('.sc-battuta')).toContainText('la cucina è chiusa');
 await banco.getByRole('button',{name:'EN',exact:true}).click();
 await expect(banco.locator('.sc-battuta')).toContainText('the kitchen is closed');
 await expect(banco.locator('.sc-battuta')).toHaveAttribute('lang','en');
 await banco.getByRole('button',{name:'Ascolta',exact:true}).click();
 // Headless browsers have no voice: the bench ends in text only. With a voice it passes through "voce" and ends "finito".
 await expect.poll(()=>banco.getAttribute('data-fase'),{timeout:12000}).toMatch(/^(solo-testo|finito|voce)$/);
 await expect(banco.locator('.sc-onda path')).toHaveAttribute('d',/M/);
 await expect(banco.locator('.sc-battuta span[data-detta="true"]').first()).toBeVisible();
 expect(await calls(page)).toEqual([]);
 expect(outside).toEqual([]);
});

test('BancoVoce: reduced motion shows the final envelope before play and never needs the microphone',async({page})=>{
 await arm(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/explore/voice');await hydrated(page);
 const banco=page.locator('[data-showcase="banco-voce"]');
 await expect(banco.locator('.sc-onda path')).toHaveAttribute('d',/V/);
 await expect(page.locator('canvas')).toHaveCount(0);
});

test('Vetrina: the cut-out searches, adds and totals in the explore scene; no checkout',async({page})=>{
 await page.goto('/explore');await hydrated(page);
 const card=station(page,'commerce');
 await card.scrollIntoViewIfNeeded();
 const vetrina=card.locator('[data-showcase="vetrina"]');
 await expect(vetrina).toHaveAttribute('data-ritaglio','true');
 await expect(vetrina.locator('.product-card')).toHaveCount(1);
 await vetrina.getByLabel('Cerca prodotti').fill('traccia');
 await expect(vetrina.locator('.product-card')).toContainText('Traccia');
 await vetrina.getByRole('button',{name:'Aggiungi al carrello +'}).click();
 await expect(vetrina.locator('.cart-panel')).toContainText('Totale demo: € 24');
 await expect(vetrina.locator('.cart-panel')).toContainText('Nessun checkout reale');
 await expect(vetrina).toContainText('SIMULATA');
});

test('Binario: nodes light in sequence in the explore scene and the human review closes the line',async({page})=>{
 await page.goto('/explore');await hydrated(page);
 const card=station(page,'workflow');
 await card.scrollIntoViewIfNeeded();
 const binario=card.locator('[data-showcase="binario"]');
 await expect(binario).toHaveAttribute('data-nodi','6');
 await binario.getByRole('button',{name:'Avvia simulazione'}).click();
 await expect(binario).toHaveAttribute('data-acceso','true');
 await expect(binario.locator('.sc-grafo li[data-acceso="true"]')).toHaveCount(6,{timeout:15000});
 await expect(binario.getByRole('log')).toContainText('La risposta viene proposta per approvazione');
 await expect(binario).toContainText('SIMULATA');
});

test('Binario: the workflow page keeps the textarea; the brief link carries the sentence only when clicked',async({page})=>{
 await page.goto('/explore/workflow');await hydrated(page);
 const binario=page.locator('[data-showcase="binario"]');
 await binario.getByRole('textbox').fill('Vorrei ricevere un promemoria per ogni appuntamento.');
 const link=binario.getByRole('link',{name:/Usa la mia frase come brief/});
 await expect(link).toHaveAttribute('href',/^\/start-project\?brief=Vorrei%20ricevere/);
 await link.click();
 await expect(page).toHaveURL(/\/start-project\?brief=/);
 await expect(page.getByPlaceholder(/Cosa vorresti creare/)).toHaveValue('Vorrei ricevere un promemoria per ogni appuntamento.');
});

test('Binario: reduced motion is already in the final state',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/explore/workflow');await hydrated(page);
 const binario=page.locator('[data-showcase="binario"]');
 await expect(binario.locator('.sc-grafo li[data-acceso="true"]')).toHaveCount(6);
 await expect(binario.getByRole('log')).toContainText('La risposta viene proposta per approvazione');
});

test('PrimaDopo: mounts only with the two own stills; the handle answers the keyboard',async({page})=>{
 await page.goto('/explore/creative');await hydrated(page);
 const coppia=page.locator('[data-showcase="prima-dopo"]');
 if(await coppia.count()===0){
  // media.ts has no pair yet: no empty rectangle may stand in for it, here or in the explore scene.
  await expect(page.locator('.sc-pd')).toHaveCount(0);
  await page.goto('/explore');await hydrated(page);
  await expect(page.locator('[data-showcase="prima-dopo"]')).toHaveCount(0);
  return;
 }
 const maniglia=coppia.first().getByRole('slider',{name:'Confronto prima e dopo'});
 await maniglia.focus();
 await page.keyboard.press('End');
 await expect(maniglia).toHaveValue('100');
 await page.keyboard.press('Home');
 await expect(maniglia).toHaveValue('0');
 await page.keyboard.press('ArrowRight');
 await expect(maniglia).toHaveValue('1');
 await expect(coppia.first()).toContainText('Non è una foto del tuo prodotto');
 for(const img of await coppia.first().locator('img').all())await expect(img).toHaveAttribute('alt',/.+/);
});

test('TiPuoServire: every scene closes with two links and one brief CTA, in the declared service',async({page})=>{
 await page.goto('/explore');await hydrated(page);
 for(const id of ['voice','commerce','workflow','creative','vision']){
  const chiusura=station(page,id).locator('[data-showcase="ti-puo-servire"]');
  await expect(chiusura,id).toHaveCount(1);
  await expect(chiusura.locator('ul a'),id).toHaveCount(2);
  await expect(chiusura.locator('a.button'),id).toHaveAttribute('href',/^\/start-project\?brief=.+/);
 }
 await expect(station(page,'voice').locator('[data-showcase="ti-puo-servire"] a.button')).toHaveAttribute('href','/start-project?brief=Voglio%20una%20risposta%20fuori%20orario%20per%20lo%20studio');
});

test('explore: the voice control sits in the first screen, also at 390px, and no scene needs a login',async({page,isMobile})=>{
 if(isMobile)await page.setViewportSize({width:390,height:844});
 await page.goto('/explore');await hydrated(page);
 const play=station(page,'voice').getByRole('button',{name:'Ascolta',exact:true});
 await expect(play).toBeVisible();
 // On desktop the first screen is the hero title by design; the 390px rule is the one that binds.
 if(isMobile)await expect(play).toBeInViewport();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
 for(const id of ['voice','commerce','workflow','creative','vision'])await expect(station(page,id).locator('a[href*="login"],a[href*="signup"],a[href*="accedi"]'),id).toHaveCount(0);
});

test('explore: the vision scene rotates by hand without asking for the camera',async({page})=>{
 await arm(page);
 await page.goto('/explore');await hydrated(page);
 const scena=station(page,'vision').locator('[data-scena="vision"]');
 await scena.scrollIntoViewIfNeeded();
 await scena.getByRole('slider').press('End');
 await expect(scena.locator('.sc-oggetto')).toHaveAttribute('data-angolo','120');
 await expect(scena).toContainText('OPERATIVA');
 expect(await calls(page)).toEqual([]);
});

test('explore: the create scene reshapes the same message in three formats',async({page})=>{
 await page.goto('/explore');await hydrated(page);
 const scena=station(page,'creative').locator('[data-scena="create"]');
 await scena.scrollIntoViewIfNeeded();
 await scena.getByRole('button',{name:'9:16'}).click();
 await expect(scena.locator('.sc-formato')).toHaveAttribute('data-formato','story');
 await scena.getByRole('button',{name:'EN',exact:true}).click();
 await expect(scena.locator('.sc-formato')).toContainText('Time for what matters.');
});
