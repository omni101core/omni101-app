import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
// Il valore atteso si ricalcola dal file del motore prezzi: nessun importo scritto a mano qui.
const engine=JSON.parse(readFileSync('apps/web/app/content/prezzi-pubblici.json','utf8')),prodotti=engine.prodotti as Record<string,{daUnaTantum:number;daMensile:number}>,bundle=engine.bundle as Record<string,{daUnaTantum:number;daMensile:number;valuta:string}>;
const offers:[string,string][]=[['ai-landing','sito_pronto'],['ai-assistant','risponde_lui'],['ai-automation','ufficio_automatico'],['local-desk','bundle:local_desk']];
const money=(n:number,sep:string)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,sep);
const atteso=(id:string)=>{if(id.startsWith('bundle:')){const b=bundle[id.slice(7)];return 'From '+money(b.daUnaTantum,',')+' '+b.valuta+' + '+money(b.daMensile,',')+' '+b.valuta+'/month'}const p=prodotti[id],parts:string[]=[];if(p.daUnaTantum>0)parts.push('Setup from €'+money(p.daUnaTantum,','));if(p.daMensile>0)parts.push('from €'+money(p.daMensile,',')+'/month');return parts.join(' · ')};
async function open(page:Page,path:string){
 await page.route('**/api/public-config',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({turnstileSiteKey:'test-only'})}));
 await page.route('https://challenges.cloudflare.com/**',r=>r.abort());
 await page.goto(path);
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}
for(const [slug,id] of offers)test('/en/offers/'+slug+': "da" setup e canone coincidono col motore, riga prezzo finale, nessuno sconto',async({page})=>{
 await open(page,'/en/offers/'+slug);
 const exp=atteso(id);expect(exp).not.toBe('');
 await expect(page.getByTestId('en-price')).toHaveText(exp);
 await expect(page.getByTestId('en-final')).toHaveText('Final price fixed after your brief, before we start.');
 await expect(page.locator('.en-page')).not.toContainText(/discount|sconto|% off/i);
});
test('/en: ogni offerta mostra il suo "da" dal motore e i progetti su misura vanno a preventivo',async({page})=>{
 await open(page,'/en');
 const prices=page.locator('.en-grid .en-price');
 await expect(prices).toHaveCount(offers.length);
 for(const [i,[,id]] of offers.entries())await expect(prices.nth(i)).toHaveText(atteso(id));
 await expect(page.getByTestId('en-custom')).toHaveText('Custom projects: quote on request, free brief.');
});
test('home IT: riga "Offerte pronte da €" col minimo setup del motore e link alle soluzioni',async({page})=>{
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const min=Math.min(...Object.values(prodotti).map(p=>p.daUnaTantum).filter(v=>v>0));
 const line=page.getByTestId('home-from');
 await expect(line).toHaveText('Offerte pronte da € '+money(min,'.')+' · su misura con preventivo');
 await expect(line).toHaveAttribute('href','/solutions');
});
