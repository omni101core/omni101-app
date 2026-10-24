import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router';

type Metrics={openTasks:number;blockedTasks:number;openTasksWithDueDate:number;overdueTasks:number|null;pendingApprovals:number;activeProjects:number;activeProjectsWithoutOpenTasks:number|null;failedWorkflowRuns:number};
type Result={tool:string;ruleVersion:string;measuredAt:string;today:string;timeZone:string;metrics:Metrics;recommendations:{rule:string;priority:string;value:number;action:string}[];attention:number;sources:string[]};
type Saved={runId:string;artifactId:string;replay:boolean;result:Result};
const metricLabels:Record<keyof Metrics,string>={openTasks:'Attività aperte',blockedTasks:'Attività bloccate',openTasksWithDueDate:'Attività aperte con scadenza',overdueTasks:'Attività scadute',pendingApprovals:'Approvazioni in attesa',activeProjects:'Progetti attivi',activeProjectsWithoutOpenTasks:'Progetti attivi senza attività aperte',failedWorkflowRuns:'Workflow falliti'};
const priorities:Record<string,string>={HIGH:'Alta',MEDIUM:'Media',LOW:'Bassa'};
function measuredAt(value:string){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('it-IT',{timeZone:'Europe/Rome',dateStyle:'medium',timeStyle:'medium'}).format(date):'Data non disponibile'}

export default function OperationsCheckup(){
 const [saved,setSaved]=useState<Saved|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const requestKey=useRef<string|null>(null),controller=useRef<AbortController|null>(null),active=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false;controller.current?.abort();controller.current=null}},[]);
 async function execute(){
  if(controller.current)return;
  const attempt=new AbortController();controller.current=attempt;
  requestKey.current??=crypto.randomUUID();
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/operations/checkup',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestKey:requestKey.current}),signal:attempt.signal});
   const body=await response.json() as Saved&{error?:string};
   if(!response.ok)throw new Error(body.error||'Checkup non completato. Riprova con la stessa richiesta.');
   if(!active.current||controller.current!==attempt)return;
   setSaved(body);requestKey.current=null;
  }catch(e){
   if(active.current&&controller.current===attempt&&!attempt.signal.aborted)setError((e as Error).message||'Checkup non completato.');
  }finally{
   if(active.current&&controller.current===attempt){controller.current=null;setBusy(false)}
  }
 }
 return <section className="os-panel" aria-label="Checkup operativo">
  <h3>Checkup operativo</h3>
  <p>Conta attività, approvazioni, progetti e workflow del workspace e applica regole dichiarate. Nessuna richiesta AI, correzione automatica o notifica. La verifica registra un’esecuzione e un risultato consultabile.</p>
  <button type="button" className="os-button" disabled={busy} onClick={()=>void execute()}>{busy?'Verifica in corso…':error?'Riprova checkup':saved?'Nuova verifica':'Esegui checkup'}</button>
  {busy?<p role="status">Checkup in corso. Attendi il risultato.</p>:null}
  {error?<p role="alert">{error} Il pulsante Riprova checkup riutilizza la stessa chiave di richiesta.</p>:null}
  {saved?<div>
   <p className="os-hint">{busy||error?'Ultimo risultato valido precedente a questo tentativo. ':'Risultato registrato. '}{saved.replay?'Recuperato dalla richiesta già completata. ':''}Misurato il <time dateTime={saved.result.measuredAt}>{measuredAt(saved.result.measuredAt)}</time> · Europe/Rome.</p>
   <p className="os-hint">Regole: {saved.result.ruleVersion} · Giorno della misura: {saved.result.today}. Il risultato non si aggiorna automaticamente.</p>
   <dl className="os-metrics">{(Object.keys(metricLabels) as (keyof Metrics)[]).map(key=><div className="os-metric" key={key}><dt>{metricLabels[key]}</dt><dd>{saved.result.metrics[key]===null?'Non misurabile':saved.result.metrics[key]}</dd></div>)}</dl>
   <h4>Azioni suggerite dalle regole</h4>
   {saved.result.recommendations.length?<ul>{saved.result.recommendations.map(item=><li key={item.rule}><strong>Priorità {priorities[item.priority]||item.priority}: </strong>{item.action}</li>)}</ul>:<p>Nessuna regola richiede un’azione sui conteggi misurati.</p>}
   <p><Link to="/admin/agent-runs">Apri elenco Mission Control</Link> · Esecuzione {saved.runId}</p>
   <div className="os-inline-actions"><a href={'/api/agent-runs/'+encodeURIComponent(saved.runId)} target="_blank" rel="noopener noreferrer">Apri esecuzione JSON</a><a href={'/api/artifacts/'+encodeURIComponent(saved.artifactId)} target="_blank" rel="noopener noreferrer">Apri risultato JSON</a></div>
   <p className="os-hint">I link JSON aprono i dati registrati con i permessi del tuo account.</p>
  </div>:<p className="os-hint">Nessuna misura eseguita da questa schermata. Avvia il checkup per ottenere conteggi reali.</p>}
 </section>;
}
