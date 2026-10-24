import {test,expect} from '@playwright/test';

const ref='7e2d9c4a-1b3f-4a5d-9e6f-0a1b2c3d4e5f';
const options=[
 {tier:'ESSENZIALE',name:'Sito essenziale',setupCents:100000,monthlyCents:5000,minMonths:null,deliveryDays:20},
 {tier:'CONSIGLIATA',name:'Sito consigliato',setupCents:200000,monthlyCents:9000,minMonths:12,deliveryDays:30},
 {tier:'COMPLETA',name:'Sito completo',setupCents:300000,monthlyCents:15000,minMonths:null,deliveryDays:45}
];
const view=(language:'it'|'en',accepted:unknown=null)=>({language,proposal:{quoteName:'Sito per Trattoria Verde',scope:'Sito vetrina in cinque pagine.',terms:'Setup anticipato, canone mensile.',options},expiresAt:Date.now()+86400000,accepted});
const payment=(iban:string|null)=>({iban,accountHolder:iban?'Studio di prova':null,reference:'PROP-AB12CD34',amountCents:200000});

test('proposal page: three options, terms, noindex, no costs, accept shows bank transfer details',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('it')}));
 let sent:Record<string,unknown>={};
 await page.route('**/api/proposal/'+ref+'/accept',route=>{sent=route.request().postDataJSON();return route.fulfill({status:201,json:{acceptedAt:Date.now(),option:options[1],payment:payment('conto-di-prova-1')}})});
 await page.goto('/proposal/'+ref);
 await expect(page.getByRole('heading',{level:1})).toHaveText('Sito per Trattoria Verde');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await expect(page.getByRole('radio')).toHaveCount(3);
 await expect(page.getByText('Setup anticipato, canone mensile.')).toBeVisible();
 await expect(page.getByText(/Durata minima 12 mesi/)).toBeVisible();
 await expect(page.locator('body')).not.toContainText(/margine|costo interno/i);
 const submit=page.getByRole('button',{name:'Accetta la proposta'});
 await expect(submit).toBeDisabled();
 await page.getByRole('radio',{name:/Consigliata/}).check();
 await page.getByLabel('Nome e cognome').fill('Mario Rossi');
 await page.getByLabel('Ruolo').fill('Titolare');
 await page.getByLabel('Email').fill('mario@example.com');
 await page.getByRole('checkbox').check();
 await submit.click();
 await expect(page.getByRole('heading',{name:'Proposta accettata'})).toBeVisible();
 await expect(page.getByText('conto-di-prova-1')).toBeVisible();
 await expect(page.getByText('PROP-AB12CD34')).toBeVisible();
 expect(sent).toMatchObject({option:'CONSIGLIATA',name:'Mario Rossi',role:'Titolare',email:'mario@example.com',termsAccepted:true});
});
test('without bank details the customer is told we write back',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('it',{acceptedAt:Date.now(),option:options[0],payment:payment(null)})}));
 await page.goto('/proposal/'+ref);
 await expect(page.getByRole('heading',{name:'Proposta accettata'})).toBeVisible();
 await expect(page.getByText('Ti scriviamo noi con le istruzioni di pagamento.')).toBeVisible();
 await expect(page.getByRole('radio')).toHaveCount(0);
});
test('English lead sees the English page',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('en')}));
 await page.goto('/proposal/'+ref);
 await expect(page.locator('main')).toHaveAttribute('lang','en');
 await expect(page.getByRole('radio',{name:/Recommended/})).toBeVisible();
 await expect(page.getByRole('button',{name:'Accept the proposal'})).toBeVisible();
});
test('a second acceptance is shown as an error, nothing changes on the page',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({json:view('it')}));
 await page.route('**/api/proposal/'+ref+'/accept',route=>route.fulfill({status:409,json:{error:'Proposta già accettata.'}}));
 await page.goto('/proposal/'+ref);
 await page.getByRole('radio',{name:/Essenziale/}).check();
 await page.getByLabel('Nome e cognome').fill('Mario Rossi');
 await page.getByLabel('Ruolo').fill('Titolare');
 await page.getByLabel('Email').fill('mario@example.com');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Accetta la proposta'}).click();
 await expect(page.getByRole('alert')).toContainText('Proposta già accettata.');
});
test('revoked, expired or unknown link shows a neutral message',async({page})=>{
 await page.route('**/api/proposal/'+ref,route=>route.fulfill({status:404,json:{error:'Proposta non disponibile.'}}));
 await page.goto('/proposal/'+ref);
 await expect(page.getByRole('alert')).toContainText('Proposal not available');
 await expect(page.getByRole('heading',{level:1})).toHaveCount(0);
});
