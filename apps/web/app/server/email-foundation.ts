import {digest,HttpError,type Env} from './auth';
// Consenso, suppression e invio unico. Nessun invio reale a destinatari esterni: il trasporto per i destinatari
// lo passa il chiamante; senza trasporto la mail viene rifiutata (NO_TRANSPORT). Nessun pixel, solo testo.
export type Purpose='richiesta_contatto'|'marketing_email';
export type SuppressionReason='UNSUBSCRIBE'|'OPT_OUT'|'BOUNCE'|'COMPLAINT'|'MANUAL';
const now=()=>Date.now();const id=()=>crypto.randomUUID();
const org=(env:Env)=>env.ORGANIZATION_ID||'omni101';
export const normEmail=(e:string)=>e.trim().toLowerCase();
// ponytail: forma minima, niente spazi/virgolette/CR/LF (header injection); la validazione vera e' z.email() all'ingresso.
export const validEmail=(e:string)=>e.length<=254&&/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(e);
const flat=(s:string,n:number)=>s.replace(/[\r\n]+/g,' ').trim().slice(0,n);
const st=(env:Env,sql:string,...v:(string|number|null)[])=>env.DB.prepare(sql).bind(...v);
const auditStmt=(env:Env,action:string,emailHash:string,details:unknown)=>st(env,"INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) VALUES(?,?,NULL,?,'email',?,?,?,?)",id(),org(env),action,emailHash,JSON.stringify(details),now(),now());

/** Consent as written by the form, per page language. Same wording as messages landing_form_consent_a + link + _b. */
export const CONSENT_TEXTS:Record<string,string>={
 'richiesta_contatto@2026-10-22:it':'Acconsento che OMNI101 usi questi dati per preparare la mia mini-demo e contattarmi, come descritto nell’informativa privacy.',
 'richiesta_contatto@2026-10-22:en':'I agree that OMNI101 may use these details to prepare my mini-demo and contact me, as described in the privacy notice.'};

export type ConsentInput={email:string;purpose:Purpose;text:string;version:string;source:string;sourceRef?:string};
/** Statements for a D1 batch: ledger row + audit row. Use inside a batch to stay atomic with the caller. */
export async function consentStatements(env:Env,c:ConsentInput){
 const email=normEmail(c.email);if(!validEmail(email))throw new HttpError(400,'Email non valida.');
 return [st(env,"INSERT INTO email_consents(id,organization_id,email,purpose,status,consent_text,text_version,source,source_ref,created_at,updated_at) VALUES(?,?,?,?,'GRANTED',?,?,?,?,?,?)",id(),org(env),email,c.purpose,c.text.slice(0,2000),c.version,c.source,c.sourceRef??null,now(),now()),
  auditStmt(env,'EMAIL_CONSENT_GRANTED',await digest(email),{purpose:c.purpose,version:c.version,source:c.source,sourceRef:c.sourceRef??null})]}
export async function recordConsent(env:Env,c:ConsentInput){await env.DB.batch(await consentStatements(env,c))}

export async function isSuppressed(env:Env,email:string){return !!await st(env,'SELECT 1 AS x FROM email_suppressions WHERE organization_id=? AND email=?',org(env),normEmail(email)).first()}
export async function hasConsent(env:Env,email:string,purpose:Purpose){
 const r=await st(env,'SELECT status FROM email_consents WHERE organization_id=? AND email=? AND purpose=? ORDER BY created_at DESC,rowid DESC LIMIT 1',org(env),normEmail(email),purpose).first<{status:string}>();return r?.status==='GRANTED'}
/** Opt-out / unsubscribe / bounce: one atomic batch. Suppression row, a WITHDRAWN event for every purpose seen, audit. Idempotent. */
export async function suppress(env:Env,email:string,reason:SuppressionReason,source:string){
 const e=normEmail(email);if(!validEmail(e))throw new HttpError(400,'Email non valida.');
 await env.DB.batch([st(env,'INSERT OR IGNORE INTO email_suppressions(id,organization_id,email,reason,source,created_at,updated_at) VALUES(?,?,?,?,?,?,?)',id(),org(env),e,reason,source,now(),now()),
  st(env,"INSERT INTO email_consents(id,organization_id,email,purpose,status,consent_text,text_version,source,source_ref,created_at,updated_at) SELECT lower(hex(randomblob(16))),?,?,purpose,'WITHDRAWN',NULL,NULL,?,NULL,?,? FROM (SELECT DISTINCT purpose FROM email_consents WHERE organization_id=? AND email=?)",org(env),e,source,now(),now(),org(env),e),
  auditStmt(env,'EMAIL_SUPPRESSED',await digest(e),{reason,source})])}

