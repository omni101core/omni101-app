import {test,expect,type Page} from '@playwright/test';

async function open(page:Page){
 await page.route('**/api/public-config',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({turnstileSiteKey:'test-only'})}));
 await page.route('https://challenges.cloudflare.com/**',route=>route.abort());
 await page.route('**/api/intake',route=>route.abort());
 await page.goto('/start-project');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 // OmniAssist monta in ritardo (chunk lazy) e sposta il focus sul suo lancio: aspettarlo prima di usare la tastiera.
 await expect(page.locator('.omni-assist-launch')).toBeVisible();
}

test.describe('intake Express',()=>{
 test.use({viewport:{width:320,height:700}});

 test('si compila da tastiera a 320px e gli errori sono leggibili',async({page})=>{
  await open(page);
  await page.getByRole('button',{name:/Express/}).focus();
  await expect(page.getByRole('button',{name:/Express/})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:/Express/})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel(/Azienda o progetto/i)).toHaveCount(0);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Luca Neri');
  await page.keyboard.press('Tab');
  await page.keyboard.type('luca@example.test');
  await page.keyboard.press('Tab');
  await page.keyboard.type('ciao');
  await page.getByRole('button',{name:/Inizia la conversazione/}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Scrivi almeno 5 caratteri.')).toBeVisible();
  await expect(page.getByText('Serve il consenso per gestire la richiesta.')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
  expect(overflow).toBe(false);
  await page.getByLabel(/Il tuo messaggio/i).fill('Mi serve un sito');
  await page.getByLabel(/informativa privacy/i).check();
  await page.getByRole('button',{name:/Inizia la conversazione/}).press('Enter');
  await expect(page.getByRole('alert')).toContainText('verifica antispam');
 });

 test('il racconto completo resta com’era',async({page})=>{
  await open(page);
  await expect(page.getByRole('button',{name:/Racconto completo/})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByLabel(/Azienda o progetto/i)).toBeVisible();
  await expect(page.getByLabel(/budget indicativo/i)).toBeVisible();
  await page.getByLabel(/Come ti chiami/i).fill('Giulia Verdi');
  await page.getByLabel(/La tua email/i).fill('giulia@example.test');
  await page.getByLabel(/Raccontaci la tua idea/i).fill('troppo corto');
  await page.getByRole('button',{name:/Inizia la conversazione/}).click();
  await expect(page.getByText('Raccontaci qualcosa in più: almeno 20 caratteri.')).toBeVisible();
 });
});
