import {panels} from '../capabilities/panels';

/** One station per family and per Playground demo. Family stations read their copy from the 75-entry catalogue. */
export interface Station{id:string;kind:'family'|'demo';kicker:string;title:string;text:string;detail?:string;to:string;label:string;visual:number}

const family=(slug:string,visual:number):Station=>{
 const p=panels.find(panel=>panel.slug===slug)!;
 return {id:p.slug,kind:'family',kicker:p.name+' / '+p.title,title:p.headline,text:p.claim,detail:`${p.featured.title}: ${p.featured.example}`,to:'/solutions/'+p.slug,label:'Esplora le soluzioni '+p.name+' ↗',visual};
};

export const stations:Station[]=[
 family('build',1),
 {id:'commerce',kind:'demo',kicker:'PLAYGROUND / COMMERCE',title:'Un negozio da provare.',text:'Catalogo, varianti e carrello dimostrativo: un acquisto simulato, senza pagamenti reali.',to:'/explore/commerce',label:'Apri la demo Commerce ↗',visual:2},
 family('automate',3),
 {id:'workflow',kind:'demo',kicker:'PLAYGROUND / WORKFLOW',title:'Un processo che prende forma.',text:'Descrivi cosa ti serve e guarda il flusso passare dalla richiesta all’azione, un passaggio alla volta.',to:'/explore/workflow',label:'Apri la demo Workflow ↗',visual:3},
 family('create',4),
 {id:'creative',kind:'demo',kicker:'PLAYGROUND / CREATIVE',title:'Un messaggio, molti formati.',text:'Cambia lingua, direzione e formato e guarda lo stesso messaggio adattarsi.',to:'/explore/creative',label:'Apri la demo Creative ↗',visual:0},
 family('grow',1),
 family('emerging',5),
 {id:'vision',kind:'demo',kicker:'PLAYGROUND / VISION',title:'Il browser che ti guarda, se vuoi.',text:'Un esperimento con webcam e gesti della mano, elaborato nel tuo browser.',to:'/explore/vision',label:'Apri la demo Vision ↗',visual:5},
];
