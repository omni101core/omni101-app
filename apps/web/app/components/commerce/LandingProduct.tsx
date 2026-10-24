import './LandingProduct.css';
import {validateConfiguration, type LandingConfiguration} from './configuration';

export default function LandingProduct({configuration}: {configuration: LandingConfiguration}) {
  const data = validateConfiguration(configuration);
  return (
    <article className={'landing-product landing-product-' + data.theme}>
      <div className="landing-product-sheet">
        <header className="landing-product-header">
          <p className="landing-product-name">{data.businessName}</p>
        </header>
        <main>
          <section className="landing-product-hero">
            <h1>{data.headline}</h1>
            <p className="landing-product-lead">{data.description}</p>
            <a className="landing-product-cta" href={data.ctaUrl}>
              {data.ctaLabel}
            </a>
          </section>
          <section className="landing-product-features">
            <h2>Dettagli</h2>
            <ul>
              {data.features.map((feature, index) => (
                <li key={index}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
        <footer className="landing-product-footer">
          <p>{data.businessName}</p>
        </footer>
      </div>
    </article>
  );
}