// Link firmato: HMAC-SHA256(org + email) con EMAIL_LINK_SECRET (secret del Worker, mai nel repo). Non scade: la disiscrizione deve funzionare sempre.
const enc=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const b64u=(s:string)=>{let r='';for(const c of enc.encode(s))r+=String.fromCharCode(c);return btoa(r).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64u=(s:string)=>{const p=s.replace(/-/g,'+').replace(/_/g,'/');const r=atob(p+'='.repeat((4-p.length%4)%4));return new TextDecoder().decode(Uint8Array.from(r,c=>c.charCodeAt(0)))};
const key=(env:Env,usage:'sign'|'verify')=>{if(!env.EMAIL_LINK_SECRET)throw new HttpError(503,'Link di disiscrizione non configurato.');return crypto.subtle.importKey('raw',enc.encode(env.EMAIL_LINK_SECRET),{name:'HMAC',hash:'SHA-256'},false,[usage])};
const payload=(env:Env,email:string)=>enc.encode(org(env)+'\n'+email);
export async function unsubscribeLink(env:Env,email:string){const e=normEmail(email);const sig=hex(await crypto.subtle.sign('HMAC',await key(env,'sign'),payload(env,e)));return (env.PUBLIC_ORIGIN||'https://omni101.app')+'/api/email/unsubscribe?e='+b64u(e)+'&s='+sig}
/** Returns the email when the signature matches, else null. crypto.subtle.verify compares in constant time. */
export async function verifyUnsubscribe(env:Env,e:string|null,s:string|null){
 if(!e||!s||!/^[0-9a-f]{64}$/.test(s))return null;let email:string;try{email=normEmail(unb64u(e))}catch{return null}if(!validEmail(email))return null;
 const sig=Uint8Array.from(s.match(/../g)!,h=>parseInt(h,16));return await crypto.subtle.verify('HMAC',await key(env,'verify'),sig,payload(env,email))?email:null}

const page=(body:string,status=200)=>new Response('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>OMNI101</title><body style="font-family:system-ui;max-width:32rem;margin:12vh auto;padding:0 1rem">'+body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'"}});
/** GET /api/email/unsubscribe shows a confirm button (scanners prefetch GETs); POST does it, also for one-click (RFC 8058). */
export async function handleEmailPublic(request:Request,env:Env):Promise<Response|null>{
 const url=new URL(request.url);if(url.pathname!=='/api/email/unsubscribe')return null;
 if(request.method!=='GET'&&request.method!=='POST')throw new HttpError(405,'Metodo non consentito.');
 const email=await verifyUnsubscribe(env,url.searchParams.get('e'),url.searchParams.get('s'));if(!email)return page('<h1>Link non valido</h1><p>Il link di disiscrizione non è valido. Scrivi a info@omni101.app.</p>',400);
 if(request.method==='GET')return page('<h1>Non vuoi più ricevere email?</h1><form method="post"><button type="submit">Conferma la disiscrizione</button></form>');
 await suppress(env,email,'UNSUBSCRIBE','link');return page('<h1>Fatto</h1><p>Non riceverai più email da OMNI101.</p>')}

export type Mail={to:string;subject:string;text:string;purpose:Purpose;kind:'founder'|'recipient'};
export type Transport=(m:{from:string;to:string;raw:string})=>Promise<void>;
export type SendResult={ok:true}|{ok:false;reason:'INVALID_RECIPIENT'|'NOT_FOUNDER'|'SUPPRESSED'|'NO_CONSENT'|'NO_LINK_SECRET'|'NO_TRANSPORT'|'FAILED'};
const FROM='leads@omni101.app';
const b64=(s:string)=>{let r='';for(const c of enc.encode(s))r+=String.fromCharCode(c);return btoa(r).replace(/.{1,76}/g,'$&\r\n')};
// Solo per la mail transazionale al founder, via il binding send_email gia' presente.
const founderTransport=(env:Env):Transport|null=>env.NOTIFY_MAIL?async m=>{const {EmailMessage}=await import('cloudflare:email');await env.NOTIFY_MAIL!.send(new EmailMessage(m.from,m.to,m.raw))}:null;
/** The only way to send. 'founder' = transactional to LEAD_NOTIFY_TO only. 'recipient' = needs purpose consent, no suppression, signed unsubscribe link, a caller-supplied transport. Every outcome is audited. */
export async function sendEmail(env:Env,mail:Mail,transport?:Transport):Promise<SendResult>{
 const to=normEmail(mail.to),hash=await digest(to),done=async(r:SendResult)=>{await auditStmt(env,r.ok?'EMAIL_SENT':'EMAIL_REFUSED',hash,{kind:mail.kind,purpose:mail.purpose,...(r.ok?{}:{reason:r.reason})}).run();return r};
 if(!validEmail(to))return done({ok:false,reason:'INVALID_RECIPIENT'});
 const head=['From: OMNI101 <'+FROM+'>','To: '+to,'Subject: '+flat(mail.subject,200),'Date: '+new Date().toUTCString(),'MIME-Version: 1.0','Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: base64'];let text=mail.text;let send:Transport|null;
 if(mail.kind==='founder'){if(!env.LEAD_NOTIFY_TO||to!==normEmail(env.LEAD_NOTIFY_TO))return done({ok:false,reason:'NOT_FOUNDER'});send=transport??founderTransport(env)}
 else{
  if(await isSuppressed(env,to))return done({ok:false,reason:'SUPPRESSED'});
  if(!await hasConsent(env,to,mail.purpose))return done({ok:false,reason:'NO_CONSENT'});
  if(!env.EMAIL_LINK_SECRET)return done({ok:false,reason:'NO_LINK_SECRET'});
  const link=await unsubscribeLink(env,to);head.push('List-Unsubscribe: <'+link+'>','List-Unsubscribe-Post: List-Unsubscribe=One-Click');text+='\r\n\r\nNon vuoi più ricevere email? Disiscriviti: '+link;send=transport??null}
 if(!send)return done({ok:false,reason:'NO_TRANSPORT'});
 try{await send({from:FROM,to,raw:head.join('\r\n')+'\r\n\r\n'+b64(text)})}catch(e){console.error('email: invio fallito',e instanceof Error?e.name:'sconosciuto');return done({ok:false,reason:'FAILED'})}
 return done({ok:true})}
