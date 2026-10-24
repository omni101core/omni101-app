import {z} from 'zod';
import {digest,HttpError,requireRole,type Env,type Identity} from './auth';
import {createSandboxOrder,loadOrder,publicOrder} from './orders';

// Approved quote -> private customer link -> recorded acceptance. No email is sent: only state, task and in-app notification.
const STAFF=['OWNER','ADMIN','SALES'] as const;
const READERS=[...STAFF,'FINANCE','PROJECT_MANAGER'] as const;
const TIERS=['ESSENZIALE','CONSIGLIATA','COMPLETA'] as const;
const TTL=30*24*3600*1000;
type Tier=typeof TIERS[number];
type Option={tier:Tier;name:string;pricingVersion:number;currency:'EUR';setupCents:number;monthlyCents:number;minMonths:number|null;deliveryDays:number|null};
type Snapshot={quoteName:string;currency:'EUR';pricingVersion:number;scope:string;terms:string;options:Option[]};
type Row={id:string;quote_id:string;pricing_version:number;language:string;snapshot:string;expires_at:number;accepted_at:number|null;acceptance_id:string|null;option_snapshot:string|null};

const json=(value:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const org=(env:Env)=>env.ORGANIZATION_ID||'omni101';
const languageOf=(lead:{message:string|null;brief:string|null;language:string|null}|null)=>lead&&(lead.language==='en'||/^Language:\s*English/mi.test((lead.message||'')+'\n'+(lead.brief||'')))?'en':'it';
// `claim` is a SQL condition: the audit row exists only when the write it describes happened.
const audit=(env:Env,orgId:string,userId:string|null,action:string,quoteId:string,details:unknown,claim:string,...claimArgs:unknown[])=>{const stamp=Date.now();return env.DB.prepare(`INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,'quotes',?,?,?,? WHERE ${claim}`).bind(crypto.randomUUID(),orgId,userId,action,quoteId,JSON.stringify(details),stamp,stamp,...claimArgs)};
async function readBody(request:Request){const raw=await request.text();if(raw.length>8000)throw new HttpError(413,'Richiesta troppo grande.');if(!raw.trim())return {};try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}

// A tier names a price-list voice and, optionally, the approved pricing version of the same quote that backs it (default: the quote's own approved version).
const pick=z.union([z.string().min(1).max(80),z.object({voce:z.string().min(1).max(80),pricingVersion:z.number().int().min(1)}).strict()]);
const shareInput=z.object({options:z.object({ESSENZIALE:pick.optional(),CONSIGLIATA:pick.optional(),COMPLETA:pick.optional()}).strict().optional()}).strict();
const acceptInput=z.object({option:z.enum(TIERS),name:z.string().trim().min(2).max(120),role:z.string().trim().min(2).max(120),email:z.string().trim().email().max(200),termsAccepted:z.literal(true)}).strict();

// Approved price of one pricing version: setup (ONE_TIME) + monthly (MONTHLY). `unsupported` = ANNUAL/USAGE amounts the customer page cannot show yet (P24-05).
const amountsOf=(calculation:string)=>{const groups=(JSON.parse(calculation) as {groups:{cadence:string;netCents:number}[]}).groups,net=(c:string)=>groups.find(g=>g.cadence===c)?.netCents||0;return {setup:net('ONE_TIME'),monthly:net('MONTHLY'),unsupported:groups.some(g=>(g.cadence==='ANNUAL'||g.cadence==='USAGE')&&!!g.netCents)}};
const UNSUPPORTED='La versione approvata contiene importi annuali o a consumo: la proposta al cliente non li supporta ancora e non viene condivisa incompleta.';
// A version is approved when it is the quote's own current one (the quote is APPROVED, checked by the caller's gate) or has an APPROVED row in `approvals`. The snapshot is the pricing_versions row: one row per version, never recalculated.
async function approvedAmounts(env:Env,orgId:string,quoteId:string,version:number){
 const row=await env.DB.prepare("SELECT pv.calculation FROM pricing_versions pv WHERE pv.quote_id=? AND pv.organization_id=? AND pv.version=? AND (pv.version=(SELECT pricing_version FROM quotes WHERE id=pv.quote_id AND organization_id=pv.organization_id) OR EXISTS(SELECT 1 FROM approvals a WHERE a.id='pricing:'||pv.id AND a.organization_id=pv.organization_id AND a.status='APPROVED'))").bind(quoteId,orgId,version).first<{calculation:string}>();
 return row?amountsOf(row.calculation):null;
}

// Every tier carries its own approved snapshot (version + setup + monthly + EUR). Price-list voices only name a tier: their amounts must equal that version's approved ones, else 409. Nothing is invented here.
async function buildOptions(env:Env,orgId:string,quoteId:string,quoteVersion:number,calculation:string,requested?:Partial<Record<Tier,z.infer<typeof pick>>>):Promise<Option[]>{
 const picked=Object.entries(requested||{}).filter(([,id])=>id) as [Tier,z.infer<typeof pick>][];
 const own=amountsOf(calculation);
 if(own.unsupported)throw new HttpError(400,UNSUPPORTED);
 if(!picked.length){
  if(!own.setup&&!own.monthly)throw new HttpError(400,'La versione approvata non ha importi una tantum o mensili da proporre: scegli le voci di listino.');
  return [{tier:'CONSIGLIATA',name:'',pricingVersion:quoteVersion,currency:'EUR',setupCents:own.setup,monthlyCents:own.monthly,minMonths:null,deliveryDays:null}];
 }
 const catalog=await env.DB.prepare('SELECT payload FROM pricing_catalog_versions WHERE organization_id=? ORDER BY version DESC LIMIT 1').bind(orgId).first<{payload:string}>();
 const voci=catalog?(JSON.parse(catalog.payload) as {voci:{id:string;nome:string;unaTantumCents:number;mensileCents:number;tempiGiorni:number;senzaAnticipo:{durataMinimaMesi:number}|null}[]}).voci:[];
 const out:Option[]=[];
 for(const tier of TIERS){
  const want=requested?.[tier];if(!want)continue;
  const {voce:voceId,pricingVersion}=typeof want==='string'?{voce:want,pricingVersion:quoteVersion}:want;
  const voce=voci.find(v=>v.id===voceId);
  if(!voce)throw new HttpError(400,'Voce di listino non trovata per l’opzione '+tier+'.');
  const approved=pricingVersion===quoteVersion?own:await approvedAmounts(env,orgId,quoteId,pricingVersion);
  if(!approved)throw new HttpError(409,'L’opzione '+tier+' non ha una versione di prezzo approvata: serve una nuova approvazione.');
  if(approved.unsupported)throw new HttpError(400,UNSUPPORTED);
  if(voce.unaTantumCents!==approved.setup||voce.mensileCents!==approved.monthly)throw new HttpError(409,'L’opzione '+tier+' ha importi diversi dalla versione approvata: serve una nuova approvazione.');
  out.push({tier,name:voce.nome,pricingVersion,currency:'EUR',setupCents:voce.unaTantumCents,monthlyCents:voce.mensileCents,minMonths:voce.senzaAnticipo?.durataMinimaMesi??null,deliveryDays:voce.tempiGiorni});
 }
 return out;
}

export async function handleProposalStaff(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const match=new URL(request.url).pathname.match(/^\/api\/pricing\/([0-9a-f-]{36})\/proposal(\/share)?$/i);
 if(!match)return null;
 const quoteId=match[1],read=request.method==='GET';
 if(!['GET','POST','DELETE'].includes(request.method)||(read?!!match[2]:!match[2]))throw new HttpError(405,'Operazione non supportata.');
 requireRole(actor,read?[...READERS]:[...STAFF]);
 const quote=await env.DB.prepare('SELECT id,name,status,pricing_version,scope,terms FROM quotes WHERE id=? AND organization_id=? AND pricing_version IS NOT NULL').bind(quoteId,actor.orgId).first<{id:string;name:string;status:string;pricing_version:number;scope:string|null;terms:string|null}>();
 if(!quote)throw new HttpError(404,'Preventivo non disponibile.');
 const stamp=Date.now();
 if(read){
  const share=await env.DB.prepare('SELECT id,pricing_version,language,expires_at,revoked_at,created_at FROM proposal_shares WHERE quote_id=? AND organization_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1').bind(quoteId,actor.orgId).first<{id:string;pricing_version:number;language:string;expires_at:number;revoked_at:number|null;created_at:number}>();
  const acc=await env.DB.prepare('SELECT pricing_version,option_tier,option_snapshot,signer_name,signer_role,signer_email,accepted_at FROM proposal_acceptances WHERE quote_id=? AND organization_id=?').bind(quoteId,actor.orgId).first<{pricing_version:number;option_tier:string;option_snapshot:string;signer_name:string;signer_role:string;signer_email:string;accepted_at:number}>();
  const order=await loadOrder(env,actor.orgId,'quote_id',quoteId);
  return json({status:quote.status,order,share:share?{pricingVersion:share.pricing_version,language:share.language,createdAt:share.created_at,expiresAt:share.expires_at,revokedAt:share.revoked_at,active:share.revoked_at===null&&share.expires_at>stamp}:null,
   acceptance:acc?{pricingVersion:acc.pricing_version,option:JSON.parse(acc.option_snapshot),name:acc.signer_name,role:acc.signer_role,email:acc.signer_email,acceptedAt:acc.accepted_at}:null});
 }
 if(request.method==='DELETE'){
  // After acceptance the link is the customer's only view of the summary and payment details: keep it.
  if(await env.DB.prepare('SELECT 1 FROM proposal_acceptances WHERE quote_id=? AND organization_id=?').bind(quoteId,actor.orgId).first())throw new HttpError(409,'Proposta già accettata: il link non si revoca.');
  await env.DB.batch([env.DB.prepare('UPDATE proposal_shares SET revoked_at=? WHERE quote_id=? AND organization_id=? AND revoked_at IS NULL').bind(stamp,quoteId,actor.orgId),audit(env,actor.orgId,actor.id,'PROPOSAL_REVOKED',quoteId,{},'changes()=1')]);
  return json({shared:false});
 }
 if(quote.status!=='APPROVED')throw new HttpError(409,'Si può condividere solo un preventivo approvato e non ancora accettato.');
 const parsed=shareInput.safeParse(await readBody(request));
 if(!parsed.success)throw new HttpError(400,'Opzioni non valide.');
 const version=await env.DB.prepare('SELECT lead_id,calculation FROM pricing_versions WHERE quote_id=? AND organization_id=? AND version=?').bind(quoteId,actor.orgId,quote.pricing_version).first<{lead_id:string|null;calculation:string}>();
 if(!version)throw new HttpError(409,'Snapshot assente.');
 const lead=version.lead_id?await env.DB.prepare('SELECT message,brief,language FROM leads WHERE id=? AND organization_id=?').bind(version.lead_id,actor.orgId).first<{message:string|null;brief:string|null;language:string|null}>():null;
 const options=(await buildOptions(env,actor.orgId,quoteId,quote.pricing_version,version.calculation,parsed.data.options)).map(o=>({...o,name:o.name||quote.name}));
 const snapshot:Snapshot={quoteName:quote.name,currency:'EUR',pricingVersion:quote.pricing_version,scope:quote.scope||'',terms:quote.terms||'',options};
 const token=crypto.randomUUID(),shareId=crypto.randomUUID(),expiresAt=stamp+TTL;
 const gate="id=? AND organization_id=? AND status='APPROVED' AND pricing_version=?",gateArgs=[quoteId,actor.orgId,quote.pricing_version];
 // A new link replaces the previous one: older tokens stop working in the same batch. Every write re-checks that the quote is still APPROVED at this version.
 await env.DB.batch([
  env.DB.prepare(`UPDATE proposal_shares SET revoked_at=? WHERE quote_id=? AND organization_id=? AND revoked_at IS NULL AND EXISTS(SELECT 1 FROM quotes WHERE ${gate})`).bind(stamp,quoteId,actor.orgId,...gateArgs),
  env.DB.prepare(`INSERT INTO proposal_shares(id,organization_id,quote_id,pricing_version,token_hash,language,snapshot,expires_at,revoked_at,created_by,created_at) SELECT ?,?,?,?,?,?,?,?,NULL,?,? FROM quotes WHERE ${gate}`).bind(shareId,actor.orgId,quoteId,quote.pricing_version,await digest(token),languageOf(lead),JSON.stringify(snapshot),expiresAt,actor.id,stamp,...gateArgs),
  audit(env,actor.orgId,actor.id,'PROPOSAL_SHARED',quoteId,{shareId,pricingVersion:quote.pricing_version,tiers:options.map(o=>o.tier)},'EXISTS(SELECT 1 FROM proposal_shares WHERE id=?)',shareId)
 ]);
 if(!await env.DB.prepare('SELECT id FROM proposal_shares WHERE id=? AND organization_id=?').bind(shareId,actor.orgId).first())throw new HttpError(409,'Il preventivo non è più approvato a questa versione: nessun link creato.');
 return json({token,path:'/proposal/'+token,expiresAt},201);
}

// Bank details live in the organization settings, never in code. Without them the customer is told we write back.
async function payment(env:Env,orgId:string,acceptanceId:string,option:Option){
 const rows=await env.DB.prepare("SELECT name,value FROM settings WHERE organization_id=? AND name IN ('payment_iban','payment_account_holder')").bind(orgId).all<{name:string;value:string|null}>();
 const setting=(name:string)=>rows.results.find(r=>r.name===name)?.value?.trim()||null;
 return {method:'BANK_TRANSFER',iban:setting('payment_iban'),accountHolder:setting('payment_account_holder'),reference:'PROP-'+acceptanceId.slice(0,8).toUpperCase(),amountCents:option.setupCents};
}

async function loadShare(env:Env,token:string):Promise<Row>{
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))throw new HttpError(404,'Proposta non disponibile.');
 const row=await env.DB.prepare('SELECT s.id,s.quote_id,s.pricing_version,s.language,s.snapshot,s.expires_at,a.accepted_at,a.id AS acceptance_id,a.option_snapshot FROM proposal_shares s LEFT JOIN proposal_acceptances a ON a.quote_id=s.quote_id WHERE s.token_hash=? AND s.organization_id=? AND s.revoked_at IS NULL').bind(await digest(token.toLowerCase()),org(env)).first<Row>();
 // An expired link still shows an acceptance already made (payment instructions), never an open proposal.
 if(!row||(row.accepted_at===null&&row.expires_at<=Date.now()))throw new HttpError(404,'Proposta non disponibile.');
 return row;
}

