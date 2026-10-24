import {useEffect,useRef,useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {offers,type Offer} from './offers';
import './landing.css';
const schema=z.object({name:z.string().trim().min(2,'Please enter your name.'),email:z.email('Please enter a valid email.'),site:z.string().trim().min(3,'Add your website or a short description of your business.').max(2000),goal:z.string().trim().min(3,'Tell us what you want to achieve.').max(3000),offer:z.string(),consent:z.boolean().refine(Boolean,'Consent is needed to handle your request.')});
type FormData=z.infer<typeof schema>;
type Turnstile={ready?:(callback:()=>void)=>void;render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void};
const ts=()=>(window as unknown as {turnstile?:Turnstile}).turnstile;
function attribution(){const q=new URLSearchParams(window.location.search),out:Record<string,string>={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content']){const v=q.get(k);if(v)out[k]=v.slice(0,200)}try{const host=document.referrer?new URL(document.referrer).hostname:'';if(host&&host!==window.location.hostname)out.referrer=host}catch{}return out}
/** Brief sent to the existing /api/intake: states offer, language and lead magnet so the team can route it. */
export function buildBrief(v:Pick<FormData,'site'|'goal'|'offer'>,path:string){const o=offers.find(x=>x.slug===v.offer);return ['Lead magnet: Free personalized mini-demo','Language: English','Offer: '+(o?o.name+' ('+o.slug+')':'not sure yet'),'Page: '+path,'Business or site: '+v.site,'Goal: '+v.goal].join('\n')}
export function LandingForm({offer}:{offer?:Offer}){
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormData>({resolver:zodResolver(schema),defaultValues:{offer:offer?.slug??'',consent:false}});
 const [error,setError]=useState(''),[done,setDone]=useState(false),[siteKey,setSiteKey]=useState(''),[token,setToken]=useState('');const box=useRef<HTMLDivElement>(null),widget=useRef<string|null>(null);
 useEffect(()=>{fetch('/api/public-config').then(async r=>await r.json() as {turnstileSiteKey?:string}).then(d=>{setSiteKey(d.turnstileSiteKey||'');if(!d.turnstileSiteKey)setError('The form is not active yet. Write to info@omni101.app.')}).catch(()=>setError('The form is temporarily unavailable. Write to info@omni101.app.'))},[]);
 useEffect(()=>{if(!siteKey)return;let off=false;const render=()=>{if(!off&&box.current&&ts()&&!widget.current)widget.current=ts()!.render(box.current,{sitekey:siteKey,action:'intake',appearance:'always',size:'flexible',callback:(v:string)=>setToken(v),'expired-callback':()=>setToken(''),'error-callback':()=>{setToken('');setError('The anti-spam check failed. Reload the page or write to info@omni101.app.')}})};if(ts())render();else{let s=document.querySelector<HTMLScriptElement>('script[data-turnstile]');if(!s){s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.dataset.turnstile='true';document.head.appendChild(s)}s.addEventListener('load',render)}return()=>{off=true;if(widget.current&&ts()){ts()!.remove(widget.current);widget.current=null}}},[siteKey]);
 async function submit(v:FormData){setError('');if(!token){setError('The anti-spam check is missing: tick the box below, then send again.');return}
  try{const r=await fetch('/api/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:v.name,email:v.email,message:buildBrief(v,window.location.pathname),express:true,attribution:attribution(),turnstileToken:token,consent:true})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error||'Your request was not saved. Please try again.');setDone(true);setToken('');if(widget.current)ts()?.reset(widget.current)}catch(e){setError((e as Error).message)}}
 if(done)return <div className="en-done" role="status"><h2>Request received.</h2><p>Thank you. We will reply by email with your personalized mini-demo.</p></div>;
 return <form className="intake-form en-form" onSubmit={handleSubmit(submit)} noValidate aria-label="Free personalized mini-demo">
  <label>Your name *<input autoComplete="name" {...register('name')}/>{errors.name?<span className="field-error">{errors.name.message}</span>:null}</label>
  <label>Your email *<input type="email" autoComplete="email" {...register('email')}/>{errors.email?<span className="field-error">{errors.email.message}</span>:null}</label>
  {offer?<input type="hidden" {...register('offer')}/>:<label className="wide">What are you interested in?<select {...register('offer')}><option value="">Not sure yet</option>{offers.map(o=><option key={o.slug} value={o.slug}>{o.name}</option>)}</select></label>}
  <label className="wide">Your website, or a short description of your business *<textarea rows={3} {...register('site')}/>{errors.site?<span className="field-error">{errors.site.message}</span>:null}</label>
  <label className="wide">What do you want to achieve? *<textarea rows={3} {...register('goal')}/>{errors.goal?<span className="field-error">{errors.goal.message}</span>:null}</label>
  <label className="wide consent"><input type="checkbox" {...register('consent')}/><span>I agree that OMNI101 may use these details to prepare my mini-demo and contact me, as described in the <a href="/privacy">privacy notice</a>.</span></label>
  {errors.consent?<span className="field-error wide">{errors.consent.message}</span>:null}
  <div className="wide" ref={box}/>
  {error?<p className="field-error wide" role="alert">{error}</p>:null}
  <button className="button" type="submit" disabled={isSubmitting}>Get my free mini-demo</button>
 </form>}
