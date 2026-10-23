import {test,expect,type Route} from '@playwright/test';
const json=(route:Route,body:unknown)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
const approvalId='run-1:review';
const approvalRoute='/admin/approvals?record='+encodeURIComponent(approvalId);
const starter={nodes:[{id:'start',type:'TRIGGER',position:{x:0,y:0},data:{label:'Avvio'}},{id:'end',type:'END',position:{x:240,y:0},data:{label:'Fine'}}],edges:[{id:'start-end',source:'start',target:'end'}]};

test('Mission Control waits for the current approval and opens exact artifacts',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Mocked workflow controls verified on desktop.');
 let approvalStatus='PENDING',resumeCalls=0;
 const run=()=>({kind:'workflow',id:'run-1',name:'Missione con revisione',status:'AWAITING_APPROVAL',current_node:'review',step:'review',createdAt:1,updatedAt:1,canCancel:true,canRetry:false,canResume:approvalStatus==='APPROVED',approvalId,approvalStatus,tokens:0,costCents:0});
 await page.route('**/api/session',route=>json(route,{user:{id:'owner',name:'Socio'},membership:{role:'OWNER'}}));
 await page.route('**/api/mission-control',route=>json(route,{runs:[run()],queue:{running:0,queued:0,awaitingApproval:1,failed:0,pendingApprovals:1},capabilities:{controlsEnabled:true,pause:false,pauseReason:'Pausa non supportata'},storage:{artifacts:'D1',r2:false,note:'Artefatti in D1'}}));
 await page.route('**/api/mission-control/workflow/run-1',route=>json(route,{run:run(),steps:[],events:[],artifacts:[{id:'task:review',kind:'TASK',name:'Attività prodotta',route:'/admin/tasks?record=task%3Areview',status:'TODO',stepNode:'task'}]}));
 await page.route('**/api/workflow-runs/run-1/resume',route=>{resumeCalls++;return json(route,{status:'DISPATCHED'})});
 await page.goto('/admin/agent-runs');
 await page.getByRole('button',{name:/Missione con revisione/}).click();
 await expect(page.getByRole('link',{name:'Apri approvazione richiesta ↗'})).toHaveAttribute('href',approvalRoute);
 await expect(page.getByRole('link',{name:/TASK · Attività prodotta/})).toHaveAttribute('href','/admin/tasks?record=task%3Areview');
 await expect(page.getByRole('button',{name:'Riprendi',exact:true})).toHaveCount(0);
 approvalStatus='APPROVED';
 // The approval decision does not modify the workflow timestamp: polling must refresh its detail anyway.
 await expect(page.getByRole('button',{name:'Riprendi',exact:true})).toBeVisible({timeout:15000});
 await page.getByRole('button',{name:'Riprendi',exact:true}).click();
 expect(resumeCalls).toBe(0);
 await page.getByRole('button',{name:'Conferma · Riprendi',exact:true}).click();
 await expect.poll(()=>resumeCalls).toBe(1);
 approvalStatus='REJECTED';
 await page.reload();
 await page.getByRole('button',{name:/Missione con revisione/}).click();
 await expect(page.getByText('Approvazione rifiutata.',{exact:false})).toBeVisible();
 await expect(page.getByRole('button',{name:'Riprendi',exact:true})).toHaveCount(0);
});

test('Workflow Builder offers resume only after the exact approval is ready',async({page},info)=>{
 test.skip(info.project.name!=='desktop','Mocked builder controls verified on desktop.');
 let approvalStatus='PENDING',resumeCalls=0,detailReads=0;
 await page.route('**/api/session',route=>json(route,{user:{id:'owner',name:'Socio'},membership:{role:'OWNER'}}));
 await page.route('**/api/records/leads',route=>json(route,{records:[{id:'lead-1',name:'Lead'}]}));
 await page.route('**/api/workflows',route=>json(route,{records:[{id:'wf-1',name:'Con revisione',version:1,status:'ACTIVE',steps:JSON.stringify(starter)}],starterGraph:starter,nodeKinds:[]}));
 await page.route('**/api/workflow-runs',route=>json(route,{id:'run-1',status:'QUEUED'}));
 await page.route('**/api/workflow-runs/run-1',route=>{detailReads++;return json(route,{run:{id:'run-1',status:'AWAITING_APPROVAL',approvalId,approvalStatus,canResume:approvalStatus==='APPROVED'},steps:[]})});
 await page.route('**/api/workflow-runs/run-1/resume',route=>{resumeCalls++;return json(route,{status:'DISPATCHED'})});
 await page.goto('/admin/automations');
 await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption('wf-1');
 await page.getByRole('combobox',{name:'Lead da elaborare'}).selectOption('lead-1');
 await page.getByRole('button',{name:'Avvia esecuzione reale'}).click();
 await expect(page.getByRole('link',{name:'Apri approvazione richiesta'})).toHaveAttribute('href',approvalRoute);
 await expect(page.getByRole('button',{name:'Riprendi dopo approvazione'})).toHaveCount(0);
 const beforeRejected=detailReads;approvalStatus='REJECTED';
 await expect.poll(()=>detailReads,{timeout:10000}).toBeGreaterThan(beforeRejected);
 await expect.poll(()=>page.getByRole('button',{name:'Riprendi dopo approvazione'}).count()).toBe(0);
 approvalStatus='APPROVED';
 await expect(page.getByRole('button',{name:'Riprendi dopo approvazione'})).toBeVisible({timeout:10000});
 await page.getByRole('button',{name:'Riprendi dopo approvazione'}).click();
 await expect.poll(()=>resumeCalls).toBe(1);
});
