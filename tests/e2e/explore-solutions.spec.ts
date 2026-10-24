import {test,expect,type Page} from '@playwright/test';
const hydrated=async(page:Page)=>{await expect(page.locator('[data-hydrated="true"]')).toBeVisible()};
const noSideScroll=async(page:Page)=>{expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1)};
const demos=['voice','commerce','workflow','creative','vision','avatar','software'];

test('explore: the path loads with every station, real links and one WebGL canvas at most',async({page,isMobile})=>{
 const response=await page.goto('/explore');expect(response?.status()).toBe(200);await hydrated(page);
 await expect(page).toHaveTitle(/OMNI101 · Playground/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Le possibilità');
 await expect(page.locator('.ex-card')).toHaveCount(12);
 for(const demo of demos)await expect(page.locator(`.ex-card>a[href="/explore/${demo}"]`)).toHaveCount(1);
 for(const family of ['build','automate','create','grow','emerging'])await expect(page.locator(`.ex-card>a[href="/solutions/${family}"]`)).toHaveCount(1);
 await expect.poll(()=>page.locator('canvas').count()).toBeLessThanOrEqual(1);
 await noSideScroll(page);
 if(isMobile){await expect(page.locator('.ex-path')).toHaveAttribute('data-enhanced','false');await expect(page.locator('.ex-card').first()).toBeVisible()}
 await page.locator('.ex-card>a[href="/explore/workflow"]').click();
 await expect(page).toHaveURL(/\/explore\/workflow$/);
});

test('explore: the camera follows the scroll and the station index selects directly',async({page,isMobile})=>{
 test.skip(isMobile,'The pinned camera path is the wide-screen mode');
 await page.goto('/explore');await hydrated(page);
 const path=page.locator('.ex-path');
 await expect(path).toHaveAttribute('data-enhanced','true');
 await expect(path).toHaveAttribute('data-active-station','voice');
 await page.getByRole('button',{name:/workflow/}).click();
 await expect.poll(()=>path.getAttribute('data-active-station'),{timeout:10000}).toBe('workflow');
 await page.locator('[data-station="vision"]').scrollIntoViewIfNeeded();
 await expect.poll(()=>path.getAttribute('data-active-station'),{timeout:10000}).toBe('vision');
 await page.screenshot({path:'test-results/explore-path.png'});
});

test('explore: reduced motion keeps every station visible without pinning',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/explore');await hydrated(page);
 await expect(page.locator('.ex-path')).toHaveAttribute('data-enhanced','false');
 await expect(page.locator('canvas')).toHaveCount(0);
 const cards=page.locator('.ex-card');await expect(cards).toHaveCount(12);
 for(let i=0;i<12;i++)await expect(cards.nth(i)).toBeVisible();
 await expect(page.locator('.ex-stage')).toBeHidden();
});

test('solutions: the wheel opens on a family, tabs work with the keyboard and the catalogue follows',async({page})=>{
 const response=await page.goto('/solutions');expect(response?.status()).toBe(200);await hydrated(page);
 await expect(page).toHaveTitle(/OMNI101 · Soluzioni/);
 const tabs=page.getByRole('tab');await expect(tabs).toHaveCount(5);
 await expect(page.getByRole('tab',{name:/BUILD/})).toHaveAttribute('aria-selected','true');
 await page.getByRole('tab',{name:/BUILD/}).focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:/AUTOMATE/})).toHaveAttribute('aria-selected','true');
 await expect(page.getByRole('tab',{name:/AUTOMATE/})).toBeFocused();
 await expect(page.locator('.cap-card').first()).toBeAttached();
 await expect(page.locator('#catalogo h2')).toContainText('Automatizzare');
 await page.keyboard.press('End');
 await expect(page.getByRole('tab',{name:/EMERGING/})).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Home');
 await expect(page.getByRole('tab',{name:/BUILD/})).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Tab');
 await expect(page.locator(':focus')).not.toHaveAttribute('role','tab');
 await noSideScroll(page);
});

