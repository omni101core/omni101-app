import {Visual} from './Visual';
import {media} from '../../content/media';

/** Three kinds of work, always labelled. No real client is declared yet: REALE stays empty until one agrees to be shown. */
export const KINDS={
 REALE:{label:'Progetto reale',tag:'PROGETTO REALE',text:'Lavoro per un cliente, pubblicato solo con il suo consenso.'},
 INTERNO:{label:'Progetto interno',tag:'PROGETTO INTERNO',text:'Strumenti costruiti dallo studio per lavorarci.'},
 CONCEPT:{label:'Concept',tag:'CONCEPT / DEMO',text:'Esplorazioni dimostrative: nessun cliente, nessuna metrica.'},
} as const;
export type KindId=keyof typeof KINDS;
export const kindOf=(type:string):KindId=>type==='REALE'?'REALE':type==='CONCEPT'?'CONCEPT':'INTERNO';

/** Real image from `content/media.ts` when one exists for this project, otherwise the original CSS visual. */
export function WorkMedia({index,kind,eager=false}:{index:number;kind:number;eager?:boolean}){
 const m=media.work[index];
 return m?<img className="work-media-img" src={m.src} alt={m.alt} width={m.w} height={m.h} loading={eager?'eager':'lazy'} decoding="async"/>:<Visual kind={kind} large/>;
}
