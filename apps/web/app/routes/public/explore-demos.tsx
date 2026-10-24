import {useState,lazy,Suspense} from 'react';
import {Link} from 'react-router';
import {Visual} from '../../components/public/Visual';
import {PageHero} from '../../components/public/shell/PageHero';
import {Binario,PrimaDopo,TiPuoServire,Vetrina} from '../../components/showcase';
import {aspettoDi,etichettaDi,messaggi} from '../../components/showcase/creativo';
import {AvatarLab,SoftwareLab} from './product-labs';
const VisionLab=lazy(()=>import('../../components/vision/VisionLab'));
export function Commerce(){return <><PageHero kicker="PLAYGROUND / ESPERIENZA COMMERCE" title={<>Essenza.<br/><em>Oggetti per una vita più lenta.</em></>} text="Un negozio dimostrativo realmente esplorabile. Catalogo, varianti e carrello; nessun pagamento o ordine reale."/><section className="section"><Vetrina/></section></>}
export function WorkflowDemo(){return <><PageHero kicker="PLAYGROUND / FLUSSO CON AI" title={<>Dalla richiesta.<br/><em>Alla prossima azione.</em></>} text="Una simulazione guidata del percorso di una richiesta. Il testo resta nel browser; questa demo non invoca modelli né crea dati produttivi."/><section className="section"><Binario campo nodi={6}/></section></>}
export function CreativeDemo(){
 const [language,setLanguage]=useState('it'),[direction,setDirection]=useState('essenza'),[format,setFormat]=useState('social');
 return <>
  <PageHero kicker="PLAYGROUND / STUDIO CREATIVO" title={<>Un’idea.<br/><em>Molte espressioni.</em></>} text="Un laboratorio di direzione creativa con visual originali generati in codice. Nessuna API generativa o consumo a pagamento."/>
  <section className="section creative-layout">
   <div className="creative-art" style={{aspectRatio:aspettoDi(format),minHeight:format==='wide'?300:440}}><Visual kind={direction==='essenza'?2:direction==='form'?4:0} large/><div className="creative-overlay"><span>{direction.toUpperCase()} / STUDIO CONCEPT</span><h2>{messaggi[language]}</h2><span>{etichettaDi(format)}</span></div></div>
   <div className="creative-controls"><span className="eyebrow">DIREZIONE CREATIVA / ANTEPRIMA</span><h2 style={{fontSize:32,fontWeight:400}}>Esplora la direzione.</h2>
    <label>Visual originale<select value={direction} onChange={e=>setDirection(e.target.value)}><option value="essenza">Essenza / natura morta</option><option value="form">Forma / tipografia</option><option value="orbit">Orbita / scultura digitale</option></select></label>
    <label>Lingua<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="it">Italiano</option><option value="en">English</option><option value="fr">Français</option></select></label>
    <label>Formato<select value={format} onChange={e=>setFormat(e.target.value)}><option value="social">Social / 1:1</option><option value="story">Storia / 9:16</option><option value="wide">Campagna / 16:9</option></select></label>
    <p className="demo-note">Questa esperienza mostra la composizione e l’adattamento multilingua. Gli asset sono concept originali; avatar e video pubblicitari verranno aggiunti solo con media autorizzati e verificati.</p>
    <PrimaDopo segmento="bottega" chiusura={false}/>
    <Link className="text-link" to="/start-project">Diamo forma al tuo immaginario ↗</Link>
   </div>
  </section>
  <section className="section"><TiPuoServire servizio="create"/></section>
 </>;
}
export function ExploreDemo({slug}:{slug:string}){
 if(slug==='avatar')return <AvatarLab/>;
 if(slug==='software')return <SoftwareLab/>;
 if(slug==='commerce')return <Commerce/>;
 if(slug==='workflow')return <WorkflowDemo/>;
 if(slug==='vision')return <Suspense fallback={<section className="section">Caricamento Vision Lab…</section>}><VisionLab/></Suspense>;
 return <CreativeDemo/>;
}
