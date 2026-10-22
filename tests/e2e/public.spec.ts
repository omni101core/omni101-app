import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{page.on('pageerror',e=>console.error('BROWSER ERROR:',e.message))});
test('public pages, SSR and correct navigation',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('La tua idea.');await page.getByRole('link',{name:'Raccontaci la tua idea'}).first().click();await expect(page).toHaveURL(/start-project/);await expect(page.getByLabel('La tua email')).toBeVisible();await page.goBack();await expect(page.getByRole('heading',{level:1})).toContainText('La tua idea.');await page.screenshot({path:'test-results/home.png',fullPage:true})});
test('all public routes render without fabricated clients',async({page})=>{for(const path of ['/solutions','/solutions/build','/work','/studio','/explore','/insights','/privacy','/terms']){const response=await page.goto(path);expect(response?.status()).toBe(200);await expect(page.getByRole('heading',{level:1})).toBeVisible()}await page.goto('/not-a-real-page');await expect(page.getByRole('heading',{level:1})).toContainText('non esiste')});
test('commerce variants and quantities work without payment',async({page})=>{await page.goto('/explore/commerce');await expect(page.locator('[data-hydrated="true"]')).toBeVisible();await page.getByLabel('Variante Essenza / Eau de Studio').selectOption('Agrumi');await page.getByRole('button',{name:'Aggiungi al carrello +'}).first().click();await expect(page.locator('#demo-cart')).toContainText('Agrumi');await expect(page.locator('#demo-cart')).toContainText('€ 68');await page.getByRole('button',{name:'Aumenta quantità essenza'}).click();await expect(page.locator('#demo-cart')).toContainText('€ 136')});
test('workflow is explicitly a simulation and completes',async({page})=>{await page.goto('/explore/workflow');await page.getByRole('button',{name:'Avvia simulazione'}).click();await expect(page.getByRole('log')).toContainText('La risposta viene proposta per approvazione',{timeout:15000});await expect(page.getByRole('log')).toContainText('Nessun dato viene scritto nel CRM reale')});
test('private APIs and privileged schema require authentication',async({request})=>{for(const path of ['/api/dashboard','/api/records/contacts','/api/schema/leads','/api/agents','/api/portal']){const r=await request.get(path);expect(r.status()).toBe(401)}});
test('reduced motion retains accessible content',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.getByRole('button',{name:'Progetto successivo'})).toBeVisible()});

test('vision has usable manual controls without camera permission',async({page})=>{await page.goto('/explore/vision');await expect(page.getByRole('heading',{level:1})).toContainText('Le mani diventano interfaccia');await expect(page.locator('.vision-lab').getByRole('status')).toContainText('Videocamera spenta');await page.getByRole('button',{name:'Prossima possibilità'}).click();await expect(page.getByRole('button',{name:'AUTOMATE',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByLabel('Rotazione manuale').press('End');await expect(page.locator('.vision-object')).toHaveAttribute('style',/rotateY\(120deg\)/);await page.screenshot({path:'test-results/vision-manual.png',fullPage:true})});

test('assistant transfers the brief locally without putting it in the URL or submitting a lead',async({page})=>{const brief='Catalogo dimostrativo con varianti e disponibilità, da verificare insieme.';let leads=0;await page.route('**/api/intake',async route=>{leads++;await route.abort()});await page.route('**/api/assistant',async route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({conversationId:'synthetic',output:{text:'Possiamo preparare il brief.',cards:[],checklist:[],actions:[{type:'brief',label:'Rivedi brief',brief}]}})}));await page.goto('/');await expect(page.locator('[data-hydrated="true"]')).toBeVisible();await page.getByRole('button',{name:'OMNI ASSIST',exact:true}).click();await page.getByLabel('Descrivi la tua idea').fill(brief);await page.getByRole('button',{name:'Invia messaggio'}).click();await page.getByRole('link',{name:'Rivedi brief'}).click();await expect(page).toHaveURL(/\/start-project$/);await expect(page.getByLabel('Raccontaci la tua idea')).toHaveValue(brief);await expect(page.getByRole('checkbox',{name:/Ho letto/})).not.toBeChecked();expect(leads).toBe(0)});

test('home: loader and hero are one scene, skippable, with doors instead of the old gallery',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('.reel-card')).toHaveCount(12);
 await page.keyboard.press('Escape');
 await expect(page.locator('.omni-reel')).toHaveAttribute('data-reel-phase','expanded');
 await expect(page.locator('.reel-loader')).toBeHidden();
 await expect(page.locator('.spatial-gallery,.portal-visual,.portal-narrative,.process')).toHaveCount(0);
 await expect(page.getByRole('link',{name:'prodotti',exact:true})).toHaveAttribute('href','/solutions/build');
 for(const href of ['/solutions','/work','/explore','/start-project'])await expect(page.locator('.home-doors').locator('a[href="'+href+'"]')).toHaveCount(1);
 expect(await page.locator('canvas').count()).toBeLessThanOrEqual(1);
});
test('home: the intro plays once per session',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.getByRole('button',{name:'Salta intro'}).click();
 await expect(page.locator('.omni-reel')).toHaveAttribute('data-reel-phase','expanded');
 await page.reload();
 await expect(page.locator('.omni-reel')).toHaveAttribute('data-reel-phase','expanded',{timeout:5000});
});
test('home: reduced motion has no loader and the ring is a plain list of links',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('.reel-loader')).toBeHidden();
 await expect(page.locator('.reel-card').first()).toBeVisible();
 await expect(page.locator('.reel-card').last()).toBeVisible();
});
test('menu opens from the centre, traps nothing outside and closes with Escape',async({page,isMobile})=>{
 test.skip(!isMobile,'the menu button only exists on small screens');
 await page.goto('/work');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.getByRole('button',{name:'Apri menu'}).click();
 await expect(page.getByRole('dialog',{name:'Menu principale'})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog',{name:'Menu principale'})).toBeHidden();
});
