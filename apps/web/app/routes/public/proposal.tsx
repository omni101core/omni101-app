import {useEffect, useState, type FormEvent} from 'react';
import {useParams} from 'react-router';
import {linkMessage} from './link-state';

export function meta() { return [{title: 'Proposal · OMNI101'}, {name: 'robots', content: 'noindex,nofollow'}]; }
export function headers() { return {'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer'}; }

type Lang = 'it' | 'en';
type Option = {tier: 'ESSENZIALE' | 'CONSIGLIATA' | 'COMPLETA'; name: string; setupCents: number; monthlyCents: number; minMonths: number | null; deliveryDays: number | null};
type Payment = {iban: string | null; accountHolder: string | null; reference: string; amountCents: number};
type Order = {mode: 'SANDBOX'; paymentStatus: string; amountCents: number; reference: string};
type Accepted = {acceptedAt: number; option: Option; payment: Payment; order?: Order | null};
type Proposal = {language: Lang; proposal: {quoteName: string; scope: string; terms: string; options: Option[]}; expiresAt: number; accepted: Accepted | null};

const T = {
  it: {
    missing: 'Proposta non disponibile', tiers: {ESSENZIALE: 'Essenziale', CONSIGLIATA: 'Consigliata', COMPLETA: 'Completa'}, choose: 'Scegli un’opzione', setup: 'Setup', monthly: 'Canone mensile', minimum: 'Durata minima',
    months: 'mesi', days: 'giorni di lavoro', includes: 'Cosa include', terms: 'Condizioni', net: 'Importi netti; le imposte seguono le condizioni indicate.', name: 'Nome e cognome', role: 'Ruolo', email: 'Email',
    agree: 'Ho letto le condizioni e accetto questa proposta.', submit: 'Accetta la proposta', sending: 'Invio…', failed: 'Accettazione non riuscita.', thanks: 'Proposta accettata', thanksText: 'Grazie. Abbiamo registrato la tua accettazione.',
    pay: 'Come pagare', payText: 'Paga il setup con bonifico', iban: 'IBAN', holder: 'Intestatario', reference: 'Causale', amount: 'Importo', later: 'Ti scriviamo noi con le istruzioni di pagamento.', expires: 'Link valido fino al',
    order: 'Ordine', checkout: 'Conferma l’ordine', orderNote: 'Ambiente di prova: nessun pagamento viene eseguito e nessun importo è addebitato.', orderDone: 'Ordine registrato. In attesa del bonifico.', orderFailed: 'Ordine non riuscito.'
  },
  en: {
    missing: 'Proposal not available', tiers: {ESSENZIALE: 'Essential', CONSIGLIATA: 'Recommended', COMPLETA: 'Complete'}, choose: 'Choose an option', setup: 'Setup', monthly: 'Monthly fee', minimum: 'Minimum term',
    months: 'months', days: 'working days', includes: 'What is included', terms: 'Terms', net: 'Amounts are net; taxes follow the stated terms.', name: 'Full name', role: 'Role', email: 'Email',
    agree: 'I have read the terms and accept this proposal.', submit: 'Accept the proposal', sending: 'Sending…', failed: 'Could not record the acceptance.', thanks: 'Proposal accepted', thanksText: 'Thank you. Your acceptance has been recorded.',
    pay: 'How to pay', payText: 'Pay the setup by bank transfer', iban: 'IBAN', holder: 'Account holder', reference: 'Reference', amount: 'Amount', later: 'We will write to you with the payment instructions.', expires: 'Link valid until',
    order: 'Order', checkout: 'Confirm the order', orderNote: 'Test environment: no payment is taken and no amount is charged.', orderDone: 'Order recorded. Waiting for the bank transfer.', orderFailed: 'Could not create the order.'
  }
} as const;
const box = {border: '1px solid #ccc', borderRadius: 8, padding: '1rem', margin: '1rem 0'} as const;

