import { createRemoteJWKSet, jwtVerify } from 'jose';
export interface Env { DB: D1Database; BUILD_REVISION?:string; AGENCY_WORKFLOW?: Workflow<{runId:string;orgId:string}>; ENVIRONMENT?: string; TURNSTILE_TEST_MODE?: string; MEDIA?: R2Bucket; QUEUE?: Queue; INTAKE_WORKFLOW?: Workflow<{leadId:string;orgId:string}>; ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string; ACCESS_MFA_ENFORCED?: string; ORGANIZATION_ID?: string; TURNSTILE_SECRET_KEY?: string; TURNSTILE_SITE_KEY?: string; AI_INPUT_CENTS_PER_MILLION?: string; AI_OUTPUT_CENTS_PER_MILLION?: string; BOOTSTRAP_OWNER_EMAIL?: string; PUBLIC_ORIGIN?: string; AI_API_KEY?: string; AI_MODEL?: string; AI_PROVIDER?: string; AI_MONTHLY_BUDGET_CENTS?: string; }
export type Role = 'OWNER'|'ADMIN'|'PROJECT_MANAGER'|'DEVELOPER'|'DESIGNER'|'SALES'|'FINANCE'|'CLIENT'|'AGENT_SERVICE_ACCOUNT';
export interface Identity { id:string; email:string; name:string; orgId:string; role:Role; clientId:string|null }
export class HttpError extends Error { constructor(public status:number,message:string){super(message)} }
const keys = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export async function verifiedEmail(request:Request,env:Env):Promise<{email:string;sub:string}> {
 if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD||env.ACCESS_MFA_ENFORCED!=='true') throw new HttpError(503,'Accesso gestito e MFA non ancora configurati.');
 const domain=env.ACCESS_TEAM_DOMAIN.replace(/^https:\/\//,'').replace(/\/$/,'');
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)) throw new HttpError(503,'Configurazione identità non valida.');
 const token=request.headers.get('Cf-Access-Jwt-Assertion'); if(!token) throw new HttpError(401,'Accedi con la tua identità autorizzata.');
 try { let key=keys.get(domain); if(!key){key=createRemoteJWKSet(new URL(`https://${domain}/cdn-cgi/access/certs`));keys.set(domain,key)}
 const {payload}=await jwtVerify(token,key,{issuer:`https://${domain}`,audience:env.ACCESS_AUD,algorithms:['RS256']});
 if(typeof payload.email!=='string'||typeof payload.sub!=='string') throw new Error('identity');
 return {email:payload.email.toLowerCase(),sub:payload.sub};
 }catch{throw new HttpError(401,'Sessione non valida o scaduta.');}
}
export async function authenticate(request:Request,env:Env):Promise<Identity>{
 const sessionToken=request.headers.get('Cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith('__Host-omni_session='))?.slice('__Host-omni_session='.length);
 if(sessionToken){const row=await env.DB.prepare("SELECT u.id,u.email,u.name,m.organization_id AS orgId,m.role,m.client_id AS clientId FROM sessions s JOIN users u ON u.id=s.user_id JOIN memberships m ON m.user_id=u.id AND m.organization_id=s.organization_id WHERE s.token_hash=? AND s.organization_id=? AND s.expires_at>? AND s.revoked_at IS NULL AND u.status='ACTIVE' AND m.status='ACTIVE'").bind(await digest(sessionToken),env.ORGANIZATION_ID||'omni101',Date.now()).first<Identity>();if(row)return row;throw new HttpError(401,'Sessione scaduta o revocata.');}
 if(!env.ACCESS_TEAM_DOMAIN)throw new HttpError(401,'Accedi con la tua passkey personale.');
 const identity=await verifiedEmail(request,env);
 const row=await env.DB.prepare('SELECT u.id,u.email,u.name,m.organization_id AS orgId,m.role,m.client_id AS clientId FROM users u JOIN memberships m ON m.user_id=u.id WHERE lower(u.email)=? AND m.organization_id=? AND m.status=\'ACTIVE\' AND u.status=\'ACTIVE\'').bind(identity.email,env.ORGANIZATION_ID||'omni101').first<Identity>();
 if(!row) throw new HttpError(403,'Questa identità non dispone di un invito attivo.'); return row;
}
export function requireRole(identity:Identity,roles:Role[]){if(!roles.includes(identity.role))throw new HttpError(403,'Il tuo ruolo non autorizza questa operazione.');}
export function assertSameOrigin(request:Request){const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin)throw new HttpError(403,'Origine della richiesta non valida.');}
export async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}

export function decodePathId(value:string){try{return decodeURIComponent(value)}catch{throw new HttpError(400,'Identificativo non valido.')}}

