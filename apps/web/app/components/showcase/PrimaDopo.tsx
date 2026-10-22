import {useId,useState,type CSSProperties} from 'react';
import {coppiaMedia,type Immagine,type Segmento,type StatoDemo} from './logica';
import {Stato} from './Stato';
import {TiPuoServire} from './TiPuoServire';
import './showcase.css';

/** Before/after with a handle. Two own stills from `content/media.ts`; without them the component does not mount (no empty rectangle).
 * The handle is a native range input: keyboard, pointer and touch come with it. */
export function PrimaDopo({segmento,prima,dopo,didascalia='Concept dello studio. Non è una foto del tuo prodotto.',stato='SIMULATA',chiusura=true}:{segmento?:Segmento;prima?:Immagine;dopo?:Immagine;didascalia?:string;stato?:StatoDemo;chiusura?:boolean}){
 const id=useId(),[pos,setPos]=useState(50),coppia=coppiaMedia(segmento,prima,dopo);
 if(!coppia)return null;
 return <figure className="sc-box sc-pd" data-showcase="prima-dopo" style={{'--pos':pos+'%'} as CSSProperties}>
  <header className="sc-testa"><span className="eyebrow">Prima / dopo</span><Stato stato={stato} nota="immagini di concept, nessun modello generativo"/></header>
  <div className="sc-pd-quadro" style={{aspectRatio:`${coppia.prima.w} / ${coppia.prima.h}`}}>
   <img src={coppia.prima.src} alt={coppia.prima.alt} width={coppia.prima.w} height={coppia.prima.h} loading="lazy" decoding="async"/>
   <img className="sc-pd-dopo" src={coppia.dopo.src} alt={coppia.dopo.alt} width={coppia.dopo.w} height={coppia.dopo.h} loading="lazy" decoding="async"/>
   <i className="sc-pd-maniglia" aria-hidden="true"/>
   <input type="range" min={0} max={100} step={1} value={pos} onChange={e=>setPos(Number(e.target.value))} aria-label="Confronto prima e dopo" aria-describedby={id+'-didascalia'} aria-valuetext={pos+'% dopo'}/>
  </div>
  <figcaption id={id+'-didascalia'} className="sc-nota">{didascalia}</figcaption>
  {chiusura&&<TiPuoServire servizio="create" segmento={segmento}/>}
 </figure>;
}
