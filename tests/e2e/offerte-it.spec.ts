import {test,expect,type Page} from '@playwright/test';
const slugs=['ai-landing','ai-assistant','ai-automation','local-desk'];
async function open(page:Page,path:string){
 await page.route('**/api/public-config',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({turnstileSiteKey:'test-only'})}));
 await page.route('https://challenges.cloudflare.com/**',r=>r.abort());
 await page.route('**/api/intake',r=>r.abort());
 await page.goto(path);
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}
test('/offerte: catalogo con 4 offerte e form brief',async({page})=>{
 await open(page,'/offerte');
 await expect(page.locator('html')).toHaveAttribute('lang','it');
 await expect(page.getByTestId('offerta-card')).toHaveCount(4);
 await expect(page.getByRole('form',{name:'Mini-demo personalizzata gratuita'})).toBeVisible();
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://omni101.app/offerte');
});
for(const slug of slugs){
 test.describe(slug,()=>{
  test('italiano, SEO e hreflang it/en',async({page})=>{
   await open(page,'/offerte/'+slug);
   await expect(page.locator('html')).toHaveAttribute('lang','it');
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.getByRole('heading',{name:'Domande'})).toBeVisible();
   await expect(page.locator('.en-faq details')).toHaveCount(4);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://omni101.app/offerte/'+slug);
   await expect(page.locator('link[rel=alternate][hreflang=en]')).toHaveAttribute('href','https://omni101.app/en/offers/'+slug);
   await expect(page.locator('link[rel=alternate][hreflang=it]')).toHaveAttribute('href','https://omni101.app/offerte/'+slug);
  });
  test('prezzo "da" solo se il flag e acceso, altrimenti preventivo fisso',async({page})=>{
   await open(page,'/offerte/'+slug);
   const price=(await page.getByTestId('en-price').innerText()).trim();
   expect(price==='Preventivo fisso dopo la demo'||/^(Setup da|canone da|Da) .*\/mese$/.test(price)).toBe(true);
  });
  test('form: errori in italiano, poi arriva al passo intake',async({page})=>{
   await open(page,'/offerte/'+slug);
   const form=page.getByRole('form',{name:'Mini-demo personalizzata gratuita'});
   await form.getByRole('button',{name:'Ricevi la tua mini-demo gratuita'}).click();
   await expect(page.getByText('Inserisci il tuo nome.')).toBeVisible();
   await form.getByLabel(/Il tuo nome/).fill('Mario Rossi');
   await form.getByLabel(/La tua email/).fill('mario@example.test');
   await form.getByLabel(/Il tuo sito/).fill('https://example.test');
   await form.getByLabel(/Cosa vuoi ottenere/).fill('Più richieste dal sito');
   await form.getByLabel(/Acconsento/).check();
   await form.getByRole('button',{name:'Ricevi la tua mini-demo gratuita'}).click();
   await expect(page.getByText('Inserisci il tuo nome.')).toHaveCount(0);
  });
 });
}
test('slug inesistente: 404',async({page})=>{expect((await page.goto('/offerte/nope'))?.status()).toBe(404)});
test('selettore lingua: IT -> EN sulla stessa offerta',async({page})=>{
 await open(page,'/offerte/ai-landing');
 await expect(page.locator('.lang-switch a[hreflang=en]').first()).toHaveAttribute('href','/en/offers/ai-landing');
});
