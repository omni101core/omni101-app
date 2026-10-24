import {PRICING_METHOD,TRUST} from './offers';
export function PricingMethod(){return <section className="section" aria-labelledby="en-pricing"><h2 id="en-pricing">How pricing works</h2><p className="en-note">{PRICING_METHOD}</p></section>}
export function Trust(){return <section className="section" aria-labelledby="en-trust"><h2 id="en-trust">Why you can trust the process</h2><div className="en-grid">{TRUST.map(([t,d])=><div key={t}><h3>{t}</h3><p>{d}</p></div>)}</div></section>}
