import {Component,lazy,Suspense,useEffect,useRef,useState,type KeyboardEvent as ReactKeyboardEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import {Link} from 'react-router';
import type {GestureRecognizer,NormalizedLandmark} from '@mediapipe/tasks-vision';
import {useWebGLSlot} from '../public/webglSlot';
import {AREAS,areaIndex,COMMAND_SCORE,cursorFromHand,gestureLabel,isPinch,LOST_MS,PINCH_GAP_MS,stepArea,SWIPE_GAP_MS,SWIPE_MIN} from './hand';
import '../../styles/playground.css';

const ObjectStage=lazy(()=>import('./ObjectStage'));
const connections=[[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[0,17]];
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const MODEL='https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

class StageBoundary extends Component<{children:ReactNode;onFail:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){this.props.onFail()}
 render(){return this.state.failed?null:this.props.children}
}

export default function VisionLab(){
 const generation=useRef(0);
 const video=useRef<HTMLVideoElement>(null);
 const canvas=useRef<HTMLCanvasElement>(null);
 const stream=useRef<MediaStream|null>(null);
 const recognizer=useRef<GestureRecognizer|null>(null);
 const frame=useRef(0);
 const enabled=useRef(false);
 const paused=useRef(false);
 const sensitivity=useRef(1);
 const origin=useRef({x:.5,y:.5});
 const lastAction=useRef(0);
 const smooth=useRef({x:.5,y:.5});
 const pinching=useRef(false);
 const swipe=useRef({x:.5,t:0});
 const lostSince=useRef<number|null>(null);
 const drag=useRef<number|null>(null);
 const [status,setStatus]=useState('Videocamera spenta');
 const [active,setActive]=useState(false);
 const [isPaused,setIsPaused]=useState(false);
 const [loading,setLoading]=useState(false);
 const [confidence,setConfidence]=useState(0);
 const [gesture,setGesture]=useState('Nessun tracking');
 const [pointer,setPointer]=useState({x:.5,y:.5});
 const [selection,setSelection]=useState(0);
 const [rotation,setRotation]=useState(0);
 const [level,setLevel]=useState(1);
 const [originLabel,setOriginLabel]=useState({x:.5,y:.5});
 const [mounted,setMounted]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [glReady,setGlReady]=useState(false);
 const [glBlocked,setGlBlocked]=useState(false);
 const slot=useWebGLSlot('vision-lab',mounted&&!glBlocked);

 function release(){
  generation.current+=1;
  enabled.current=false;
  paused.current=false;
  cancelAnimationFrame(frame.current);
  stream.current?.getTracks().forEach(track=>track.stop());
  stream.current=null;
  try{recognizer.current?.close()}catch{/* already closed */}
  recognizer.current=null;
  canvas.current?.getContext('2d')?.clearRect(0,0,640,480);
 }
 function stop(){
  release();
  setLoading(false);
  setActive(false);
  setIsPaused(false);
  setStatus('Videocamera spenta');
  setGesture('Nessun tracking');
  setConfidence(0);
 }
 function pause(reason='In pausa: riprendi esplicitamente'){
  if(!enabled.current)return;
  paused.current=true;
  setIsPaused(true);
  setStatus(reason);
 }
 function resume(){
  if(!enabled.current)return;
  paused.current=false;
  lostSince.current=null;
  setIsPaused(false);
  setStatus('Elaborazione locale attiva');
 }
 function choose(index:number){
  if(enabled.current&&!paused.current)pause('Input fisico: i gesti sono in pausa');
  setSelection(index);
 }
 function nudge(direction:1|-1){
  if(enabled.current&&!paused.current)pause('Input fisico: i gesti sono in pausa');
  setSelection(current=>stepArea(current,direction));
 }

 useEffect(()=>{
  setMounted(true);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const apply=()=>setReduced(motion.matches);
  apply();
  motion.addEventListener('change',apply);
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')stop()};
  const onHide=()=>{if(document.hidden)pause()};
  window.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onHide);
  return()=>{release();motion.removeEventListener('change',apply);window.removeEventListener('keydown',onKey);document.removeEventListener('visibilitychange',onHide)};
 },[]);

 function drawHand(hand:NormalizedLandmark[]){
  const ctx=canvas.current?.getContext('2d');
  if(!ctx)return;
  ctx.clearRect(0,0,640,480);
  ctx.strokeStyle='#d2b77b';
  ctx.lineWidth=3;
  for(const line of connections){
   ctx.beginPath();
   line.forEach((index,point)=>{
    const landmark=hand[index];
    const x=(1-landmark.x)*640;
    const y=landmark.y*480;
    if(point===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   });
   ctx.stroke();
  }
  ctx.fillStyle='#f2eee6';
  for(const landmark of hand){
   ctx.beginPath();
   ctx.arc((1-landmark.x)*640,landmark.y*480,4,0,Math.PI*2);
   ctx.fill();
  }
 }

 async function start(){
  if(loading||active)return;
  const attempt=++generation.current;
  setLoading(true);
  setStatus('Caricamento del modello nel browser…');
  try{
   const {FilesetResolver,GestureRecognizer:Recognizer}=await import('@mediapipe/tasks-vision');
   const files=await FilesetResolver.forVisionTasks(WASM);
   const model=await Recognizer.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.65,minTrackingConfidence:.65});
   if(generation.current!==attempt){model.close();return}
   recognizer.current=model;
   const media=await navigator.mediaDevices.getUserMedia({audio:false,video:{width:{ideal:640},height:{ideal:480},facingMode:'user'}});
   if(generation.current!==attempt){media.getTracks().forEach(track=>track.stop());model.close();return}
   stream.current=media;
   const element=video.current;
   if(!element){stop();return}
   element.srcObject=media;
   await element.play();
   if(generation.current!==attempt){stop();return}
   enabled.current=true;
   paused.current=false;
   lostSince.current=null;
   setActive(true);
   setIsPaused(false);
   setStatus('Elaborazione locale attiva');
   let last=0;
   const loop=(time:number)=>{
    if(!enabled.current)return;
    frame.current=requestAnimationFrame(loop);
    if(paused.current||time-last<65||!video.current||!recognizer.current||video.current.readyState<2)return;
    last=time;
    try{
     const result=recognizer.current.recognizeForVideo(video.current,time);
     const hand=result.landmarks[0];
     if(!hand||hand.length<21){
      pinching.current=false;
      canvas.current?.getContext('2d')?.clearRect(0,0,640,480);
      if(lostSince.current==null)lostSince.current=time;
      setGesture('Tracking perso — nessun comando');
      setConfidence(0);
      if(time-lostSince.current>=LOST_MS)pause('Timeout: tracking perso. Nessun comando. Riprendi esplicitamente.');
      else setStatus('Tracking perso: comandi sospesi');
      return;
     }
     lostSince.current=null;
     drawHand(hand);
     const recognized=result.gestures[0]?.[0];
     const score=recognized?.score??0;
     const handScore=result.handedness[0]?.[0]?.score??0;
     const name=recognized?.categoryName||'None';
     setConfidence(Math.round(Math.max(score,handScore)*100));
     setGesture(gestureLabel(name));
     const target=cursorFromHand(hand,origin.current.x,origin.current.y,sensitivity.current);
     smooth.current={x:smooth.current.x*.65+target.x*.35,y:smooth.current.y*.65+target.y*.35};
     setPointer({x:smooth.current.x,y:smooth.current.y});
     const pinch=isPinch(hand);
     if(pinch&&!pinching.current&&time-lastAction.current>PINCH_GAP_MS){
      setSelection(areaIndex(smooth.current.x));
      lastAction.current=time;
      setStatus('Pinch: elemento selezionato nel laboratorio');
     }
     pinching.current=pinch;
     if(!pinch&&name==='Closed_Fist'&&score>=COMMAND_SCORE){
      setRotation(Math.max(-120,Math.min(120,(smooth.current.x-.5)*240)));
      setStatus('Pugno: rotazione dell’oggetto nel laboratorio');
     }else if(!pinch&&name==='Open_Palm'&&score>=COMMAND_SCORE){
      if(time-swipe.current.t>280){
       const delta=smooth.current.x-swipe.current.x;
       if(Math.abs(delta)>SWIPE_MIN/sensitivity.current&&time-lastAction.current>SWIPE_GAP_MS){
        setSelection(current=>stepArea(current,delta>0?1:-1));
        lastAction.current=time;
        setStatus('Swipe: carosello aggiornato nel laboratorio');
       }
       swipe.current={x:smooth.current.x,t:time};
      }
     }else swipe.current={x:smooth.current.x,t:time};
    }catch{pause('Tracking interrotto. Puoi fermare e riavviare la videocamera.')}
   };
   frame.current=requestAnimationFrame(loop);
  }catch(error){
   stop();
   setStatus(error instanceof DOMException&&error.name==='NotAllowedError'?'Permesso videocamera negato. Usa i controlli manuali.':'Modello o videocamera non disponibili. Usa i controlli manuali.');
  }finally{setLoading(false)}
 }

 function onStageMove(event:ReactPointerEvent<HTMLDivElement>){
  if(enabled.current&&!paused.current)return;
  const rect=event.currentTarget.getBoundingClientRect();
  const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
  const y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
  smooth.current={x,y};
  setPointer({x,y});
 }
 function onStageDown(event:ReactPointerEvent<HTMLDivElement>){
  if((event.target as HTMLElement).closest('button'))return;
  if(enabled.current&&!paused.current){pause('Input fisico: i gesti sono in pausa');return}
  const rect=event.currentTarget.getBoundingClientRect();
  choose(areaIndex((event.clientX-rect.left)/rect.width));
  drag.current=event.clientX;
 }
 function onStageUp(event:ReactPointerEvent<HTMLDivElement>){
  if(drag.current==null)return;
  const delta=event.clientX-drag.current;
  drag.current=null;
  if(Math.abs(delta)>56)nudge(delta>0?1:-1);
 }
 function onCarouselKey(event:ReactKeyboardEvent<HTMLDivElement>){
  if(event.key==='ArrowRight'){event.preventDefault();nudge(1)}
  if(event.key==='ArrowLeft'){event.preventDefault();nudge(-1)}
 }

 return <section className="section vision-lab" data-reduced={reduced?'true':'false'}>
  <div>
   <span className="eyebrow">VISION LAB / ELABORAZIONE SUL DISPOSITIVO</span>
   <h1>Le mani diventano interfaccia.</h1>
   <p>La videocamera, se la avvii, riconosce una mano e controlla soltanto questo laboratorio. Nessuna immagine viene registrata o inviata a OMNI101. All’avvio il browser scarica il runtime da jsDelivr e il modello dei gesti da Google: sono i file del modello, non i fotogrammi. I gesti non controllano il computer.</p>
   <div className="vision-controls">
    <button type="button" className="button button-gold" onClick={()=>void start()} disabled={loading||active}>{loading?'Caricamento…':'Avvia videocamera'}</button>
    <button type="button" className="button" disabled={!active} onClick={()=>{if(isPaused)resume();else pause()}}>{isPaused?'Riprendi':'Pausa'}</button>
    <button type="button" className="button" disabled={!active&&!loading} onClick={stop}>Stop / Esc</button>
   </div>
   <p role="status" aria-live="polite">{status}</p>
   <p className="vision-meters">Gesto: {gesture}. Confidence {confidence}%. Calibrazione {originLabel.x.toFixed(2)}, {originLabel.y.toFixed(2)}. Sensibilità {level.toFixed(1)}. I comandi discreti partono sopra il 75% e hanno un intervallo di sicurezza.</p>
  </div>
  <div className="vision-grid">
   <div className="vision-camera">
    <video ref={video} muted playsInline aria-label="Anteprima locale della videocamera"/>
    <canvas ref={canvas} width={640} height={480} aria-hidden="true"/>
    {!active&&<span>Videocamera spenta — avvio solo con il tuo consenso</span>}
   </div>
   <div className="vision-stage" onPointerMove={onStageMove} onPointerDown={onStageDown} onPointerUp={onStageUp}>
    <div className={glReady?'vision-object is-backed':'vision-object'} style={{transform:`rotateY(${rotation}deg)`}} aria-hidden="true">OMNI<br/>PORTAL</div>
    {mounted&&slot&&!glBlocked&&<StageBoundary onFail={()=>{setGlBlocked(true);setGlReady(false)}}><Suspense fallback={null}><ObjectStage rotation={rotation} reduced={reduced} onReady={()=>setGlReady(true)}/></Suspense></StageBoundary>}
    <div className="vision-pointer" aria-hidden="true" style={{left:pointer.x*100+'%',top:pointer.y*100+'%'}}/>
    <div className="vision-options" role="group" aria-label="Carosello possibilità" onKeyDown={onCarouselKey}>{AREAS.map((label,index)=><button type="button" key={label} className={selection===index?'selected':''} onClick={()=>choose(index)} aria-pressed={selection===index}>{label}</button>)}</div>
   </div>
  </div>
  <div className="vision-grid">
   <div>
    <h2>Gesti e controlli</h2>
    <p>Indice: cursore interno. Pinch: seleziona una delle tre aree. Palmo aperto e swipe: carosello avanti o indietro. Pugno: ruota l’oggetto. Pollice, vittoria e gli altri gesti non fanno nulla. Se la mano sparisce per più di un secondo e mezzo, i comandi si fermano. Mouse, trascinamento e tastiera fanno le stesse cose.</p>
    <label>Sensibilità <input type="range" min="0.5" max="2" step="0.1" value={level} onChange={event=>{const next=Number(event.target.value);setLevel(next);sensitivity.current=next}}/></label>
    <button type="button" className="button" onClick={()=>{origin.current={x:.5,y:.5};smooth.current={x:.5,y:.5};swipe.current={x:.5,t:performance.now()};lastAction.current=performance.now();setOriginLabel({x:.5,y:.5});setPointer({x:.5,y:.5});setRotation(0);setStatus(active?'Centro ricalibrato; allinea la mano al centro dell’inquadratura':'Centro ricalibrato. La videocamera è spenta.')}}>Ricalibra al centro</button>
   </div>
   <div>
    <h2>Funziona anche senza webcam.</h2>
    <label>Rotazione manuale <input type="range" min="-120" max="120" value={rotation} onChange={event=>{if(enabled.current&&!paused.current)pause('Input fisico: i gesti sono in pausa');setRotation(Number(event.target.value))}}/></label>
    <div className="vision-controls">
     <button type="button" className="button" onClick={()=>nudge(-1)}>Possibilità precedente</button>
     <button type="button" className="button" onClick={()=>nudge(1)}>Prossima possibilità</button>
    </div>
    <p>Frecce sinistra e destra sul carosello, clic o trascinamento sul riquadro. Questa demo non controlla il Mac e non installa software.</p>
    <p><Link className="text-link" to="/explore/voice">Prova la demo vocale ↗</Link></p>
   </div>
  </div>
 </section>;
}
