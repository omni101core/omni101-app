import {useState,type ChangeEvent} from 'react';
import {Panel} from './ProductUI';
export type CatalogAnticipo={canoneMensileCents:number;durataMinimaMesi:number;totaleCents:number;nota:string};
export type CatalogVoice={id:string;nome:string;unaTantumCents:number;mensileCents:number;tempiGiorni:number;senzaAnticipo:CatalogAnticipo|null};
export type Catalog={version:number|null;generatoIl?:string|null;importedAt?:string|null;importedBy?:string|null;voci:CatalogVoice[]};
type ImportResponse={version:number;voci?:number;duplicate?:boolean};
const money=(v:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(v/100);
const when=(v:string|null|undefined)=>v?new Date(v).toLocaleString('it-IT'):'non disponibile';
export default function PricingCatalog({catalog,loading,error,role,onImported}:{catalog:Catalog|null;loading:boolean;error:string;role:string|null|undefined;onImported:()=>void|Promise<void>}){
 const [importError,setImportError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const canImport=role==='OWNER'||role==='ADMIN';
 async function importFile(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];e.target.value='';
  if(!file)return;
  setBusy(true);setImportError('');setNotice('');
  try{
   const parsed=JSON.parse(await file.text()) as Partial<Catalog>;
   if(typeof parsed.generatoIl!=='string'||!Array.isArray(parsed.voci))throw new Error('File non valido: attesi generatoIl e voci.');
   if(parsed.voci.length===0)throw new Error('Il file non contiene voci di listino.');
   if(parsed.voci.length>200)throw new Error('Troppe voci: il massimo importabile è 200.');
   const r=await fetch('/api/pricing/catalog',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(parsed)});
   const d=await r.json() as ImportResponse&{error?:string};
   if(!r.ok)throw new Error(d.error||'Import non riuscito.');
   setNotice(d.duplicate?'Listino già importato in precedenza: nessuna nuova versione creata (v'+d.version+').':'Listino importato: v'+d.version+' con '+(d.voci??parsed.voci.length)+' voci.');
   await onImported()
  }catch(err){setImportError((err as Error).message)}finally{setBusy(false)}
 }
 return <Panel title="Listino" hint="Prezzi di riferimento del motore. Solo confronto: non cambiano il calcolo del preventivo. Il file non sta nel repo.">
  {canImport?<label className="os-field">Importa file JSON del listino<input type="file" accept="application/json,.json" disabled={busy} onChange={e=>void importFile(e)}/></label>:<p className="os-hint">Import riservato a OWNER e ADMIN. Puoi consultare le voci già caricate.</p>}
  {busy?<p role="status">Import in corso…</p>:null}
  {importError?<p className="os-error" role="alert">{importError}</p>:null}
  {notice?<p className="os-hint">{notice}</p>:null}
  {error?<p className="os-error" role="alert">{error}</p>:null}
  {loading?<p role="status">Caricamento listino…</p>:catalog?<CatalogTable catalog={catalog} canImport={canImport}/>:null}
 </Panel>
}
function CatalogTable({catalog,canImport}:{catalog:Catalog;canImport:boolean}){
 if(catalog.version===null)return <div>
  <p>Nessun listino in questa organizzazione.</p>
  <p className="os-hint">Per generare il file in locale (fuori dal repo):</p>
  <pre><code>node scripts/catalogo-listino.mjs &gt; listino.json</code></pre>
  {canImport?<p className="os-hint">Poi carica qui il JSON con «Importa file JSON del listino».</p>:<p className="os-hint">Chiedi a OWNER o ADMIN di importare il file generato.</p>}
 </div>;
 return <>
  <p className="os-hint">Versione v{catalog.version} · generata il {when(catalog.generatoIl)} · importata il {when(catalog.importedAt)} da {catalog.importedBy||'utente non indicato'}</p>
  {catalog.voci.length===0?<p>Versione presente ma senza voci. Reimporta il JSON del motore prezzi.</p>:<div className="os-pricing-costs"><table><caption>Voci del listino (riferimento)</caption><thead><tr><th>Voce</th><th>Una tantum</th><th>Mensile</th><th>Tempi (giorni)</th></tr></thead><tbody>{catalog.voci.map(v=><tr key={v.id}><td>{v.nome}{v.senzaAnticipo?<><br/><small>Senza anticipo: {money(v.senzaAnticipo.canoneMensileCents)} al mese per {v.senzaAnticipo.durataMinimaMesi} mesi · totale {money(v.senzaAnticipo.totaleCents)}</small></>:null}</td><td>{money(v.unaTantumCents)}</td><td>{money(v.mensileCents)}</td><td>{v.tempiGiorni}</td></tr>)}</tbody></table></div>}
 </>
}
