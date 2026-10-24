import {useEffect,useState} from 'react';
type Item={type:'stage'|'note'|'created';id:string;title:string;detail:string|null;actor:string|null;at:number};
const LABEL={stage:'cambio fase',note:'nota',created:'creazione'};
export default function LeadHistory({resource,id}:{resource:'leads'|'deals';id:string}){
 const [items,setItems]=useState<Item[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;setLoading(true);setError('');void fetch('/api/crm/'+resource+'/'+encodeURIComponent(id)+'/history').then(async res=>{const data=await res.json() as {items?:Item[];error?:string};if(!active)return;if(!res.ok){setError(String(data.error||'Storico non disponibile'));setItems([]);return}setItems(data.items||[])}).catch(()=>{if(active)setError('Storico non disponibile')}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[resource,id]);
 const fmt=(ms:number)=>new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(ms));
 return <section className="os-timeline" aria-labelledby="os-history-title"><h3 id="os-history-title">Storico attività</h3>{loading&&<p role="status" className="os-hint">Caricamento storico…</p>}{error&&<p role="alert" className="os-error">{error}</p>}{!loading&&!error&&<ul>{items.map(it=><li key={it.type+'-'+it.id}><time dateTime={new Date(it.at).toISOString()}>{fmt(it.at)}</time><div><strong>{it.title.replaceAll('_',' ')}</strong><span className="os-badge">{LABEL[it.type]}</span>{it.detail?<p className="os-hint">{it.type==='stage'?'Motivo: ':''}{it.detail}</p>:null}{it.actor?<small>{it.actor}</small>:null}</div></li>)}</ul>}</section>;
}
