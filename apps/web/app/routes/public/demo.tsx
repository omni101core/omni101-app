import {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import LandingProduct from '../../components/commerce/LandingProduct';
import type {LandingConfiguration} from '../../components/commerce/configuration';
import {linkMessage} from './link-state';

export function meta() { return [{title: 'Demo · OMNI101'}, {name: 'robots', content: 'noindex,nofollow'}]; }
export function headers() { return {'X-Robots-Tag': 'noindex, nofollow'}; }

type Demo = {configuration: LandingConfiguration; language: 'it' | 'en'};
const BANNER = {en: 'Personalized demo by OMNI101 — not a live site', it: 'Demo personalizzata di OMNI101 — non è un sito online'};

// The call to action keeps the studio's own contact page and carries a short brief; any other target is left as configured.
function withBrief(config: LandingConfiguration, language: 'it' | 'en') {
  const url = new URL(config.ctaUrl);
  if (url.pathname === '/start-project' || url.pathname === '/en') {
    url.searchParams.set('brief', (language === 'en' ? 'Language: English\nI saw the personalized demo for ' : 'Ho visto la demo personalizzata per ') + config.businessName);
  }
  return {...config, ctaUrl: url.href};
}

export default function PublicDemo() {
  const {token} = useParams();
  const [demo, setDemo] = useState<Demo | 'missing' | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    fetch('/api/demo/' + encodeURIComponent(token || ''))
      .then(r => (r.ok ? (r.json() as Promise<Demo>) : Promise.reject(r.status)))
      .then(setDemo)
      .catch(status => {
        setNotice(linkMessage(typeof status === 'number' ? status : null));
        setDemo('missing');
      });
  }, [token]);
  return demo === null ? null : demo === 'missing' ? (
    <p role="alert" style={{padding: '4rem 1rem', textAlign: 'center'}}>{notice}</p>
  ) : (
    <div lang={demo.language}>
      <p role="note" style={{margin: 0, padding: '.6rem 1rem', textAlign: 'center', background: '#111', color: '#fff', fontSize: '.9rem'}}>{BANNER[demo.language]}</p>
      <LandingProduct configuration={withBrief(demo.configuration, demo.language)} />
    </div>
  );
}
