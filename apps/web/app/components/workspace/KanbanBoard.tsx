import {useEffect,useRef,useState} from 'react';
import {Feedback} from './ProductUI';
import './KanbanBoard.css';

type Row=Record<string,unknown>;
type Extra={lostReason?:string};
type Fail={row:Row;status:string;message:string;extra?:Extra};
type Stage={status:string;count:number;valueCents:number;weightedCents:number};
const eur=(cents:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(cents/100);

// Stati lead documentati in docs/moduli/crm-workspace.md. Codici ignoti restano il codice.
const PHASE:Record<string,string>={
 NEW:'Nuovo',
 AI_TRIAGE:'Triage',
 QUALIFICATION:'Qualifica',
 DISCOVERY:'Scoperta',
 PROPOSAL_DRAFT:'Bozza proposta',
 PROPOSAL_SENT:'Proposta inviata',
 NEGOTIATION:'Trattativa',
 WON:'Vinto',
 LOST:'Perso',
 ON_HOLD:'In pausa',
};

function phaseLabel(status:string){return PHASE[status]||status.replaceAll('_',' ')}
function titleOf(row:Row){const name=String(row.name||row.title||'').trim();return name||'Senza titolo'}
function inColumn(row:Row,status:string){return String(row.status||'NEW')===status}

export default function KanbanBoard({records,statuses,canWrite,onMove,onOpen,summaryUrl}:{records:Row[];statuses:string[];canWrite:boolean;onMove:(row:Row,status:string,extra?:Extra)=>Promise<void>;onOpen:(row:Row)=>void;summaryUrl?:string}){
 // ponytail: Playwright dragTo = mouse only, no HTML5 dragstart — pointer path → onMove
 const dragId=useRef<string|null>(null),[over,setOver]=useState(''),[pending,setPending]=useState<string[]>([]),[fail,setFail]=useState<Fail|null>(null),[ask,setAsk]=useState<{row:Row;status:string}|null>(null),[reason,setReason]=useState(''),[said,setSaid]=useState(''),[stages,setStages]=useState<Record<string,Stage>>({});
 // Valore per fase dal preventivo collegato (o dalla stima), pesato per fase. Se l'endpoint non risponde il board resta valido, senza cifre.
 const sig=records.map(r=>r.id+':'+r.status+':'+r.updated_at).join('|');
 useEffect(()=>{if(!summaryUrl)return;let live=true;void fetch(summaryUrl).then(r=>r.ok?r.json():null).then((value:unknown)=>{const d=value as {stages?:Stage[]}|null;if(live&&d?.stages)setStages(Object.fromEntries(d.stages.map(s=>[s.status,s])))}).catch(()=>{});return()=>{live=false}},[summaryUrl,sig]);
 async function move(row:Row,status:string,extra?:Extra){
  const id=String(row.id);
  if(!canWrite||pending.includes(id)||inColumn(row,status))return;
  // Passare a «Perso» chiede sempre il motivo: lo impone anche il server.
  if(status==='LOST'&&!extra?.lostReason){setAsk({row,status});setReason('');dragId.current=null;setOver('');return}
  setPending(p=>[...p,id]);
  setFail(null);
  try{await onMove(row,status,extra);setSaid('Scheda «'+titleOf(row)+'» spostata in '+phaseLabel(status)+'.')}
  catch(error){const message=error instanceof Error&&error.message?error.message:'Spostamento non riuscito.';setFail({row,status,message,extra})}
  finally{setPending(p=>p.filter(x=>x!==id));dragId.current=null;setOver('')}
 }
 const columns=Array.from(new Set([...statuses,...records.map(r=>String(r.status||'NEW'))]));
 let next:Row|null=null;
 for(const status of columns){const hit=records.find(r=>inColumn(r,status));if(hit){next=hit;break}}
 const nextTitle=next?titleOf(next):'';
 const nextPhase=next?phaseLabel(String(next.status||'NEW')):'';
 return <div className="os-pipeline-board">
  {fail?<Feedback state="error" message={fail.message} onRetry={()=>void move(fail.row,fail.status,fail.extra)}/>:pending.length?<Feedback state="loading" message="Spostamento in corso."/>:records.length?null:<Feedback state="empty" message="Nessuna scheda in pipeline."/>}
  <p className="sr-only" role="status" aria-live="polite">{said}</p>
  {ask?<form className="os-lost-form" aria-label="Motivo della perdita" onKeyDown={e=>{if(e.key==='Escape')setAsk(null)}} onSubmit={e=>{e.preventDefault();const text=reason.trim();if(text.length<5)return;const a=ask;setAsk(null);void move(a.row,a.status,{lostReason:text})}}>
   <label>Perché «{titleOf(ask.row)}» è perso?<textarea autoFocus required minLength={5} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)} aria-describedby="os-lost-hint"/></label>
   <small id="os-lost-hint">Obbligatorio, da 5 a 500 caratteri. Resta nello storico della scheda.</small>
   <div><button type="submit" className="os-button" disabled={reason.trim().length<5}>Conferma perso</button> <button type="button" className="os-button secondary" onClick={()=>setAsk(null)}>Annulla</button></div>
  </form>:null}
  <header className="os-kanban-now">
   <p className="os-eyebrow">Da fare ora</p>
   <p className="os-kanban-next">{next?canWrite?'Apri «'+nextTitle+'», fase '+nextPhase+'. Poi «Sposta fase» o trascina la scheda.':'Apri «'+nextTitle+'», fase '+nextPhase+'. Spostamento non disponibile.':'Nessuna scheda in pipeline.'}</p>
   {next?<button type="button" className="os-button" onClick={()=>{if(next)onOpen(next)}}>{'Apri scheda '+nextTitle}</button>:null}
  </header>
  <div className="os-kanban" aria-label="Board degli stati" onMouseUp={()=>{dragId.current=null;setOver('')}}>{columns.map(status=>{
   const cards=records.filter(r=>inColumn(r,status));
   const shown=phaseLabel(status);
   return <section className={'os-kanban-column '+(over===status?'is-drop-target':'')} key={status} aria-label={status} onMouseEnter={()=>{dragId.current&&canWrite?setOver(status):null}} onMouseLeave={()=>setOver('')} onMouseUp={e=>{e.stopPropagation();const row=records.find(r=>String(r.id)===dragId.current);row?void move(row,status):(dragId.current=null,setOver(''))}}>
    <h3>{shown===status.replaceAll('_',' ')?shown:shown+' ('+status+')'} <span>{cards.length===1?'1 scheda':cards.length+' schede'}</span>{stages[status]&&status!=='LOST'?<small className="os-kanban-value">{eur(stages[status].valueCents)}{stages[status].weightedCents!==stages[status].valueCents?' · atteso '+eur(stages[status].weightedCents):''}</small>:null}</h3>
    {cards.length?null:<p className="os-kanban-empty">Nessuna scheda in questa fase.</p>}
    {cards.map(row=>{
     const id=String(row.id),title=titleOf(row),saving=pending.includes(id);
     return <article className={'os-kanban-card '+(saving?'is-saving':'')} key={id} tabIndex={0} aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight" aria-label={title+', fase '+phaseLabel(status)+'. Alt con le frecce sinistra e destra sposta la scheda.'} onKeyDown={e=>{if(!e.altKey||e.target!==e.currentTarget||(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'))return;const to=columns[columns.indexOf(status)+(e.key==='ArrowRight'?1:-1)];if(to){e.preventDefault();void move(row,to)}}} onMouseDown={e=>{if(!canWrite||saving)return;if((e.target as HTMLElement).closest('button,select,label,a,input,textarea'))return;dragId.current=id}}>
      <div className="os-card-body">
       <strong>{title}</strong>
       <p>{String(row.email||row.description||row.next_action||'Apri la scheda')}</p>
       <small>{String(row.priority||row.due_date||'')}</small>
       {status==='LOST'&&row.lost_reason?<small className="os-kanban-lost">Motivo: {String(row.lost_reason)}</small>:null}
       <button type="button" className="os-card-open" aria-label={'Apri scheda '+title} onClick={()=>onOpen(row)}>Apri scheda</button>
      </div>
      {canWrite?<label className="os-status-control" onMouseDown={e=>e.stopPropagation()}><span>{saving?'Salvataggio…':'Sposta fase'}</span><select aria-label={'Stato di '+title} value={String(row.status||'NEW')} disabled={saving} onChange={e=>void move(row,e.target.value)}>{columns.map(s=><option key={s} value={s}>{phaseLabel(s)}</option>)}</select></label>:<button type="button" className="os-button secondary" disabled>Sposta non disponibile</button>}
     </article>;
    })}
    <span className="os-drop-hint">{canWrite?'Trascina qui o usa «Sposta fase»':'Sola lettura. Sposta non disponibile.'}</span>
   </section>;
  })}</div>
 </div>;
}
