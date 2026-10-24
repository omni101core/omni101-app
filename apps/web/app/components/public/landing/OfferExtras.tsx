import {pricingMethod,trust} from './offers';
import {t,type Locale} from '../shell/i18n';
export function PricingMethod({locale}:{locale:Locale}){return <section className="section" aria-labelledby="en-pricing"><h2 id="en-pricing">{t('landing_pricing_h',locale)}</h2><p className="en-note">{pricingMethod(locale)}</p></section>}
export function Trust({locale}:{locale:Locale}){return <section className="section" aria-labelledby="en-trust"><h2 id="en-trust">{t('landing_trust_h',locale)}</h2><div className="en-grid">{trust(locale).map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></section>}
