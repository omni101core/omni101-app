import {requireRole,type Env,type Identity} from './auth';
import {validateGraph,type WorkflowGraph} from './workflow-runtime';
// Stable IDs make preparation repeatable without overwriting a colleague's edits.
export const operatingTasks=[
 ['cloud-access','Sbloccare deploy CI Cloudflare','URGENT','Founder: confermare nuovo accesso CI. Token attuale limitato per IP e senza Workers Scripts. Non sostituire con OAuth.','security-reviewer'],
 ['dashboard-qa','Verificare centro operativo e pianificazione','HIGH','CI: permessi, isolamento organizzazioni, cicli, concorrenza, commenti e notifiche. Salvare ID run e prove.','qa-engineer'],
 ['portfolio','Completare casi settore e immagini originali','HIGH','B&B, ristorazione, professionisti. Etichettare concept, nessun cliente o risultato inventato.','creative-director'],
 ['collaborator','Verificare accesso del collaboratore Owner','HIGH','Founder e collaboratore completano passkey; verificare sessione e permessi. Non copiare inviti nei documenti.','project-manager'],
 ['staging','Verificare nuova revisione su preview','HIGH','Dopo accesso CI: migrazioni, deploy, health e smoke test. Annotare revisione effettiva.','qa-engineer'],
 ['production','Preparare rilascio produzione per approvazione','HIGH','Serve staging verde e conferma founder. Preparare rollback prima del rilascio.','project-manager'],
 ['growth','Collegare campagne e funnel a dati reali','NORMAL','Definire eventi e conversioni, UTM e fonti. Invii email solo dopo provider e autorizzazione.','marketing-specialist'],
 ['creative','Chiudere processo creativo e revisione','NORMAL','Brief, storyboard, varianti, feedback, approvazione e consegna. Provider media non configurati: nessuna generazione simulata come reale.','creative-director'],
 ['finance','Verificare registri e costi progetto','NORMAL','Confermare incassi, spese, ricorrenze e costi lavoro. Differenze parziali non equivalgono a utile fiscale.','project-manager'],
 ['portal','Provare portale cliente e feedback','NORMAL','QA accessi per cliente, consegne, ticket, approvazioni e allegati. Nessun dato di altri clienti.','qa-engineer'],
 ['storage','Definire archivio media e retention','NORMAL','Storage attuale assente. Nessun R2 o nuovo costo senza autorizzazione; definire limiti e conservazione.','solution-architect'],
 ['legal','Raccogliere dati legali verificati','HIGH','Founder: identità, P.IVA e testi confermati. Non inventare dati aziendali o termini.','project-manager'],
 ['accessibility','Verificare mobile, tastiera e motion ridotto','NORMAL','Controllare flussi pubblici e workspace, contrasto temi, focus, form, errori e prestazioni.','ux-designer'],
 ['recovery','Provare recupero errori workflow e agenti','NORMAL','Retry idempotente, cancellazione, approvazioni, limiti e costi. Nessuna attivazione automatica dal backlog.','backend-engineer'],
 ['handoff','Aggiornare prove e passaggio di consegne','NORMAL','Aggiornare docs/STATO.md, moduli e operativo/ripresa.md con revisione, limiti e prossima azione.','project-manager'],
] as const;
const links=[['staging','cloud-access'],['staging','dashboard-qa'],['production','staging'],['production','collaborator'],['handoff','dashboard-qa']] as const;
function draft(label:string,approval:string):WorkflowGraph{return validateGraph({nodes:[{id:'brief',type:'TRIGGER',position:{x:0,y:0},data:{label:'Brief lead verificato'}},{id:'review',type:'HUMAN_APPROVAL',position:{x:240,y:0},data:{label:approval}},{id:'task',type:'CREATE_TASK',position:{x:480,y:0},data:{label,value:'Bozza operativa da assegnare. Nessun invio esterno automatico.'}},{id:'end',type:'END',position:{x:720,y:0},data:{label:'Passaggio al responsabile'}}],edges:[{id:'a',source:'brief',target:'review'},{id:'b',source:'review',target:'task'},{id:'c',source:'task',target:'end'}]})}
export async function prepareOperatingBacklog(env:Env,actor:Identity){
 requireRole(actor,['OWNER']);const stamp=Date.now(),org=actor.orgId,prefix='operating:'+org+':',projectId=prefix+'project';
 const q=(sql:string,...values:(string|number)[])=>env.DB.prepare(sql).bind(...values);
 const writes=[q("INSERT OR IGNORE INTO projects(id,organization_id,name,description,status,visibility,created_at,updated_at) VALUES(?,?,? ,?,'PLANNING','TEAM',?,?)",projectId,org,'OMNI101 · Sviluppo piattaforma','Backlog interno reale. Nessuna scadenza promessa; assegnazioni da concordare.',stamp,stamp)];
 for(const [key,name,priority,description,agent]of operatingTasks)writes.push(q("INSERT OR IGNORE INTO tasks(id,organization_id,project_id,name,priority,description,status,kind,estimate_minutes,created_at,updated_at) VALUES(?,?,?,?,?,?,'TODO','WORK',0,?,?)",prefix+key,org,projectId,name,priority,description+'\nAgente suggerito: '+agent+'. Esecuzione solo con brief e revisione umana; non avviata.',stamp,stamp));
 // Only the initial preparation inserts dependencies. Repeating it preserves edits, including archived edges.
 for(const [child,parent]of links)writes.push(q('INSERT OR IGNORE INTO task_dependencies(task_id,depends_on_task_id,active) SELECT ?,?,1 WHERE NOT EXISTS(SELECT 1 FROM audit_logs WHERE organization_id=? AND action=?)',prefix+child,prefix+parent,org,'OPERATING_BACKLOG_PREPARED'));
 for(const [i,name]of ['Dashboard verificata','Preview pronta per revisione','Rilascio approvato'].entries())writes.push(q("INSERT OR IGNORE INTO milestones(id,organization_id,project_id,name,status,position,created_at,updated_at) VALUES(?,?,?,?,'PENDING',?,?,?)",prefix+'milestone-'+i,org,projectId,name,i,stamp,stamp));
 for(const [key,name,approval]of [['discovery','Discovery → revisione → attività','Confermare brief e perimetro'],['creative-review','Creatività → revisione → attività','Approvare direzione creativa'],['delivery-review','Consegna → revisione → attività','Confermare criteri di accettazione']]){
  const id=prefix+'workflow-'+key,graph=JSON.stringify(draft(name,approval));writes.push(q("INSERT OR IGNORE INTO workflow_definitions(id,organization_id,name,event_type,version,status,steps,created_at,updated_at) VALUES(?,?,?,'MANUAL',1,'DRAFT',?,?,?)",id,org,name,graph,stamp,stamp));
  writes.push(q('INSERT OR IGNORE INTO workflow_versions(id,organization_id,definition_id,version,graph,created_by,created_at) SELECT ?,?,?,1,?,?,? WHERE NOT EXISTS(SELECT 1 FROM workflow_versions WHERE definition_id=? AND version=1)',id+':v1',org,id,graph,actor.id,stamp,id));
 }
 writes.push(q("INSERT OR IGNORE INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) VALUES(?,?,?,'OPERATING_BACKLOG_PREPARED','projects',?,'{}',?,?)",prefix+'prepared',org,actor.id,projectId,stamp,stamp));
 await env.DB.batch(writes);
 return new Response(JSON.stringify({projectId,tasks:operatingTasks.length,workflowDrafts:3,milestones:3,executionsStarted:0}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
}
