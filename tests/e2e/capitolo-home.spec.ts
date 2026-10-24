import {test,expect} from '@playwright/test';

/** Replaces cinematic-reentry.spec.ts: the chapter is now option cards, so the checks are the ones that still mean something. */
for(const motion of ['no-preference','reduce'] as const){
 test('home chapter shows option cards that each lead to an offer, motion '+motion,async({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:motion});
  await page.goto('/');
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
  await page.keyboard.press('Escape');
  const chapter=page.locator('#capitolo'),cards=chapter.locator('.capitolo-cards>li');
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.getByRole('heading',{level:2})).toBeVisible();
  // Voce, Binario and Vetrina always; Prima/Dopo only when the two stills exist.
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  expect(await cards.count()).toBeLessThanOrEqual(4);
  for(const card of await cards.all()){
   await expect(card.locator('h3[id^="capitolo-"]')).toBeVisible(); // ponytail: card title only; lazy demos add their own h3
   const link=card.locator('footer a');
   await expect(link).toHaveAttribute('href',/^\/explore\/[a-z]+$/);
  }
  await expect(chapter.locator('.capitolo-cards footer a[href="/explore/voice"]')).toBeVisible();
  await expect(chapter.getByRole('link',{name:/Raccontaci la tua idea/})).toHaveAttribute('href','/start-project');
  // No second renderer, no pin, no scroll lock.
  await expect(chapter.locator('canvas')).toHaveCount(0);
  expect(await chapter.evaluate(el=>getComputedStyle(el).position)).not.toBe('sticky');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
  await page.screenshot({path:'test-results/capitolo-home-'+motion+'-'+testInfo.project.name+'.png'});
 });
}

test('home chapter mounts a demo only when its card is near, and the cards keep their text without it',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const first=page.locator('#capitolo .capitolo-cards>li').first();
 await expect(first.locator('.capitolo-demo')).toBeEmpty();
 await first.scrollIntoViewIfNeeded();
 await expect(first.locator('.capitolo-demo > *').first()).toBeAttached({timeout:15000});
});

test('home chapter is reachable from the hero link and by keyboard',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.getByRole('link',{name:/Guarda come lavoriamo/}).click();
 await expect(page).toHaveURL(/#capitolo$/);
 await expect(page.locator('#capitolo')).toBeInViewport();
 const link=page.locator('#capitolo .capitolo-cards footer a').first();
 await link.focus();
 await expect(link).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/explore\//);
});
