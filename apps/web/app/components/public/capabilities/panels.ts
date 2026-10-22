import {capabilities,families,type Availability,type Capability,type Family} from '../../../content/capabilities';

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
