import {useEffect,useId,useRef,useState} from 'react';
import {battute,decadimento,durataStimataMs,nomeSegmento,sagoma,segmenti,type Lingua,type Segmento,type StatoDemo} from './logica';
import {Stato} from './Stato';
import {TiPuoServire} from './TiPuoServire';
import './showcase.css';

type Fase='fermo'|'campanello'|'voce'|'solo-testo'|'finito';
const BARRE=48,LARGHEZZA=640,ALTEZZA=96;
const codice:Record<Lingua,string>={it:'it-IT',en:'en-GB'};
const messaggioFase:Record<Fase,string>={
 fermo:'Premi Ascolta. Il microfono non serve.',
 campanello:'Segnale di avvio: la forma d’onda qui è letta dall’audio vero.',
 voce:'La voce è quella del tuo browser. Qui si vede l’inviluppo delle parole in uscita.',
 'solo-testo':'Questo browser non ha una voce per la lingua scelta: resta il testo.',
 finito:'Finito. Puoi cambiare scena o lingua e riascoltare.',
};
type ContestoAudio=typeof AudioContext;

/** Voice bench. Web Speech speaks the line; the browser does not expose the audio of its own voice, so the waveform shows
 * (a) the real AnalyserNode signal of a short start tone and (b) the envelope of the words as they are spoken. Stated on the page. */
