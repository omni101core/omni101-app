import {z} from 'zod';
// Shared by the form (browser) and /api/intake-drafts (worker): no React, no DOM at import time.
export const DRAFT_DAYS=14;
const KEY='omni:intake-draft';
const common={id:'when',label:'Entro quando ti serve?',options:['Appena possibile','Entro 1 mese','Entro 3 mesi','Senza fretta']} as const;
export type Question={readonly id:string;readonly label:string;readonly options?:readonly string[]};
export const projectTypes:readonly {id:string;label:string;questions:readonly Question[]}[]=[
 {id:'sito',label:'Sito o landing',questions:[{id:'existing',label:'Hai già un sito?',options:['Sì, da rifare','No, parto da zero']},{id:'pages',label:'Quante pagine ti immagini?',options:['Una sola','Fino a 5','Più di 5','Non so']}]},
 {id:'ecommerce',label:'Negozio online',questions:[{id:'products',label:'Quanti prodotti vuoi vendere?',options:['Meno di 20','20–200','Oltre 200','Non so']},{id:'channel',label:'Dove vendi oggi?'}]},
 {id:'app',label:'App o gestionale',questions:[{id:'users',label:'Chi la userà?',options:['Il mio team','I miei clienti','Entrambi']},{id:'tools',label:'Quali strumenti usi oggi?'}]},
 {id:'automazione',label:'Automazione di processi',questions:[{id:'task',label:'Quale attività vuoi alleggerire?'},{id:'frequency',label:'Ogni quanto la ripeti?',options:['Ogni giorno','Ogni settimana','Ogni mese']}]},
 {id:'contenuti',label:'Contenuti e brand',questions:[{id:'need',label:'Che cosa serve?',options:['Testi','Immagini e video','Identità visiva','Più cose']},{id:'identity',label:'Hai già logo o tono di voce?',options:['Sì','No']}]},
];
/** Deterministic: the questions follow the project type, nothing is inferred from free text. */
export const questionsFor=(type:string):readonly Question[]=>{const p=projectTypes.find(x=>x.id===type);return p?[...p.questions,common]:[]};

export const draftSchema=z.object({v:z.literal(1),express:z.boolean(),projectType:z.string().max(30),answers:z.record(z.string().max(40),z.string().max(500)).refine(a=>Object.keys(a).length<=12),services:z.array(z.string().max(80)).max(8),company:z.string().max(200),message:z.string().max(10000),budget:z.string().max(60)});
export type IntakeDraft=z.infer<typeof draftSchema>;
export const emptyDraft:IntakeDraft={v:1,express:false,projectType:'',answers:{},services:[],company:'',message:'',budget:''};
/** Unknown keys (name, email, consent…) are dropped by zod; answers outside the current questions are pruned. */
export function parseDraft(raw:unknown):IntakeDraft|null{const r=draftSchema.safeParse(raw);if(!r.success)return null;const ids=new Set(questionsFor(r.data.projectType).map(q=>q.id));return {...r.data,answers:Object.fromEntries(Object.entries(r.data.answers).filter(([k])=>ids.has(k)))}}
export const isEmpty=(d:IntakeDraft)=>!d.message.trim()&&!d.company.trim()&&!d.projectType&&!d.budget&&!d.services.length;

/** Full-mode message sent to /api/intake: the written text plus the adaptive answers, capped at the server limit. */
export function composeMessage(d:IntakeDraft){
 if(d.express)return d.message;
 const type=projectTypes.find(x=>x.id===d.projectType);
 const lines=type?['Tipo di progetto: '+type.label,...questionsFor(type.id).filter(q=>d.answers[q.id]?.trim()).map(q=>q.label+' '+d.answers[q.id].trim())]:[];
 const extra=lines.length?'\n\n'+lines.join('\n'):'';
 return d.message.slice(0,10000-extra.length)+extra;
}

// Browser side. Every storage and network call can fail: the form must keep working without them.
export function loadLocal():IntakeDraft|null{try{const s=JSON.parse(localStorage.getItem(KEY)||'null') as {savedAt?:number;draft?:unknown}|null;if(!s||typeof s.savedAt!=='number'||Date.now()-s.savedAt>DRAFT_DAYS*864e5)return null;return parseDraft(s.draft)}catch{return null}}
export function saveLocal(draft:IntakeDraft){try{localStorage.setItem(KEY,JSON.stringify({savedAt:Date.now(),draft}))}catch{}}
export function clearLocal(){try{localStorage.removeItem(KEY)}catch{}}
const req=(path:string,init?:RequestInit)=>fetch('/api/intake-drafts'+path,{headers:{'Content-Type':'application/json'},...init});
/** Creates the draft, or updates it when the token is still valid; returns the (possibly new) private token. */
export async function saveRemote(draft:IntakeDraft,token=''){const r=await req('',{method:'POST',body:JSON.stringify({token:token||undefined,draft})});if(!r.ok)throw new Error('draft '+r.status);return (await r.json() as {token:string}).token}
export async function loadRemote(token:string){const r=await req('/'+encodeURIComponent(token));if(!r.ok)return null;return parseDraft((await r.json() as {draft?:unknown}).draft)}
export const clearRemote=(token:string)=>req('/'+encodeURIComponent(token),{method:'DELETE'});
