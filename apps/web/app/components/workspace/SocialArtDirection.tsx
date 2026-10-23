import {useState} from 'react';
import './SocialArtDirection.css';

const cards = [
  {
    "id": "automate",
    "file": "01-automate-clear-path.png",
    "title": "Meno passaggi.",
    "accent": "Più spazio.",
    "copy": "Automazioni intorno al lavoro che conta.",
    "alt": "Nastro di ottone che attraversa pieghe di carta avorio e si distende su fondo grafite.",
    "concept": "Percorso che supera le pieghe: semplificare i passaggi."
  },
  {
    "id": "build",
    "file": "02-build-concrete-experience.png",
    "title": "La tua idea",
    "accent": "prende forma.",
    "copy": "Esperienze digitali progettate per essere usate.",
    "alt": "Un libro di carta avorio diventa una soglia illuminata, bordata in ottone.",
    "concept": "Una soglia concreta: il prodotto come esperienza."
  },
  {
    "id": "create",
    "file": "03-create-shared-form.png",
    "title": "Creatività,",
    "accent": "con una struttura.",
    "copy": "Identità ed esperienze che parlano la stessa lingua.",
    "alt": "Ventaglio di carta avorio che si apre in una curva continua, unito da una base sottile di ottone.",
    "concept": "Rigore e libertà appartengono alla stessa forma."
  }
];

export default function SocialArtDirection(){
 const [square,setSquare]=useState(false);
 return <section className={'sad-gallery'+(square?' sad-square':'')} aria-labelledby="sad-title">
  <header className="sad-header"><div><span className="sad-eyebrow">DIREZIONE EDITORIALE / SOCIAL</span><h2 id="sad-title">Materia e possibilità.</h2><p>Tre visual concettuali dello studio, con testi e composizione da revisionare.</p></div><span className="sad-status">BOZZA — revisione richiesta</span></header>
  <div className="sad-tools"><div role="group" aria-label="Formato delle anteprime"><button type="button" aria-pressed={!square} onClick={()=>setSquare(false)}>4:5 · Feed</button><button type="button" aria-pressed={square} onClick={()=>setSquare(true)}>1:1 · Square</button></div><span role="status" aria-live="polite">Formato attivo: {square?'1:1':'4:5'}</span></div>
  <div className="sad-grid">{cards.map((card,index)=><article className="sad-item" key={card.id}><div className="sad-meta"><span>0{index+1} / {card.id.toUpperCase()}</span><span>CONCEPT</span></div><div className={'sad-card sad-'+card.id}><img src={'/media/social-editorial-24/'+card.file} width={1122} height={1402} loading="lazy" decoding="async" alt={card.alt}/><div className="sad-brand"><span>omni101.</span><span>Digital Possibility Studio</span></div><h3>{card.title}<br/><em>{card.accent}</em></h3><div className="sad-foot"><p>{card.copy}</p><span className="sad-cta">Esplora {card.id.toUpperCase()} <span aria-hidden="true">↗</span></span></div></div><p className="sad-caption">{card.concept}</p></article>)}</div>
  <p className="sad-note">Concept visivi generati per lo studio, da revisionare prima dell’uso. Non rappresentano lavori di clienti. Nessun post pubblicato.</p>
 </section>;
}
