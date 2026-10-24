import {HttpError,type Env} from './auth';

// SANDBOX checkout: accepted proposal -> order -> client -> project. No payment provider; payment stays PENDING_BANK_TRANSFER.
export type OrderRow={id:string;mode:'SANDBOX';payment_status:string;amount_cents:number;currency:string;option_tier:string;reference:string;client_id:string;project_id:string;created_at:number};
const COLUMNS='id,mode,payment_status,amount_cents,currency,option_tier,reference,client_id,project_id,created_at';

export const loadOrder=(env:Env,orgId:string,by:'acceptance_id'|'quote_id',value:string)=>env.DB.prepare(`SELECT ${COLUMNS} FROM orders WHERE organization_id=? AND ${by}=?`).bind(orgId,value).first<OrderRow>();
// Customer-facing shape: no internal ids.
export const publicOrder=(row:OrderRow|null)=>row?{mode:row.mode,paymentStatus:row.payment_status,amountCents:row.amount_cents,currency:row.currency,reference:row.reference,createdAt:row.created_at}:null;

export async function createSandboxOrder(env:Env,orgId:string,acceptanceId:string):Promise<{order:OrderRow;created:boolean}>{
 const existing=await loadOrder(env,orgId,'acceptance_id',acceptanceId);
 if(existing)return {order:existing,created:false};
 const acc=await env.DB.prepare('SELECT a.quote_id,a.signer_name,a.signer_email,q.name AS quote_name,q.client_id FROM proposal_acceptances a JOIN quotes q ON q.id=a.quote_id AND q.organization_id=a.organization_id WHERE a.id=? AND a.organization_id=?').bind(acceptanceId,orgId).first<{quote_id:string;signer_name:string;signer_email:string;quote_name:string|null;client_id:string|null}>();
 if(!acc)throw new HttpError(404,'Accettazione non trovata.');
 // Reuse only the quote's own client. The e-mail typed in the public form is never matched to an existing client (anyone holding the link could attach the order to someone else's portal); otherwise a new contact + client, and staff merge by hand (task below).
 const clientId=acc.client_id;
 const orderId=crypto.randomUUID(),projectId=crypto.randomUUID(),contactId=crypto.randomUUID(),newClientId=crypto.randomUUID(),stamp=Date.now();
 const reference='PROP-'+acceptanceId.slice(0,8).toUpperCase(),finalClient=clientId??newClientId;
 // Every write is conditioned on "no order yet for this acceptance"; the unique index on orders is the last guard and rolls the whole batch back.
 const open='NOT EXISTS(SELECT 1 FROM orders WHERE acceptance_id=?)',made='EXISTS(SELECT 1 FROM orders WHERE id=?)';
 const statements=[
  ...(clientId?[]:[
   env.DB.prepare(`INSERT INTO contacts(id,organization_id,name,email,created_at,updated_at) SELECT ?,?,?,?,?,? WHERE ${open}`).bind(contactId,orgId,acc.signer_name,acc.signer_email,stamp,stamp,acceptanceId),
   env.DB.prepare(`INSERT INTO clients(id,organization_id,name,contact_id,status,created_at,updated_at) SELECT ?,?,?,?,'ACTIVE',?,? WHERE ${open}`).bind(newClientId,orgId,acc.signer_name,contactId,stamp,stamp,acceptanceId)
  ]),
  // Amount is read from the frozen acceptance snapshot (the approved price), never from the request.
  env.DB.prepare(`INSERT INTO projects(id,organization_id,name,client_id,description,budget_cents,status,visibility,created_at,updated_at) SELECT ?,a.organization_id,?,?,?,CAST(json_extract(a.option_snapshot,'$.setupCents') AS INTEGER),'PLANNING','CLIENT',?,? FROM proposal_acceptances a WHERE a.id=? AND a.organization_id=? AND ${open}`).bind(projectId,acc.quote_name||acc.quote_id,finalClient,'Ordine SANDBOX '+reference,stamp,stamp,acceptanceId,orgId,acceptanceId),
  env.DB.prepare(`INSERT INTO orders(id,organization_id,acceptance_id,quote_id,client_id,project_id,mode,payment_status,amount_cents,currency,option_tier,reference,created_at,updated_at) SELECT ?,a.organization_id,a.id,a.quote_id,?,?,'SANDBOX','PENDING_BANK_TRANSFER',CAST(json_extract(a.option_snapshot,'$.setupCents') AS INTEGER),'EUR',a.option_tier,?,?,? FROM proposal_acceptances a WHERE a.id=? AND a.organization_id=?`).bind(orderId,finalClient,projectId,reference,stamp,stamp,acceptanceId,orgId),
  env.DB.prepare(`UPDATE quotes SET client_id=COALESCE(client_id,?),project_id=COALESCE(project_id,?),updated_at=? WHERE id=? AND organization_id=? AND ${made}`).bind(finalClient,projectId,stamp,acc.quote_id,orgId,orderId),
  ...(clientId?[]:[env.DB.prepare(`INSERT INTO tasks(id,organization_id,name,project_id,priority,description,status,kind,created_at,updated_at) SELECT ?,?,?,?,'MEDIUM',?,'TODO','WORK',?,? WHERE ${made}`).bind(crypto.randomUUID(),orgId,'Verifica cliente / '+reference,projectId,'Cliente creato dai dati scritti nel modulo pubblico. Se esiste già in anagrafica, unisci a mano cliente e progetto.',stamp,stamp,orderId)]),
  env.DB.prepare(`INSERT INTO notifications(id,organization_id,name,body,status,created_at,updated_at) SELECT ?,?,?,?,'UNREAD',?,? WHERE ${made}`).bind(crypto.randomUUID(),orgId,'Ordine SANDBOX creato','Ordine di prova per «'+(acc.quote_name||acc.quote_id)+'» ('+reference+'): in attesa del bonifico. Cliente e progetto creati.',stamp,stamp,orderId),
  env.DB.prepare(`INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,NULL,'ORDER_CREATED_SANDBOX','orders',?,?,?,? WHERE ${made}`).bind(crypto.randomUUID(),orgId,orderId,JSON.stringify({acceptanceId,quoteId:acc.quote_id,clientId:finalClient,projectId,reference,mode:'SANDBOX',clientReused:!!clientId}),stamp,stamp,orderId)
 ];
 try{await env.DB.batch(statements)}catch{
  // A parallel call won the unique index and the batch rolled back: return the winner's order.
  const winner=await loadOrder(env,orgId,'acceptance_id',acceptanceId);
  if(winner)return {order:winner,created:false};
  throw new HttpError(500,'Ordine non creato.');
 }
 const order=await loadOrder(env,orgId,'acceptance_id',acceptanceId);
 if(!order)throw new HttpError(500,'Ordine non creato.');
 return {order,created:order.id===orderId};
}