export default function PublicProposal() {
  const {token} = useParams();
  const [data, setData] = useState<Proposal | 'missing' | null>(null);
  const [accepted, setAccepted] = useState<Accepted | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [tier, setTier] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const base = '/api/proposal/' + encodeURIComponent(token || '');
  useEffect(() => {
    fetch(base)
      .then(r => (r.ok ? (r.json() as Promise<Proposal>) : Promise.reject(r.status)))
      .then(value => {
        setData(value);
        setAccepted(value.accepted);
        setOrder(value.accepted?.order ?? null);
        if (value.proposal.options.length === 1) setTier(value.proposal.options[0].tier);
      })
      .catch(status => {
        setNotice(linkMessage(typeof status === 'number' ? status : null));
        setData('missing');
      });
  }, [base]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (data === null || data === 'missing') return;
    const t = T[data.language];
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    const response = await fetch(base + '/accept', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({option: tier, name: form.get('name'), role: form.get('role'), email: form.get('email'), termsAccepted: form.get('terms') === 'on'})
    }).catch(() => null);
    const out = (await response?.json().catch(() => ({}))) as (Accepted & {error?: string}) | undefined;
    setBusy(false);
    if (response?.ok && out) setAccepted(out);
    else setError(out?.error || t.failed);
  }
  // Double click is safe: the server returns the same order for the same acceptance.
  async function checkout() {
    if (data === null || data === 'missing' || busy) return;
    setBusy(true);
    setError('');
    const response = await fetch(base + '/checkout', {method: 'POST'}).catch(() => null);
    const out = (await response?.json().catch(() => ({}))) as {order?: Order; error?: string} | undefined;
    setBusy(false);
    if (response?.ok && out?.order) setOrder(out.order);
    else setError(out?.error || T[data.language].orderFailed);
  }
  if (data === null) return null;
  if (data === 'missing') return <p role="alert" style={{padding: '4rem 1rem', textAlign: 'center'}}>{notice}</p>;
  const lang = data.language;
  const t = T[lang];
  const money = (cents: number) => new Intl.NumberFormat(lang === 'en' ? 'en-IE' : 'it-IT', {style: 'currency', currency: 'EUR'}).format(cents / 100);
  const day = (ms: number) => new Date(ms).toLocaleDateString(lang === 'en' ? 'en-GB' : 'it-IT');
  const p = data.proposal;
  return (
    <main lang={lang} style={{maxWidth: 760, margin: '0 auto', padding: '2rem 1rem'}}>
      <h1>{p.quoteName}</h1>
      {accepted ? (
        <section aria-label={t.thanks} style={box}>
          <h2>{t.thanks}</h2>
          <p>{t.thanksText} {t.tiers[accepted.option.tier]} · {t.setup} {money(accepted.option.setupCents)} · {t.monthly} {money(accepted.option.monthlyCents)}</p>
          <h3>{t.pay}</h3>
          {accepted.payment.iban ? (
            <dl>
              <dt>{t.payText}</dt>
              <dd>{t.iban}: <strong>{accepted.payment.iban}</strong></dd>
              {accepted.payment.accountHolder ? <dd>{t.holder}: {accepted.payment.accountHolder}</dd> : null}
              <dd>{t.reference}: {accepted.payment.reference}</dd>
              <dd>{t.amount}: {money(accepted.payment.amountCents)}</dd>
            </dl>
          ) : (
            <p>{t.later}</p>
          )}
          <h3>{t.order} <mark>SANDBOX</mark></h3>
          {order ? (
            <p role="status">{t.orderDone} {order.reference} · {money(order.amountCents)}</p>
          ) : (
            <button type="button" disabled={busy} onClick={() => void checkout()}>{busy ? t.sending : t.checkout}</button>
          )}
          <p>{t.orderNote}</p>
          {error ? <p role="alert">{error}</p> : null}
        </section>
      ) : (
        <>
          <section aria-label={t.includes} style={box}>
            <h2>{t.includes}</h2>
            <p style={{whiteSpace: 'pre-wrap'}}>{p.scope}</p>
          </section>
          <form onSubmit={e => void submit(e)}>
            <fieldset style={box}>
              <legend>{t.choose}</legend>
              {p.options.map(o => (
                <label key={o.tier} style={{display: 'block', margin: '.6rem 0'}}>
                  <input type="radio" name="option" value={o.tier} checked={tier === o.tier} onChange={() => setTier(o.tier)} required />{' '}
                  <strong>{t.tiers[o.tier]}</strong> · {o.name}<br />
                  {t.setup} {money(o.setupCents)} · {t.monthly} {money(o.monthlyCents)}
                  {o.minMonths !== null ? ' · ' + t.minimum + ' ' + o.minMonths + ' ' + t.months : ''}
                  {o.deliveryDays !== null ? ' · ' + o.deliveryDays + ' ' + t.days : ''}
                </label>
              ))}
              <p>{t.net}</p>
            </fieldset>
            <section aria-label={t.terms} style={box}>
              <h2>{t.terms}</h2>
              <p style={{whiteSpace: 'pre-wrap'}}>{p.terms}</p>
              <p>{t.expires} {day(data.expiresAt)}</p>
            </section>
            <label style={{display: 'block', margin: '.6rem 0'}}>{t.name}<input name="name" required minLength={2} maxLength={120} autoComplete="name" style={{display: 'block', width: '100%'}} /></label>
            <label style={{display: 'block', margin: '.6rem 0'}}>{t.role}<input name="role" required minLength={2} maxLength={120} autoComplete="organization-title" style={{display: 'block', width: '100%'}} /></label>
            <label style={{display: 'block', margin: '.6rem 0'}}>{t.email}<input name="email" type="email" required maxLength={200} autoComplete="email" style={{display: 'block', width: '100%'}} /></label>
            <label style={{display: 'block', margin: '.6rem 0'}}><input name="terms" type="checkbox" required /> {t.agree}</label>
            <button type="submit" disabled={busy || !tier}>{busy ? t.sending : t.submit}</button>
            {error ? <p role="alert">{error}</p> : null}
          </form>
        </>
      )}
    </main>
  );
}
