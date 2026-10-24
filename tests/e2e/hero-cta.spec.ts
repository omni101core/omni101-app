import {expect,test} from '@playwright/test';

test('home hero: subtitle and primary CTA above the fold, tiles in Italian', async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const h1=page.getByRole('heading',{level:1});
 await expect(h1).toContainText('La tua idea.');
 const primary=page.locator('.home-title ~ .hero-actions').getByRole('link',{name:/Raccontaci la tua idea/});
 await expect(primary).toHaveAttribute('href','/start-project');
 await expect(page.locator('.home-title ~ .hero-actions').getByRole('link',{name:/Vedi cosa facciamo/})).toHaveAttribute('href','/solutions');
 const box=await primary.boundingBox();
 expect(box!.y+box!.height).toBeLessThanOrEqual(844);
 await expect(page.locator('.reel-card').first()).not.toContainText(/experience|products|workflows|possibilities/i);
});

test('header CTA is one 44px target with the arrow inside', async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const cta=page.locator('.site-header .header-action');
 await expect(cta).toContainText('Parliamone');
 await expect(cta.locator('i')).toContainText('↗');
 const box=await cta.boundingBox();
 expect(box!.height).toBeGreaterThanOrEqual(44);
});