test('solutions: services are reachable without touching the wheel, with availability and working CTAs',async({page})=>{
 await page.goto('/solutions');await hydrated(page);
 await page.getByRole('tab',{name:/AUTOMATE/}).click();
 await page.getByRole('link',{name:'Vai al catalogo'}).click();
 await expect(page.locator('#catalogo')).toBeInViewport();
 const cards=page.locator('.cap-card'),total=await cards.count();
 expect(total).toBeGreaterThan(5);
 await expect(page.locator('.cap-card .cap-badge').first()).toBeVisible();
 const filter=page.getByRole('button',{name:/Su misura/});
 const wanted=Number(await filter.locator('span').innerText());
 await filter.click();await expect(cards).toHaveCount(wanted);expect(wanted).toBeLessThan(total);
 await expect(filter).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:/Tutte/}).click();await expect(cards).toHaveCount(total);
 await cards.first().getByRole('link').first().click();
 await expect(page).toHaveURL(/\/(start-project|contact)$/);
});

test('solutions: the deck is dealt, lifts into a wheel and turns to the chosen family',async({page,isMobile})=>{
 test.skip(isMobile,'The wheel needs a wide, tall viewport');
 await page.goto('/solutions');await hydrated(page);
 await expect(page.locator('.cap-carousel')).toHaveAttribute('data-enhanced','true');
 const wheel=page.locator('.deal');
 await expect(wheel).toHaveAttribute('data-phase','idle',{timeout:15000});
 await expect(page.locator('.deal-card')).toHaveCount(10);
 await expect(page.locator('.deal-card[data-top="true"]')).toHaveAttribute('data-family','build');
 const visible=await page.locator('.deal-card').evaluateAll(cards=>cards.filter(card=>getComputedStyle(card).visibility==='visible').length);
 expect(visible).toBeLessThanOrEqual(6);expect(visible).toBeGreaterThanOrEqual(3);
 await expect(page.locator('.deal-card[data-top="true"] .cap-art')).toBeVisible();
 expect(await page.locator('.deal-caption .cap-title').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(40);
 await expect(page.locator('.cap-carousel')).toHaveAttribute('data-active','build');
 await page.getByRole('tab',{name:/CREATE/}).click();
 await expect(page.locator('.deal-card[data-top="true"]')).toHaveAttribute('data-family','create');
 await expect(page.locator('.deal-caption')).toContainText('Immagini generative');
 await page.screenshot({path:'test-results/solutions-wheel.png'});
 // A drag to the left of about one card turns the wheel to the next family; the pointer is still before release so no flick.
 // The stage is taller than the space under the hero on a 720px screen: bring it to the middle so the pointer is inside the viewport.
 await page.locator('.deal-stage').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant' as ScrollBehavior}));
 const box=(await page.locator('.deal-stage').boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x-190,y,{steps:14});await page.waitForTimeout(150);await page.mouse.up();
 await expect(page.locator('.deal-card[data-top="true"]')).toHaveAttribute('data-family','grow');
 await expect(page.getByRole('tab',{name:/GROW/})).toHaveAttribute('aria-selected','true');
 // A click on the top card opens its family page. Let the wheel settle first: mid-turn two cards overlap the centre.
 await page.waitForTimeout(1200);
 await page.locator('.deal-card[data-top="true"] .deal-face').click();
 await expect(page).toHaveURL(/\/solutions\/grow$/);
});

test('solutions: reduced motion shows every family panel at once',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/solutions');await hydrated(page);
 await expect(page.locator('.cap-carousel')).toHaveAttribute('data-enhanced','false');
 const panels=page.locator('.cap-panel');await expect(panels).toHaveCount(5);
 for(let i=0;i<5;i++){await expect(panels.nth(i)).toBeVisible();await expect(panels.nth(i).locator('.cap-art')).toBeVisible();await expect(panels.nth(i)).not.toHaveAttribute('inert')}
 await expect(page.locator('canvas')).toHaveCount(0);
 await page.getByRole('tab',{name:/GROW/}).click();
 await expect(page.locator('#catalogo h2')).toContainText('Crescere');
});

