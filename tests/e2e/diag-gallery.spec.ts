import {test,expect} from '@playwright/test';
// TEMPORARY diagnostic (SPEC-18): prints scroll samples when the gallery goes past the next plane. Remove once motion-gallery is green.
test('DIAG work gallery next',async({page,isMobile})=>{
 test.skip(isMobile);
 await page.goto('/work');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.locator('.spatial-gallery').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY,behavior:'instant'}));
 await expect.poll(async()=>Number(await page.locator('.spatial-gallery').getAttribute('data-depth'))).toBeLessThan(.1);
 const sample=()=>page.evaluate(()=>({y:Math.round(scrollY),depth:document.querySelector('.spatial-gallery')?.getAttribute('data-depth'),galleryTop:Math.round((document.querySelector('.spatial-gallery') as HTMLElement).getBoundingClientRect().top+scrollY),docH:document.documentElement.scrollHeight,ih:innerHeight,loc:document.querySelector('.sg-location')?.textContent?.slice(0,14)}));
 const before=await sample();
 await page.getByRole('button',{name:'Studio successivo'}).click();
 const out=[before];
 for(let i=0;i<14;i++){await page.waitForTimeout(250);out.push(await sample())}
 expect(out.filter((_,i)=>i%2===0||i<4).map(o=>JSON.stringify(o)).join('\n')).toBe('');
});
