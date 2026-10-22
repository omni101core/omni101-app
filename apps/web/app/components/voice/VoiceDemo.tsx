import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Link} from 'react-router';
import {interpretCommand,type VoiceIntent} from './commands';
import '../../styles/playground.css';

type Scene='home'|'commerce'|'services';
type Rec={lang:string;continuous:boolean;interimResults:boolean;start:()=>void;stop:()=>void;abort:()=>void;onresult:((event:SpeechEvent)=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null};
type SpeechEvent={resultIndex:number;results:ArrayLike<{isFinal:boolean;0:{transcript:string}}>};

const products=[{name:'Essenza',note:'Oggetto concept. Nessun prezzo da pagare.'},{name:'Forma',note:'Anteprima di catalogo, solo in questa pagina.'},{name:'Traccia',note:'Il carrello reale non viene aperto.'}];
const services=[{name:'Build',to:'/solutions/build',text:'Siti, app e commerce costruiti intorno a un risultato.'},{name:'Automate',to:'/solutions/automate',text:'Flussi e sistemi che lasciano il controllo alle persone.'},{name:'Create',to:'/solutions/create',text:'Identità, immagini e movimento.'},{name:'Grow',to:'/solutions/grow',text:'Presenza, contenuti e il passo successivo.'}];

function scriptFor(scene:Scene){
 if(scene==='commerce')return 'Commerce dimostrativo. Tre oggetti concept, nessun pagamento e nessun ordine.';
 if(scene==='services')return 'Servizi dello studio: Build, Automate, Create e Grow.';
 return 'Demo vocale. Puoi dire apri commerce, oppure mostrami i servizi.';
}

function createRecognizer(){
 const host=window as Window&{SpeechRecognition?:new()=>Rec;webkitSpeechRecognition?:new()=>Rec};
 const Ctor=host.SpeechRecognition||host.webkitSpeechRecognition;
 return Ctor?new Ctor():null;
}

export default function VoiceDemo(){
 const recognizer=useRef<Rec|null>(null);
 const want=useRef(false);
 const sceneRef=useRef<Scene>('home');
 const [scene,setScene]=useState<Scene>('home');
 const [draft,setDraft]=useState('');
 const [transcript,setTranscript]=useState('Nessuna frase ancora.');
 const [status,setStatus]=useState('Microfono spento');
 const [listening,setListening]=useState(false);
 const [supported,setSupported]=useState<'unknown'|'yes'|'no'>('unknown');
 const [micPolicy,setMicPolicy]=useState<'unknown'|'allowed'|'blocked'>('unknown');
 const [voices,setVoices]=useState<number|null>(null);
 const [reduced,setReduced]=useState(false);

 useEffect(()=>{
  const host=window as Window&{SpeechRecognition?:unknown;webkitSpeechRecognition?:unknown};
  setSupported(host.SpeechRecognition||host.webkitSpeechRecognition?'yes':'no');
  const policy=(document as Document&{permissionsPolicy?:{allowsFeature:(name:string)=>boolean}}).permissionsPolicy;
  setMicPolicy(policy&&!policy.allowsFeature('microphone')?'blocked':'allowed');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const apply=()=>setReduced(motion.matches);
  apply();
  motion.addEventListener('change',apply);
  const synth=window.speechSynthesis;
  const count=()=>setVoices(synth?synth.getVoices().length:0);
  count();
  synth?.addEventListener('voiceschanged',count);
  return()=>{
   want.current=false;
   recognizer.current?.abort();
   motion.removeEventListener('change',apply);
   synth?.removeEventListener('voiceschanged',count);
   synth?.cancel();
  };
 },[]);

 function speak(text:string){
  const synth=window.speechSynthesis;
  if(!synth){setStatus('Sintesi non disponibile in questo browser. Il testo resta a schermo.');return}
  synth.cancel();
  const utter=new SpeechSynthesisUtterance(text);
  utter.lang='it-IT';
  utter.rate=1;
  synth.speak(utter);
  setStatus('Sintesi del browser in corso. L’audio non viene inviato a OMNI101.');
 }

 function go(next:Scene,message:string){
  sceneRef.current=next;
  setScene(next);
  setStatus(message);
 }

 function apply(intent:VoiceIntent){
  if(intent==='commerce')go('commerce','Commerce aperto nella demo. Nessun pagamento.');
  else if(intent==='services')go('services','Servizi aperti nella demo.');
  else if(intent==='home')go('home','Tornato all’inizio della demo.');
  else if(intent==='speak')speak(scriptFor(sceneRef.current));
  else setStatus('Comando non riconosciuto. Prova «apri commerce» o «mostrami i servizi».');
 }

 function runText(event:FormEvent){
  event.preventDefault();
  const phrase=draft.trim();
  if(!phrase)return;
  setTranscript(phrase);
  apply(interpretCommand(phrase));
 }

 function stop(){
  want.current=false;
  recognizer.current?.stop();
  setListening(false);
  setStatus('Microfono spento');
 }

 function start(){
  if(listening||supported!=='yes'||micPolicy!=='allowed')return;
  const engine=recognizer.current??createRecognizer();
  if(!engine){setSupported('no');setStatus('Questo browser non espone il riconoscimento vocale. Usa il campo di testo.');return}
  recognizer.current=engine;
  engine.lang='it-IT';
  engine.continuous=true;
  engine.interimResults=true;
  engine.onresult=event=>{
   let finalText='';
   let interim='';
   for(let index=event.resultIndex;index<event.results.length;index+=1){
    const piece=event.results[index][0]?.transcript??'';
    if(event.results[index].isFinal)finalText+=piece;else interim+=piece;
   }
   if(interim)setTranscript(interim);
   const phrase=finalText.trim();
   if(!phrase)return;
   setTranscript(phrase);
   apply(interpretCommand(phrase));
  };
  engine.onerror=event=>{
   want.current=false;
   setListening(false);
   if(event.error==='not-allowed'||event.error==='service-not-allowed')setStatus('Permesso microfono negato o bloccato. Usa il campo di testo.');
   else setStatus('Riconoscimento interrotto. Usa il campo di testo.');
  };
  engine.onend=()=>{
   if(!want.current){setListening(false);return}
   try{engine.start()}catch{want.current=false;setListening(false);setStatus('Riconoscimento chiuso. Usa il campo di testo.')}
  };
  try{
   want.current=true;
   engine.start();
   setListening(true);
   setStatus('In ascolto. I comandi restano in questa pagina.');
  }catch{
   want.current=false;
   setListening(false);
   setStatus('Il microfono non è partito. Usa il campo di testo.');
  }
 }

 const micDisabled=listening||supported!=='yes'||micPolicy!=='allowed';
 return <section className="section voice-demo" data-reduced={reduced?'true':'false'}>
  <span className="eyebrow">PLAYGROUND / VOCE NEL BROWSER</span>
  <h1>Dillo, oppure scrivilo.</h1>
  <p>Il microfono parte solo dal pulsante. La sintesi usa le voci del browser{voices==null?'':` (${voices} disponibili)`}. OMNI101 non riceve audio e non usa API a pagamento. Il riconoscimento, se c’è, è l’API Web Speech del browser: in Chrome l’audio può essere elaborato dal fornitore del browser, non viene salvato qui.</p>
  <div className={'voice-live'+(listening?' is-on':'')} aria-hidden="true"><i/>{listening?'In ascolto':'Microfono spento'}</div>
  <p role="status" aria-live="polite">{status}</p>
  {micPolicy==='blocked'&&<p className="demo-note">L’intestazione della pagina blocca il microfono su questo indirizzo. I comandi di testo e la sintesi restano disponibili.</p>}
  {supported==='no'&&<p className="demo-note">Questo browser non espone il riconoscimento vocale. Il campo di testo esegue gli stessi comandi.</p>}
  <div className="voice-actions">
   <button type="button" className="button button-gold" onClick={start} disabled={micDisabled}>{listening?'In ascolto':'Avvia microfono'}</button>
   <button type="button" className="button" onClick={stop} disabled={!listening}>Ferma microfono</button>
   <button type="button" className="button" onClick={()=>speak(scriptFor(scene))}>Ascolta il pannello</button>
  </div>
  <p className="voice-transcript" aria-live="polite"><span className="eyebrow">Trascrizione</span>{transcript}</p>
  <form className="voice-form" onSubmit={runText}>
   <label htmlFor="voice-command">Comando di testo</label>
   <input id="voice-command" value={draft} onChange={event=>setDraft(event.target.value)} autoComplete="off" placeholder="apri commerce"/>
   <button className="button" type="submit">Esegui comando</button>
  </form>
  <div className="voice-actions">
   <button type="button" className="button" aria-pressed={scene==='commerce'} onClick={()=>apply('commerce')}>Apri commerce</button>
   <button type="button" className="button" aria-pressed={scene==='services'} onClick={()=>apply('services')}>Mostrami i servizi</button>
   <button type="button" className="button" aria-pressed={scene==='home'} onClick={()=>apply('home')}>Torna all’inizio</button>
  </div>
  <section aria-label="Introduzione" hidden={scene!=='home'}>
   <h2>Due frasi, due stanze.</h2>
   <p>«Apri commerce» mostra un catalogo finto. «Mostrami i servizi» elenca le quattro famiglie. «Ascolta» legge il pannello. Niente di tutto questo lascia il browser verso i server dello studio.</p>
  </section>
  <section aria-label="Commerce" hidden={scene!=='commerce'}>
   <h2>Commerce, solo in demo.</h2>
   <ul className="voice-cards">{products.map(item=><li key={item.name}><strong>{item.name}</strong><span>{item.note}</span></li>)}</ul>
   <Link className="text-link" to="/explore/commerce">Apri il catalogo dimostrativo ↗</Link>
  </section>
  <section aria-label="Servizi" hidden={scene!=='services'}>
   <h2>I servizi dello studio.</h2>
   <ul className="voice-cards">{services.map(item=><li key={item.name}><strong>{item.name}</strong><span>{item.text}</span><Link to={item.to}>Apri {item.name} ↗</Link></li>)}</ul>
  </section>
  <p><Link className="text-link" to="/explore/vision">Prova Vision Lab ↗</Link></p>
 </section>;
}
