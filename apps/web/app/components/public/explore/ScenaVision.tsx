import {useId,useState} from 'react';
import {Visual} from '../Visual';
import {Stato,TiPuoServire} from '../../showcase';
import '../../showcase/showcase.css';

/** Vision scene: the manual control of the lab, no camera and no WebGL. The webcam and the gestures live in /explore/vision. */
export default function ScenaVision(){
 const id=useId(),[angolo,setAngolo]=useState(0);
 return <div className="sc-box sc-scena" data-scena="vision">
  <header className="sc-testa"><span className="eyebrow">Visione</span><Stato stato="OPERATIVA" nota="la rotazione a mano; la webcam resta nel laboratorio, dopo il tuo consenso"/></header>
  <div className="sc-oggetto" style={{transform:`perspective(700px) rotateY(${angolo}deg)`}} data-angolo={angolo}><Visual kind={5}/></div>
  <label className="sc-nota" htmlFor={id+'-rot'}>Rotazione manuale: {angolo}°</label>
  <input id={id+'-rot'} className="sc-range" type="range" min={0} max={120} step={1} value={angolo} onChange={e=>setAngolo(Number(e.target.value))}/>
  <TiPuoServire servizio="vision"/>
 </div>;
}
