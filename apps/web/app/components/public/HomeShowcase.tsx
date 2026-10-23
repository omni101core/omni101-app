import {lazy,Suspense} from 'react';
import type {CinemaStage} from './CinematicExperience';
import {coppiaMedia} from '../showcase/logica';

/**
 * The four moments of the home chapter, in this order: BancoVoce, PrimaDopo, Binario, Vetrina.
 * The primitives come from `components/showcase` (SPEC-25) and load only when their stage is on screen: the home
 * pays for none of them until the visitor scrolls into the chapter. The closing "Ti può servire anche" line is left
 * out here (`chiusura={false}`): the stage already carries its own link.
 */
const BancoVoce=lazy(()=>import('../showcase/BancoVoce').then(m=>({default:m.BancoVoce})));
const PrimaDopo=lazy(()=>import('../showcase/PrimaDopo').then(m=>({default:m.PrimaDopo})));
const Binario=lazy(()=>import('../showcase/Binario').then(m=>({default:m.Binario})));
const Vetrina=lazy(()=>import('../showcase/Vetrina').then(m=>({default:m.Vetrina})));

/** PrimaDopo needs two real stills of ours; without them the moment is left out, never replaced by an empty frame. */
const hasPair=coppiaMedia('bottega')!==null;

export function homeStages():CinemaStage[]{
 const stages:CinemaStage[]=[{id:'voce',label:'VOCE',title:'Ascolta una risposta.',body:'Scegli una scena e premi play: la voce parla, la forma d’onda segue il suono. Una dimostrazione, non una promessa.',detail:'Voce / accoglienza / assistenti',to:'/explore/voice',cta:'Prova la voce',demo:<Suspense fallback={null}><BancoVoce segmento="studio" compatto chiusura={false}/></Suspense>}];
 if(hasPair)stages.push({id:'prima-dopo',label:'PRIMA / DOPO',title:'Guarda la differenza.',body:'Due immagini, una maniglia. Trascina e confronta lo stesso soggetto prima e dopo il lavoro creativo.',detail:'Immagini / prodotto / campagne',to:'/explore/creative',cta:'Apri il laboratorio creativo',demo:<Suspense fallback={null}><PrimaDopo segmento="bottega" chiusura={false}/></Suspense>});
 stages.push(
  {id:'binario',label:'BINARIO',title:'Segui il lavoro.',body:'Una richiesta entra, passa per tre punti e arriva a una persona. Ogni passaggio si accende quando succede ed è simulato: non scrive nei tuoi strumenti.',detail:'Workflow / approvazioni / tracce',to:'/explore/workflow',cta:'Avvia il flusso',demo:<Suspense fallback={null}><Binario nodi={3} chiusura={false}/></Suspense>},
  {id:'vetrina',label:'VETRINA',title:'Scegli un oggetto.',body:'Cerca, apri una scheda, aggiungi al carrello. Un ritaglio del negozio dimostrativo: tutto il resto sta nel playground.',detail:'E-commerce / catalogo / acquisto',to:'/explore/commerce',cta:'Entra nel negozio dimostrativo',demo:<Suspense fallback={null}><Vetrina ritaglio chiusura={false}/></Suspense>},
 );
 return stages;
}
