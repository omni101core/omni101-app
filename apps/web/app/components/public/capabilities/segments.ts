import {capabilities,type Capability,type Family} from '../../../content/capabilities';

/** The ten segments of `esiti/omni101-codex-ripresa/PUBBLICO.md`, as short copy for /solutions/:family. Each segment is one
 * problem and has ONE demo (table "Dove vive" in SHOWCASE-PROPOSTA.md): the showcase primitive of `components/showcase`
 * (SPEC-25) opened in the card on request, plus a link to the full Playground page. `formati` has no primitive: its demo is
 * the Playground page. No figures, no prices, no client names, no promise of rankings or results: only what the catalogue sells. */
export type DemoKind='voce'|'binario'|'vetrina'|'formati';
export type Scena='studio'|'locale'|'bottega'|'generico';
export interface SegmentDemo{kind:DemoKind;name:string;to:string;line:string;scena:Scena;campo?:boolean}
export interface Segment{id:string;name:string;who:string;problem:string;result:string;buys:string[];demo:SegmentDemo;brief:string}

export const demos:Record<DemoKind,{name:string;to:string}>={
 voce:{name:'BancoVoce',to:'/explore/voice'},
 binario:{name:'Binario',to:'/explore/workflow'},
 vetrina:{name:'Vetrina',to:'/explore/commerce'},
 formati:{name:'Formati',to:'/explore/creative'},
};
const demo=(kind:DemoKind,line:string,scena:Scena='generico',campo?:boolean):SegmentDemo=>({kind,...demos[kind],line,scena,campo});

