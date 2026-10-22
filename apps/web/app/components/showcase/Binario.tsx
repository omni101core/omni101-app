import {useEffect,useId,useState} from 'react';
import {Link} from 'react-router';
import {briefLink,nodiVisibili,passiBinario,richiestaIniziale,type SegmentoOGenerico,type StatoDemo} from './logica';
import {Stato} from './Stato';
import {TiPuoServire} from './TiPuoServire';
import './showcase.css';

/** Graph of N nodes that light in sequence: request -> steps -> human review. `campo` shows the textarea of the workflow demo.
 * The visitor's text stays in the browser; the only way it reaches the brief is the explicit link below the log. */
export function Binario({nodi=6,segmento='generico',campo=false,stato='SIMULATA',chiusura=true}:{nodi?:3|6;segmento?:SegmentoOGenerico;campo?:boolean;stato?:StatoDemo;chiusura?:boolean}){
 const id=useId(),[testo,setTesto]=useState(richiestaIniziale(segmento)),[passo,setPasso]=useState(-1),[acceso,setAcceso]=useState(false),[ridotto,setRidotto]=useState(false);
 const passi=nodiVisibili(passiBinario(segmento,testo),nodi),ultimo=passi.length-1;
 useEffect(()=>{
  const m=matchMedia('(prefers-reduced-motion: reduce)'),applica=()=>{setRidotto(m.matches);if(m.matches)setPasso(ultimo)};
  applica();m.addEventListener('change',applica);return()=>m.removeEventListener('change',applica);
 },[ultimo]);
 useEffect(()=>{
  if(!acceso)return;
  if(passo>=ultimo){setAcceso(false);return}
  const t=setTimeout(()=>setPasso(p=>p+1),650);
  return()=>clearTimeout(t);
 },[acceso,passo,ultimo]);
 function avvia(){if(ridotto){setPasso(ultimo);return}setPasso(-1);setAcceso(true)}
 return <div className="demo-surface sc-box sc-binario" data-showcase="binario" data-nodi={nodi} data-passo={passo} data-acceso={acceso}>
  <header className="sc-testa"><span className="eyebrow">Binario</span><Stato stato={stato} nota="il testo resta nel browser, nessun modello, nessun CRM"/></header>
  {campo&&<><label className="eyebrow" htmlFor={id+'-richiesta'}>LA RICHIESTA DA ESPLORARE</label><textarea id={id+'-richiesta'} className="form-input workflow-input" value={testo} maxLength={1500} onChange={e=>setTesto(e.target.value)}/></>}
  <button className="button" disabled={acceso||testo.trim().length<10} onClick={avvia}>{acceso?'Simulazione in corso…':'Avvia simulazione →'}</button>
  <ol className="sc-grafo" aria-hidden="true">{passi.map((p,i)=><li key={p.titolo} data-acceso={passo>=i}><span>{String(i+1).padStart(2,'0')}</span><em>{p.titolo}</em></li>)}</ol>
  <div className="timeline" role="log" aria-live="polite">{passi.map((p,i)=><div key={p.titolo} className={'timeline-item '+(passo>=i?'complete':'')}><strong>0{i+1} / {p.titolo}</strong><p>{passo>=i?p.testo:'In attesa del passaggio precedente.'}</p></div>)}</div>
  {campo&&testo.trim().length>=10&&<p><Link className="text-link" to={briefLink(testo)}>Usa la mia frase come brief ↗</Link></p>}
  {chiusura&&<TiPuoServire servizio="binario" segmento={segmento==='generico'?undefined:segmento}/>}
 </div>;
}
