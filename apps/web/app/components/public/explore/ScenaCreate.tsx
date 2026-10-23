import {useState} from 'react';
import {Visual} from '../Visual';
import {PrimaDopo,Stato,TiPuoServire} from '../../showcase';
import {aspettoDi,etichettaDi,formati,messaggi,type Formato} from '../../showcase/creativo';
import '../../showcase/showcase.css';

/** Create scene: the before/after (only when the own stills exist) and the three formats of the same message. */
export default function ScenaCreate(){
 const [formato,setFormato]=useState<Formato>('social'),[lingua,setLingua]=useState<'it'|'en'>('it');
 return <div className="sc-box sc-scena" data-scena="create">
  <header className="sc-testa"><span className="eyebrow">Create</span><Stato stato="SIMULATA" nota="visual in codice, nessun modello generativo"/></header>
  <div className="sc-chips" role="group" aria-label="Formato">{formati.map(f=><button type="button" key={f.id} aria-pressed={f.id===formato} onClick={()=>setFormato(f.id)}>{f.breve}</button>)}</div>
  <div className="sc-chips" role="group" aria-label="Lingua del messaggio">{(['it','en'] as const).map(l=><button type="button" key={l} aria-pressed={l===lingua} onClick={()=>setLingua(l)}>{l.toUpperCase()}</button>)}</div>
  <div className="sc-formato" data-formato={formato} style={{aspectRatio:aspettoDi(formato)}}><Visual kind={4}/><div className="sc-formato-testo"><span>{etichettaDi(formato)}</span><strong>{messaggi[lingua]}</strong></div></div>
  <PrimaDopo segmento="bottega" chiusura={false}/>
  <TiPuoServire servizio="create"/>
 </div>;
}
