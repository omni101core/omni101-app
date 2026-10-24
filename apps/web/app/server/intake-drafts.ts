import {digest,HttpError,type Env} from './auth';
import {DRAFT_DAYS,draftSchema} from '../components/public/intake/intake-draft';

const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const newToken=()=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

// Public, no session: the private link token is the only credential. The row holds the minimized form state only
// (draftSchema drops name, email and consent) and only the token's hash. Rate limit is applied by handleApi.
export async function handleIntakeDrafts(request:Request,env:Env):Promise<Response|null>{
 const m=new URL(request.url).pathname.match(/^\/api\/intake-drafts(?:\/([^/]+))?$/);if(!m)return null;
 const org=env.ORGANIZATION_ID||'omni101',now=Date.now(),expires=now+DRAFT_DAYS*864e5;
 if(!m[1]){
  if(request.method!=='POST')return null;
  const raw=await request.text();if(raw.length>20000)throw new HttpError(413,'Bozza troppo lunga.');
  let body:{token?:unknown;draft?:unknown};try{body=JSON.parse(raw)}catch{throw new HttpError(400,'Bozza non valida.')}
  const draft=draftSchema.safeParse(body.draft);if(!draft.success)throw new HttpError(400,'Bozza non valida.');
  const payload=JSON.stringify(draft.data);
  await env.DB.prepare('DELETE FROM intake_drafts WHERE organization_id=? AND expires_at<?').bind(org,now).run();
  if(typeof body.token==='string'&&TOKEN.test(body.token)){
   const updated=await env.DB.prepare('UPDATE intake_drafts SET payload=?,expires_at=?,updated_at=? WHERE organization_id=? AND token_hash=? AND expires_at>=? RETURNING id').bind(payload,expires,now,org,await digest(body.token),now).first();
   if(updated)return json({token:body.token,expiresAt:expires});
  }
  const token=newToken();
  await env.DB.prepare('INSERT INTO intake_drafts(id,organization_id,token_hash,payload,expires_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),org,await digest(token),payload,expires,now,now).run();
  return json({token,expiresAt:expires},201);
 }
 if(!TOKEN.test(m[1]))throw new HttpError(404,'Bozza non trovata o scaduta.');
 const hash=await digest(m[1]);
 if(request.method==='GET'){
  const row=await env.DB.prepare('SELECT payload,expires_at FROM intake_drafts WHERE organization_id=? AND token_hash=? AND expires_at>=?').bind(org,hash,now).first<{payload:string;expires_at:number}>();
  if(!row)throw new HttpError(404,'Bozza non trovata o scaduta.');
  return json({draft:JSON.parse(row.payload),expiresAt:row.expires_at});
 }
 if(request.method==='DELETE'){await env.DB.prepare('DELETE FROM intake_drafts WHERE organization_id=? AND token_hash=?').bind(org,hash).run();return json({success:true})}
 return null;
}