// Template di ruolo (REC-018): restringono un ruolo base esistente, non aggiungono permessi.
// Le capacità rispecchiano i requireRole già presenti in api.ts, pricing.ts, workflow-runtime.ts, operating-backlog.ts.
export const INTERNAL_ROLES:Role[]=['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE'];
export const CAPABILITIES={invite:['OWNER'],revoke:['OWNER'],budget:['OWNER'],backlog:['OWNER'],'agent-run':['OWNER','ADMIN','PROJECT_MANAGER'],'agent-approve':['OWNER','ADMIN'],workflow:['OWNER','ADMIN','PROJECT_MANAGER'],'finance-approve':['OWNER','FINANCE'],pricing:['OWNER','ADMIN'],money:['OWNER','ADMIN','FINANCE']} as const satisfies Record<string,readonly Role[]>;
export type Capability=keyof typeof CAPABILITIES;
export type ScopeResource={write:Role[];read?:Role[];client?:boolean};
export type RoleTemplate={label:string;base:Role;read:string[]|'*';write:string[]|'*';caps:Capability[]};
const allCaps=Object.keys(CAPABILITIES) as Capability[];
const clientDocs=['projects','issues'];
export const ROLE_TEMPLATES={
 owner:{label:'Owner',base:'OWNER',read:'*',write:'*',caps:allCaps},
 admin:{label:'Admin',base:'ADMIN',read:'*',write:'*',caps:allCaps},
 sales:{label:'Sales',base:'SALES',read:['contacts','companies','leads','deals','proposals','campaigns','growth-plans','clients','calendar','inbox'],write:['contacts','companies','leads','deals','proposals','campaigns','growth-plans'],caps:[]},
 marketing:{label:'Marketing',base:'SALES',read:['campaigns','growth-plans','contacts','companies','calendar'],write:['campaigns','growth-plans'],caps:[]},
 pm:{label:'PM',base:'PROJECT_MANAGER',read:'*',write:'*',caps:['agent-run','workflow']},
 developer:{label:'Developer',base:'DEVELOPER',read:['projects','milestones','tasks','issues','deliverables','calendar'],write:['tasks','issues'],caps:[]},
 creative:{label:'Creative',base:'DESIGNER',read:['projects','tasks','issues','creative-jobs','content','media','deliverables'],write:['tasks','issues','creative-jobs'],caps:[]},
 finance:{label:'Finance',base:'FINANCE',read:['clients','projects','proposals','contracts','invoices','expenses','subscriptions'],write:['contracts','invoices','expenses','subscriptions'],caps:['finance-approve','money']},
 support:{label:'Support',base:'DEVELOPER',read:['issues','clients','projects','contacts','companies','inbox','deliverables'],write:['issues'],caps:[]},
 clientOwner:{label:'Client Owner',base:'CLIENT',read:[...clientDocs,'proposals','contracts','invoices'],write:[],caps:[]},
 clientAdmin:{label:'Client Admin',base:'CLIENT',read:[...clientDocs,'proposals'],write:[],caps:[]},
 clientMember:{label:'Client Member',base:'CLIENT',read:clientDocs,write:[],caps:[]},
 reviewer:{label:'Reviewer',base:'CLIENT',read:['projects','proposals'],write:[],caps:[]},
 partner:{label:'Partner/Reseller',base:'CLIENT',read:clientDocs,write:[],caps:[]},
 contractor:{label:'Contractor',base:'DEVELOPER',read:['projects','tasks','issues'],write:['tasks'],caps:[]},
 serviceAccount:{label:'Service Account',base:'AGENT_SERVICE_ACCOUNT',read:[],write:[],caps:[]},
 aiAgent:{label:'AI Agent',base:'AGENT_SERVICE_ACCOUNT',read:['projects','milestones','tasks','issues','contacts','companies','leads','deals','content'],write:[],caps:[]},
 workflowIdentity:{label:'Workflow Identity',base:'AGENT_SERVICE_ACCOUNT',read:['projects','tasks','leads'],write:['tasks'],caps:[]},
} satisfies Record<string,RoleTemplate>;
export type TemplateName=keyof typeof ROLE_TEMPLATES;
const pick=(list:readonly string[]|'*',key:string)=>list==='*'||list.includes(key);
// Scope effettivo = ruolo base ∩ elenco del template. AI Agent e Workflow Identity (base AGENT_SERVICE_ACCOUNT) ereditano solo da chi li avvia: senza avviante, scope vuoto, mai capacità.
export function templateScope(t:RoleTemplate,resources:Record<string,ScopeResource>,starter?:RoleTemplate):string[]{
 const delegated=t.base==='AGENT_SERVICE_ACCOUNT';
 const parent=delegated?(starter&&starter.base!=='AGENT_SERVICE_ACCOUNT'?templateScope(starter,resources):[]):null;
 const out:string[]=[];
 for(const [key,r] of Object.entries(resources)){
  const read=parent?parent.includes('read:'+key):t.base==='CLIENT'?!!r.client:(r.read||INTERNAL_ROLES).includes(t.base);
  const write=parent?parent.includes('write:'+key):r.write.includes(t.base);
  if(read&&pick(t.read,key))out.push('read:'+key);
  if(write&&pick(t.write,key))out.push('write:'+key);
 }
 if(!delegated)for(const c of t.caps)if((CAPABILITIES[c] as readonly Role[]).includes(t.base))out.push('cap:'+c);
 return out;
}
