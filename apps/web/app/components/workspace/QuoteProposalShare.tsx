import {useEffect, useState} from 'react';

type Option = {tier: string; name: string; setupCents: number; monthlyCents: number};
type State = {
  status: string;
  share: {expiresAt: number; active: boolean} | null;
  acceptance: {option: Option; name: string; role: string; email: string; acceptedAt: number} | null;
};
const SHARERS = ['OWNER', 'ADMIN', 'SALES'];
const money = (cents: number) => new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(cents / 100);
const day = (ms: number) => new Date(ms).toLocaleDateString('it-IT');

// Quote card actions: share the proposal with the customer, revoke the link, see the acceptance. Approved or accepted quotes only.
export default function QuoteProposalShare({quoteId, role}: {quoteId: string; role?: string | null}) {
  const [state, setState] = useState<State | null>(null);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const path = '/api/pricing/' + encodeURIComponent(quoteId) + '/proposal';
  const canShare = SHARERS.includes(role || '');
  function load() {
    fetch(path).then(r => (r.ok ? (r.json() as Promise<State>) : Promise.reject())).then(setState).catch(() => setState(null));
  }
  useEffect(() => {
    setLink('');
    load();
  }, [path]);
  async function call(method: 'POST' | 'DELETE') {
    setBusy(true);
    setError('');
    const response = await fetch(path + '/share', {method, headers: {'Content-Type': 'application/json'}, body: method === 'POST' ? '{}' : undefined}).catch(() => null);
    const data = (await response?.json().catch(() => ({}))) as {path?: string; error?: string} | undefined;
    setBusy(false);
    if (response?.ok) {
      setLink(method === 'POST' && data?.path ? window.location.origin + data.path : '');
      load();
    } else setError(data?.error || 'Operazione non riuscita.');
  }
  const accepted = state?.acceptance;
  return (
    <section className="os-conversion" aria-label="Proposta al cliente">
      <h3>Proposta al cliente</h3>
      {accepted ? (
        <p>
          Accettata il {day(accepted.acceptedAt)} da {accepted.name} ({accepted.role}, {accepted.email}) · opzione {accepted.option.tier} · setup {money(accepted.option.setupCents)} · canone {money(accepted.option.monthlyCents)}. Prezzi dello snapshot approvato.
        </p>
      ) : state?.share?.active ? (
        <p className="os-hint">Link attivo fino al {day(state.share.expiresAt)}. Il link si vede una sola volta, alla creazione.</p>
      ) : (
        <p className="os-hint">Nessun link attivo.</p>
      )}
      {canShare && !accepted ? (
        <div className="os-revenue-actions">
          <button type="button" className="os-button secondary" disabled={busy} onClick={() => void call('POST')}>
            {state?.share?.active ? 'Nuovo link (sostituisce il precedente)' : 'Condividi'}
          </button>
          {state?.share?.active ? (
            <button type="button" className="os-button secondary" disabled={busy} onClick={() => void call('DELETE')}>
              Revoca
            </button>
          ) : null}
        </div>
      ) : null}
      {link ? (
        <p>
          <input readOnly aria-label="Link da inviare al cliente" value={link} onFocus={e => e.currentTarget.select()} style={{width: '100%'}} />
        </p>
      ) : null}
      {error ? <p role="alert" className="os-error">{error}</p> : null}
    </section>
  );
}
