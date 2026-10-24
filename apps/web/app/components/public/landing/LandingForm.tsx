import {useEffect,useMemo,useRef,useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {offers,offerText,type Offer} from './offers';
import {flagged,t,type Key,type Locale} from '../shell/i18n';
import './landing.css';
const makeSchema=(l:Locale)=>z.object({name:z.string().trim().min(2,t('landing_err_name',l)),email:z.email(t('landing_err_email',l)),site:z.string().trim().min(3,t('landing_err_site',l)).max(2000),goal:z.string().trim().min(3,t('landing_err_goal',l)).max(3000),offer:z.string(),company:z.string().trim().max(200).optional(),areas:z.string().trim().max(300).optional(),budget:z.string().max(80).optional(),consent:z.boolean().refine(Boolean,t('landing_err_consent',l))});
type FormData=z.infer<ReturnType<typeof makeSchema>>;
type Turnstile={ready?:(callback:()=>void)=>void;render:(element:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void};
const ts=()=>(window as unknown as {turnstile?:Turnstile}).turnstile;
function attribution(){const q=new URLSearchParams(window.location.search),out:Record<string,string>={};for(const k of ['utm_source','utm_medium','utm_campaign','utm_content']){const v=q.get(k);if(v)out[k]=v.slice(0,200)}try{const host=document.referrer?new URL(document.referrer).hostname:'';if(host&&host!==window.location.hostname)out.referrer=host}catch{}return out}
/** Brief sent to the existing /api/intake: states offer, language and lead magnet so the team can route it. */
export type FormMode='idea'|'contesto';
export function buildBrief(v:Pick<FormData,'site'|'goal'|'offer'|'company'|'areas'|'budget'> & {mode?:FormMode},path:string,locale:Locale='en'){const o=offers.find(x=>x.slug===v.offer);const lines=['Lead magnet: Free personalized mini-demo','Language: '+(locale==='it'?'Italian':'English'),'Mode: '+(v.mode==='contesto'?'with context (company, areas, budget)':'short idea (2 lines)'),'Offer: '+(o?offerText(o,'en').name+' ('+o.slug+')':'not sure yet'),'Page: '+path,'Business or site: '+v.site,'Goal: '+v.goal];if(v.mode==='contesto'){if(v.company)lines.push('Company: '+v.company);if(v.areas)lines.push('Areas: '+v.areas);if(v.budget)lines.push('Budget band: '+v.budget)}return lines.join('\n')}
export function LandingForm({offer,locale}:{offer?:Offer;locale:Locale}){
 const schema=useMemo(()=>makeSchema(locale),[locale]);
 const {register,handleSubmit,formState:{errors,isSubmitting}}=useForm<FormData>({resolver:zodResolver(schema),defaultValues:{offer:offer?.slug??'',consent:false}});
 const [error,setError]=useState(''),[done,setDone]=useState(false),[mode,setMode]=useState<FormMode>('idea'),[sent,setSent]=useState<FormData & {mode:FormMode}|null>(null),[siteKey,setSiteKey]=useState(''),[token,setToken]=useState('');const box=useRef<HTMLDivElement>(null),widget=useRef<string|null>(null);
 useEffect(()=>{fetch('/api/public-config').then(async r=>await r.json() as {turnstileSiteKey?:string}).then(d=>{setSiteKey(d.turnstileSiteKey||'');if(!d.turnstileSiteKey)setError(t('landing_err_inactive',locale))}).catch(()=>setError(t('landing_err_unavailable',locale)))},[]);
 useEffect(()=>{if(!siteKey)return;let off=false;const render=()=>{if(!off&&box.current&&ts()&&!widget.current)widget.current=ts()!.render(box.current,{sitekey:siteKey,action:'intake',appearance:'always',size:'flexible',callback:(v:string)=>setToken(v),'expired-callback':()=>setToken(''),'error-callback':()=>{setToken('');setError(t('landing_err_antispam_failed',locale))}})};if(ts())render();else{let s=document.querySelector<HTMLScriptElement>('script[data-turnstile]');if(!s){s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';s.async=true;s.dataset.turnstile='true';document.head.appendChild(s)}s.addEventListener('load',render)}return()=>{off=true;if(widget.current&&ts()){ts()!.remove(widget.current);widget.current=null}}},[siteKey]);
 async function submit(v:FormData){setError('');if(!token){setError(t('landing_err_antispam_missing',locale));return}
  try{const r=await fetch('/api/intake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:v.name,email:v.email,message:buildBrief({...v,mode},window.location.pathname,locale),express:true,attribution:attribution(),turnstileToken:token,consent:true})});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error||t('landing_err_not_saved',locale));setSent({...v,mode});setDone(true);setToken('');if(widget.current)ts()?.reset(widget.current)}catch(e){setError((e as Error).message)}}
 const modeKey=(m:FormMode)=> (m==='idea'?'landing_form_mode_idea':'landing_form_mode_context') as Key;
 if(done&&sent){const chosen=offers.find(o=>o.slug===sent.offer);return <div className="en-done" role="status"><h2>{t('landing_form_done_h',locale)}</h2><p>{t('landing_form_done_p',locale)}</p><h3>{t('landing_form_summary_h',locale)}</h3><dl>
  <div><dt>{t('landing_form_summary_mode',locale)}</dt><dd>{t(modeKey(sent.mode),locale)}</dd></div>
  <div><dt>{t('landing_form_name',locale)}</dt><dd>{sent.name}</dd></div>
  <div><dt>{t('landing_form_email',locale)}</dt><dd>{sent.email}</dd></div>
  {chosen?<div><dt>{t('landing_form_interest',locale)}</dt><dd>{offerText(chosen,locale).name}</dd></div>:null}
  <div><dt>{t('landing_form_site',locale)}</dt><dd>{sent.site}</dd></div>
  <div><dt>{t('landing_form_goal',locale)}</dt><dd>{sent.goal}</dd></div>
  {sent.mode==='contesto'&&sent.company?<div><dt>{t('landing_form_company',locale)}</dt><dd>{sent.company}</dd></div>:null}
  {sent.mode==='contesto'&&sent.areas?<div><dt>{t('landing_form_areas',locale)}</dt><dd>{sent.areas}</dd></div>:null}
  {sent.mode==='contesto'&&sent.budget?<div><dt>{t('landing_form_budget',locale)}</dt><dd>{sent.budget}</dd></div>:null}
  <div><dt>{t('landing_form_summary_reply',locale)}</dt><dd>{t('landing_form_reply_time',locale)}</dd></div>
 </dl></div>}
 return <form className="intake-form en-form" onSubmit={handleSubmit(submit)} noValidate aria-label={t('landing_demo_h',locale)}>
  <div className="wide" role="group" aria-labelledby="landing-mode-title"><h2 id="landing-mode-title">{t('landing_form_mode_legend',locale)}</h2><p id="landing-mode-hint">{t((mode==='idea'?'landing_form_mode_hint_idea':'landing_form_mode_hint_context') as Key,locale)}</p><div className="en-modes"><button type="button" className={mode==='idea'?'button':'button ghost'} aria-pressed={mode==='idea'} aria-describedby="landing-mode-hint" onClick={()=>setMode('idea')}>{t('landing_form_mode_idea',locale)}</button><button type="button" className={mode==='contesto'?'button':'button ghost'} aria-pressed={mode==='contesto'} aria-describedby="landing-mode-hint" onClick={()=>setMode('contesto')}>{t('landing_form_mode_context',locale)}</button></div></div>
  <label>{t('landing_form_name',locale)}<input autoComplete="name" {...register('name')}/>{errors.name?<span className="field-error">{errors.name.message}</span>:null}</label>
  <label>{t('landing_form_email',locale)}<input type="email" autoComplete="email" {...register('email')}/>{errors.email?<span className="field-error">{errors.email.message}</span>:null}</label>
  {offer?<input type="hidden" {...register('offer')}/>:<label className="wide">{t('landing_form_interest',locale)}<select {...register('offer')}><option value="">{t('landing_form_unsure',locale)}</option>{offers.map(o=><option key={o.slug} value={o.slug}>{offerText(o,locale).name}</option>)}</select></label>}
  <label className="wide">{t('landing_form_site',locale)}<textarea rows={3} {...register('site')}/>{errors.site?<span className="field-error">{errors.site.message}</span>:null}</label>
  <label className="wide">{t('landing_form_goal',locale)}<textarea rows={3} {...register('goal')}/>{errors.goal?<span className="field-error">{errors.goal.message}</span>:null}</label>
  {mode==='contesto'&&<><label className="wide">{t('landing_form_company',locale)}<input autoComplete="organization" {...register('company')}/></label><label className="wide">{t('landing_form_areas',locale)}<input {...register('areas')}/></label><label className="wide">{t('landing_form_budget',locale)}<select {...register('budget')}><option value="">{t('landing_form_budget_empty',locale)}</option>{(['landing_form_budget_1','landing_form_budget_2','landing_form_budget_3','landing_form_budget_4'] as Key[]).map(k=><option key={k}>{t(k,locale)}</option>)}</select></label></>}
  <label className="wide consent"><input type="checkbox" {...register('consent')}/><span>{t('landing_form_consent_a',locale)}<a href="/privacy">{flagged(t('landing_form_consent_link',locale),'/privacy',locale)}</a>{t('landing_form_consent_b',locale)}</span></label>
  {errors.consent?<span className="field-error wide">{errors.consent.message}</span>:null}
  <div className="wide" ref={box}/>
  {error?<p className="field-error wide" role="alert">{error}</p>:null}
  <button className="button" type="submit" disabled={isSubmitting}>{t('landing_offer_cta',locale)}</button>
 </form>}
