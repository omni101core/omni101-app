import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
type Guide={slug:string;title:string;cta:{href:string};faq:{q:string}[]};
const load=(l:string)=>JSON.parse(readFileSync('apps/web/app/content/insights.'+l+'.json','utf8')) as Guide[];
const it=load('it'),en=load('en');
const ld=async(page:import('@playwright/test').Page)=>(await page.locator('script[type="application/ld+json"]').allTextContents()).join(' ');
test('/insights lists the guides; one opens with sections, FAQ, offer link and JSON-LD',async({page})=>{
 await page.goto('/insights');
 for(const g of it)await expect(page.getByRole('link',{name:g.title}).first()).toBeVisible();
 const g=it[0];
 await page.getByRole('link',{name:g.title}).first().click();
 await expect(page).toHaveURL(new RegExp('/insights/'+g.slug+'$'));
 await expect(page.getByRole('heading',{level:1})).toContainText(g.title.slice(0,20));
 expect(await page.locator('article h2').count()).toBeGreaterThanOrEqual(4);
 await expect(page.getByRole('heading',{name:'Domande frequenti'})).toBeVisible();
 for(const f of g.faq)await expect(page.getByRole('heading',{name:f.q})).toBeVisible();
 await expect(page.locator('article a[href="'+g.cta.href+'"]')).toBeVisible();
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://omni101.app/insights/'+g.slug);
 await expect(page.locator('link[hreflang=en]')).toHaveAttribute('href','https://omni101.app/en/insights/'+g.slug);
 const json=await ld(page);expect(json).toContain('"Article"');expect(json).toContain('"FAQPage"');
});
test('/en/insights/:slug is English, points back to the Italian guide and links an English offer',async({page})=>{
 const g=en[0];
 await page.goto('/en/insights/'+g.slug);
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await expect(page.getByRole('heading',{level:1})).toContainText(g.title.slice(0,20));
 await expect(page.getByRole('heading',{name:'Frequently asked questions'})).toBeVisible();
 await expect(page.locator('link[hreflang=it]')).toHaveAttribute('href','https://omni101.app/insights/'+g.slug);
 await expect(page.locator('article a[href="'+g.cta.href+'"]')).toBeVisible();
 await page.goto('/en/insights');
 for(const x of en)await expect(page.getByRole('link',{name:x.title}).first()).toBeVisible();
});
test('an Italian-only guide has no English page',async({request})=>{
 expect((await request.get('/en/insights/dal-brief-al-prodotto')).status()).toBe(404);
});
