import type {Env} from './auth';
// Avviso email al founder per ogni lead nuovo. Best effort: senza binding
// (staging/test) salta; se l'invio fallisce il lead resta salvato. Oggetto fisso,
// nessun input utente negli header: i campi liberi vanno solo nel corpo.
export type LeadMail={id:string;name:string;email:string;message:string;services?:string[];budget?:string|null};
const flat=(s:string,n:number)=>s.replace(/[\r\n]+/g,' ').trim().slice(0,n);
const b64=(s:string)=>{let r='';for(const c of new TextEncoder().encode(s))r+=String.fromCharCode(c);return btoa(r).replace(/.{1,76}/g,'$&\r\n')};
// ponytail: lingua e offerta si leggono dalle righe "Language:"/"Offer:" del brief del form landing; assenti = n/d.
const riga=(m:string,k:string)=>m.match(new RegExp('^'+k+': (.+)$','m'))?.[1]??'';
export async function notifyLead(env:Env,lead:LeadMail){
 const to=env.LEAD_NOTIFY_TO;if(!env.NOTIFY_MAIL||!to)return;
 try{
  const {EmailMessage}=await import('cloudflare:email');
  const from='leads@omni101.app',nd='n/d';
  const servizio=lead.services?.length?lead.services.join(', '):riga(lead.message,'Offer');
  const text=['Nuova richiesta dal sito.','','Nome: '+flat(lead.name,120),'Email: '+flat(lead.email,200),'Servizio: '+(flat(servizio,200)||nd),'Budget: '+(flat(lead.budget??'',100)||nd),'Lingua pagina: '+(flat(riga(lead.message,'Language'),40)||nd),'Riferimento: '+lead.id,'','Dashboard: '+(env.PUBLIC_ORIGIN||'https://omni101.app')+'/admin/leads'].join('\r\n');
  const raw=['From: OMNI101 <'+from+'>','To: '+to,'Subject: Nuova richiesta dal sito','Message-ID: <'+lead.id+'@omni101.app>','Date: '+new Date().toUTCString(),'MIME-Version: 1.0','Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: base64','',b64(text)].join('\r\n');
  await env.NOTIFY_MAIL.send(new EmailMessage(from,to,raw));
 }catch(e){console.error('notify: invio fallito',e instanceof Error?e.name:'sconosciuto')}
}