export function BancoVoce({segmento='studio',lingua:linguaIniziale='it',compatto=false,stato='OPERATIVA',chiusura=true}:{segmento?:Segmento;lingua?:Lingua;compatto?:boolean;stato?:StatoDemo;chiusura?:boolean}){
 const id=useId();
 const [scena,setScena]=useState<Segmento>(segmento),[lingua,setLingua]=useState<Lingua>(linguaIniziale),[fase,setFase]=useState<Fase>('fermo'),[ridotto,setRidotto]=useState(false),[parola,setParola]=useState(-1),[picco,setPicco]=useState(0);
 const onda=useRef<SVGPathElement>(null),ctx=useRef<AudioContext|null>(null),analisi=useRef<AnalyserNode|null>(null),raf=useRef(0),timer=useRef<number[]>([]);
 const livello=useRef(0),storia=useRef<number[]>(Array.from({length:BARRE},()=>0)),faseRef=useRef<Fase>('fermo'),piccoRef=useRef(0);
 const testo=battute[scena][lingua],parole=testo.split(/\s+/);

 const imposta=(f:Fase)=>{faseRef.current=f;setFase(f)};
 const pulisci=()=>{
  timer.current.forEach(t=>window.clearTimeout(t));timer.current=[];
  cancelAnimationFrame(raf.current);raf.current=0;
  window.speechSynthesis?.cancel();
 };

 function disegna(barre:number[],segnale?:Uint8Array){
  const tratto=onda.current;if(!tratto)return;
  if(segnale){
   tratto.setAttribute('stroke-width','2');
   tratto.setAttribute('d',Array.from(segnale,(v,i)=>(i?'L':'M')+(i/(segnale.length-1)*LARGHEZZA).toFixed(1)+' '+(ALTEZZA/2+(v-128)/128*(ALTEZZA/2-6)).toFixed(1)).join(''));
   return;
  }
  const w=LARGHEZZA/barre.length;
  tratto.setAttribute('stroke-width',(w*.6).toFixed(1));
  tratto.setAttribute('d',barre.map((b,i)=>{const mezza=Math.max(1.5,b*(ALTEZZA-8)/2),x=(i*w+w/2).toFixed(1);return `M${x} ${(ALTEZZA/2-mezza).toFixed(1)}V${(ALTEZZA/2+mezza).toFixed(1)}`}).join(''));
 }

 useEffect(()=>{
  const movimento=matchMedia('(prefers-reduced-motion: reduce)'),aggiorna=()=>setRidotto(movimento.matches);
  aggiorna();movimento.addEventListener('change',aggiorna);
  return()=>{movimento.removeEventListener('change',aggiorna);pulisci();void ctx.current?.close();ctx.current=null};
 },[]);
 // Idle and final states: nothing moves. With reduced motion the scene is already in its final state (the envelope of the line).
 useEffect(()=>{if(fase==='fermo'&&!ridotto)disegna(Array.from({length:BARRE},()=>0.04));else disegna(sagoma(testo,BARRE))},[fase,ridotto,testo]);
 useEffect(()=>{pulisci();imposta('fermo');setParola(-1)},[scena,lingua]);

 function ciclo(ultimo:number){
  const adesso=performance.now(),dt=adesso-ultimo;
  if(faseRef.current==='campanello'&&analisi.current){
   const dati=new Uint8Array(analisi.current.fftSize);analisi.current.getByteTimeDomainData(dati);
   const ampiezza=dati.reduce((m,v)=>Math.max(m,Math.abs(v-128)),0)/128*100;
   if(ampiezza>piccoRef.current){piccoRef.current=ampiezza;setPicco(Math.round(ampiezza))}
   disegna([],dati);
  }else if(faseRef.current==='voce'){
   livello.current=decadimento(livello.current,dt);
   storia.current=[...storia.current.slice(1),livello.current];
   disegna(storia.current);
  }
  raf.current=requestAnimationFrame(()=>ciclo(adesso));
 }

 function suona(){
  const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext?:ContestoAudio}).webkitAudioContext;
  if(!Ctor)return 0;
  const audio=ctx.current??new Ctor();ctx.current=audio;void audio.resume();
  const an=audio.createAnalyser();an.fftSize=1024;an.connect(audio.destination);analisi.current=an;
  const guadagno=audio.createGain(),t=audio.currentTime;
  guadagno.gain.setValueAtTime(0.0001,t);guadagno.gain.exponentialRampToValueAtTime(0.08,t+0.04);guadagno.gain.exponentialRampToValueAtTime(0.0001,t+0.42);
  guadagno.connect(an);
  [660,880].forEach((f,i)=>{const o=audio.createOscillator();o.frequency.value=f;o.connect(guadagno);o.start(t+i*0.14);o.stop(t+0.45)});
  return 450;
 }

 function parla(){
  const sintesi=window.speechSynthesis;
  const voci=sintesi?sintesi.getVoices().filter(v=>v.lang.toLowerCase().startsWith(lingua)):[];
  if(!sintesi||!voci.length){cancelAnimationFrame(raf.current);raf.current=0;imposta('solo-testo');setParola(parole.length);return}
  const frase=new SpeechSynthesisUtterance(testo);
  frase.lang=codice[lingua];frase.voice=voci[0]??null;
  let partita=false;
  frase.onstart=()=>{partita=true;imposta('voce')};
  frase.onboundary=e=>{
   const prima=testo.slice(0,e.charIndex).split(/\s+/).filter(Boolean).length;setParola(prima);
   const lunga=testo.slice(e.charIndex).split(/\s+/)[0]?.replace(/[^\p{L}\p{N}]/gu,'').length??0;
   livello.current=Math.min(1,0.15+lunga/9*0.85);
  };
  const fine=()=>{imposta('finito');setParola(parole.length);cancelAnimationFrame(raf.current);raf.current=0};
  frase.onend=fine;frase.onerror=fine;
  timer.current.push(window.setTimeout(()=>{if(!partita){sintesi.cancel();cancelAnimationFrame(raf.current);raf.current=0;imposta('solo-testo');setParola(parole.length)}},2500));
  timer.current.push(window.setTimeout(()=>{if(faseRef.current==='voce'){sintesi.cancel();fine()}},durataStimataMs(testo)+4000));
  sintesi.cancel();sintesi.speak(frase);
 }

 function ascolta(){
  pulisci();piccoRef.current=0;setPicco(0);setParola(0);storia.current=Array.from({length:BARRE},()=>0);livello.current=0;
  const attesa=suona();
  imposta('campanello');
  if(!ridotto)raf.current=requestAnimationFrame(()=>ciclo(performance.now()));
  timer.current.push(window.setTimeout(parla,attesa));
 }
 function ferma(){pulisci();imposta('fermo');setParola(-1)}

 const inCorso=fase==='campanello'||fase==='voce';
 return <section className="sc-box sc-voce" data-showcase="banco-voce" data-compatto={compatto} data-fase={fase} data-scena={scena} data-lingua={lingua} data-picco={picco}>
  <header className="sc-testa"><span className="eyebrow">Banco voce</span><Stato stato={stato} nota="la voce è del browser, la richiesta è simulata"/></header>
  <div className="sc-azioni"><button type="button" className="button button-gold" aria-describedby={id+'-stato'} onClick={inCorso?ferma:ascolta}>{inCorso?'Ferma':'Ascolta'}</button></div>
  <div className="sc-chips" role="group" aria-label="Scena">{segmenti.map(s=><button type="button" key={s} aria-pressed={s===scena} onClick={()=>setScena(s)}>{nomeSegmento[s]}</button>)}</div>
  <div className="sc-chips" role="group" aria-label="Lingua">{(['it','en'] as Lingua[]).map(l=><button type="button" key={l} aria-pressed={l===lingua} onClick={()=>setLingua(l)}>{l.toUpperCase()}</button>)}</div>
  <p className="sc-battuta" id={id+'-battuta'} lang={lingua} aria-live="polite">{parole.map((p,i)=><span key={i} data-detta={parola>i||parola>=parole.length}>{p}{' '}</span>)}</p>
  <svg className="sc-onda" viewBox={`0 0 ${LARGHEZZA} ${ALTEZZA}`} preserveAspectRatio="none" aria-hidden="true" data-sorgente={fase==='campanello'?'analyser':fase==='voce'?'inviluppo':'sagoma'}><path ref={onda} fill="none" stroke="currentColor"/></svg>
  <p className="sc-nota" id={id+'-stato'} role="status">{messaggioFase[fase]}</p>
  {!compatto&&<p className="sc-nota">Il browser non rende leggibile l’audio della propria voce: per questo la forma d’onda vera è quella del segnale di avvio, poi si vede l’inviluppo delle parole. Nessun audio lascia questa pagina.</p>}
  {chiusura&&<TiPuoServire servizio="voce" segmento={scena}/>}
 </section>;
}
