import {Link} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';
import {PageHero} from '../../components/public/shell/PageHero';
import {LandingForm} from '../../components/public/landing/LandingForm';
import {fixedQuote,offerBySlug,offers,offerText,priceSetupMonthly} from '../../components/public/landing/offers';
import {PricingMethod,Trust} from '../../components/public/landing/OfferExtras';
import {flagged,t,useLocale} from '../../components/public/shell/i18n';
import {itMeta} from '../../content/seo';
import {EnShell} from './en-shared';
// ponytail: one module serves /offerte (catalogue) and /offerte/:slug (offer); the Italian twin of en.tsx + en-offer.tsx. Same sections, same keys, locale 'it'.
const it='it' as const;
export function loader({params}:LoaderFunctionArgs){if(!params.slug)return {slug:''};const o=offerBySlug(params.slug);if(!o)throw new Response('Not found',{status:404});return {slug:o.slug}}
export function meta({params}:{params:{slug?:string}}){
 if(!params.slug)return itMeta('/offerte',t('landing_home_meta_title',it),t('landing_home_meta_description',it));
 const o=offerBySlug(params.slug);if(!o)return [{title:t('landing_offer_not_found',it)}];const x=offerText(o,it);return itMeta('/offerte/'+o.slug,x.title,x.description)}
export default function Offerte({loaderData}:{loaderData:{slug:string}}){const l=useLocale();const o=offerBySlug(loaderData.slug);
 if(!loaderData.slug)return <EnShell>
  <PageHero kicker={t('landing_home_kicker',l)} title={t('landing_home_title_a',l)+' '+t('landing_home_title_b',l)} text={t('landing_home_text',l)}/>
  <section className="section" aria-labelledby="en-offers"><h2 id="en-offers">{t('landing_home_offers_h',l)}</h2><div className="en-grid">{offers.map(of=>{const x=offerText(of,l);return <div key={of.slug} data-testid="offerta-card"><h3>{x.name}</h3><p>{x.tagline}</p><p className="en-price">{priceSetupMonthly(of,l)??fixedQuote(l)}</p><Link to={'/offerte/'+of.slug}>{t('landing_home_offer_link',l)}</Link></div>})}</div></section>
  <section className="section" aria-labelledby="en-steps"><h2 id="en-steps">{t('landing_how_h',l)}</h2><ol className="en-steps">{[1,2,3].map(i=><li key={i}><h3>{t(('landing_how_'+i+'_t') as 'landing_how_1_t',l)}</h3><p>{t(('landing_how_'+i+'_d') as 'landing_how_1_d',l)}</p></li>)}</ol></section>
  <PricingMethod locale={l}/>
  <Trust locale={l}/>
  <section className="section" id="mini-demo" aria-labelledby="en-demo"><h2 id="en-demo">{t('landing_demo_h',l)}</h2><p>{t('landing_demo_text',l)}</p><LandingForm locale={l}/></section>
 </EnShell>;
 if(!o)return null;const x=offerText(o,l),price=priceSetupMonthly(o,l);return <EnShell>
  <PageHero kicker={x.name.toUpperCase()} title={x.tagline} text={x.what}/>
  <section className="section"><p className="en-price" data-testid="en-price">{price??fixedQuote(l)}</p><a className="button en-cta" href="#mini-demo">{t('landing_offer_cta',l)}</a></section>
  <section className="section" aria-labelledby="en-get"><h2 id="en-get">{t('landing_offer_get_h',l)}</h2><ul className="en-list">{x.get.map(g=><li key={g}>{g}</li>)}</ul></section>
  <section className="section" aria-labelledby="en-steps"><h2 id="en-steps">{t('landing_how_h',l)}</h2><ol className="en-steps">{x.steps.map(([title,text])=><li key={title}><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
  <section className="section" aria-labelledby="en-needs"><h2 id="en-needs">{t('landing_offer_needs_h',l)}</h2><ul className="en-list">{x.needs.map(n=><li key={n}>{n}</li>)}</ul></section>
  <section className="section" aria-labelledby="en-proof"><h2 id="en-proof">{t('landing_offer_proof_h',l)}</h2><p className="en-note">{t('landing_offer_proof_note',l)}</p><ul className="en-list">{x.proof.map(p=><li key={p.href}><Link to={p.href}>{flagged(p.label,p.href,l)}</Link>: {p.note}</li>)}</ul></section>
  <PricingMethod locale={l}/>
  <Trust locale={l}/>
  <section className="section en-faq" aria-labelledby="en-faq"><h2 id="en-faq">{t('landing_offer_faq_h',l)}</h2>{x.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
  <section className="section" id="mini-demo" aria-labelledby="en-demo"><h2 id="en-demo">{t('landing_demo_h',l)}</h2><p>{t('landing_demo_text',l)}</p><LandingForm offer={o} locale={l}/></section>
 </EnShell>}
