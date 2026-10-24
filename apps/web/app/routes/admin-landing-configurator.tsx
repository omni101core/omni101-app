import {useEffect, useState} from 'react';
import AuthGate from '../components/AuthGate';
import LandingConfigurator from '../components/commerce/LandingConfigurator';

export default function AdminLandingConfigurator() {
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading');
  useEffect(() => {
    fetch('/api/session').then(r => (r.ok ? r.json() : Promise.reject())).then((value: unknown) => {
      const s = value as {membership?: {role?: string}};
      if (s.membership?.role === 'CLIENT') window.location.replace('/portal');
      else setState('in');
    }).catch(() => setState('out'));
  }, []);
  return state === 'in' ? <LandingConfigurator /> : state === 'out' ? <AuthGate /> : null;
}
