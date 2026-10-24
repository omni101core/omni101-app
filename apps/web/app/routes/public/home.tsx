import {Link} from 'react-router';
import ReelOrbit from '../../components/public/ReelOrbit';
import CinematicExperience from '../../components/public/CinematicExperience';
import {homeStages} from '../../components/public/HomeShowcase';
import {RevealTitle} from '../../components/public/shell/RevealTitle';
import {media} from '../../content/media';
import {projects,services} from '../../components/public/shell/site-data';
import '../../styles/home-regia.css';

/** Home: the reel ring (loader and hero are one scene), four families, then one cinematic chapter, the playground, concept work, method and the final doors. */
const stages=homeStages();
const demos=7;
const doors=[
 ['/work','Concept dello studio','Prototipi dello studio, non clienti.'],
 ['/explore','Playground','Le possibilità, da provare con le tue mani.'],
 ['/start-project','Raccontaci la tua idea','Un brief in poche righe.'],
];

const pillars=[
 ['build','PRODOTTO','Prodotti che funzionano.','Siti, commercio, SaaS, CRM, portali e software su misura.'],
 ['automate','PROCESSO','Meno passaggi. Più tempo.','Workflow, agenti, documenti, qualificazione dei contatti e supporto.'],
 ['create','CONTENUTO','La tua idea prende forma.','Visual, campagne, video, avatar, voce e mondi interattivi.'],
 ['grow','CRESCITA','Il prodotto continua a crescere.','Funnel, contenuti, SEO, email e ottimizzazione delle conversioni.'],
];
const senses=[
 ['VEDE','vision','Il gesto diventa interfaccia.','Tracciamento reale della mano nel browser. Webcam solo dopo consenso.'],
 ['PARLA','voice','Una voce per ogni incontro.','Sintesi del browser e scenari dimostrativi. Nessuna telefonata reale.'],
 ['CREA','creative','Da un soggetto a una campagna.','Confronta composizioni e formati. Nessuna generazione live a pagamento.'],
 ['AGISCI','workflow','Una richiesta diventa un percorso.','Simulazione del flusso: ingresso, brief, attività e approvazione.'],
];
const labs=[['avatar','Avatar Studio','Storyboard e copione multilingua · simulato'],['voice','Voce AI','Voce del browser · reale'],['vision','Visione / gesto','Tracciamento della mano nel browser · reale'],['workflow','Flusso con agenti','Percorso guidato · simulato'],['commerce','Commerce','Catalogo e carrello · demo locale'],['creative','Creative AI','Varianti e confronto · composizione locale'],['software','Software Lab','Mini CRM e prenotazioni · demo locale']];

export function Home(){
 return <>
  <ReelOrbit
   head={<>
    <div className="home-top"><span className="eyebrow">DIGITAL POSSIBILITY STUDIO</span><span className="availability">NUOVE IDEE, NUOVE POSSIBILITÀ</span></div>
    <h1 className="home-title">La tua idea.<em>Oltre il software.</em></h1>
   </>}
   foot={<>
    <p className="home-sentence">Costruiamo <Link to="/solutions/build">prodotti</Link>, automatizziamo <Link to="/solutions/automate">processi</Link>, creiamo <Link to="/solutions/create">contenuti</Link> e facciamo crescere <Link to="/solutions/grow">ciò che hai già</Link>.</p>
    <div className="home-foot">
     <div className="hero-actions"><Link className="button" to="/start-project">Raccontaci la tua idea <span>↗</span></Link><a className="text-link" href="#capitolo">Guarda come lavoriamo <span>↓</span></a></div>
     <dl className="home-numbers"><div><dt>famiglie di servizio</dt><dd>{services.length}</dd></div><div><dt>concept da esplorare</dt><dd>{projects.length}</dd></div><div><dt>demo da provare</dt><dd>{demos}</dd></div></dl>
    </div>
   </>}
  />
  <section className="home-pillars section" aria-label="Quattro famiglie di possibilità">{pillars.map(([id,label,title,body])=><Link key={id} to={'/solutions/'+id}><span className="eyebrow">{label}</span><h2>{title}</h2><p>{body}</p><span aria-hidden="true">↗</span></Link>)}</section>
  <section className="home-possibility section">
   <span className="eyebrow">01 / NON SOLO UN SITO</span>
   <RevealTitle as="h2" className="section-heading">Un prodotto. Un processo.<br/><em>Un nuovo modo di lavorare.</em></RevealTitle>
   <p>Dal primo contatto alla consegna, dal contenuto alla vendita: colleghiamo software, creatività e intelligenza artificiale intorno a un obiettivo concreto.</p>
  </section>
  <section className="home-senses section" aria-label="Possibilità AI"><header><span className="eyebrow">02 / INTELLIGENZA DA PROVARE</span><RevealTitle as="h2" className="section-heading">Vede. Parla. Crea.<br/><em>Ti aiuta ad agire.</em></RevealTitle></header><div>{senses.map(([name,slug,title,body],i)=><Link to={'/explore/'+slug} key={name}><span className="home-sense-word">{name}</span><span className="home-sense-copy"><strong>{title}</strong><small>{body}</small></span><span aria-hidden="true">0{i+1} ↗</span></Link>)}</div></section>
  <div id="capitolo"><CinematicExperience stages={stages}/></div>
  <section className="home-labs section"><span className="eyebrow">03 / PLAYGROUND</span><RevealTitle as="h2" className="section-heading">Non immaginarlo soltanto.<br/><em>Provalo.</em></RevealTitle><div>{labs.map(([slug,name,status])=><Link key={slug} to={'/explore/'+slug}><strong>{name}</strong><small>{status}</small><span aria-hidden="true">↗</span></Link>)}</div></section>
  <section className="home-proof section"><div><span className="eyebrow">04 / CONCEPT E PROTOTIPI</span><RevealTitle as="h2" className="section-heading">Possibilità<br/><em>che prendono forma.</em></RevealTitle><p>Esperienze dimostrative dello studio. Nessun risultato commerciale o cliente dichiarato senza prova.</p><Link className="text-link" to="/work">Esplora i concept ↗</Link></div><Link to="/work" className="img-hover" aria-label="Esplora i concept dello studio"><img src={media.work[0].src} alt={media.work[0].alt} width={media.work[0].w} height={media.work[0].h} loading="lazy"/></Link></section>
  <section className="home-method section"><span className="eyebrow">05 / DALL’IDEA AL PRODOTTO</span><RevealTitle as="h2" className="section-heading">Prima capiamo.<br/><em>Poi costruiamo insieme.</em></RevealTitle><ol>{[['Ascolto','Obiettivo, persone e vincoli. Un brief condiviso.'],['Prototipo','Una versione concreta da vedere e correggere.'],['Realizzazione','Software, contenuti e automazioni verificati.'],['Consegna e crescita','Accessi, formazione e prossimi passi misurabili.']].map(([title,body])=><li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol></section>
  <section className="home-doors" aria-label="Da dove cominciare">
   <RevealTitle as="h2" className="home-doors-title">Da dove vuoi<br/><em>cominciare?</em></RevealTitle>
   <ul>{doors.map(([to,name,line],i)=><li key={to}><Link className="home-door" to={to}><span className="home-door-index">0{i+1} /</span><span className="home-door-name">{name}</span><span className="home-door-line">{line}</span><span className="home-door-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
  </section>
 </>;
}
