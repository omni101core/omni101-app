import {test,expect} from '@playwright/test';

test('assistant reflows, returns focus and preserves explicit draft and brief actions',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Responsive assistant contract is exercised once with explicit desktop and narrow viewports.');
 let posts=0,intakes=0;
 await page.route('**/api/assistant/conversations?*',route=>route.fulfill({json:{conversations:[]}}));
 await page.route('**/api/intake',async route=>{intakes++;await route.abort()});
 const brief='Un catalogo di prodotti da esplorare con lo studio, con disponibilità da verificare.';
 await page.route('**/api/assistant',async route=>{
  expect(route.request().method()).toBe('POST');posts++;
  if(posts===1)return route.fulfill({status:503,json:{error:'Risposta temporaneamente non disponibile.'}});
  return route.fulfill({json:{conversationId:'synthetic-assist-review',output:{text:'Possiamo preparare una traccia da rivedere insieme.',cards:[],checklist:[],actions:[{type:'brief',label:'Rivedi brief',brief}]}}});
 });
 await page.goto('/start-project');
 for(const theme of ['light','dark']){
  await page.evaluate(value=>{localStorage.setItem('omni:theme:public',value);document.documentElement.dataset.theme=value},theme);
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:width===320?568:844});
   const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});
   await expect(launch).toBeVisible();
   const target=await launch.boundingBox();expect(target!.height).toBeGreaterThanOrEqual(44);
   await launch.click();
   const panel=page.getByRole('dialog',{name:'OMNI ASSIST AI',exact:true});
   const input=panel.getByRole('textbox',{name:'Descrivi la tua idea',exact:true});
   await expect(input).toBeFocused();expect(posts).toBe(0);expect(intakes).toBe(0);
   const box=await panel.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);expect(box!.y+box!.height).toBeLessThanOrEqual(width===320?568:844);
   expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   expect(await panel.locator('.omni-assist-body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   if(width<700)expect(await input.evaluate(el=>getComputedStyle(el).fontSize)).toBe('16px');
   await input.fill('Bozza non inviata');
   await page.keyboard.press('Escape');await expect(panel).not.toBeVisible();await expect(launch).toBeFocused();
   await launch.click();await expect(input).toHaveValue('Bozza non inviata');
   await panel.getByRole('button',{name:'Chiudi assistente',exact:true}).click();await expect(launch).toBeFocused();
  }
 }
 const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});await launch.click();
 const panel=page.getByRole('dialog',{name:'OMNI ASSIST AI',exact:true}),input=panel.getByRole('textbox',{name:'Descrivi la tua idea',exact:true});
 await panel.getByRole('button',{name:'Vorrei creare un e-commerce ↗',exact:true}).click();
 await expect(input).toHaveValue('Vorrei creare un e-commerce');expect(posts).toBe(0);
 await input.fill(brief);await panel.getByRole('button',{name:'Invia messaggio',exact:true}).click();
 await expect(panel.getByRole('alert')).toContainText('temporaneamente non disponibile');await expect(input).toHaveValue(brief);
 await panel.getByRole('button',{name:'Invia messaggio',exact:true}).click();
 await expect(panel.getByRole('link',{name:'Rivedi brief ↗',exact:true})).toBeVisible();expect(posts).toBe(2);expect(intakes).toBe(0);
 await page.screenshot({path:'test-results/assist-responsive-320-dark.png'});
 await panel.getByRole('link',{name:'Rivedi brief ↗',exact:true}).click();
 await expect(panel).not.toBeVisible();await expect(page).toHaveURL(/\/start-project$/);
 await expect(page.getByLabel('Raccontaci la tua idea')).toHaveValue(brief);expect(intakes).toBe(0);
});
