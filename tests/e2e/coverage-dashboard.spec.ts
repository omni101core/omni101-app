import {test,expect} from '@playwright/test';
test('coverage dashboard separates implementation from operations and paginates source evidence',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Synthetic dashboard behavior runs once; role and tenant guards are separate server tests.');
 const entry={id:'synthetic:email',sourceId:'source-a',source:{path:'docs/mandati/product-excellence-2026-10-23.md',startLine:12,endLine:16},kind:'MACRO_GROUP',requirement:'Bozze email e invio',acceptance:'Persistenza e provider effettivo',backlogKeys:['email-foundation'],implementationStatus:'PARTIALLY_IMPLEMENTED',operationalStatus:'BLOCKED',implementation:[],tests:[],release:null,verification:{status:'TESTED',reason:'Composer verificato; invio non collegato'},gaps:['Provider di invio assente'],reviewNeeded:true};
 await page.route('**/api/session',r=>r.fulfill({json:{user:{id:'synthetic',name:'Socio'},membership:{role:'OWNER'}}}));
 await page.route('**/api/knowledge*',r=>r.fulfill({json:{records:[],kinds:['REQUIREMENT'],statuses:['CAPTURED'],coverage:{sources:0,requirements:0,decisions:0,unlinkedRequirements:0},hasMore:false}}));
 const seen:string[]=[];
 await page.route('**/api/requirement-coverage?*',async r=>{const u=new URL(r.request().url());seen.push(u.search);const q=u.searchParams.get('q'),kind=u.searchParams.get('kind'),offset=Number(u.searchParams.get('offset'));await r.fulfill({json:{baseline:{revision:'5808a6ef',run:'40007650626'},summary:{publicSources:11,privateSources:2,macroGroups:48,semanticRequirements:1,unreviewedBlocks:100},sources:[{id:'source-a',sha256:'synthetic',reviewStatus:'PENDING'}],records:q==='nessun risultato'?[]:[{...entry,id:offset?'synthetic:second':entry.id,kind:kind||'MACRO_GROUP'}],total:q==='nessun risultato'?0:26,offset,limit:25,hasMore:offset===0&&q!=='nessun risultato'}})});
 await page.goto('/admin/knowledge');const panel=page.getByRole('region',{name:'Copertura dei mandati'});
 await expect(panel.getByRole('heading',{name:'Mandati → prodotto → prove'})).toBeVisible();
 await expect(panel.getByText('PARTIALLY_IMPLEMENTED',{exact:true})).toBeVisible();await expect(panel.getByText('BLOCKED',{exact:true})).toBeVisible();await expect(panel.getByText('Provider di invio assente',{exact:true})).toBeVisible();
 await expect(panel.getByRole('link',{name:/Fonte originale/})).toHaveAttribute('href',/product-excellence-2026-10-23\.md#L12$/);
 await panel.getByRole('button',{name:'Successivi',exact:true}).click();await expect.poll(()=>seen.at(-1)).toContain('offset=25');
 await panel.getByLabel('Livello di copertura').selectOption('CANDIDATE');await expect.poll(()=>seen.at(-1)).toContain('kind=CANDIDATE');await expect.poll(()=>seen.at(-1)).toContain('offset=0');
 await panel.getByLabel('Cerca nella copertura').fill('nessun risultato');await panel.getByRole('button',{name:'Cerca requisiti',exact:true}).click();await expect(panel.getByText('Nessun requisito corrisponde ai filtri.')).toBeVisible();
 await page.screenshot({path:'test-results/coverage-dashboard-desktop.png'});
});
