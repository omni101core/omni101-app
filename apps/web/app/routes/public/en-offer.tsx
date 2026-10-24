import {Link} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';
import {PageHero} from '../../components/public/shell/PageHero';
import {LandingForm} from '../../components/public/landing/LandingForm';
import {fixedQuote,offerBySlug,offerText,priceFrom} from '../../components/public/landing/offers';
import {PricingMethod,Trust} from '../../components/public/landing/OfferExtras';
import {flagged,t,useLocale} from '../../components/public/shell/i18n';
import {enMeta} from '../../content/seo';
import {EnShell} from './en-shared';
export function loader({params}:LoaderFunctionArgs){const o=offerBySlug(params.slug||'');if(!o)throw new Response('Not found',{status:404});return {slug:o.slug}}
export function meta({params}:{params:{slug?:string}}){const o=offerBySlug(params.slug||'');if(!o)return [{title:t('landing_offer_not_found','en')}];const x=offerText(o,'en');return enMeta('/en/offers/'+o.slug,x.title,x.description)}
export default function EnOffer({loaderData}:{loaderData:{slug:string}}){const l=useLocale();const o=offerBySlug(loaderData.slug);if(!o)return null;const x=offerText(o,l),price=priceFrom(o,l);return <EnShell>
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