test('solutions/:family: each family has its page, its catalogue and a 404 for the unknown',async({page})=>{
 for(const [slug,title] of [['build','Costruire'],['automate','Automatizzare'],['create','Creare'],['grow','Crescere'],['emerging','Sperimentale']]){
  const response=await page.goto('/solutions/'+slug);expect(response?.status()).toBe(200);await hydrated(page);
  await expect(page.getByRole('heading',{level:1})).toContainText(title);
  await expect(page).toHaveTitle(new RegExp(slug.toUpperCase()));
  await expect(page.getByRole('tab',{name:new RegExp(slug.toUpperCase())})).toHaveAttribute('aria-selected','true');
  expect(await page.locator('.cap-card').count()).toBeGreaterThan(5);
  // Segments of PUBBLICO.md: a still grid, one problem and exactly one demo per card, no wheel on this page.
  const segments=page.locator('#segmenti .cap-segment');expect(await segments.count()).toBeGreaterThan(0);
  for(const card of await segments.all()){await expect(card.locator('.cap-segment-demo')).toHaveCount(1);await expect(card.locator('.cap-segment-demo > .cap-actions a')).toHaveCount(1)}
  await expect(page.locator('.deal')).toHaveCount(0);
 }
 await page.goto('/solutions/automate');await hydrated(page);
 await page.getByRole('tab',{name:/GROW/}).click();
 await expect(page).toHaveURL(/\/solutions\/grow$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Crescere');
 await page.goto('/solutions/automate');await hydrated(page);
 await page.locator('.cap-card a[href="/explore/workflow"]').first().click();
 await expect(page).toHaveURL(/\/explore\/workflow$/);
 const missing=await page.goto('/solutions/inesistente');expect(missing?.status()).toBe(404);
});

test('solutions/build: each card has per chi, risultato, cosa serve, da; Disponibile chip hidden when it matches Tutte',async({page})=>{
 await page.goto('/solutions/build');await hydrated(page);
 const card=page.locator('.cap-card[data-capability="siti-premium"]');
 for(const label of ['Per chi','Risultato','Cosa serve','Da','Tempi'])await expect(card.getByText(label,{exact:true})).toBeVisible();
 await expect(card).toContainText('4400');
 await expect(card).not.toContainText('Da definire nel preventivo');
 await expect(page.locator('.cap-card[data-capability="saas"]')).toContainText('Da definire nel preventivo');
 await expect(page.locator('.cap-card[data-capability="saas"]')).not.toContainText('€');
 await expect(page.getByRole('button',{name:/^Disponibile/})).toHaveCount(0);
 await expect(page.getByRole('button',{name:/^Tutte/})).toHaveCount(0);
});

test('solutions/:family: a segment demo opens in its card only on request',async({page})=>{
 await page.goto('/solutions/automate');await hydrated(page);
 const card=page.locator('.cap-segment[data-segment="ristoranti"]'),live=card.locator('.cap-segment-live');
 await expect(live).toBeHidden();
 await card.getByRole('button',{name:/Provala qui/}).click();
 await expect(live).toBeVisible();
 await expect(live).toContainText(/simulata|operativa/i);
 await expect(card.getByRole('button',{name:/Chiudi la demo/})).toHaveAttribute('aria-expanded','true');
 await card.getByRole('button',{name:/Chiudi la demo/}).click();
 await expect(live).toBeHidden();
});

test('screenshots: the pages at desktop 1440 and mobile 390 for the visual review',async({page,isMobile},info)=>{
 await page.setViewportSize(isMobile?{width:390,height:844}:{width:1440,height:900});
 const shot=async(name:string,full=false)=>{await page.waitForTimeout(1600);await page.screenshot({path:`test-results/shots/${info.project.name}-${name}.png`,fullPage:full})};
 await page.goto('/explore');await hydrated(page);await shot('explore-top');
 await page.locator('[data-station="automate"]').scrollIntoViewIfNeeded();await shot('explore-automate');
 await page.locator('[data-station="vision"]').scrollIntoViewIfNeeded();await shot('explore-vision');
 await page.goto('/solutions');await hydrated(page);if(!isMobile)await expect(page.locator('.deal')).toHaveAttribute('data-phase','idle',{timeout:15000});await shot('solutions-top');
 if(!isMobile)await page.getByRole('tab',{name:/GROW/}).click();
 await shot('solutions-wheel');
 await page.getByRole('link',{name:'Vai al catalogo'}).click();await shot('solutions-catalogue');
 await page.goto('/solutions/automate');await hydrated(page);await shot('solutions-automate',true);
 await page.goto('/solutions/build');await hydrated(page);await shot('solutions-build',true);
});
