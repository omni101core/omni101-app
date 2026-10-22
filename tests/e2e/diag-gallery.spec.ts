import {test,expect} from '@playwright/test';
test('gallery next advances one project without overshooting',async({page,isMobile})=>{
 test.skip(isMobile);
 await page.goto('/work');await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('.spatial-gallery')).toHaveClass(/sg-enhanced/);
 await page.locator('.spatial-gallery').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
 await page.getByRole('button',{name:'Studio successivo'}).click();
 await expect(page.locator('.sg-location')).toContainText('Atelier');
 await expect.poll(async()=>Number(await page.locator('.spatial-gallery').getAttribute('data-depth'))).toBeGreaterThan(.8);
 await expect.poll(async()=>Number(await page.locator('.spatial-gallery').getAttribute('data-depth'))).toBeLessThan(1.2);
});
