import {Link} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';
import {PageHero} from '../../components/public/shell/PageHero';
import {LandingForm} from '../../components/public/landing/LandingForm';
import {FIXED_QUOTE,offerBySlug,priceFrom} from '../../components/public/landing/offers';
import {PricingMethod,Trust} from '../../components/public/landing/OfferExtras';
import {enMeta} from '../../content/seo';
import {EnShell} from './en-shared';
export function loader({params}:LoaderFunctionArgs){const o=offerBySlug(params.slug||'');if(!o)throw new Response('Not found',{status:404});return {slug:o.slug}}
export function meta({params}:{params:{slug?:string}}){const o=offerBySlug(params.slug||'');return o?enMeta('/en/offers/'+o.slug,o.title,o.description):[{title:'Not found · OMNI101'}]}
export default function EnOffer({loaderData}:{loaderData:{slug:string}}){const o=offerBySlug(loaderData.slug);if(!o)return null;const price=priceFrom(o);return <EnShell>
 <PageHero kicker={o.name.toUpperCase()} title={o.tagline} text={o.what}/>
 <section className="section"><p className="en-price" data-testid="en-price">{price??FIXED_QUOTE}</p><a className="button en-cta" href="#mini-demo">Get my free mini-demo</a></section>
 <section className="section" aria-labelledby="en-get"><h2 id="en-get">What you get</h2><ul className="en-list">{o.get.map(g=><li key={g}>{g}</li>)}</ul></section>
 <section className="section" aria-labelledby="en-steps"><h2 id="en-steps">How it works</h2><ol className="en-steps">{o.steps.map(([t,d])=><li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol></section>
 <section className="section" aria-labelledby="en-needs"><h2 id="en-needs">What we need from you</h2><ul className="en-list">{o.needs.map(n=><li key={n}>{n}</li>)}</ul></section>
 <section className="section" aria-labelledby="en-proof"><h2 id="en-proof">See it in practice</h2><p className="en-note">Studio concepts and live demos built by us, not client results.</p><ul className="en-list">{o.proof.map(p=><li key={p.href}><Link to={p.href}>{p.label}</Link>: {p.note}</li>)}</ul></section>
 <PricingMethod/>
 <Trust/>
 <section className="section en-faq" aria-labelledby="en-faq"><h2 id="en-faq">Questions</h2>{o.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
 <section className="section" id="mini-demo" aria-labelledby="en-demo"><h2 id="en-demo">Free personalized mini-demo</h2><p>Tell us about your business. We reply by email with a first version made for you.</p><LandingForm offer={o}/></section>
</EnShell>}
