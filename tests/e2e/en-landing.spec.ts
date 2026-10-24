import {test,expect,type Page} from '@playwright/test';
const slugs=['ai-landing','ai-assistant','ai-automation'];
async function open(page:Page,path:string){
 await page.route('**/api/public-config',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({turnstileSiteKey:'test-only'})}));
 await page.route('https://challenges.cloudflare.com/**',r=>r.abort());
 await page.route('**/api/intake',r=>r.abort());
 await page.goto(path);
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}
for(const slug of slugs){
 test.describe(slug,()=>{
  test('reachable, English, SEO tags',async({page})=>{
   await open(page,'/en/offers/'+slug);
   await expect(page.locator('html')).toHaveAttribute('lang','en');
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.getByRole('heading',{name:'Questions'})).toBeVisible();
   await expect(page.locator('.en-faq details')).toHaveCount(4);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://omni101.app/en/offers/'+slug);
   expect(await page.title()).toMatch(/OMNI101/);
  });
  test('no "From" price without engine data',async({page})=>{
   await open(page,'/en/offers/'+slug);
   const price=(await page.getByTestId('en-price').innerText()).trim();
   expect(price==='Fixed quote after the demo'||/^From €\d+/.test(price)).toBe(true);
   if(price==='Fixed quote after the demo')await expect(page.locator('.en-page')).not.toContainText(/\bFrom €/);
  });
  test('form: invalid shows errors, valid reaches the intake step',async({page})=>{
   await open(page,'/en/offers/'+slug);
   const form=page.getByRole('form',{name:'Free personalized mini-demo'});
   await form.getByRole('button',{name:'Get my free mini-demo'}).click();
   await expect(page.getByText('Please enter your name.')).toBeVisible();
   await expect(page.getByText('Consent is needed to handle your request.')).toBeVisible();
   await form.getByLabel(/Your name/).fill('Jane Doe');
   await form.getByLabel(/Your email/).fill('jane@example.test');
   await form.getByLabel(/website, or a short description/).fill('https://example.test');
   await form.getByLabel(/want to achieve/).fill('More enquiries from the site');
   await form.getByLabel(/I agree/).check();
   await form.getByRole('button',{name:'Get my free mini-demo'}).click();
   await expect(page.getByText('Please enter your name.')).toHaveCount(0);
   await expect(page.getByRole('alert')).toContainText('anti-spam');
  });
  test('mobile 375: no overflow, CTA contrast >= 4.5',async({page})=>{
   await page.setViewportSize({width:375,height:800});
   await open(page,'/en/offers/'+slug);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBe(false);
   const ratio=await page.locator('a.en-cta').evaluate(el=>{const s=getComputedStyle(el);const lum=(c:string)=>{const [r,g,b]=(c.match(/[\d.]+/g)||['0','0','0']).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4});return 0.2126*r+0.7152*g+0.0722*b};const a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)});
   expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
 });
}
test('/en: three offers linked, hreflang, no overflow at 375',async({page})=>{
 await page.setViewportSize({width:375,height:800});
 await open(page,'/en');
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 for(const s of slugs)await expect(page.locator('.en-page a[href="/en/offers/'+s+'"]')).toHaveCount(1);
 await expect(page.locator('link[hreflang=it]')).toHaveAttribute('href','https://omni101.app/');
 await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href','https://omni101.app/en');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBe(false);
 await expect(page.getByLabel(/interested in/)).toBeVisible();
});
test.describe('English shell',()=>{
 for(const path of ['/en','/en/offers/ai-landing'])test('header, menu and footer are English on '+path,async({page})=>{
  await open(page,path);
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  const nav=page.getByRole('navigation',{name:'Main navigation'});
  await expect(nav.getByRole('link',{name:'Offers'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Projects (Italian)'}).first()).toBeVisible();
  await expect(page.locator('.site-header .header-action')).toContainText('Free mini-demo');
  await expect(page.getByRole('link',{name:'Skip to content'})).toHaveCount(1);
  const footer=page.locator('footer.site-footer');
  await expect(footer).toContainText('IDEAS INTO POSSIBILITIES.');
  await expect(footer).toContainText('Digital Possibility Studio.');
  await expect(footer).toContainText('What we build');
  await expect(footer).not.toContainText(/Possibilità|Esplora|Termini|Una conversazione/);
  await expect(page.locator('.site-header')).not.toContainText(/Soluzioni|Progetti|Parliamone/);
  await expect(page.locator('.site-header .wordmark')).toHaveAttribute('href','/en');
  await expect(page.locator('.cta-section')).toHaveCount(0);
 });
 test('menu dialog is English and keeps its focus behaviour',async({page})=>{
  await page.setViewportSize({width:375,height:800});
  await open(page,'/en');
  await page.getByRole('button',{name:'Open menu'}).click();
  const dialog=page.getByRole('dialog',{name:'Main menu'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Digital Possibility Studio / Italy');
  await expect(dialog.getByRole('button',{name:'Close menu'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Open menu'})).toBeFocused();
 });
 test('language switch: EN to IT and back, selected language marked',async({page})=>{
  await open(page,'/en');
  const sw=page.locator('.site-header > .lang-switch');
  await expect(sw.locator('a[aria-current=true]')).toHaveText('EN');
  await sw.getByRole('link',{name:'Italiano'}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','it');
  await expect(page.locator('.site-header > .lang-switch a[aria-current=true]')).toHaveText('IT');
  await expect(page.locator('footer.site-footer')).toContainText('Possibilità');
  await page.locator('.site-header > .lang-switch').getByRole('link',{name:'English'}).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang','en');
 });
 test('SSR html carries the right lang before hydration',async({request})=>{
  expect(await (await request.get('/en')).text()).toMatch(/<html[^>]*lang="en"/);
  expect(await (await request.get('/')).text()).toMatch(/<html[^>]*lang="it"/);
  expect(await (await request.get('/en/offers/ai-assistant')).text()).toMatch(/<html[^>]*lang="en"/);
 });
 test('Italian shell stays Italian',async({page})=>{
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','it');
  await expect(page.getByRole('navigation',{name:'Navigazione principale'}).getByRole('link',{name:'Soluzioni'})).toBeVisible();
  await expect(page.locator('footer.site-footer')).toContainText('IDEAS INTO POSSIBILITIES.');
 });
});
