import {test,expect} from '@playwright/test';

test('coverage opens the authorized Knowledge source and retains task and handoff navigation',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Link behavior runs once; API role checks run separately.');
 const id='11111111-1111-4111-a111-111111111111',task='mandate:omni101:email-foundation';
 const record={id,name:'Fonte sintetica autorizzata',kind:'MANDATE',status:'CAPTURED',body:'Originale sintetico di prova, nessun dato reale.',source:'synthetic fixture',acceptance:'Conservare originale',evidence:'',source_id:null,task_id:null,version:1};
 await page.route('**/api/session',r=>r.fulfill({json:{user:{id:'synthetic',name:'Socio'},membership:{role:'OWNER'}}}));
 await page.route('**/api/knowledge*',r=>r.fulfill({json:{records:[],kinds:['MANDATE'],statuses:['CAPTURED'],coverage:{sources:0,requirements:0,decisions:0,unlinkedRequirements:0},hasMore:false}}));
 await page.route('**/api/knowledge/'+id,r=>r.fulfill({json:{record,revisions:[]}}));
 await page.route('**/api/requirement-coverage?*',r=>r.fulfill({json:{baseline:{},summary:{},sources:[],navigation:{pipeline:'/admin/pipeline',handoff:'docs/operativo/ripresa.md'},records:[{id:'synthetic',sourceId:'fixture',kind:'MACRO_GROUP',source:{knowledgeHref:'/admin/knowledge?record='+id},tasks:[{id:task,name:'Attività email',href:'/admin/tasks?record='+encodeURIComponent(task)}],requirement:'Requisito sintetico',acceptance:'',backlogKeys:['email-foundation'],implementationStatus:'CAPTURED',operationalStatus:'NOT_CONNECTED',implementation:[],tests:[],release:null,verification:{status:'UNKNOWN',reason:'Fixture'},gaps:[],reviewNeeded:true}],total:1,offset:0,limit:25,hasMore:false}}));
 await page.goto('/admin/knowledge');
 const panel=page.getByRole('region',{name:'Copertura dei mandati'});
 await expect(panel.getByRole('link',{name:'Handoff corrente ↗'})).toHaveAttribute('href','https://github.com/omni101core/omni101-app/blob/release-commercial/docs/operativo/ripresa.md');
 await expect(panel.getByRole('link',{name:'Fasi dei progetti ↗'})).toHaveAttribute('href','/admin/pipeline');
 await expect(panel.getByRole('link',{name:'Attività email · Apri attività ↗'})).toHaveAttribute('href','/admin/tasks?record='+encodeURIComponent(task));
 await panel.getByRole('link',{name:'Apri fonte in archivio ↗'}).click();
 await expect(page).toHaveURL(new RegExp('record='+id));
 await expect(page.getByLabel('Titolo',{exact:true})).toHaveValue(record.name);
 await expect(page.getByLabel('Contenuto originale o nota',{exact:true})).toHaveValue(record.body);
 await page.route('**/api/knowledge/'+id,r=>r.fulfill({status:404,json:{error:'Elemento non disponibile.'}}));
 await page.reload();
 await expect(page.getByRole('alert')).toContainText('Elemento non disponibile.');
 await expect(page.getByLabel('Contenuto originale o nota',{exact:true})).toHaveCount(0);
});
