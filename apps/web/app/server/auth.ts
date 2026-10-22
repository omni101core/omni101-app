import { createRemoteJWKSet, jwtVerify } from 'jose';
export interface Env { DB: D1Database; MEDIA?: R2Bucket; QUEUE?: Queue; ACCESS_TEAM_DOMAIN?: string; ACCESS_AUD?: string; ACCESS_MFA_ENFORCED?: string; ORGANIZATION_ID?: string; TURNSTILE_SECRET_KEY?: string; TURNSTILE_SITE_KEY?: string; AI_INPUT_CENTS_PER_MILLION?: string; AI_OUTPUT_CENTS_PER_MILLION?: string; BOOTSTRAP_OWNER_EMAIL?: string; PUBLIC_ORIGIN?: string; AI_API_KEY?: string; AI_MODEL?: string; AI_PROVIDER?: string; AI_MONTHLY_BUDGET_CENTS?: string; }
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
