import {test,expect,type Page,type Route} from '@playwright/test';

const starter={nodes:[{id:'start',type:'TRIGGER',position:{x:0,y:100},data:{label:'Brief acquisito'}},{id:'end',type:'END',position:{x:240,y:100},data:{label:'Fine'}}],edges:[{id:'start-end',source:'start',target:'end'}]};
type Definition={id:string;name:string;version:number;status:'DRAFT'|'ACTIVE';steps:string};
type SaveBody={id?:string;version?:number;name:string;active:boolean;graph:typeof starter};

function saved(overrides:Partial<Definition>={}):Definition{return {id:'wf-saved',name:'Già salvato',version:1,status:'DRAFT',steps:JSON.stringify(starter),...overrides}}

async function install(page:Page){
 const defs:Definition[]=[saved()];
 let hold:Promise<void>|null=null;
 let release:()=>void=()=>{};
 let conflict=false;
 const saves:SaveBody[]=[];
 const runs:Array<{dryRun?:boolean;definitionId?:string;leadId?:string}>=[];
 const session={user:{id:'user-1',name:'Socio'},membership:{role:'OWNER'}};
 const json=(route:Route,status:number,body:unknown)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/session',route=>json(route,200,session));
 await page.route('**/api/records/leads',route=>json(route,200,{records:[{id:'lead-1',name:'Lead vero'}]}));
 await page.route('**/api/workflows',async route=>{
  if(route.request().method()==='GET')return json(route,200,{records:defs,starterGraph:starter,nodeKinds:[]});
  const body=route.request().postDataJSON() as SaveBody;
  saves.push(body);
  if(hold)await hold;
  if(conflict)return json(route,409,{error:'Workflow modificato da un altro socio: ricarica.'});
  const current=body.id?defs.find(item=>item.id===body.id):undefined;
  if(current&&current.version!==body.version)return json(route,409,{error:'Workflow modificato da un altro socio: ricarica.'});
  const version=(current?.version||0)+1;
  const next:Definition={id:body.id||'wf-new',name:body.name,version,status:body.active?'ACTIVE':'DRAFT',steps:JSON.stringify(body.graph)};
  const index=defs.findIndex(item=>item.id===next.id);
  if(index>=0)defs[index]=next;else defs.unshift(next);
  return json(route,201,{id:next.id,version,graph:body.graph});
 });
 await page.route('**/api/workflow-runs**',async route=>{
  const url=new URL(route.request().url());
  if(route.request().method()==='POST'&&url.pathname==='/api/workflow-runs'){
   const body=route.request().postDataJSON() as {dryRun?:boolean;definitionId?:string;leadId?:string};
   runs.push(body);
   return json(route,body.dryRun?200:202,body.dryRun?{valid:true,sideEffects:false}:{id:'run-1',status:'QUEUED',dispatch:true});
  }
  return json(route,200,{run:{id:'run-1',status:'QUEUED',error:null},steps:[]});
 });
 await page.goto('/admin/automations');
 await expect(page.getByRole('heading',{name:'Workflow Builder'})).toBeVisible({timeout:20000});
 await expect(page.locator('.react-flow__node')).toHaveCount(2);
 return {defs,saves,runs,conflictOn(next:boolean){conflict=next},holdSave(){hold=new Promise(resolve=>{release=resolve})},releaseSave(){release();hold=null}};
}

test('a new workflow discards a dirty draft only after confirmation and does not reuse the open id',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The mocked builder is exercised once on desktop Chromium.');
 const mock=await install(page);
 const name=page.getByRole('textbox',{name:'Nome workflow'});
 const picker=page.getByRole('combobox',{name:'Workflow salvato'});
 await picker.selectOption({label:'Già salvato · v1'});
 await expect(name).toHaveValue('Già salvato');
 await name.fill('Bozza locale');
 await picker.selectOption({label:'Nuovo workflow'});
 const dialog=page.getByRole('alertdialog',{name:'Bozza non salvata'});
 await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'Annulla'}).click();
 await expect(name).toHaveValue('Bozza locale');
 await expect(picker).toHaveValue('wf-saved');
 await picker.selectOption({label:'Nuovo workflow'});
 await dialog.getByRole('button',{name:'Scarta bozza e continua'}).click();
 await expect(picker).toHaveValue('');
 await expect(name).toHaveValue('Intake → proposta → approvazione');
 await expect(page.getByRole('status')).toContainText('Nessuna versione salvata');
 await name.fill('Creato ora');
 await page.getByRole('button',{name:'Salva versione'}).click();
 await expect(page.getByRole('status')).toContainText('Versione 1 salvata');
 expect(mock.saves.at(-1)).toMatchObject({name:'Creato ora',active:false});
 expect(mock.saves.at(-1)?.id).toBeUndefined();
 expect(mock.defs.find(item=>item.id==='wf-saved')).toMatchObject({name:'Già salvato',version:1});
});