export const segments:Segment[]=[
 {id:'sanitario',name:'Studi sanitari',who:'Dentista, fisioterapista, psicologo, veterinario: studi con pochi collaboratori, non le catene.',
  problem:'Agenda, telefono e segreteria li tiene spesso la stessa persona, e a studio chiuso nessuno risponde.',
  result:'Il telefono non squilla per «a che ora avete posto». Il sito prende la richiesta anche a studio chiuso e l’agenda che hai già non viene buttata.',
  buys:['siti-premium','seo','booking','scheduling','assistenti-ai','ai-receptionist','email-automation','document-processing','on-device-ai'],
  demo:demo('voce','Ascolta come risponde lo studio fuori orario.','studio'),brief:'Sono uno studio sanitario e vorrei una risposta fuori orario'},
 {id:'ristoranti',name:'Ristoranti e bar',who:'Il titolare di un locale indipendente: sala e cucina, spesso in famiglia.',
  problem:'Il tavolo si prenota per telefono mentre si serve, e un no-show costa una sera.',
  result:'La sala è piena di chi arriva, non di chi ha dimenticato. WhatsApp risponde «siete aperti?» mentre sei in cucina.',
  buys:['siti-premium','booking','pwa-applicazioni','ai-receptionist','email-automation','social-content','creative-advertising','immagini-generative'],
  demo:demo('binario','Da «siete aperti?» a una prenotazione con promemoria.','locale'),brief:'Ho un ristorante e vorrei le prenotazioni con promemoria contro i no-show'},
 {id:'ospitalita',name:'B&B e locazioni brevi',who:'Chi gestisce poche camere o pochi appartamenti, di solito da solo.',
  problem:'Check-in, messaggi ripetitivi e pulizie si mangiano la mattina.',
  result:'L’ospite riceve da solo le istruzioni di arrivo e la struttura si prenota anche fuori dalle piattaforme.',
  buys:['siti-premium','booking','email-automation','assistenti-ai','ai-receptionist','seo','multilingual-localization','real-time-voice-assistants'],
  demo:demo('binario','Una richiesta dell’ospite che diventa un passo dopo l’altro.','locale'),brief:'Gestisco un B&B e vorrei automatizzare check-in e messaggi agli ospiti'},
 {id:'botteghe',name:'Botteghe e marchi',who:'Chi vende un prodotto proprio, fatto o scelto da sé.',
  problem:'Il prodotto vive sul social e sui marketplace: scheda, taglia, spedizione e cliente non stanno in un posto tuo.',
  result:'La vetrina di legno e quella sul telefono mostrano gli stessi pezzi, e lo stock non si vende due volte.',
  buys:['e-commerce','product-photography','integrazioni','siti-premium','seo','ai-customer-support','conversion-optimization'],
  demo:demo('vetrina','Una vetrina da sfogliare, con un acquisto di prova.','bottega'),brief:'Ho una bottega e vorrei una vetrina online per il mio catalogo'},
 {id:'studi',name:'Avvocati e commercialisti',who:'Studi professionali con clienti ricorrenti e molta carta.',
  problem:'Il digitale entra per obbligo (fattura, firma), non per farsi trovare né per smettere di cercare un PDF.',
  result:'Il cliente carica i documenti e vede lo stato della pratica. La prima chiamata viene qualificata e finisce in agenda. Nessun parere automatico.',
  buys:['siti-premium','portali-clienti','seo','ai-receptionist','document-processing','knowledge-assistants','email-automation','lead-qualification','on-device-ai'],
  demo:demo('binario','Dalla prima richiesta di un cliente alla pratica avviata.','studio'),brief:'Sono uno studio professionale e vorrei un portale dove il cliente vede lo stato della pratica'},
 {id:'palestre',name:'Palestre e studi di movimento',who:'Centri indipendenti con corsi a posti limitati.',
  problem:'Iscrizione, certificato e «posso sospendere un mese?» passano da chat e fogli, e il sito non prenota il posto in sala.',
  result:'Il corso ha un tetto di posti. L’abbonamento si rinnova con un promemoria, non con un inseguimento.',
  buys:['siti-premium','membership','booking','scheduling','social-content','email-marketing','customer-retention','assistenti-ai','pose-tracking','digital-training-systems'],
  demo:demo('formati','Un messaggio del corso, in tre formati.'),brief:'Ho una palestra e vorrei iscrizioni e prenotazione dei corsi online'},
 {id:'immobiliari',name:'Agenzie immobiliari',who:'Agenzie indipendenti, con un lavoro locale.',
  problem:'Lead, visite e «ci sentiamo la settimana prossima» stanno in chat diverse.',
  result:'La richiesta dal sito diventa una visita in agenda, con promemoria. L’annuncio resta sul portale.',
  buys:['crm','crm-automation','siti-premium','lead-qualification','scheduling','ai-sales','email-automation','analytics'],
  demo:demo('binario','Dalla richiesta dal sito alla visita in agenda.','studio'),brief:'Ho un’agenzia immobiliare e vorrei che le richieste diventino visite in agenda'},
 {id:'laboratori',name:'Laboratori e manifatture',who:'Piccole produzioni su commessa.',
  problem:'Preventivo, approvazione, avanzamento e consegna stanno nella testa di una persona e in qualche foglio.',
  result:'Il cliente vede lo stato senza telefonare e il preventivo accettato diventa commessa senza essere ribattuto.',
  buys:['web-app','business-process-automation','document-processing','reporting','portali-clienti','knowledge-assistants','computer-vision-applications'],
  demo:demo('binario','Scrivi una richiesta e guarda i passi fino alla commessa.','generico',true),brief:'Ho un laboratorio e vorrei seguire le commesse senza fogli'},
 {id:'formazione',name:'Formazione a pagamento',who:'Chi vende corsi e percorsi, in aula o online.',
  problem:'Iscrizioni in mail, materiali in drive, «non trovo la lezione»: il sito presenta il corso e non fa entrare l’iscritto.',
  result:'La persona si iscrive, paga, entra e ritrova la lezione. Chi forma aggiorna un contenuto senza rigirare un video intero.',
  buys:['landing','membership','funnel','email-marketing','content-strategy','siti-premium','booking','digital-presenters','voiceover'],
  demo:demo('formati','Una lezione annunciata in più formati e lingue.'),brief:'Vendo corsi e vorrei una pagina di iscrizione con accesso ai materiali'},
 {id:'prodotto',name:'Chi ha già un prodotto digitale',who:'Chi è partito da un template e ora vuole il suo.',
  problem:'Pagamenti, ruoli e contenuti non stanno nello stesso posto, e il template non regge più.',
  result:'Un repository tuo, pubblicato dove vuoi. Ruoli e pagamenti stanno nel prodotto e puoi cambiare fornitore senza ricominciare.',
  buys:['saas','marketplace','web-app','api','integrazioni','dashboard','esperienze-immersive','agentic-workflows'],
  demo:demo('vetrina','Catalogo, ruoli e carrello in un prodotto solo.'),brief:'Ho già un prodotto digitale e vorrei passare dal template a un prodotto mio'},
];

/** The segments that buy something from this family, with the catalogue entries that tie them to it, in the order the
 * segment lists them. */
export function segmentsFor(family:Family):{segment:Segment;matched:Capability[]}[]{
 const byId=new Map(capabilities.map(c=>[c.id,c]));
 return segments.flatMap(segment=>{
  const matched=segment.buys.map(id=>byId.get(id)).filter((c):c is Capability=>c!==undefined&&c.family===family);
  return matched.length?[{segment,matched}]:[];
 });
}
