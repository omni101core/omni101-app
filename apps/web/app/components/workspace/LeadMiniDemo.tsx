import {useEffect, useState} from 'react';

type Demo = {id: string; shared: boolean} | null;

// Lead card action: generate the mini-demo draft, then review it in the landing configurator.
export default function LeadMiniDemo({leadId}: {leadId: string}) {
  const [demo, setDemo] = useState<Demo | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const path = '/api/leads/' + encodeURIComponent(leadId) + '/mini-demo';
  useEffect(() => {
    setDemo(undefined);
    fetch(path).then(r => (r.ok ? r.json() : Promise.reject())).then(v => setDemo((v as {demo: Demo}).demo)).catch(() => setDemo(null));
  }, [path]);
  async function generate() {
    setBusy(true);
    setError('');
    const response = await fetch(path, {method: 'POST'}).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as {id?: string; error?: string} | undefined;
    setBusy(false);
    if (response?.ok && data?.id) setDemo({id: data.id, shared: false});
    else setError(data?.error || 'Generazione non riuscita.');
  }
  return (
    <section className="os-conversion" aria-label="Mini-demo">
      <h3>Mini-demo</h3>
      {demo ? (
        <p className="os-hint">
          {demo.shared ? 'Condivisa con il lead.' : 'Bozza pronta, non ancora condivisa.'}{' '}
          <a href={'/admin/landing-configurator?id=' + encodeURIComponent(demo.id)}>Rivedi nel configuratore</a>
        </p>
      ) : demo === null ? (
        <button type="button" className="os-button secondary" disabled={busy} onClick={() => void generate()}>
          {busy ? 'Generazione…' : 'Genera mini-demo'}
        </button>
      ) : null}
      {error ? <p role="alert" className="os-error">{error}</p> : null}
    </section>
  );
}