test('validate and start use only the saved active version',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The mocked builder is exercised once on desktop Chromium.');
 const mock=await install(page);
 const name=page.getByRole('textbox',{name:'Nome workflow'});
 const validate=page.getByRole('button',{name:'Valida senza eseguire'});
 const start=page.getByRole('button',{name:'Avvia esecuzione reale'});
 await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption({label:'Già salvato · v1'});
 await expect(validate).toBeEnabled();
 await expect(start).toBeDisabled();
 await validate.click();
 await expect(page.getByRole('status')).toContainText('Validazione riuscita');
 expect(mock.runs.at(-1)).toMatchObject({dryRun:true,definitionId:'wf-saved'});
 await page.getByLabel('Aggiungi nodo').selectOption('TRANSFORM');
 await expect(page.locator('.react-flow__node')).toHaveCount(3);
 await expect(validate).toBeDisabled();
 await expect(start).toBeDisabled();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Workflow Builder'})).toBeVisible();
 await expect(page.locator('.react-flow__node')).toHaveCount(2);
 await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption({label:'Già salvato · v1'});
 await page.getByRole('checkbox',{name:'Attivo'}).check();
 await expect(validate).toBeDisabled();
 await expect(start).toBeDisabled();
 await page.getByRole('button',{name:'Salva versione'}).click();
 await expect(page.getByRole('status')).toContainText('Versione 2 salvata');
 expect(mock.saves.at(-1)).toMatchObject({id:'wf-saved',version:1,active:true});
 await expect(validate).toBeEnabled();
 await expect(start).toBeDisabled();
 await page.getByRole('combobox',{name:'Lead da elaborare'}).selectOption({label:'Lead vero'});
 await expect(start).toBeEnabled();
 await name.fill('Ancora locale');
 await expect(validate).toBeDisabled();
 await expect(start).toBeDisabled();
 await page.getByRole('button',{name:'Salva versione'}).click();
 await expect(page.getByRole('status')).toContainText('Versione 3 salvata');
 await start.click();
 await expect(page.getByRole('status')).toContainText('Esecuzione accodata');
 expect(mock.runs.at(-1)).toMatchObject({dryRun:false,definitionId:'wf-saved',leadId:'lead-1'});
});

test('a stale save keeps the local draft and loads the server copy only after confirmation',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The mocked builder is exercised once on desktop Chromium.');
 const mock=await install(page);
 const name=page.getByRole('textbox',{name:'Nome workflow'});
 await page.getByRole('combobox',{name:'Workflow salvato'}).selectOption({label:'Già salvato · v1'});
 await name.fill('Non perdere');
 mock.conflictOn(true);
 await page.getByRole('button',{name:'Salva versione'}).click();
 await expect(page.getByRole('alert')).toContainText('ricarica');
 await expect(name).toHaveValue('Non perdere');
 await expect(page.getByRole('button',{name:'Carica ultima versione'})).toBeVisible();
 expect(mock.defs[0]).toMatchObject({name:'Già salvato',version:1});
 await page.getByRole('button',{name:'Carica ultima versione'}).click();
 const replace=page.getByRole('alertdialog',{name:'Sostituire la bozza'});
 await replace.getByRole('button',{name:'Annulla'}).click();
 await expect(name).toHaveValue('Non perdere');
 mock.defs[0]=saved({name:'Versione remota',version:4,status:'ACTIVE'});
 mock.conflictOn(false);
 await page.getByRole('button',{name:'Carica ultima versione'}).click();
 await replace.getByRole('button',{name:'Conferma caricamento'}).click();
 await expect(name).toHaveValue('Versione remota');
 await expect(page.getByRole('checkbox',{name:'Attivo'})).toBeChecked();
 await expect(page.getByRole('status')).toContainText('Versione 4 caricata');
 await expect(page.getByRole('button',{name:'Valida senza eseguire'})).toBeEnabled();
});

test('inputs and workflow selection stay locked until the save request ends',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','The mocked builder is exercised once on desktop Chromium.');
 const mock=await install(page);
 const name=page.getByRole('textbox',{name:'Nome workflow'});
 const picker=page.getByRole('combobox',{name:'Workflow salvato'});
 await picker.selectOption({label:'Già salvato · v1'});
 await name.fill('In attesa');
 mock.holdSave();
 await page.getByRole('button',{name:'Salva versione'}).click();
 await expect(name).toBeDisabled();
 await expect(picker).toBeDisabled();
 await expect(page.getByRole('checkbox',{name:'Attivo'})).toBeDisabled();
 await expect(page.getByRole('combobox',{name:'Lead da elaborare'})).toBeDisabled();
 await expect(page.getByLabel('Aggiungi nodo')).toBeDisabled();
 await expect(name).toHaveValue('In attesa');
 mock.releaseSave();
 await expect(page.getByRole('status')).toContainText('Versione 2 salvata');
 await expect(name).toBeEnabled();
 await expect(picker).toHaveValue('wf-saved');
 await expect(name).toHaveValue('In attesa');
});
