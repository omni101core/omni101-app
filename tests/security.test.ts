import {describe,it,expect,vi} from 'vitest';
import {assertSameOrigin,authenticate,type Env} from '../apps/web/app/server/auth';
import {intakeSchema,resourceSchema,resources} from '../apps/web/app/server/schema';
import {handleApi,classify} from '../apps/web/app/server/api';
describe('boundary protection',()=>{
 it('rejects cross-origin state changes',()=>{expect(()=>assertSameOrigin(new Request('https://omni101.app/api/intake',{method:'POST',headers:{Origin:'https://evil.example'}}))).toThrow()});
 it('rejects unauthenticated administrative reads before queries',async()=>{const db={prepare:vi.fn()};const res=await handleApi(new Request('https://omni101.app/api/dashboard'),{DB:db} as unknown as Env);expect(res?.status).toBe(401);expect(db.prepare).not.toHaveBeenCalled()});
 it('ignores forged Access headers when managed identity is unconfigured',async()=>{await expect(authenticate(new Request('https://omni101.app/api/session',{headers:{'Cf-Access-Jwt-Assertion':'fake'}}),{} as Env)).rejects.toThrow()});
 it('rejects forged session cookies without an active database session',async()=>{const db={prepare:()=>({bind:()=>({first:async()=>null})})};await expect(authenticate(new Request('https://omni101.app/api/session',{headers:{Cookie:'__Host-omni_session=fake'}}),{DB:db} as unknown as Env)).rejects.toThrow()});
 it('does not expose schema without identity',async()=>{const res=await handleApi(new Request('https://omni101.app/api/schema/contacts'),{DB:{}} as Env);expect(res?.status).toBe(401)});
 it('returns real 404 for an unknown API endpoint',async()=>{const res=await handleApi(new Request('https://omni101.app/api/unknown'),{DB:{}} as Env);expect(res?.status).toBe(401)});
});
describe('validated commercial input',()=>{
 const lead={name:'Test User',email:'test@example.com',message:'Vorrei realizzare un sito e-commerce con catalogo prodotti.',services:['BUILD'],consent:true,turnstileToken:'test'};
 it('requires explicit consent and a valid email',()=>{expect(intakeSchema.safeParse({...lead,consent:false}).success).toBe(false);expect(intakeSchema.safeParse({...lead,email:'invalid'}).success).toBe(false)});
 it('rejects privileged and unknown input fields',()=>{expect(intakeSchema.safeParse({...lead,role:'OWNER'}).success).toBe(false);expect(resourceSchema(resources.contacts).safeParse({name:'Alice',email:'alice@example.com',organization_id:'foreign'}).success).toBe(false)});
 it('bounds financial values and probabilities',()=>{expect(resourceSchema(resources.deals).safeParse({name:'Deal',status:'WON',owner_id:'owner',next_action:'call',value_cents:-1}).success).toBe(false)});
 it('labels deterministic classification honestly and never invents budget',()=>{const result=classify('Voglio un e-commerce urgente con un workflow',[]);expect(result.method).toBe('rules-v1');expect(result.services).toContain('BUILD');expect(result.services).toContain('AUTOMATE');expect(result).not.toHaveProperty('budget')});
 it('does not intercept page rendering',async()=>{expect(await handleApi(new Request('https://omni101.app/'),{} as Env)).toBeNull()});
});
