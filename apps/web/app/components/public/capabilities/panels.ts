import {capabilities,families,type Availability,type Capability,type Family} from '../../../content/capabilities';
import prezziPubblici from '../../../content/prezzi-pubblici.json';

export const familyOrder:Family[]=['BUILD','AUTOMATE','CREATE','GROW','EMERGING'];
export const availabilityLabel:Record<Availability,string>={DISPONIBILE:'Disponibile',SU_MISURA:'Su misura',SPERIMENTALE:'Sperimentale'};
export const availabilityNote:Record<Availability,string>={DISPONIBILE:'Lo realizziamo oggi.',SU_MISURA:'Si progetta insieme, caso per caso.',SPERIMENTALE:'In esplorazione: nessuna promessa di prodotto pronto.'};
const headlines:Record<Family,string>={BUILD:'Se puoi immaginarlo, possiamo costruirlo.',AUTOMATE:'Meno passaggi. Più possibilità.',CREATE:'Idee che si fanno notare. E ricordare.',GROW:'Un prodotto è solo l’inizio.',EMERGING:'Dove la tecnologia sta andando.'};
const featuredId:Record<Family,string>={BUILD:'e-commerce',AUTOMATE:'agentic-workflows',CREATE:'immagini-generative',GROW:'landing',EMERGING:'smart-camera-experiences'};

export interface FamilyPanel{family:Family;slug:string;name:string;title:string;claim:string;headline:string;featured:Capability;also:Capability[];count:number}

export const slugOf=(family:Family)=>family.toLowerCase();
export function familyFromSlug(slug:string|undefined):Family|null{return familyOrder.find(f=>slugOf(f)===slug)||null}
export const inFamily=(family:Family)=>capabilities.filter(c=>c.family===family);

export const panels:FamilyPanel[]=familyOrder.map(family=>{
 const list=inFamily(family),featured=list.find(c=>c.id===featuredId[family])||list[0];
 return {family,slug:slugOf(family),name:family,title:families[family].title,claim:families[family].claim,headline:headlines[family],featured,also:list.filter(c=>c!==featured).slice(0,3),count:list.length};
});

type Prodotto=keyof typeof prezziPubblici.prodotti;
// ponytail: euro only when the card title is that public product. No week counts: prezzi-pubblici.json has no tempi.
const prodottoDi:Partial<Record<string,Prodotto>>={'siti-premium':'sito_premium','e-commerce':'ecommerce',gestionale:'gestionale_su_misura','social-content':'social'};
const euro=(n:number)=>new Intl.NumberFormat('it-IT',{style:'currency',currency:prezziPubblici.valuta,maximumFractionDigits:0}).format(n);
export const tempiScheda='Tempi scritti nel preventivo, prima di iniziare.';
export function schedaPrezzo(id:string,availability:Availability='DISPONIBILE'){
 if(availability!=='DISPONIBILE')return {da:'Da definire nel preventivo',tempi:tempiScheda};
 const voce=prodottoDi[id]?prezziPubblici.prodotti[prodottoDi[id]!]:undefined;
 if(!voce)return {da:'Da definire nel preventivo',tempi:tempiScheda};
 const bits=[voce.daUnaTantum>0?euro(voce.daUnaTantum):'',voce.daMensile>0?euro(voce.daMensile)+' al mese':''].filter(Boolean);
 return {da:bits.length?'Da '+bits.join(' + '):'Da definire nel preventivo',tempi:tempiScheda};
}
export const cosaServe:Record<Availability,string>={
 DISPONIBILE:'Un referente e i materiali che hai già: testi, immagini, accessi. Il resto si scrive nel preventivo.',
 SU_MISURA:'Un caso concreto da progettare insieme. Non c’è un pacchetto pronto.',
 SPERIMENTALE:'Un caso da esplorare. Non è un prodotto pronto.'
};
const statiFiltro:(Availability|'ALL')[]=['ALL','DISPONIBILE','SU_MISURA','SPERIMENTALE'];
/** Hide a chip that matches Tutte. Hide the row when only Tutte would remain. */
export function filtriVisibili(counts:Record<Availability|'ALL',number>){
 const shown=statiFiltro.filter(s=>counts[s]>0&&!(s!=='ALL'&&counts[s]===counts.ALL));
 return shown.some(s=>s!=='ALL')?shown:[];
}
