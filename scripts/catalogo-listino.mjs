#!/usr/bin/env node
// ponytail: solo stdlib, spec minimo; percorsi fissi relativi alla cartella progetto
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const IN='src/data/prezzi.generated.json';
const DIVIETI=['apps','packages','docs','tests']; // cartelle del repo pubblicato: mai output lì

function numOk(v,etichetta){
  if(typeof v!=='number'||!Number.isFinite(v)||v<0) throw new Error(etichetta+': atteso numero finito >= 0');
}
export function convertiListino(json){
  if(typeof json?.generatoIl!=='string'||!json.generatoIl) throw new Error('generatoIl: attesa data non vuota');
  const prodotti=json.prodotti;
  if(!prodotti||typeof prodotti!=='object') throw new Error('file prezzi senza prodotti');
  const voci=Object.keys(prodotti).sort().map(id=>{
    if(!id) throw new Error('id vuoto nei prodotti');
    const p=prodotti[id];
    if(!p||typeof p.nome!=='string'||!p.nome.trim()) throw new Error('prodotto '+id+': nome non valido');
    numOk(p.unaTantum,id+'.unaTantum');
    numOk(p.mensile,id+'.mensile');
    numOk(p.tempiGiorni,id+'.tempiGiorni');
    const s=p.pianoSenzaAnticipo??null;
    let senzaAnticipo=null;
    if(s!=null){
      numOk(s.canone_mensile,id+'.pianoSenzaAnticipo.canone_mensile');
      numOk(s.durata_minima_mesi,id+'.pianoSenzaAnticipo.durata_minima_mesi');
      numOk(s.totale_durata_minima_mesi,id+'.pianoSenzaAnticipo.totale_durata_minima_mesi');
      senzaAnticipo={canoneMensileCents:Math.round(s.canone_mensile*100),durataMinimaMesi:s.durata_minima_mesi,totaleCents:Math.round(s.totale_durata_minima_mesi*100),nota:s.nota};
    }
    return {id,nome:p.nome,unaTantumCents:Math.round(p.unaTantum*100),mensileCents:Math.round(p.mensile*100),tempiGiorni:p.tempiGiorni,senzaAnticipo};
  });
  return {generatoIl:json.generatoIl,fonte:'motore prezzi',voci};
}

if(import.meta.url===pathToFileURL(process.argv[1]??'').href){
  try{
    const argv=process.argv.slice(2);
    let out=null;
    for(let i=0;i<argv.length;i++){
      if(argv[i]==='--out') out=argv[++i];
      else throw new Error('argomento non riconosciuto: '+argv[i]);
    }
    const json=convertiListino(JSON.parse(readFileSync(IN,'utf8')));
    let testo=JSON.stringify(json,null,2)+'\n';
    if(out==null){
      process.stdout.write(testo);
    }else{
      const rel=resolve(out).slice(resolve('').length+1).split(/[\\/]/)[0];
      if(DIVIETI.includes(rel)) throw new Error('--out bannato: il listino reale non deve finire in '+DIVIETI.join('/')+' (repo pubblicato)');
      mkdirSync(dirname(out),{recursive:true});
      writeFileSync(out,testo);
    }
  }catch(e){
    console.error('Errore: '+e.message);
    process.exit(1);
  }
}
