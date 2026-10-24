import {panels} from '../capabilities/panels';

/** One station per family and per Playground demo. Family stations read their copy from the 75-entry catalogue. */
export type Scena='voce'|'vetrina'|'binario'|'create'|'vision';
export interface Station{id:string;kind:'family'|'demo';kicker:string;title:string;text:string;detail?:string;to:string;label:string;visual:number;scena?:Scena}

const family=(slug:string,visual:number):Station=>{
 const p=panels.find(panel=>panel.slug===slug)!;
 return {id:p.slug,kind:'family',kicker:p.name+' / '+p.title,title:p.headline,text:p.claim,detail:`${p.featured.title}: ${p.featured.example}`,to:'/solutions/'+p.slug,label:'Esplora le soluzioni '+p.name+' ↗',visual};
};

export const stations:Station[]=[
 {id:'voice',kind:'demo',scena:'voce',kicker:'Playground / voce',title:'Una voce che risponde.',text:'Scegli una scena e una lingua, premi Ascolta: la voce è quella del tuo browser, la richiesta è simulata. Il microfono non serve.',to:'/explore/voice',label:'Apri il banco voce ↗',visual:3},
 family('build',1),
 {id:'commerce',kind:'demo',scena:'vetrina',kicker:'Playground / commerce',title:'Un negozio da provare.',text:'Catalogo, varianti e carrello dimostrativo: un acquisto simulato, senza pagamenti reali.',to:'/explore/commerce',label:'Apri la demo commercio ↗',visual:2},
 family('automate',3),
 {id:'workflow',kind:'demo',scena:'binario',kicker:'Playground / workflow',title:'Un processo che prende forma.',text:'Descrivi cosa ti serve e guarda il flusso passare dalla richiesta all’azione, un passaggio alla volta.',to:'/explore/workflow',label:'Apri la demo di workflow ↗',visual:3},
 family('create',4),
 {id:'creative',kind:'demo',scena:'create',kicker:'Playground / creatività',title:'Un messaggio, molti formati.',text:'Cambia lingua, direzione e formato e guarda lo stesso messaggio adattarsi.',to:'/explore/creative',label:'Apri la demo creativa ↗',visual:0},
 family('grow',1),
 family('emerging',5),
 {id:'vision',kind:'demo',scena:'vision',kicker:'Playground / visione',title:'Il browser che ti guarda, se vuoi.',text:'Un esperimento con webcam e gesti della mano, elaborato nel tuo browser.',to:'/explore/vision',label:'Apri la demo visione ↗',visual:5},
 {id:'avatar',kind:'demo',kicker:'Playground / avatar',title:'Uno script, una presenza.',text:'Prepara uno storyboard multilingua. Anteprima simulata: video e lip sync richiedono un provider.',to:'/explore/avatar',label:'Apri lo studio avatar ↗',visual:4},
 {id:'software',kind:'demo',kicker:'Playground / software',title:'Prova il tuo prossimo strumento.',text:'Mini CRM e prenotazioni interattive, con dati locali dimostrativi.',to:'/explore/software',label:'Apri il laboratorio software ↗',visual:1},
];
