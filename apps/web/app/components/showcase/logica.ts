import {media} from '../../content/media';

/** Pure logic of the showcase primitives. No DOM, no window: safe on the server and testable in Node. */
export type Segmento='studio'|'locale'|'bottega';
export type SegmentoOGenerico=Segmento|'generico';
export type Lingua='it'|'en';
export type Servizio='voce'|'vetrina'|'binario'|'create'|'vision';
export type StatoDemo='SIMULATA'|'OPERATIVA';
export interface Immagine{src:string;alt:string;w:number;h:number}
export interface Passo{titolo:string;testo:string}

export const segmenti:Segmento[]=['studio','locale','bottega'];
export const nomeSegmento:Record<Segmento,string>={studio:'Studio',locale:'Locale',bottega:'Bottega'};

/** Lines of the voice bench, one per segment and language. Copy from PUBBLICO.md and SHOWCASE-PROPOSTA.md. */
export const battute:Record<Segmento,Record<Lingua,string>>={
 studio:{it:'Buongiorno, lo studio è chiuso. Vuole la prima visita o un promemoria?',en:'Good morning, the practice is closed. Would you like a first visit or a reminder?'},
 locale:{it:'Buonasera, la cucina è chiusa. Posso prenotarle un tavolo per domani?',en:'Good evening, the kitchen is closed. Can I book you a table for tomorrow?'},
 bottega:{it:'Il pezzo che cerca è in vetrina. Lo metto da parte fino a sabato?',en:'The piece you are looking for is in the window. Shall I hold it until Saturday?'},
};

const richiesteBinario:Record<SegmentoOGenerico,string>={
 generico:'Vorrei un e-commerce con catalogo prodotti e un sistema per gestire le richieste dei clienti.',
 studio:'Buonasera, vorrei una prima visita la prossima settimana.',
 locale:'Siete aperti domenica a pranzo? Saremmo in quattro.',
 bottega:'Ordine pagato in demo: Essenza, variante Agrumi.',
};
export const richiestaIniziale=(segmento:SegmentoOGenerico)=>richiesteBinario[segmento];

const REVISIONE:Passo={titolo:'Revisione umana',testo:'La risposta viene proposta per approvazione, senza invio automatico.'};

/** Six steps. Index 3 is the key action: the three-node variant keeps steps 0, 3 and 5. */
export function passiBinario(segmento:SegmentoOGenerico,testo:string):Passo[]{
 const richiesta:Passo={titolo:'Richiesta ricevuta',testo};
 if(segmento==='studio')return [richiesta,
  {titolo:'Intake e classificazione',testo:'Tipo individuato in questa simulazione: prima visita o promemoria.'},
  {titolo:'Orario proposto',testo:'Tre orari liberi da far scegliere alla persona. Nessuna agenda reale collegata.'},
  {titolo:'Promemoria pronto',testo:'Anteprima del messaggio di promemoria. Nessun invio.'},
  {titolo:'Attività assegnata',testo:'Una persona dello studio conferma l’orario la mattina dopo.'},REVISIONE];
 if(segmento==='locale')return [richiesta,
  {titolo:'Intake e classificazione',testo:'Tipo individuato in questa simulazione: prenotazione di un tavolo.'},
  {titolo:'Tavolo proposto',testo:'Quattro coperti, domenica a pranzo. Nessuna sala reale collegata.'},
  {titolo:'Promemoria no-show',testo:'Anteprima del messaggio il giorno prima. Nessun invio, nessun dato scritto nel CRM.'},
  {titolo:'Attività assegnata',testo:'Chi apre la sala vede il tavolo in lista.'},REVISIONE];
 if(segmento==='bottega')return [richiesta,
  {titolo:'Intake e classificazione',testo:'Tipo individuato in questa simulazione: ordine di un pezzo a catalogo.'},
  {titolo:'Pezzo riservato',testo:'Lo stock del pezzo scende di uno. Nessun magazzino reale collegato.'},
  {titolo:'Attività per il pacco',testo:'Compito per chi prepara la spedizione. Il pagamento resta finto.'},
  {titolo:'Messaggio al cliente',testo:'Anteprima della conferma, nella lingua della scheda.'},REVISIONE];
 return [richiesta,
  {titolo:'Intake e classificazione',testo:'Servizi individuati in questa simulazione: '+(/commerce|shop|catalogo/i.test(testo)?'BUILD / E-commerce':'BUILD / Prodotto digitale')},
  {titolo:'Brief preparato',testo:'Obiettivo estratto dal testo. Budget e tempi restano da chiarire con il cliente.'},
  {titolo:'Lead nel CRM',testo:'Anteprima del record simulato. Nessun dato viene scritto nel CRM reale.'},
  {titolo:'Attività assegnata',testo:'Discovery con un responsabile e criteri da definire.'},REVISIONE];
}
export const nodiVisibili=(passi:Passo[],nodi:3|6)=>nodi===6?passi:[0,3,5].map(i=>passi[i]).filter((p):p is Passo=>Boolean(p));

