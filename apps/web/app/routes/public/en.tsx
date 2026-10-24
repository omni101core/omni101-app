import {Link} from 'react-router';
import {PageHero} from '../../components/public/shell/PageHero';
import {LandingForm} from '../../components/public/landing/LandingForm';
import {FIXED_QUOTE,offers,priceFrom} from '../../components/public/landing/offers';
import {PricingMethod,Trust} from '../../components/public/landing/OfferExtras';
import {enMeta} from '../../content/seo';
import {EnShell} from './en-shared';
export function meta(){return enMeta('/en','AI-built websites, assistants and automations · OMNI101','We build landing pages, website assistants and process automations with AI, checked by people. Start with a free personalized mini-demo.')}
export default function EnHome(){return <EnShell>
 <PageHero kicker="OMNI101 · FOR SMALL BUSINESSES" title={<>One landing page, one assistant,<br/><em>or one automation.</em></>} text="Three narrow results for a small business, built with AI and checked by people. Each starts with a free personalized mini-demo: a low-risk first step, so you judge the real thing before you decide."/>
 <section className="section" aria-labelledby="en-offers"><h2 id="en-offers">What we build</h2><div className="en-grid">{offers.map(o=><article key={o.slug}><h3>{o.name}</h3><p>{o.tagline}</p><p className="en-price">{priceFrom(o)??FIXED_QUOTE}</p><Link to={'/en/offers/'+o.slug}>See how it works →</Link></article>)}</div></section>
 <section className="section" aria-labelledby="en-how"><h2 id="en-how">How it works</h2><ol className="en-steps"><li><h3>Tell us about your business</h3><p>A link or a few lines is enough.</p></li><li><h3>See your mini-demo</h3><p>A personalized first version, free, with no obligation.</p></li><li><h3>Decide with a fixed quote</h3><p>If you want to go ahead, you know the price before any work starts.</p></li></ol></section>
 <section className="section" aria-labelledby="en-proof"><h2 id="en-proof">See our work</h2><p className="en-note">These are studio concepts and live demos built by us. They are not client results.</p><ul className="en-list"><li><Link to="/work">Projects</Link></li><li><Link to="/explore">Playground: demos you can try</Link></li></ul></section>
 <PricingMethod/>
 <Trust/>
 <section className="section" id="mini-demo" aria-labelledby="en-demo"><h2 id="en-demo">Free personalized mini-demo</h2><p>Tell us about your business. We reply by email with a first version made for you.</p><LandingForm/></section>
</EnShell>}
