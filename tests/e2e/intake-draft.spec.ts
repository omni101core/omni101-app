import {test,expect,type Page} from '@playwright/test';

async function open(page:Page,path='/start-project'){
 await page.route('**/api/public-config',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({turnstileSiteKey:'test-only'})}));
 await page.route('https://challenges.cloudflare.com/**',route=>route.abort());
 await page.goto(path);
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}

test.describe('bozza intake',()=>{
 test('il ricaricamento ripristina i campi non personali e non salva email né consenso',async({page})=>{
  await open(page);
  await page.getByRole('combobox',{name:/^Tipo di progetto/}).selectOption('sito');
  await page.getByLabel('Quante pagine ti immagini?').selectOption('Fino a 5');
  await page.getByLabel(/Raccontaci la tua idea/i).fill('Un sito per il mio studio dentistico');
  await page.getByLabel(/La tua email/i).fill('luca@example.test');
  await page.getByLabel(/informativa privacy/i).check();
  await page.waitForFunction(()=>localStorage.getItem('omni:intake-draft'));
  expect(await page.evaluate(()=>localStorage.getItem('omni:intake-draft'))).not.toContain('luca@example.test');
  await page.reload();
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await expect(page.getByLabel(/Raccontaci la tua idea/i)).toHaveValue('Un sito per il mio studio dentistico');
  await expect(page.getByLabel('Quante pagine ti immagini?')).toHaveValue('Fino a 5');
  await expect(page.getByLabel(/La tua email/i)).toHaveValue('');
  await expect(page.getByLabel(/informativa privacy/i)).not.toBeChecked();
  await expect(page.getByText(/ripristinato la tua bozza/i)).toBeVisible();
 });

 test('con lo storage bloccato il modulo funziona e "Scarta" svuota i campi',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});
  await open(page);
  await page.getByLabel(/Raccontaci la tua idea/i).fill('Prova senza storage');
  await page.getByRole('button',{name:'Scarta la bozza'}).click();
  await expect(page.getByLabel(/Raccontaci la tua idea/i)).toHaveValue('');
 });

 test('il link si crea sul server e riapre la bozza su un altro dispositivo',async({page,browser})=>{
  const store:{draft?:unknown}={},token='t'.repeat(43);
  const serve=async(p:Page)=>{
   await p.route('**/api/intake-drafts',route=>{store.draft=JSON.parse(route.request().postData()||'{}').draft;return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({token})})});
   await p.route('**/api/intake-drafts/'+token,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({draft:store.draft})}));
  };
  await serve(page);
  await open(page);
  await page.getByLabel(/Raccontaci la tua idea/i).fill('Un negozio online di ceramiche');
  await page.getByRole('button',{name:'Salva e riprendi con un link'}).click();
  await expect(page.getByLabel(/Link per riprendere/)).toHaveValue(new RegExp('riprendi='+token+'$'));
  const other=await browser.newPage({baseURL:test.info().project.use.baseURL});
  await serve(other);
  await open(other,'/start-project?riprendi='+token);
  await expect(other.getByLabel(/Raccontaci la tua idea/i)).toHaveValue('Un negozio online di ceramiche');
  await other.close();
 });
});
