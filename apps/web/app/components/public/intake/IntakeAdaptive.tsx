import {DRAFT_DAYS,projectTypes,questionsFor} from './intake-draft';
type Props={type:string;answers:Record<string,string>;onType:(type:string)=>void;onAnswer:(id:string,value:string)=>void};
/** Optional questions that follow the project type. Existing form styles only. */
export function IntakeAdaptive({type,answers,onType,onAnswer}:Props){
 return <fieldset><legend>Che tipo di progetto è? (facoltativo)</legend>
  <label className="wide">Tipo di progetto<select value={type} onChange={e=>onType(e.target.value)}><option value="">Non so ancora</option>{projectTypes.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
  {questionsFor(type).map(q=><label className="wide" key={type+q.id}>{q.label}{q.options?<select value={answers[q.id]||''} onChange={e=>onAnswer(q.id,e.target.value)}><option value="">Da definire insieme</option>{q.options.map(o=><option key={o}>{o}</option>)}</select>:<input value={answers[q.id]||''} maxLength={500} onChange={e=>onAnswer(q.id,e.target.value)}/>}</label>)}
 </fieldset>;
}
type BarProps={status:'idle'|'saved'|'error';restored:boolean;link:string;onLink:()=>void;onDiscard:()=>void};
/** Says what is saved, where, and for how long; link and discard are explicit actions. */
export function IntakeDraftBar({status,restored,link,onLink,onDiscard}:BarProps){
 return <div className="wide mode-choice" role="group" aria-label="Bozza">
  <p role="status">{restored&&status==='idle'?'Abbiamo ripristinato la tua bozza. Nome, email e consenso vanno inseriti di nuovo.':status==='error'?'Bozza salvata su questo dispositivo. Il link non è aggiornato: non hai perso nulla.':status==='saved'?'Bozza salvata. Nome, email e consenso non vengono salvati. La conserviamo '+DRAFT_DAYS+' giorni.':'Mentre scrivi salviamo una bozza su questo dispositivo. Nome, email e consenso non vengono salvati.'}</p>
  <button type="button" className="button ghost" onClick={onLink}>Salva e riprendi con un link</button>
  <button type="button" className="button ghost" onClick={onDiscard}>Scarta la bozza</button>
  {link?<label className="wide">Link per riprendere (copiato negli appunti)<input readOnly value={link} onFocus={e=>e.currentTarget.select()}/></label>:null}
 </div>;
}
