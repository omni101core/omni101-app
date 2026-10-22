import {useId,useState} from 'react';
import {Link} from 'react-router';
import {Visual} from '../public/Visual';
import {Stato} from './Stato';
import {TiPuoServire} from './TiPuoServire';
import type {StatoDemo} from './logica';
import './showcase.css';

export const prodotti=[{id:'essenza',name:'Essenza / Eau de Studio',price:68,kind:2,variants:['Originale','Legno','Agrumi']},{id:'forma',name:'Forma / Oggetto da studio',price:42,kind:0,variants:['Champagne','Grafite','Avorio']},{id:'traccia',name:'Traccia / Taccuino creativo',price:24,kind:4,variants:['Avorio','Oliva','Nero']}];
type Riga={id:string;variant:string;quantity:number};

/** The shop of the Commerce demo. `ritaglio` (home, explore) = search + one object + cart; full = whole catalogue, dashboard included. */
export function Vetrina({ritaglio=false,stato='SIMULATA',chiusura=true}:{ritaglio?:boolean;stato?:StatoDemo;chiusura?:boolean}){
 const id=useId(),[query,setQuery]=useState(''),[varianti,setVarianti]=useState<Record<string,string>>({}),[carrello,setCarrello]=useState<Riga[]>([]),[dettaglio,setDettaglio]=useState<string|null>(null);
 const idCarrello=ritaglio?id+'-carrello':'demo-cart';
 const trovati=prodotti.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())),mostrati=ritaglio?trovati.slice(0,1):trovati;
 const trova=(pid:string)=>prodotti.find(p=>p.id===pid)!;
 const totale=carrello.reduce((somma,r)=>somma+trova(r.id).price*r.quantity,0),pezzi=carrello.reduce((somma,r)=>somma+r.quantity,0);
 function aggiungi(pid:string){
  const variant=varianti[pid]||trova(pid).variants[0]!;
  setCarrello(c=>c.some(x=>x.id===pid&&x.variant===variant)?c.map(x=>x.id===pid&&x.variant===variant?{...x,quantity:x.quantity+1}:x):[...c,{id:pid,variant,quantity:1}]);
 }
 return <div className="demo-surface sc-vetrina" data-showcase="vetrina" data-ritaglio={ritaglio}>
  {ritaglio&&<header className="sc-testa"><span className="eyebrow">Vetrina</span><Stato stato={stato} nota="nessun pagamento, nessun ordine"/></header>}
  <div className="demo-toolbar"><span className="wordmark">ESSENZA<span> / STUDIO</span></span><input aria-label="Cerca prodotti" placeholder="Cerca nel catalogo…" value={query} onChange={e=>setQuery(e.target.value)}/><a className="text-link" href={'#'+idCarrello}>Carrello ({pezzi}) ↓</a></div>
  <div className="product-grid">{mostrati.map(p=><article className="product-card" key={p.id}>
   <button style={{padding:0,border:0,width:'100%',background:'transparent'}} onClick={()=>setDettaglio(dettaglio===p.id?null:p.id)} aria-label={'Dettaglio '+p.name}><Visual kind={p.kind}/></button>
   <h3>{p.name}<span className="product-price">€ {p.price}</span></h3>
   {dettaglio===p.id&&<p className="demo-note">Oggetto concept dello studio Essenza. Anteprima dimostrativa: nessun prodotto è in vendita. Scegli la variante per esplorare il comportamento del carrello.</p>}
   <label className="demo-note">Variante <select className="form-input" aria-label={'Variante '+p.name} value={varianti[p.id]||p.variants[0]} onChange={e=>setVarianti(v=>({...v,[p.id]:e.target.value}))}>{p.variants.map(v=><option key={v}>{v}</option>)}</select></label>
   <button className="button ghost" onClick={()=>aggiungi(p.id)}>Aggiungi al carrello +</button>
  </article>)}{!mostrati.length&&<p className="demo-note">Nessun oggetto con questo nome.</p>}</div>
  <section className="cart-panel" id={idCarrello} aria-live="polite">
   <h2 style={{fontSize:ritaglio?18:24,fontWeight:400}}>Il tuo carrello dimostrativo</h2>
   {carrello.length?carrello.map((r,i)=><div className="cart-line" key={r.id+r.variant}><span>{trova(r.id).name} / {r.variant}</span><div><button aria-label={'Riduci quantità '+r.id} onClick={()=>setCarrello(old=>old.map((x,j)=>i===j?{...x,quantity:x.quantity-1}:x).filter(x=>x.quantity>0))}>−</button> {r.quantity} <button aria-label={'Aumenta quantità '+r.id} onClick={()=>setCarrello(old=>old.map((x,j)=>i===j?{...x,quantity:x.quantity+1}:x))}>+</button></div></div>):<p className="demo-note">Aggiungi un oggetto per esplorare il carrello.</p>}
   <p>Totale demo: € {totale}</p>
   <p className="demo-note">Nessun checkout reale. I dati del carrello sono mantenuti solo durante questa visita.</p>
  </section>
  {ritaglio?<p><Link className="text-link" to="/explore/commerce">Apri il negozio intero ↗</Link></p>:<div className="demo-sales" aria-label="Dashboard con dati sintetici"><div><span>RICAVI / DATI SINTETICI</span><strong>€ 8.240</strong></div><div><span>ORDINI / DATI SINTETICI</span><strong>126</strong></div><div><span>CONVERSIONE / SIMULATA</span><strong>2,8%</strong></div></div>}
  {chiusura&&<TiPuoServire servizio="vetrina"/>}
 </div>;
}
