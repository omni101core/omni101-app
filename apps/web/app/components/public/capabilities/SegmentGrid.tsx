import {useId,useState} from 'react';
import {Link} from 'react-router';
import type {Capability,Family} from '../../../content/capabilities';
import {BancoVoce,Binario,Vetrina} from '../../showcase';
import {availabilityLabel} from './panels';
import {segmentsFor,type Segment} from './segments';

/** The primitive of a segment's demo, mounted only when the visitor asks for it: no microphone, no network, no extra work
 * until then. Each primitive declares its own state (simulated or operational) and closes with its own links, so the card
 * switches its own closing line off. `formati` has no primitive here and stays a link to the Playground page. */
function Demo({segment}:{segment:Segment}){
 const {kind,scena,campo}=segment.demo;
 if(kind==='voce')return <BancoVoce segmento={scena==='locale'||scena==='bottega'?scena:'studio'} compatto chiusura={false}/>;
 if(kind==='binario')return <Binario nodi={3} segmento={scena} campo={campo} chiusura={false}/>;
 if(kind==='vetrina')return <Vetrina ritaglio chiusura={false}/>;
 return null;
}

function SegmentCard({segment,matched}:{segment:Segment;matched:Capability[]}){
 const [open,setOpen]=useState(false),panel=useId(),inline=segment.demo.kind!=='formati';
 return <li data-open={open}>
  <article className="cap-segment" data-segment={segment.id}>
   <h3>{segment.name}</h3>
   <p className="cap-segment-who">{segment.who}</p>
   <p className="cap-segment-problem"><small>Il problema</small>{segment.problem}</p>
   <p className="cap-segment-result"><small>Cosa cambia</small>{segment.result}</p>
   <ul className="cap-also" aria-label={'Soluzioni per '+segment.name}>{matched.map(c=><li key={c.id} data-availability={c.availability} title={availabilityLabel[c.availability]}>{c.title}</li>)}</ul>
   <div className="cap-segment-demo">
    <small>Una demo</small>
    <strong>{segment.demo.name}</strong>
    <p>{segment.demo.line}</p>
    <div className="cap-actions">
     {inline&&<button type="button" className="cap-demo-toggle" aria-expanded={open} aria-controls={panel} onClick={()=>setOpen(!open)}>{open?'Chiudi la demo':'Provala qui ↓'}</button>}
     <Link className="cap-link" to={segment.demo.to}>{inline?'A pagina intera ↗':'Provala ↗'}</Link>
    </div>
    {inline&&<div id={panel} className="cap-segment-live" hidden={!open}>{open&&<Demo segment={segment}/>}</div>}
   </div>
   <Link className="cap-link" to={'/start-project?brief='+encodeURIComponent(segment.brief)}>Raccontaci il tuo caso ↗</Link>
  </article>
 </li>;
}

/** "Per chi lo facciamo" on /solutions/:family: a still grid of the segments that buy from this family. One problem, one
 * demo per card. */
export default function SegmentGrid({family,name}:{family:Family;name:string}){
 const items=segmentsFor(family);
 if(!items.length)return null;
 return <section className="cap-segments" id="segmenti" aria-labelledby="segmenti-title">
  <div className="cap-segments-head">
   <span className="eyebrow">PER CHI / {name}</span>
   <h2 id="segmenti-title">Chi ne ha bisogno, e che cosa cambia.</h2>
   <p>Un problema per volta, con la demo che lo mostra. Ogni demo dichiara se è simulata o operativa.</p>
  </div>
  <ul className="cap-segment-grid">{items.map(({segment,matched})=><SegmentCard key={segment.id} segment={segment} matched={matched}/>)}</ul>
 </section>;
}
