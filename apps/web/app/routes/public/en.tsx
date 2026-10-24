import {Link} from 'react-router';
import {PageHero} from '../../components/public/shell/PageHero';
import {LandingForm} from '../../components/public/landing/LandingForm';
import {fixedQuote,offerText,offers,priceFrom} from '../../components/public/landing/offers';
import {PricingMethod,Trust} from '../../components/public/landing/OfferExtras';
import {flagged,t,useLocale} from '../../components/public/shell/i18n';
import {enMeta} from '../../content/seo';
import {EnShell} from './en-shared';
export function meta(){return enMeta('/en',t('landing_home_meta_title','en'),t('landing_home_meta_description','en'))}
export default function EnHome(){const l=useLocale();return <EnShell>
 <PageHero kicker={t('landing_home_kicker',l)} title={<>{t('landing_home_title_a',l)}<br/><em>{t('landing_home_title_b',l)}</em></>} text={t('landing_home_text',l)}/>
 <section className="section" aria-labelledby="en-offers"><h2 id="en-offers">{t('landing_home_offers_h',l)}</h2><div className="en-grid">{offers.map(o=>{const x=offerText(o,l);return <article key={o.slug}><h3>{x.name}</h3><p>{x.tagline}</p><p className="en-price">{priceFrom(o,l)??fixedQuote(l)}</p><Link to={'/en/offers/'+o.slug}>{t('landing_home_offer_link',l)}</Link></article>})}</div></section>
 <section className="section" aria-labelledby="en-how"><h2 id="en-how">{t('landing_how_h',l)}</h2><ol className="en-steps"><li><h3>{t('landing_how_1_t',l)}</h3><p>{t('landing_how_1_d',l)}</p></li><li><h3>{t('landing_how_2_t',l)}</h3><p>{t('landing_how_2_d',l)}</p></li><li><h3>{t('landing_how_3_t',l)}</h3><p>{t('landing_how_3_d',l)}</p></li></ol></section>
 <section className="section" aria-labelledby="en-proof"><h2 id="en-proof">{t('landing_home_proof_h',l)}</h2><p className="en-note">{t('landing_home_proof_note',l)}</p><ul className="en-list"><li><Link to="/work">{flagged(t('landing_home_proof_work',l),'/work',l)}</Link></li><li><Link to="/explore">{flagged(t('landing_home_proof_explore',l),'/explore',l)}</Link></li></ul></section>
 <PricingMethod locale={l}/>
 <Trust locale={l}/>
 <section className="section" id="mini-demo" aria-labelledby="en-demo"><h2 id="en-demo">{t('landing_demo_h',l)}</h2><p>{t('landing_demo_text',l)}</p><LandingForm locale={l}/></section>
</EnShell>}
