import {useRef,useState} from 'react';
import {Feedback} from './ProductUI';

type Row=Record<string,unknown>;
type Fail={row:Row;status:string;message:string};

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

export default function KanbanBoard({records,statuses,canWrite,onMove,onOpen}:{records:Row[];statuses:string[];canWrite:boolean;onMove:(row:Row,status:string)=>Promise<void>;onOpen:(row:Row)=>void}){
 // ponytail: Playwright dragTo = mouse only, no HTML5 dragstart — pointer path → onMove
 const dragId=useRef<string|null>(null),[over,setOver]=useState(''),[pending,setPending]=useState<string[]>([]),[fail,setFail]=useState<Fail|null>(null);
 async function move(row:Row,status:string){
  const id=String(row.id);
  if(!canWrite||pending.includes(id)||inColumn(row,status))return;
  setPending(p=>[...p,id]);
  setFail(null);
  try{await onMove(row,status)}
  catch(error){const message=error instanceof Error&&error.message?error.message:'Spostamento non riuscito.';setFail({row,status,message})}
  finally{setPending(p=>p.filter(x=>x!==id));dragId.current=null;setOver('')}
 }
 const columns=Array.from(new Set([...statuses,...records.map(r=>String(r.status||'NEW'))]));
 let next:Row|null=null;
 for(const status of columns){const hit=records.find(r=>inColumn(r,status));if(hit){next=hit;break}}
 const nextTitle=next?titleOf(next):'';
 const nextPhase=next?phaseLabel(String(next.status||'NEW')):'';
 return <div className="os-pipeline-board">
  {fail?<Feedback state="error" message={fail.message} onRetry={()=>void move(fail.row,fail.status)}/>:pending.length?<Feedback state="loading" message="Spostamento in corso."/>:records.length?null:<Feedback state="empty" message="Nessuna scheda in pipeline."/>}
  <header className="os-kanban-now">
   <p className="os-eyebrow">Da fare ora</p>
   <p className="os-kanban-next">{next?canWrite?'Apri «'+nextTitle+'», fase '+nextPhase+'. Poi «Sposta fase» o trascina la scheda.':'Apri «'+nextTitle+'», fase '+nextPhase+'. Spostamento non disponibile.':'Nessuna scheda in pipeline.'}</p>
   {next?<button type="button" className="os-button" onClick={()=>{if(next)onOpen(next)}}>{'Apri scheda '+nextTitle}</button>:null}
  </header>
  <div className="os-kanban" aria-label="Board degli stati" onMouseUp={()=>{dragId.current=null;setOver('')}}>{columns.map(status=>{
   const cards=records.filter(r=>inColumn(r,status));
   const shown=phaseLabel(status);
   return <section className={'os-kanban-column '+(over===status?'is-drop-target':'')} key={status} aria-label={status} onMouseEnter={()=>{dragId.current&&canWrite?setOver(status):null}} onMouseLeave={()=>setOver('')} onMouseUp={e=>{e.stopPropagation();const row=records.find(r=>String(r.id)===dragId.current);row?void move(row,status):(dragId.current=null,setOver(''))}}>
    <h3>{shown===status.replaceAll('_',' ')?shown:shown+' ('+status+')'} <span>{cards.length===1?'1 scheda':cards.length+' schede'}</span></h3>
    {cards.length?null:<p className="os-kanban-empty">Nessuna scheda in questa fase.</p>}
    {cards.map(row=>{
     const id=String(row.id),title=titleOf(row),saving=pending.includes(id);
     return <article className={'os-kanban-card '+(saving?'is-saving':'')} key={id} onMouseDown={e=>{if(!canWrite||saving)return;if((e.target as HTMLElement).closest('button,select,label,a,input,textarea'))return;dragId.current=id}}>
      <div className="os-card-body">
       <strong>{title}</strong>
       <p>{String(row.email||row.description||row.next_action||'Apri la scheda')}</p>
       <small>{String(row.priority||row.due_date||'')}</small>
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
