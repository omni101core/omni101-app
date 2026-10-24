import {Link} from 'react-router';
import './engagement-modes.css';

const modes=[
 {id:'one-time',title:'Una tantum',label:'Un risultato definito',description:'Per un intervento con un inizio e una consegna: una landing, un’identità visiva o una singola automazione.',terms:'Definiamo cosa include, le revisioni e la consegna. Assistenza e attività successive si concordano a parte.',cta:'Richiedi una proposta una tantum',brief:'Vorrei una proposta una tantum. Il risultato che cerco è: '},
 {id:'ongoing',title:'Continuativo',label:'Un lavoro che prosegue',description:'Per contenuti, manutenzione o miglioramenti che richiedono un lavoro ricorrente.',terms:'La proposta indica attività incluse, frequenza, durata, rinnovo e condizioni di uscita. Eventuali extra sono separati.',cta:'Richiedi una proposta continuativa',brief:'Vorrei valutare un servizio continuativo o in abbonamento. Le attività ricorrenti che mi servono sono: '},
 {id:'custom',title:'Progetto su misura',label:'Più parti, un obiettivo',description:'Per un’app, un portale o un processo che collega persone, dati e strumenti della tua attività.',terms:'Partiamo dal brief e definiamo perimetro, fasi, responsabilità e criteri di consegna prima di iniziare.',cta:'Prepara il brief del progetto',brief:'Vorrei definire un progetto su misura. Il problema da risolvere e le persone coinvolte sono: '},
] as const;

export default function EngagementModes(){return <section id="modalita" className="cap-segments engagement-modes" aria-labelledby="engagement-title">
 <div className="cap-segments-head"><span className="eyebrow">MODALITÀ E PREVENTIVI</span><h2 id="engagement-title">Un intervento, un percorso.<br/>Il prezzo parte da ciò che serve.</h2><p>Una tantum, abbonamento o progetto su misura: scegli da dove iniziare. Riceverai una proposta con prezzo, eventuale canone, imposte, tempi e condizioni da valutare prima di accettare.</p></div>
 <ul className="cap-segment-grid">{modes.map(mode=><li key={mode.id}><article className="cap-segment" aria-labelledby={'engagement-'+mode.id}>
  <span className="eyebrow">{mode.label}</span><h3 id={'engagement-'+mode.id}>{mode.title}</h3><p>{mode.description}</p><p>{mode.terms}</p>
  <Link className="text-link engagement-cta" to={'/start-project?brief='+encodeURIComponent(mode.brief)}>{mode.cta} ↗</Link>
 </article></li>)}</ul>
 <p className="engagement-note">La richiesta apre una conversazione: non attiva abbonamenti e non richiede pagamenti. <Link className="text-link" to="/terms">Leggi i termini ↗</Link></p>
 </section>}
