import {test,expect} from '@playwright/test';
test('public theme persists, private scope defaults dark and all seven labs are reachable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Attiva tema scuro'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Attiva tema chiaro'}).click();
 await page.goto('/admin');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 for(const slug of ['avatar','voice','vision','workflow','commerce','creative','software'])await expect(page.locator('.home-labs a[href="/explore/'+slug+'"]')).toHaveCount(1);
});
test('avatar prepares an honest storyboard; software lab changes local records',async({page})=>{
 await page.goto('/explore/avatar');await page.getByLabel('Copione',{exact:true}).fill('Presentazione dimostrativa del prodotto.');await page.getByRole('button',{name:/Prepara storyboard/}).click();await expect(page.locator('.lab-avatar')).toContainText('Presentazione dimostrativa del prodotto.');
 await page.goto('/explore/software');await page.getByLabel('Nuova opportunità',{exact:true}).fill('Prova CRM');await page.getByRole('button',{name:'Aggiungi',exact:true}).click();const item=page.locator('.lab-crm article').filter({hasText:'Prova CRM'});await item.getByRole('combobox').selectOption('Concluso');await expect(page.locator('.lab-crm>section').filter({has:page.getByRole('heading',{name:/Concluso/})})).toContainText('Prova CRM');
 await page.getByRole('button',{name:'Prenotazioni',exact:true}).click();await page.getByLabel('Giorno').fill('2026-12-10');await page.getByRole('button',{name:'Simula prenotazione'}).click();await expect(page.getByRole('status').first()).toContainText('2026-12-10');
});
