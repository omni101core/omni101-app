import {test,expect,type Page} from '@playwright/test';
const hydrated=async(page:Page)=>{await expect(page.locator('[data-hydrated="true"]')).toBeVisible()};
const noSideScroll=async(page:Page)=>{expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1)};
const demos=['commerce','workflow','creative','vision'];

test('explore: the path loads with every station, real links and one WebGL canvas at most',async({page,isMobile})=>{
 const response=await page.goto('/explore');expect(response?.status()).toBe(200);await hydrated(page);
 await expect(page).toHaveTitle(/Playground · OMNI101/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Le possibilità');
 await expect(page.locator('.ex-card')).toHaveCount(9);
 for(const demo of demos)await expect(page.locator(`.ex-card a[href="/explore/${demo}"]`)).toHaveCount(1);
 for(const family of ['build','automate','create','grow','emerging'])await expect(page.locator(`.ex-card a[href="/solutions/${family}"]`)).toHaveCount(1);
 await expect.poll(()=>page.locator('canvas').count()).toBeLessThanOrEqual(1);
 await noSideScroll(page);
 if(isMobile){await expect(page.locator('.ex-path')).toHaveAttribute('data-enhanced','false');await expect(page.locator('.ex-card').first()).toBeVisible()}
 await page.locator('.ex-card a[href="/explore/workflow"]').click();
 await expect(page).toHaveURL(/\/explore\/workflow$/);
});

test('explore: the camera follows the scroll and the station index selects directly',async({page,isMobile})=>{
 test.skip(isMobile,'The pinned camera path is the wide-screen mode');
 await page.goto('/explore');await hydrated(page);
 const path=page.locator('.ex-path');
 await expect(path).toHaveAttribute('data-enhanced','true');
 await expect(path).toHaveAttribute('data-active-station','build');
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
 const cards=page.locator('.ex-card');await expect(cards).toHaveCount(9);
 for(let i=0;i<9;i++)await expect(cards.nth(i)).toBeVisible();
 await expect(page.locator('.ex-stage')).toBeHidden();
});

test('solutions: the ring opens on a family, tabs work with the keyboard and the catalogue follows',async({page})=>{
 const response=await page.goto('/solutions');expect(response?.status()).toBe(200);await hydrated(page);
 await expect(page).toHaveTitle(/Soluzioni · OMNI101/);
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

test('solutions: services are reachable without scrolling the ring, with availability and working CTAs',async({page})=>{
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

test('solutions: the ring turns with the scroll on wide screens',async({page,isMobile})=>{
 test.skip(isMobile,'The pinned ring needs a tall viewport');
 await page.goto('/solutions');await hydrated(page);
 const ring=page.locator('.cap-carousel');
 await expect(ring).toHaveAttribute('data-enhanced','true');
 await expect(ring).toHaveAttribute('data-active','build');
 await ring.evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY+(el.clientHeight-window.innerHeight)*.5,behavior:'instant' as ScrollBehavior}));
 await expect.poll(()=>ring.getAttribute('data-active'),{timeout:10000}).toBe('create');
 await expect(page.locator('.cap-panel[data-active="true"]')).toContainText('Immagini generative');
 await page.screenshot({path:'test-results/solutions-ring.png'});
});

test('solutions: reduced motion shows every family panel at once',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/solutions');await hydrated(page);
 await expect(page.locator('.cap-carousel')).toHaveAttribute('data-enhanced','false');
 const panels=page.locator('.cap-panel');await expect(panels).toHaveCount(5);
 for(let i=0;i<5;i++){await expect(panels.nth(i)).toBeVisible();await expect(panels.nth(i)).not.toHaveAttribute('inert')}
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

test('screenshots: the pages at desktop 1440 and mobile 390 for the visual review',async({page,isMobile},info)=>{
 await page.setViewportSize(isMobile?{width:390,height:844}:{width:1440,height:900});
 const shot=async(name:string,full=false)=>{await page.waitForTimeout(1600);await page.screenshot({path:`test-results/shots/${info.project.name}-${name}.png`,fullPage:full})};
 await page.goto('/explore');await hydrated(page);await shot('explore-top');
 await page.locator('[data-station="automate"]').scrollIntoViewIfNeeded();await shot('explore-automate');
 await page.locator('[data-station="vision"]').scrollIntoViewIfNeeded();await shot('explore-vision');
 await page.goto('/solutions');await hydrated(page);await shot('solutions-top');
 if(!isMobile)await page.getByRole('tab',{name:/GROW/}).click();
 await shot('solutions-ring');
 await page.getByRole('link',{name:'Vai al catalogo'}).click();await shot('solutions-catalogue');
 await page.goto('/solutions/automate');await hydrated(page);await shot('solutions-automate',true);
});