/** Honest envelope of a line: one bar per slice, height from the length of the words. Not a recording. */
export function sagoma(testo:string,barre:number):number[]{
 const parole=testo.split(/\s+/).filter(Boolean);
 if(!parole.length||barre<1)return Array.from({length:Math.max(barre,0)},()=>0.08);
 const out:number[]=[];
 for(let i=0;i<barre;i+=1){
  const parola=parole[Math.min(parole.length-1,Math.floor(i/barre*parole.length))]??'';
  out.push(Math.min(1,0.12+parola.replace(/[^\p{L}\p{N}]/gu,'').length/9*0.88));
 }
 return out;
}
export const decadimento=(valore:number,dtMs:number)=>valore<0.02?0:valore*Math.pow(0.5,dtMs/90);
export const durataStimataMs=(testo:string)=>testo.split(/\s+/).filter(Boolean).length*420+1500;

export const briefLink=(testo:string)=>'/start-project?brief='+encodeURIComponent(testo.trim().slice(0,2000));

interface Chiusura{links:[{to:string;label:string},{to:string;label:string}];cta:string;brief:string}
const chiusure:Record<Servizio,Chiusura>={
 voce:{links:[{to:'/explore/workflow',label:'Il promemoria che parte da solo'},{to:'/solutions/automate',label:'Altre richieste che non si perdono'}],cta:'Facciamo rispondere lo studio',brief:'Voglio una risposta fuori orario'},
 vetrina:{links:[{to:'/explore/creative',label:'La scheda in un’altra lingua e formato'},{to:'/solutions/build',label:'Negozio e app costruiti su misura'}],cta:'Vediamo il tuo catalogo',brief:'Vorrei una vetrina online per il mio catalogo'},
 binario:{links:[{to:'/explore/voice',label:'Chi risponde fuori orario'},{to:'/solutions/automate',label:'Altri passaggi che si ripetono'}],cta:'Raccontaci il passaggio che si ripete',brief:'C’è un passaggio che si ripete ogni giorno e vorrei automatizzarlo'},
 create:{links:[{to:'/explore/commerce',label:'La stessa scheda in vetrina'},{to:'/solutions/create',label:'Immagini e movimento per il tuo prodotto'}],cta:'Porta due foto tue',brief:'Porto due foto mie, le consegno io, vorrei vederle in due versioni'},
 vision:{links:[{to:'/explore/vision',label:'Il laboratorio dei gesti'},{to:'/solutions/emerging',label:'Cosa si sta aprendo'}],cta:'Parliamone',brief:'Vorrei capire se un controllo a gesti ha senso per noi'},
};
const briefSegmento:Partial<Record<Servizio,Record<Segmento,string>>>={
 voce:{studio:'Voglio una risposta fuori orario per lo studio',locale:'Voglio una risposta fuori orario per il locale e le prenotazioni',bottega:'Voglio una risposta fuori orario per la bottega'},
 binario:{studio:'Vorrei un promemoria automatico per le visite',locale:'Vorrei un promemoria automatico contro i no-show',bottega:'Vorrei un compito automatico per chi prepara gli ordini'},
};
export function chiusura(servizio:Servizio,segmento?:Segmento){
 const base=chiusure[servizio];
 return {links:base.links,cta:base.cta,href:briefLink((segmento&&briefSegmento[servizio]?.[segmento])||base.brief)};
}

/** Pairs declared in SHOWCASE-PROPOSTA: only the shop has a confirmed pair of stills (same framing). */
const coppie:Partial<Record<Segmento,[string,string]>>={bottega:['reel-01','reel-08']};
export function coppiaMedia(segmento:Segmento|undefined,prima?:Immagine,dopo?:Immagine):{prima:Immagine;dopo:Immagine}|null{
 if(prima&&dopo)return {prima,dopo};
 const nomi=segmento?coppie[segmento]:undefined;
 if(!nomi)return null;
 const tutte:Immagine[]=[...media.reel,...media.work,...media.explore];
 const a=tutte.find(m=>m.src.includes(nomi[0])),b=tutte.find(m=>m.src.includes(nomi[1]));
 return a&&b?{prima:a,dopo:b}:null;
}