// Public, unauthenticated: the token is the only key. Customer-facing snapshot only, no internal costs or margins.
export async function handlePublicProposal(request:Request,env:Env):Promise<Response>{
 const match=new URL(request.url).pathname.match(/^\/api\/proposal\/([^/]+?)(\/accept|\/checkout)?$/);
 if(!match)throw new HttpError(404,'Proposta non disponibile.');
 const headers={'x-robots-tag':'noindex, nofollow','referrer-policy':'no-referrer'};
 if(request.method==='GET'&&!match[2]){
  const row=await loadShare(env,match[1]);
  const accepted=row.acceptance_id&&row.option_snapshot?{acceptedAt:row.accepted_at,option:JSON.parse(row.option_snapshot) as Option,payment:await payment(env,org(env),row.acceptance_id,JSON.parse(row.option_snapshot)),order:publicOrder(await loadOrder(env,org(env),'acceptance_id',row.acceptance_id))}:null;
  return json({language:row.language==='en'?'en':'it',proposal:JSON.parse(row.snapshot),expiresAt:row.expires_at,accepted},200,headers);
 }
 if(request.method!=='POST'||!match[2])throw new HttpError(405,'Operazione non supportata.');
 const row=await loadShare(env,match[1]);
 if(match[2]==='/checkout'){
  // SANDBOX checkout: no payment provider. Amount comes from the stored acceptance; a repeated call returns the same order.
  if(!row.acceptance_id)return json({error:'Accetta prima la proposta.'},409,headers);
  const {order,created}=await createSandboxOrder(env,org(env),row.acceptance_id);
  return json({order:publicOrder(order)},created?201:200,headers);
 }
 if(row.acceptance_id)return json({error:'Proposta già accettata.'},409,headers);
 const data=acceptInput.safeParse(await readBody(request));
 if(!data.success)throw new HttpError(400,'Compila nome, ruolo, email e conferma la presa visione dei termini.');
 const option=(JSON.parse(row.snapshot) as Snapshot).options.find(o=>o.tier===data.data.option);
 if(!option)throw new HttpError(400,'Opzione non disponibile in questa proposta.');
 // The chosen option must still equal the approved snapshot of its own pricing version: a tampered or stale option is never accepted.
 const approved=await approvedAmounts(env,org(env),row.quote_id,option.pricingVersion??row.pricing_version);
 if(!approved||approved.unsupported||(option.currency&&option.currency!=='EUR')||approved.setup!==option.setupCents||approved.monthly!==option.monthlyCents)return json({error:'L’opzione scelta non corrisponde più alla versione di prezzo approvata: serve una nuova approvazione.'},409,headers);
 const quote=await env.DB.prepare('SELECT name FROM quotes WHERE id=? AND organization_id=?').bind(row.quote_id,org(env)).first<{name:string}>();
 const acceptanceId=crypto.randomUUID(),stamp=Date.now(),ipHash=await digest(org(env)+':'+(request.headers.get('cf-connecting-ip')||'local'));
 const claim='EXISTS(SELECT 1 FROM proposal_acceptances WHERE id=?)';
 // The acceptance row is the claim: it needs a live share and a quote still APPROVED at the shared version, and quote_id is unique. A parallel second attempt fails the whole batch.
 try{
  await env.DB.batch([
   env.DB.prepare("INSERT INTO proposal_acceptances(id,organization_id,quote_id,share_id,pricing_version,option_tier,option_snapshot,proposal_snapshot,signer_name,signer_role,signer_email,terms_accepted,ip_hash,accepted_at) SELECT ?,?,s.quote_id,s.id,s.pricing_version,?,?,s.snapshot,?,?,?,1,?,? FROM proposal_shares s JOIN quotes q ON q.id=s.quote_id AND q.organization_id=s.organization_id WHERE s.id=? AND s.organization_id=? AND s.revoked_at IS NULL AND s.expires_at>? AND q.status='APPROVED' AND q.pricing_version=s.pricing_version").bind(acceptanceId,org(env),option.tier,JSON.stringify(option),data.data.name,data.data.role,data.data.email,ipHash,stamp,row.id,org(env),stamp),
   env.DB.prepare(`UPDATE quotes SET status='ACCEPTED',updated_at=? WHERE id=? AND organization_id=? AND status='APPROVED' AND ${claim}`).bind(stamp,row.quote_id,org(env),acceptanceId),
   env.DB.prepare(`INSERT INTO tasks(id,organization_id,name,priority,description,status,kind,created_at,updated_at) SELECT ?,?,?,'HIGH',?,'TODO','WORK',?,? WHERE ${claim}`).bind(crypto.randomUUID(),org(env),'Avvio progetto / '+(quote?.name||row.quote_id),'Proposta accettata dal cliente, opzione '+option.tier+'. Referente e dati nella scheda del preventivo. Pagamento: bonifico.',stamp,stamp,acceptanceId),
   env.DB.prepare(`INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) SELECT ?,?,?,?,'UNREAD',?,? WHERE ${claim}`).bind(crypto.randomUUID(),org(env),'Proposta accettata','Il cliente ha accettato «'+(quote?.name||row.quote_id)+'» (opzione '+option.tier+'). Controlla il bonifico e avvia il progetto.',stamp,stamp,acceptanceId),
   audit(env,org(env),null,'PROPOSAL_ACCEPTED',row.quote_id,{acceptanceId,shareId:row.id,option:option.tier},claim,acceptanceId)
  ]);
 }catch{
  // Only a stored acceptance means "already accepted"; any other failure is retryable and records nothing.
  const existing=await env.DB.prepare('SELECT 1 FROM proposal_acceptances WHERE quote_id=? AND organization_id=?').bind(row.quote_id,org(env)).first().catch(()=>null);
  return existing?json({error:'Proposta già accettata.'},409,headers):json({error:'Servizio momentaneamente non disponibile: riprova tra poco.'},503,{...headers,'retry-after':'5'});
 }
 if(!await env.DB.prepare('SELECT id FROM proposal_acceptances WHERE id=? AND organization_id=?').bind(acceptanceId,org(env)).first())return json({error:'Proposta non più disponibile.'},409,headers);
 return json({acceptedAt:stamp,option,payment:await payment(env,org(env),acceptanceId,option)},201,headers);
}
