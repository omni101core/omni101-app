import prezziPubblici from '../../../content/prezzi-pubblici.json';
import {t,type Key,type Locale} from '../shell/i18n';
export const MOSTRA_PREZZI=true;
export type ProdottoPubblico=keyof typeof prezziPubblici.prodotti;
/** Structure only. Every visible string lives in messages/*.json under offer_<slug with _>_<field>. */
export type Offer={slug:string;productId:ProdottoPubblico;proof:string[]};
export type OfferText={slug:string;name:string;title:string;description:string;tagline:string;what:string;get:string[];steps:[string,string][];needs:string[];faq:[string,string][];proof:{href:string;label:string;note:string}[]};
export const offers:Offer[]=[
{slug:'ai-landing',productId:'sito_pronto',proof:['/work/studio-forma','/work/casa-luce']},
{slug:'ai-assistant',productId:'risponde_lui',proof:['/explore/voice','/explore/avatar']},
{slug:'ai-automation',productId:'ufficio_automatico',proof:['/explore/workflow','/work/flow','/work/tavola']},
// ponytail: a bundle (sito_pronto + risponde_lui) has one productId; its "from" lives in prezzi-pubblici.json under bundle.local_desk
{slug:'local-desk',productId:'sito_pronto',proof:['/work/casa-luce','/work/flow']}];
export const offerBySlug=(slug:string)=>offers.find(o=>o.slug===slug);
/** Item counts per list are fixed by the offer template: 4 get, 3 steps, 3 needs, 4 faq. i18n-check fails if a locale misses a key. */
export function offerText(o:Offer,locale:Locale):OfferText{
 const k=(f:string)=>'offer_'+o.slug.replace(/-/g,'_')+'_'+f as Key,T=(f:string)=>t(k(f),locale),list=(n:number)=>Array.from({length:n},(_,i)=>i+1);
 return {slug:o.slug,name:T('name'),title:T('title'),description:T('description'),tagline:T('tagline'),what:T('what'),get:list(4).map(i=>T('get_'+i)),steps:list(3).map((i):[string,string]=>[T('step_'+i+'_t'),T('step_'+i+'_d')]),needs:list(3).map(i=>T('need_'+i)),faq:list(4).map((i):[string,string]=>[T('faq_'+i+'_q'),T('faq_'+i+'_a')]),proof:o.proof.map((href,i)=>({href,label:T('proof_'+(i+1)+'_label'),note:T('proof_'+(i+1)+'_note')}))};
}
export const fixedQuote=(l:Locale)=>t('landing_fixed_quote',l);
/** "From" only when the engine file has a value and the founder flag allows prices; otherwise null. */
/** Thousands separator only, no Intl: same output on every runtime. */
export const money=(n:number,l:Locale)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,l==='it'?'.':',');
/** Setup and monthly "from" figures, each only when the engine file has a value above zero; null otherwise (caller shows the fixed-quote line). */
type Bundle={daUnaTantum:number;daMensile:number;valuta:string};
/** A bundle (bundle.<slug with _> in the engine file) carries its own setup, monthly and currency: "From 1,900 USD + 148 USD/month". */
export function priceFrom(o:Offer,l:Locale){if(!MOSTRA_PREZZI)return null;const b=(prezziPubblici.bundle as Record<string,Bundle|undefined>)[o.slug.replace(/-/g,'_')];if(b)return t('landing_price_from_bundle',l,{amount:money(b.daUnaTantum,l)+' '+b.valuta,monthly:money(b.daMensile,l)+' '+b.valuta});const p=prezziPubblici.prodotti[o.productId],parts:string[]=[];if(p.daUnaTantum>0)parts.push(t('landing_price_setup',l,{amount:money(p.daUnaTantum,l)}));if(p.daMensile>0)parts.push(t('landing_price_monthly',l,{amount:money(p.daMensile,l)}));return parts.length?parts.join(' · '):null}
/** The Italian offer pages (/offerte) use the same "from" line as the English ones: one formatter, one flag. */
export const priceSetupMonthly=priceFrom;
/** Lowest one-off setup across the ready offers, straight from the engine file (home line). */
export const minSetup=()=>Math.min(...Object.values(prezziPubblici.prodotti).map(p=>p.daUnaTantum).filter(v=>v>0));
export const finalPrice=(l:Locale)=>t('landing_price_final',l);
export const customQuote=(l:Locale)=>t('landing_custom_quote',l);
export const pricingMethod=(l:Locale)=>t('landing_pricing_method',l);
export const trust=(l:Locale):[string,string][]=>[1,2,3,4].map((i):[string,string]=>[t(('landing_trust_'+i+'_t') as Key,l),t(('landing_trust_'+i+'_d') as Key,l)]);
