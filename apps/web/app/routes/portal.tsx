import AuthGate from '../components/AuthGate';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
type Row = Record<string, unknown>;
export function meta() { return [{ title: 'Il tuo progetto · OMNI101' }, { name: 'robots', content: 'noindex,nofollow' }]; }
const text = (v: unknown) => v === undefined || v === null || v === '' ? '—' : String(v);
const money = (v: unknown) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(v || 0) / 100);
const statusLabel: Record<string, string> = { DELIVERED: 'Da approvare', APPROVED: 'Approvato', CHANGES_REQUESTED: 'Modifiche richieste', OPEN: 'Aperta', IN_PROGRESS: 'In lavorazione', RESOLVED: 'Risolta', CLOSED: 'Chiusa' };
async function call(path: string, init?: RequestInit) {
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
    const data = await response.json() as Row;
    if (!response.ok) throw new Error(text(data.error));
    return data;
}
export default function Portal() {
    const location = useLocation();
    const [data, setData] = useState<Row | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [changes, setChanges] = useState<Record<string, string>>({});
    const token = new URLSearchParams(location.search).get('token');
    const load = useCallback(async () => { try { setData(await call('/api/portal')); setError(''); } catch (e) { setError((e as Error).message); } }, []);
    useEffect(() => { if (!token) void load(); }, [token, load]);
    async function decide(id: string, decision: 'APPROVED' | 'CHANGES_REQUESTED') {
        setBusy(true); setError(''); setNotice('');
        try {
            await call('/api/portal/deliverables/' + encodeURIComponent(id) + '/decision', { method: 'POST', body: JSON.stringify({ decision, note: changes[id] || undefined }) });
            setNotice(decision === 'APPROVED' ? 'Consegna approvata. Grazie.' : 'Richiesta di modifiche inviata allo studio.');
            await load();
        }
        catch (e) { setError((e as Error).message); }
        finally { setBusy(false); }
    }
    async function openTicket(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget, values = Object.fromEntries(new FormData(form));
        setBusy(true); setError(''); setNotice('');
        try {
            await call('/api/portal/tickets', { method: 'POST', body: JSON.stringify({ projectId: values.projectId, name: values.name, description: values.description, priority: values.priority }) });
            form.reset();
            setNotice('Richiesta inviata allo studio.');
            await load();
        }
        catch (e) { setError((e as Error).message); }
        finally { setBusy(false); }
    }
    if (token) return <AuthGate inviteToken={token} />;
    const list = (key: string) => (data?.[key] as Row[] | undefined) || [];
    const projects = list('projects'), deliverables = list('deliverables'), tickets = list('tickets');
    return <div className="os-login"><Link className="os-wordmark" to="/">OMNI<span>101</span></Link><main style={{ maxWidth: 1100, margin: '8vh auto' }}><span className="os-eyebrow">CLIENT SPACE</span><h1 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400 }}>Le idee prendono forma.<br /><em>Insieme.</em></h1>
        {notice && <p className="os-notice" role="status">{notice}</p>}{error && <p className="os-error" role="alert">{error}</p>}
        {!data ? <><p>{error ? 'Accedi per vedere il tuo spazio.' : 'Caricamento dei tuoi progetti…'}</p><a className="os-button" href="/admin">Accedi al tuo spazio →</a></> : <div className="os-dashboard-grid">
            <section className="os-panel" id="portal-projects" aria-labelledby="portal-projects-title"><h2 id="portal-projects-title">I tuoi progetti</h2>{projects.length ? projects.map(item => <article className="os-activity" key={String(item.id)}><div><strong>{text(item.name)}</strong><p>{text(item.status)}</p>{item.description ? <p>{text(item.description)}</p> : null}</div></article>) : <p>Nessun elemento condiviso al momento.</p>}</section>
            <section className="os-panel" id="portal-deliverables" aria-labelledby="portal-deliverables-title"><h2 id="portal-deliverables-title">Consegne</h2>{deliverables.length ? deliverables.map(item => { const id = String(item.id); return <article className="os-activity" key={id}><div><strong>{text(item.name)} · v{text(item.version)}</strong><p>{text(item.project_name)} · <span className="os-badge">{statusLabel[String(item.status)] || text(item.status)}</span></p>{item.body ? <p>{text(item.body)}</p> : null}{item.client_note ? <p>La tua nota: {text(item.client_note)}</p> : null}{item.status === 'DELIVERED' && <><label className="os-field">Cosa va modificato (solo se chiedi modifiche)<textarea rows={2} value={changes[id] || ''} onChange={e => setChanges({ ...changes, [id]: e.target.value })} /></label><div className="os-button-row"><button className="os-button" disabled={busy} onClick={() => void decide(id, 'APPROVED')}>Approva consegna</button><button className="os-button secondary" disabled={busy || (changes[id] || '').trim().length < 5} onClick={() => void decide(id, 'CHANGES_REQUESTED')}>Richiedi modifiche</button></div></>}</div></article>; }) : <p>Nessuna consegna da rivedere al momento.</p>}</section>
            <section className="os-panel" id="portal-tickets" aria-labelledby="portal-tickets-title"><h2 id="portal-tickets-title">Manutenzione e richieste</h2>{projects.length ? <form onSubmit={e => void openTicket(e)}><label className="os-field">Progetto<select name="projectId" required>{projects.map(p => <option key={String(p.id)} value={String(p.id)}>{text(p.name)}</option>)}</select></label><label className="os-field">Titolo della richiesta<input name="name" required minLength={3} maxLength={120} /></label><label className="os-field">Descrizione<textarea name="description" required minLength={10} maxLength={4000} rows={3} /></label><label className="os-field">Priorità<select name="priority" defaultValue="NORMAL"><option value="LOW">Bassa</option><option value="NORMAL">Normale</option><option value="HIGH">Alta</option></select></label><button className="os-button" disabled={busy}>Invia richiesta</button></form> : <p>Potrai aprire richieste quando un progetto sarà condiviso con te.</p>}{tickets.map(item => <article className="os-activity" key={String(item.id)}><div><strong>{text(item.name)}</strong><p><span className="os-badge">{statusLabel[String(item.status)] || text(item.status)}</span> {text(item.description)}</p></div></article>)}</section>
            <section className="os-panel" id="portal-proposals" aria-labelledby="portal-proposals-title"><h2 id="portal-proposals-title">Proposte</h2><p className="os-hint">Approvate internamente. La visualizzazione non equivale ad accettazione, firma o pagamento.</p>{list('proposals').length ? list('proposals').map(item => <article className="os-activity" key={String(item.id)}><div><strong>{text(item.name)}</strong><p>{statusLabel[String(item.status)]||text(item.status)}{item.pricing_version?' · v'+text(item.pricing_version):''}{item.amount_cents!==null&&item.amount_cents!==undefined ? ' · '+(item.pricing_version?'Quota una tantum netta: ':'')+money(item.amount_cents) : ''}</p>{item.summary ? <p>{text(item.summary)}</p> : null}{(item.scope||item.terms)&&<details><summary>Ambito e condizioni</summary>{item.scope&&<p>{text(item.scope)}</p>}{item.terms&&<p>{text(item.terms)}</p>}{item.valid_until&&<p>Validità dichiarata: {text(item.valid_until)}</p>}</details>}</div></article>) : <p>Nessun elemento condiviso al momento.</p>}</section>
            <section className="os-panel" id="portal-documents" aria-labelledby="portal-documents-title"><h2 id="portal-documents-title">Documenti</h2>{[...list('invoices'), ...list('contracts')].length ? [...list('invoices'), ...list('contracts')].map(item => <article className="os-activity" key={String(item.id)}><div><strong>{text(item.name)}</strong><p>{text(item.status)}{item.amount_cents ? ' · ' + money(item.amount_cents) : ''}</p></div></article>) : <p>Nessun elemento condiviso al momento.</p>}</section>
        </div>}
    </main></div>;
}
