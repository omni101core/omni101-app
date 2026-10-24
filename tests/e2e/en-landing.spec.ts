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
 for(const s of slugs)await expect(page.locator('a[href="/en/offers/'+s+'"]')).toHaveCount(1);
 await expect(page.locator('link[hreflang=it]')).toHaveAttribute('href','https://omni101.app/');
 await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href','https://omni101.app/en');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth)).toBe(false);
 await expect(page.getByLabel(/interested in/)).toBeVisible();
});
