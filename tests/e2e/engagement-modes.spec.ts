import {test,expect} from '@playwright/test';

test('solutions exposes three engagement modes and sends the selected intention to the real brief without purchase',async({page})=>{
 let intake=0,payment=0;
 await page.route('**/api/intake',route=>{intake++;return route.abort()});
 await page.route('**/api/commerce/checkout',route=>{payment++;return route.abort()});
 const choices=[['Richiedi una proposta una tantum','Vorrei una proposta una tantum. Il risultato che cerco è: '],['Richiedi una proposta continuativa','Vorrei valutare un servizio continuativo o in abbonamento. Le attività ricorrenti che mi servono sono: '],['Prepara il brief del progetto','Vorrei definire un progetto su misura. Il problema da risolvere e le persone coinvolte sono: ']] as const;
 for(const [label,brief] of choices){
  await page.goto('/solutions');const section=page.getByRole('region',{name:/Un intervento, un percorso/});
  await expect(section.getByRole('heading',{name:'Una tantum',exact:true})).toBeVisible();
  await expect(section.getByRole('heading',{name:'Continuativo',exact:true})).toBeVisible();
  await expect(section.getByRole('heading',{name:'Progetto su misura',exact:true})).toBeVisible();
  await expect(section).toContainText('non attiva abbonamenti');
  await section.getByRole('link',{name:label+' ↗',exact:true}).click();
  await expect(page).toHaveURL(/\/start-project\?brief=/);
  await expect(page.getByLabel('Raccontaci la tua idea')).toHaveValue(brief);
  await expect(page.getByRole('checkbox',{name:/Ho letto/})).not.toBeChecked();
 }
 expect(intake).toBe(0);expect(payment).toBe(0);
});

test('engagement modes remain readable on a narrow family page, including keyboard navigation to terms',async({page})=>{
 await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/solutions/build');const section=page.locator('#modalita');
 await expect(section.getByRole('heading',{name:'Continuativo',exact:true})).toBeVisible();
 for(const article of await section.getByRole('article').all())expect(await article.evaluate(node=>node.getBoundingClientRect().right)).toBeLessThanOrEqual(361);
 const terms=section.getByRole('link',{name:'Leggi i termini ↗'});await terms.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/terms$/);
});
