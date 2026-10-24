import {z} from 'zod';
import {HttpError,requireRole,type Env,type Identity,type Role} from './auth';
const roles:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','SALES','FINANCE'];
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const bp=z.number().int().min(0).max(10000),money=z.number().int().min(0).max(100000000);
// Exact integer math: float division can misround above ~1e11 cents. ponytail: local BigInt, no dependency.
const mulDiv=(a:number,b:number,d:number)=>Number((BigInt(a)*BigInt(b)*2n+BigInt(d))/(BigInt(d)*2n));
const ceilDiv=(a:number,d:number)=>Number((BigInt(a)+BigInt(d)-1n)/BigInt(d));
export const pricingInput=z.object({
 name:z.string().trim().min(3).max(160),leadId:z.string().min(1).max(160).nullable(),clientId:z.string().min(1).max(160).nullable().default(null),currency:z.literal('EUR'),
 scope:z.string().trim().min(20).max(6000),terms:z.string().trim().min(10).max(4000),assumptions:z.string().trim().min(10).max(4000),
 lines:z.array(z.object({name:z.string().trim().min(2).max(160),category:z.enum(['LABOR','AI_API','INFRASTRUCTURE','THIRD_PARTY','PRODUCTION']),cadence:z.enum(['ONE_TIME','MONTHLY','ANNUAL','USAGE']),unit:z.string().trim().min(1).max(60),quantityMilli:z.number().int().min(1).max(1000000),unitCostCents:money}).strict()).min(1).max(40),
 overheadBp:bp,contingencyBp:bp,marginBp:z.number().int().min(0).max(9500),discountBp:bp,
 taxBp:bp.nullable(),taxNote:z.string().trim().max(500)
}).strict().superRefine((v,c)=>{if(v.taxBp!==null&&v.taxNote.length<10)c.addIssue({code:'custom',path:['taxNote'],message:'Documenta il trattamento fiscale scelto: nessuna aliquota è presunta.'});if(v.lines.some(l=>l.cadence==='USAGE'&&l.quantityMilli!==1000))c.addIssue({code:'custom',path:['lines'],message:'Il consumo si quota per una singola unità dichiarata, senza volume futuro presunto.'});if(new Set(v.lines.filter(l=>l.cadence==='USAGE').map(l=>l.unit)).size>1)c.addIssue({code:'custom',path:['lines'],message:'Usa una sola unità di consumo per preventivo, oppure separa le offerte.'})});
export type PricingInput=z.infer<typeof pricingInput>;
export function calculatePricing(input:PricingInput){
 // Integer cents/basis points, rounded per line. Inputs are bounded so intermediate products remain safe integers.
 const lines=input.lines.map(line=>({...line,costCents:mulDiv(line.unitCostCents,line.quantityMilli,1000)}));
 const groups=(['ONE_TIME','MONTHLY','ANNUAL','USAGE'] as const).flatMap(cadence=>{
  const selected=lines.filter(l=>l.cadence===cadence);if(!selected.length)return [];
  const directCents=selected.reduce((n,l)=>n+l.costCents,0);if(directCents>10000000000)throw new HttpError(400,'Costo aggregato oltre il limite per cadenza.');
  const overheadCents=mulDiv(directCents,input.overheadBp,10000),contingencyCents=mulDiv(directCents+overheadCents,input.contingencyBp,10000),adjustedCostCents=directCents+overheadCents+contingencyCents;
  const targetCents=ceilDiv(adjustedCostCents*10000,10000-input.marginBp),discountCents=mulDiv(targetCents,input.discountBp,10000),netCents=targetCents-discountCents;
  if(netCents>1000000000000)throw new HttpError(400,'Importo oltre il limite del preventivatore.');
  const taxCents=input.taxBp===null?null:mulDiv(netCents,input.taxBp,10000);
  return [{cadence,unit:cadence==='USAGE'?selected[0].unit:null,directCents,overheadCents,contingencyCents,adjustedCostCents,targetCents,discountCents,netCents,taxCents,totalCents:taxCents===null?null:netCents+taxCents,effectiveMarginBp:netCents?Math.round((netCents-adjustedCostCents)*10000/netCents):null,belowTarget:netCents<targetCents,belowCost:netCents<adjustedCostCents}];
 });
 return {method:'cost-margin-v1',currency:input.currency,rounding:'Arrotondamento al centesimo per riga; prezzo obiettivo arrotondato per eccesso.',formula:'(diretto + overhead + contingency) / (1 - margine). Sconto applicato dopo il prezzo obiettivo.',lines,groups,oneTimeNetCents:groups.find(g=>g.cadence==='ONE_TIME')?.netCents||0,combinedTotal:null,taxStatus:input.taxBp===null?'NOT_CONFIGURED':'USER_DECLARED',warning:'Stima interna: tariffe, margini, imposte e condizioni richiedono revisione umana. Cadenze diverse non vengono sommate.'};
}
async function body(request:Request,maxLength=32000){const raw=await request.text();if(raw.length>maxLength)throw new HttpError(413,'Richiesta troppo grande.');try{return JSON.parse(raw)}catch{throw new HttpError(400,'JSON non valido.')}}
type Version={id:string;organization_id:string;quote_id:string;version:number;lead_id:string|null;input:string;calculation:string;created_by:string;created_at:number};
const catalogInput=z.object({
 generatoIl:z.string().trim().min(1).max(64),fonte:z.literal('motore prezzi'),
 voci:z.array(z.object({
  id:z.string().trim().min(1).max(80),nome:z.string().trim().min(1).max(160),
  unaTantumCents:money,mensileCents:money,tempiGiorni:z.number().int().min(0).max(3650),
  senzaAnticipo:z.object({canoneMensileCents:money,durataMinimaMesi:z.number().int().min(1).max(120),totaleCents:money,nota:z.string().trim().max(500)}).strict().nullable()
 }).strict()).max(200)
}).strict();
type CatalogRow={version:number;generated_at:string;imported_by:string;created_at:number;payload:string};
export async function handlePricing(request:Request,env:Env,actor:Identity):Promise<Response|null>{
 const path=new URL(request.url).pathname;if(!path.startsWith('/api/pricing'))return null;requireRole(actor,roles);const org=actor.orgId,stamp=Date.now();
 const stmt=(sql:string,...params:(string|number|null)[])=>env.DB.prepare(sql).bind(...params);
 const audit=(action:string,id:string,details:unknown)=>stmt('INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) SELECT ?,?,?,?,\'quotes\',?,?,?,? WHERE changes()=1',crypto.randomUUID(),org,actor.id,action,id,JSON.stringify(details),stamp,stamp);
 if(path==='/api/pricing/preview'&&request.method==='POST')return json({calculation:calculatePricing(pricingInput.parse(await body(request))),persisted:false,sendingEnabled:false});
 if(path==='/api/pricing'&&request.method==='GET')return json({records:(await stmt('SELECT id,name,status,amount_cents,pricing_version,updated_at FROM quotes WHERE organization_id=? AND pricing_version IS NOT NULL ORDER BY updated_at DESC LIMIT 101',org).all()).results,sendingEnabled:false});
 if(path==='/api/pricing'&&request.method==='POST'){
  const data=z.object({quoteId:z.uuid(),requestId:z.uuid(),version:z.number().int().min(0),input:pricingInput}).strict().parse(await body(request)),input=JSON.stringify(data.input),calculation=calculatePricing(data.input);
  const version=()=>stmt('SELECT * FROM pricing_versions WHERE id=? AND organization_id=?',data.requestId,org).first<Version>();const same=(v:Version|null)=>v&&v.organization_id===org&&v.quote_id===data.quoteId&&v.input===input&&v.created_by===actor.id&&v.version===data.version+1;
  const old=await version();if(old){if(!same(old))throw new HttpError(409,'Identificativo già usato per una versione diversa.');return json({quoteId:data.quoteId,version:old.version,duplicate:true});}
  const quote=await stmt('SELECT pricing_version,status FROM quotes WHERE id=? AND organization_id=?',data.quoteId,org).first<{pricing_version:number|null;status:string}>();
  if(quote&&(quote.pricing_version!==data.version||!['DRAFT','REJECTED'].includes(quote.status))||!quote&&data.version!==0)throw new HttpError(409,'Versione superata o proposta in revisione/approvata. Ricarica prima di modificare.');
  if(data.input.leadId&&!await stmt('SELECT id FROM leads WHERE id=? AND organization_id=?',data.input.leadId,org).first())throw new HttpError(404,'Lead non disponibile nel workspace.');
  if(data.input.clientId&&!await stmt('SELECT id FROM clients WHERE id=? AND organization_id=?',data.input.clientId,org).first())throw new HttpError(404,'Cliente non disponibile nel workspace.');
  const statements=[];if(!quote)statements.push(stmt("INSERT OR IGNORE INTO quotes(id,organization_id,name,status,pricing_version,created_at,updated_at) SELECT ?,?,?,'DRAFT',0,?,? WHERE NOT EXISTS(SELECT 1 FROM pricing_versions WHERE id=?)",data.quoteId,org,data.input.name,stamp,stamp,data.requestId));
  statements.push(stmt("INSERT OR IGNORE INTO pricing_versions(id,organization_id,quote_id,version,lead_id,input,calculation,created_by,created_at) SELECT ?,?,?,?, ?,?,?,?,? FROM quotes WHERE id=? AND organization_id=? AND pricing_version=? AND status IN ('DRAFT','REJECTED')",data.requestId,org,data.quoteId,data.version+1,data.input.leadId,input,JSON.stringify(calculation),actor.id,stamp,data.quoteId,org,data.version));
  statements.push(stmt("UPDATE quotes SET name=?,client_id=?,scope=?,terms=?,assumptions=?,summary=?,amount_cents=?,status='DRAFT',pricing_version=?,updated_at=? WHERE id=? AND organization_id=? AND pricing_version=? AND status IN ('DRAFT','REJECTED') AND EXISTS(SELECT 1 FROM pricing_versions WHERE id=? AND organization_id=? AND quote_id=? AND version=?)",data.input.name,data.input.clientId,data.input.scope,data.input.terms,data.input.assumptions,'Proposta economica · importi netti: '+calculation.groups.map(g=>({ONE_TIME:'Una tantum',MONTHLY:'Al mese',ANNUAL:'All’anno',USAGE:'A consumo'}[g.cadence])+': '+new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(g.netCents/100)+(g.unit?' / '+g.unit:'')+' netti').join('; ')+'. Imposte: '+(data.input.taxBp===null?'non configurate':data.input.taxBp/100+'% dichiarato: '+data.input.taxNote)+'. Quote iniziali, ricorrenti e a consumo sono distinte: non rappresentano un unico importo da pagare.',calculation.oneTimeNetCents,data.version+1,stamp,data.quoteId,org,data.version,data.requestId,org,data.quoteId,data.version+1));
  statements.push(audit('PRICING_VERSION_SAVED',data.quoteId,{version:data.version+1,snapshotId:data.requestId}));
  await env.DB.batch(statements);if(!same(await version()))throw new HttpError(409,'Conflitto concorrente: nessuna versione sovrascritta.');return json({quoteId:data.quoteId,version:data.version+1},201);
 }
 if(path==='/api/pricing/catalog'&&request.method==='GET'){
  const row=await stmt('SELECT version,generated_at,imported_by,created_at,payload FROM pricing_catalog_versions WHERE organization_id=? ORDER BY version DESC LIMIT 1',org).first<CatalogRow>();
  if(!row)return json({version:null,voci:[]});
  const stored=JSON.parse(row.payload) as {voci:z.infer<typeof catalogInput>['voci']};
  return json({version:row.version,generatoIl:row.generated_at,importedAt:row.created_at,importedBy:row.imported_by,voci:stored.voci});
 }
 if(path==='/api/pricing/catalog'&&request.method==='POST'){
  requireRole(actor,['OWNER','ADMIN']);
  const data=catalogInput.parse(await body(request,600000));
  const duplicate=await stmt('SELECT version FROM pricing_catalog_versions WHERE organization_id=? AND generated_at=?',org,data.generatoIl).first<{version:number}>();
  if(duplicate)return json({version:duplicate.version,duplicate:true});
  const id=crypto.randomUUID();
  try{
   await env.DB.batch([
    stmt('INSERT INTO pricing_catalog_versions(id,organization_id,version,generated_at,payload,imported_by,created_at) SELECT ?,?,(SELECT COALESCE(MAX(version),0)+1 FROM pricing_catalog_versions WHERE organization_id=?),?,?,?,?',id,org,org,data.generatoIl,JSON.stringify(data),actor.id,stamp),
    stmt("INSERT INTO audit_logs(id,organization_id,user_id,action,resource_type,resource_id,details,created_at,updated_at) VALUES(?,?,?,'PRICING_CATALOG_IMPORTED','pricing_catalog',?,?,?,?)",crypto.randomUUID(),org,actor.id,id,JSON.stringify({generatoIl:data.generatoIl,voci:data.voci.length}),stamp,stamp)
   ]);
  }catch{throw new HttpError(409,'Importazione concorrente dello stesso listino: ricarica prima di riprovare.')}
  const saved=await stmt('SELECT version FROM pricing_catalog_versions WHERE id=? AND organization_id=?',id,org).first<{version:number}>();
  if(!saved)throw new HttpError(409,'Importazione concorrente dello stesso listino: ricarica prima di riprovare.');
  return json({version:saved.version,voci:data.voci.length},201);
 }
 if(path==='/api/pricing/catalog')throw new HttpError(405,'Operazione non supportata.');
 const match=path.match(/^\/api\/pricing\/([0-9a-f-]{36})(\/review)?$/i);if(!match)throw new HttpError(404,'Percorso non disponibile.');const quoteId=match[1];
 const quote=await stmt('SELECT id,name,status,pricing_version FROM quotes WHERE id=? AND organization_id=? AND pricing_version IS NOT NULL',quoteId,org).first<{id:string;name:string;status:string;pricing_version:number}>();if(!quote)throw new HttpError(404,'Preventivo non disponibile.');
 if(!match[2]&&request.method==='GET'){
  const versions=await stmt('SELECT * FROM pricing_versions WHERE quote_id=? AND organization_id=? ORDER BY version DESC LIMIT 100',quoteId,org).all<Version>();const rawVersion=new URL(request.url).searchParams.get('version');if(rawVersion!==null){const wanted=z.number().int().min(1).max(1000000000).parse(Number(rawVersion));if(!versions.results.some(v=>v.version===wanted)){const extra=await stmt('SELECT * FROM pricing_versions WHERE quote_id=? AND organization_id=? AND version=?',quoteId,org,wanted).first<Version>();if(!extra)throw new HttpError(404,'Versione non disponibile.');versions.results.push(extra)}}const reviews=(await stmt("SELECT a.id,a.status,a.reason,a.decided_by,a.decided_at,v.version AS pricingVersion FROM approvals a LEFT JOIN pricing_versions v ON a.id='pricing:'||v.id AND v.organization_id=a.organization_id AND v.quote_id=a.resource_id WHERE a.organization_id=? AND a.resource_type='quotes' AND a.resource_id=? ORDER BY a.created_at DESC LIMIT 100",org,quoteId).all()).results;return json({quote,reviews,versions:versions.results.map(v=>({...v,input:JSON.parse(v.input),calculation:JSON.parse(v.calculation)})),historyLimit:100,sendingEnabled:false});
 }
 if(match[2]&&request.method==='POST'){
  // tierVersions: other approved-together price versions of this quote for ESSENZIALE / COMPLETA (CONSIGLIATA is `version`). One request, one decision, one audit row per version.
  const tierVersion=z.number().int().min(1).optional();
  const data=z.object({version:z.number().int().min(1),riskReason:z.string().trim().max(2000).default(''),tierVersions:z.object({ESSENZIALE:tierVersion,COMPLETA:tierVersion}).strict().default({})}).strict().parse(await body(request));if(data.version!==quote.pricing_version)throw new HttpError(409,'Versione superata.');
  const snapshot=await stmt('SELECT * FROM pricing_versions WHERE quote_id=? AND organization_id=? AND version=?',quoteId,org,data.version).first<Version>();if(!snapshot)throw new HttpError(409,'Snapshot assente.');
  const approvalId='pricing:'+snapshot.id;const existing=await stmt('SELECT id,status FROM approvals WHERE id=? AND organization_id=?',approvalId,org).first();if(existing)return json({approval:existing,duplicate:true});
  const tiers:Record<string,{pricingVersion:number;snapshotId:string}>={},rows:Version[]=[snapshot];
  for(const [tier,v] of Object.entries(data.tierVersions)){
   if(v===undefined)continue;
   if(v===data.version||Object.values(tiers).some(t=>t.pricingVersion===v))throw new HttpError(400,'Ogni livello usa una versione di prezzo diversa.');
   const row=await stmt('SELECT * FROM pricing_versions WHERE quote_id=? AND organization_id=? AND version=?',quoteId,org,v).first<Version>();if(!row)throw new HttpError(409,'Versione di prezzo del livello '+tier+' assente.');
   if(await stmt('SELECT 1 FROM approvals WHERE id=? AND organization_id=?','pricing:'+row.id,org).first())throw new HttpError(409,'La versione del livello '+tier+' ha già una revisione.');
   tiers[tier]={pricingVersion:v,snapshotId:row.id};rows.push(row);
  }
  const computed=rows.map(r=>JSON.parse(r.calculation) as ReturnType<typeof calculatePricing>);const belowCost=computed.some(c=>c.groups.some(g=>g.belowCost)),belowTarget=computed.some(c=>c.groups.some(g=>g.belowTarget));if((belowCost||belowTarget)&&data.riskReason.length<10)throw new HttpError(400,'Documenta il motivo dello sconto o del prezzo sotto costo prima di chiedere approvazione.');
  const evidence=JSON.stringify({quoteId,pricingVersion:data.version,snapshotId:snapshot.id,belowCost,belowTarget,riskReason:data.riskReason,...(Object.keys(tiers).length?{tiers}:{}),...(snapshot.lead_id?{leadId:snapshot.lead_id}:{})});
  await env.DB.batch([
   stmt("UPDATE quotes SET status='IN_REVIEW',updated_at=? WHERE id=? AND organization_id=? AND pricing_version=? AND status='DRAFT'",stamp,quoteId,org,data.version),
   stmt("INSERT OR IGNORE INTO approvals(id,organization_id,name,status,resource_type,resource_id,evidence,requested_by,version,created_at,updated_at) SELECT ?,?,?,'PENDING','quotes',?,?,?,1,?,? WHERE changes()=1",approvalId,org,'Preventivo / '+quote.name,quoteId,evidence,actor.id,stamp,stamp),
   audit('PRICING_REVIEW_REQUESTED',quoteId,{approvalId,version:data.version,tiers})
  ]);
  const approval=await stmt('SELECT id,status FROM approvals WHERE id=? AND organization_id=?',approvalId,org).first();if(!approval)throw new HttpError(409,'La proposta non è una bozza disponibile per revisione.');return json({approval},201);
 }
 throw new HttpError(405,'Operazione non supportata.');
}
