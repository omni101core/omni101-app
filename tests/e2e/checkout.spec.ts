import {test,expect} from '@playwright/test';

const ref='7e2d9c4a-1b3f-4a5d-9e6f-0a1b2c3d4e5f';
const option={tier:'CONSIGLIATA',name:'Sito consigliato',setupCents:200000,monthlyCents:9000,minMonths:12,deliveryDays:30};
const payment={iban:'conto-di-prova-1',accountHolder:'Studio di prova',reference:'PROP-AB12CD34',amountCents:200000};
const order={mode:'SANDBOX',paymentStatus:'PENDING_BANK_TRANSFER',amountCents:200000,currency:'EUR',reference:'PROP-AB12CD34',createdAt:1};
const view=(language:'it'|'en',withOrder:boolean)=>({language,proposal:{quoteName:'Sito per Trattoria Verde',scope:'Sito vetrina.',terms:'Setup anticipato.',options:[option]},expiresAt:Date.now()+86400000,accepted:{acceptedAt:Date.now(),option,payment,order:withOrder?order:null}});

test('accepted proposal: SANDBOX label, one click creates the order, button disappears',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('it',false)}));
 let calls=0;
 await page.route('**/api/proposal/'+ref+'/checkout',async route=>{calls++;await new Promise(r=>setTimeout(r,150));return route.fulfill({status:201,json:{order}})});
 await page.goto('/proposal/'+ref);
 await expect(page.getByText('SANDBOX',{exact:true})).toBeVisible();
 await expect(page.getByText(/nessun pagamento viene eseguito/)).toBeVisible();
 const button=page.getByRole('button',{name:'Conferma l’ordine'});
 await button.dblclick();
 await expect(page.getByRole('status')).toContainText('Ordine registrato');
 await expect(page.getByRole('button',{name:'Conferma l’ordine'})).toHaveCount(0);
 expect(calls).toBe(1);
});
test('reload after the order shows it without the button',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('it',true)}));
 await page.goto('/proposal/'+ref);
 await expect(page.getByRole('status')).toContainText('PROP-AB12CD34');
 await expect(page.getByRole('button',{name:'Conferma l’ordine'})).toHaveCount(0);
});
test('English page and a failed checkout shows the error',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('en',false)}));
 await page.route('**/api/proposal/'+ref+'/checkout',route=>route.fulfill({status:500,json:{error:'Ordine non creato.'}}));
 await page.goto('/proposal/'+ref);
 await expect(page.getByText(/no payment is taken/)).toBeVisible();
 await page.getByRole('button',{name:'Confirm the order'}).click();
 await expect(page.getByRole('alert')).toContainText('Ordine non creato.');
 await expect(page.getByRole('button',{name:'Confirm the order'})).toBeVisible();
});
