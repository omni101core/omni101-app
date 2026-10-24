import {test,expect} from '@playwright/test';
// scroll-reveal cards stay visibility:hidden until near the viewport, so bring the card there before clicking
const openFirstCard=async(page:import('@playwright/test').Page)=>{const card=page.locator('.work-grid .work-card[href="/work/essenza"]');await card.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await card.click()};
test('work grid card opens a full preview, then the case page continues from it',async({page})=>{
 await page.goto('/work');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('.work-kind')).toHaveCount(3);
 await openFirstCard(page);
 const dialog=page.getByRole('dialog');
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('heading',{name:'Essenza / commercio'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page).toHaveURL(/\/work$/);
 await openFirstCard(page);
 await page.getByRole('dialog').getByRole('link',{name:/Apri il caso/}).click();
 await expect(page).toHaveURL(/\/work\/essenza$/);
 await expect(page.locator('[data-public-transition]')).toHaveAttribute('data-phase','idle');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.getByRole('heading',{level:1})).toContainText('Essenza');
 await expect(page.locator('.case-hero')).toBeVisible();
 await expect(page.locator('.spatial-gallery')).toHaveCount(0);
});
test('reduced motion: work cards are plain links to the case',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/work');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await openFirstCard(page);
 await expect(page).toHaveURL(/\/work\/essenza$/);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.case-hero')).toBeVisible();
});
test('studio portal changes state with the principles and never adds a second canvas',async({page})=>{
 await page.goto('/studio');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const portal=page.locator('.studio-portal');
 await expect(portal).toHaveAttribute('data-portal-mode','idle');
 for(const mode of ['build','grow']){
  await page.locator('.sp-step[data-mode="'+mode+'"]').evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-innerHeight*.35,behavior:'instant'}));
  await expect(portal).toHaveAttribute('data-portal-mode',mode);
  expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1);
 }
 await expect(page.locator('.sp-state')).toContainText('GROW');
 await page.screenshot({path:'test-results/studio-portal-grow.png'});
});
test('reduced motion: studio portal is static in its final state without a canvas',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/studio');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('.studio-portal')).toHaveAttribute('data-portal-mode','grow');
 await expect(page.locator('canvas')).toHaveCount(0);
 await expect(page.locator('.sp-step')).toHaveCount(6);
});
test('404 has a real heading, useful links and a 3D text cylinder that turns with scroll',async({page})=>{
 const response=await page.goto('/pagina-che-non-esiste');
 expect(response?.status()).toBe(404);
 await expect(page.getByRole('heading',{level:1})).toContainText('non esiste');
 await expect(page.locator('.nf-row')).toHaveCount(12);
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 await expect.poll(()=>page.locator('.nf-track').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--nf-rot'))).not.toBe('0deg');
 await page.screenshot({path:'test-results/not-found.png'});
 await page.getByRole('navigation',{name:'Pagine utili'}).getByRole('link',{name:/Progetti/}).click();
 await expect(page).toHaveURL(/\/work$/);
});

test('sector portfolio shows original hospitality cover and concrete scope',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/work');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();await page.getByLabel('Settore',{exact:true}).selectOption('B&B e ospitalità');
 await expect(page.locator('.work-grid .work-card')).toHaveCount(1);
 await expect(page.locator('.work-grid img')).toHaveAttribute('src','/media/originali/work-07-casa-luce.webp');
 await page.getByRole('link',{name:/Casa Luce/}).click();await expect(page).toHaveURL(/\/work\/casa-luce$/);
 await expect(page.getByText('Richiesta soggiorno e disponibilità da confermare',{exact:true})).toBeVisible();
});
