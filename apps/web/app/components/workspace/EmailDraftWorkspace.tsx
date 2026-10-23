import {useEffect,useId,useRef,useState,type FormEvent} from 'react';
import {Link} from 'react-router';
import {ActionButton,TextField,Panel,Feedback} from './ProductUI';
type Status='DRAFT'|'IN_REVIEW'|'APPROVED';
type Draft={id:string;version:number;status:Status;subject:string;preheader:string;body:string;ctaLabel:string;ctaUrl:string;campaignId:string|null;provider:null;sendingEnabled:false;account:null;savedIsApproval:false};
type Listed={id:string;version:number;status:Status;subject:string;campaignId:string|null};
type Fail=Error&{status?:number;draft?:Draft;localKept?:boolean};
type Sent={subject:string;preheader:string;body:string;ctaLabel:string;ctaUrl:string;campaignId:string|null};
const labels:Record<Status,string>={DRAFT:'Bozza',IN_REVIEW:'In revisione',APPROVED:'Approvata'};
async function call<T>(path:string,init?:RequestInit){
 const res=await fetch(path,{credentials:'same-origin',...init,headers:{'Content-Type':'application/json',...init?.headers}});
 const data=await res.json() as T&{error?:string;draft?:Draft;localKept?:boolean};
 if(!res.ok){const error=new Error(data.error||'Operazione non riuscita.') as Fail;error.status=res.status;error.draft=data.draft;error.localKept=data.localKept;throw error}
 return data;
}
export default function EmailDraftWorkspace({campaigns}:{campaigns:{id:string;name:string}[]}){
 const [rows,setRows]=useState<Listed[]>([]);
 const bodyId=useId(),exportId=useId();
 const [id,setId]=useState(''),[version,setVersion]=useState(0),[status,setStatus]=useState<Status>('DRAFT');
 const [subject,setSubject]=useState(''),[preheader,setPreheader]=useState(''),[body,setBody]=useState(''),[ctaLabel,setCtaLabel]=useState(''),[ctaUrl,setCtaUrl]=useState(''),[campaignId,setCampaignId]=useState('');
 const [html,setHtml]=useState(''),[text,setText]=useState(''),[dirty,setDirty]=useState(false),[serverDraft,setServerDraft]=useState<Draft|null>(null);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const live=useRef({subject,preheader,body,ctaLabel,ctaUrl,campaignId});
 live.current={subject,preheader,body,ctaLabel,ctaUrl,campaignId};
 const locked=status!=='DRAFT',frozen=locked||busy;
 function apply(draft:Draft,sent?:Sent){
  setId(draft.id);setVersion(draft.version);setStatus(draft.status);
  const now=live.current,same=!sent||(now.subject===sent.subject&&now.preheader===sent.preheader&&now.body===sent.body&&now.ctaLabel===sent.ctaLabel&&now.ctaUrl===sent.ctaUrl&&(now.campaignId||'')===(sent.campaignId||''));
  if(same){setSubject(draft.subject);setPreheader(draft.preheader);setBody(draft.body);setCtaLabel(draft.ctaLabel);setCtaUrl(draft.ctaUrl);setCampaignId(draft.campaignId||'');setDirty(false)}else setDirty(true);
  setServerDraft(null);
 }
 async function listed(){const data=await call<{drafts:Listed[]}>('/api/email-drafts');setRows(data.drafts)}
 async function preview(draftId:string){const data=await call<{html:string;text:string}>('/api/email-drafts/'+draftId+'/preview');setHtml(data.html);setText(data.text)}
 useEffect(()=>{let active=true;void call<{drafts:Listed[]}>('/api/email-drafts').then(data=>{if(active)setRows(data.drafts)}).catch(e=>{if(active)setError((e as Error).message)});return()=>{active=false}},[]);
 function askDiscard(){return !dirty||window.confirm('Ci sono modifiche non salvate. Scartarle?')}
 async function open(draftId:string,force=false){if(busy||(!force&&!askDiscard()))return;setBusy(true);setError('');setNotice('');try{const draft=await call<Draft>('/api/email-drafts/'+draftId);apply(draft);await preview(draft.id)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 function blank(){if(busy||!askDiscard())return;setId('');setVersion(0);setStatus('DRAFT');setSubject('');setPreheader('');setBody('');setCtaLabel('');setCtaUrl('');setCampaignId('');setHtml('');setText('');setDirty(false);setServerDraft(null);setError('');setNotice('')}
 function payload():Sent{return {subject,preheader,body,ctaLabel,ctaUrl,campaignId:campaignId||null}}
 async function save(e:FormEvent){e.preventDefault();if(busy||locked)return;const sent=payload();setBusy(true);setError('');setNotice('');try{
  const saved=id?await call<Draft>('/api/email-drafts/'+id,{method:'PATCH',body:JSON.stringify({...sent,version})}):await call<Draft>('/api/email-drafts',{method:'POST',body:JSON.stringify(sent)});
  apply(saved,sent);await preview(saved.id);await listed();setNotice('Bozza salvata. Non è approvata e non è stata inviata.');
 }catch(e){const fail=e as Fail;setError(fail.message);if(fail.localKept&&fail.draft)setServerDraft(fail.draft)}finally{setBusy(false)}}
 async function review(){if(!id||busy||dirty||locked)return;setBusy(true);setError('');setNotice('');try{const data=await call<Draft&{approvalId:string}>('/api/email-drafts/'+id+'/review',{method:'POST',body:JSON.stringify({version})});apply(data);await listed();setNotice('Richiesta di revisione registrata. Non è un’approvazione e non parte alcun invio.')}catch(e){const fail=e as Fail;setError(fail.message);if(fail.localKept&&fail.draft)setServerDraft(fail.draft)}finally{setBusy(false)}}
 return <Panel title="Bozze email" hint="Provider assente. Scrivi, rivedi ed esporta. Nessun account, nessun destinatario, nessun invio, nessun pixel.">
  <Feedback error={error} notice={notice}/>
  <p className="os-hint">Il salvataggio registra una bozza. Non la approva e non la invia. Stato: {labels[status]}{id?' · versione '+version:''}.</p>
  <div className="os-inline-actions"><ActionButton variant="secondary" disabled={busy} onClick={blank}>Nuova bozza</ActionButton>{id?<a className="os-button secondary" href={'/api/email-drafts/'+encodeURIComponent(id)+'/export?format=html'}>Scarica HTML</a>:null}{id?<a className="os-button secondary" href={'/api/email-drafts/'+encodeURIComponent(id)+'/export?format=text'}>Scarica testo</a>:null}{status==='IN_REVIEW'?<Link className="os-button secondary" to="/admin/approvals">Apri la decisione</Link>:null}</div>
  {rows.length?<ul className="os-priority-list">{rows.map(row=><li key={row.id}><button type="button" className="os-button secondary" disabled={busy} onClick={()=>void open(row.id)}>{row.subject}<small>{labels[row.status]} · v{row.version}</small></button></li>)}</ul>:<p>Nessuna bozza salvata.</p>}
  <form onSubmit={e=>void save(e)}>
   <TextField label="Oggetto" value={subject} onChange={e=>{setSubject(e.target.value);setDirty(true)}} required maxLength={200} disabled={frozen}/>
   <TextField label="Preheader" value={preheader} onChange={e=>{setPreheader(e.target.value);setDirty(true)}} maxLength={180} disabled={frozen}/>
   <div className="os-field"><label htmlFor={bodyId}>Testo</label><textarea id={bodyId} value={body} onChange={e=>{setBody(e.target.value);setDirty(true)}} required rows={8} maxLength={20000} disabled={frozen}/></div>
   <TextField label="Etichetta del pulsante" value={ctaLabel} onChange={e=>{setCtaLabel(e.target.value);setDirty(true)}} maxLength={80} disabled={frozen}/>
   <TextField label="Indirizzo https del pulsante" type="url" value={ctaUrl} onChange={e=>{setCtaUrl(e.target.value);setDirty(true)}} maxLength={2000} disabled={frozen} placeholder="https://"/>
   <label className="os-field">Campagna dello stesso workspace<select aria-label="Campagna collegata" value={campaignId} onChange={e=>{setCampaignId(e.target.value);setDirty(true)}} disabled={frozen}><option value="">Nessuna campagna</option>{campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   <div className="os-inline-actions"><ActionButton type="submit" busy={busy} disabled={locked}>Salva bozza</ActionButton><ActionButton variant="secondary" busy={busy} disabled={!id||dirty||locked} onClick={()=>void review()}>Chiedi revisione</ActionButton></div>
  </form>
  {serverDraft?<div role="status"><p>C’è una versione salvata più recente. Il testo qui sopra non è stato sostituito.</p><ActionButton variant="secondary" disabled={busy} onClick={()=>{if(busy||!askDiscard())return;void open(serverDraft.id,true)}}>Carica la versione salvata</ActionButton></div>:null}
  {dirty&&id?<p className="os-hint">Il testo nel modulo non è ancora quello salvato. L’anteprima mostra l’ultima versione registrata.</p>:null}
  {html?<><h3>Anteprima isolata</h3><iframe title="Anteprima isolata della bozza" sandbox="" srcDoc={html} style={{width:'100%',minHeight:280,border:'1px solid #d2b77b55',background:'#fff'}}/><div className="os-field"><label htmlFor={exportId}>Testo esportato</label><textarea id={exportId} readOnly value={text} rows={6}/></div></>:null}
 </Panel>;
}
