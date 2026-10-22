import ExplorePath from '../components/public/explore/ExplorePath';
import {ClosingCTA,PublicShell} from '../components/public/capabilities/PublicShell';

export function meta(){
 const title='Playground · OMNI101',description='Un percorso nello spazio attraverso le possibilità: scorri tra le famiglie di soluzioni e le demo da provare, dal negozio al flusso automatico, dai contenuti creativi alla visione.';
 return [{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{property:'og:url',content:'https://omni101.app/explore'},{tagName:'link',rel:'canonical',href:'https://omni101.app/explore'}];
}
export default function Explore(){
 return <PublicShell routeKey="explore">
  <section className="page-hero ex-hero">
   <span className="eyebrow">03 / THE PLAYGROUND</span>
   <h1>Le possibilità,<br/><em>lungo un percorso.</em></h1>
   <p>Scorri: la camera attraversa le famiglie di soluzioni e le demo da provare. Ogni stazione ha un link vero; l’elenco qui sotto vale anche senza animazioni.</p>
  </section>
  <ExplorePath/>
  <ClosingCTA/>
 </PublicShell>;
}
