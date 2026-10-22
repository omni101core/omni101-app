import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
type Row = Record<string, unknown>;
type Stage = { key: string; label: string; state: 'DONE' | 'ACTIVE' | 'WAITING'; detail: string };
type Pipeline = { project: Row; stages: Stage[]; tasks: Row[]; reviews: Row[]; deliverables: Row[]; tickets: Row[]; events: Row[]; sharedWithClient: boolean };
const text = (v: unknown) => v === undefined || v === null || v === '' ? '—' : String(v);
const stateLabel = { DONE: 'Completata', ACTIVE: 'In corso', WAITING: 'In attesa' } as const;
async function call(path: string, init?: RequestInit) {
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
    const data = await response.json() as Row;
    if (!response.ok) throw new Error(text(data.error));
    return data;
}
export default function ProjectPipeline() {
    const [projects, setProjects] = useState<Row[]>([]), [clients, setClients] = useState<Row[]>([]), [projectId, setProjectId] = useState(''), [data, setData] = useState<Pipeline | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [notes, setNotes] = useState<Record<string, string>>({});
    useEffect(() => {
        void Promise.all([call('/api/records/projects'), call('/api/records/clients')]).then(([p, c]) => {
            const list = (p.records || []) as Row[];
            setProjects(list); setClients((c.records || []) as Row[]);
            const wanted = new URLSearchParams(window.location.search).get('project');
            setProjectId(prev => prev || (wanted && list.some(item => item.id === wanted) ? wanted : String(list[0]?.id || '')));
        }).catch(e => setError((e as Error).message));
    }, []);
    const load = useCallback(async () => {
        if (!projectId) { setData(null); return; }
        try { setData(await call('/api/projects/' + encodeURIComponent(projectId) + '/pipeline') as unknown as Pipeline); setError(''); }
        catch (e) { setError((e as Error).message); }
    }, [projectId]);
    useEffect(() => { void load(); }, [load]);
    async function run(label: string, work: () => Promise<unknown>) {
        setBusy(true); setError(''); setNotice('');
        try { await work(); setNotice(label); await load(); }
        catch (e) { setError((e as Error).message); }
        finally { setBusy(false); }
    }
    const post = (path: string, body: unknown = {}) => call(path, { method: 'POST', body: JSON.stringify(body) });
    const pending = new Set((data?.reviews || []).filter(r => r.status === 'PENDING').map(r => String(r.task_id)));
    const work = (data?.tasks || []).filter(t => t.kind === 'WORK');
    const taskName = (taskId: unknown) => text((data?.tasks || []).find(t => t.id === taskId)?.name);
    function createDeliverable(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget, values = Object.fromEntries(new FormData(form));
        void run('Deliverable preparato in bozza.', async () => { await post('/api/projects/' + encodeURIComponent(projectId) + '/deliverables', { name: values.name, body: values.body }); form.reset(); });
    }
    return <section className="os-pipeline"><div className="os-panel-title"><div><h2>Pipeline di progetto</h2><p className="os-hint">Esecuzione → QA → consegna → manutenzione. Ogni passaggio è registrato nel log di audit.</p></div></div>
        <label className="os-field">Progetto<select value={projectId} onChange={e => setProjectId(e.target.value)}>{projects.map(p => <option key={String(p.id)} value={String(p.id)}>{text(p.name)}</option>)}</select></label>
        {notice && <p className="os-notice" role="status">{notice}</p>}{error && <p className="os-error" role="alert">{error}</p>}
        {!projects.length && <div className="os-empty"><h3>Nessun progetto.</h3><p>Crea un progetto o converti un lead approvato per avviare la pipeline.</p></div>}
        {data && <>
            <ol className="os-stages" aria-label="Fasi della pipeline">{data.stages.map(stage => <li key={stage.key} data-state={stage.state}><strong>{stage.label}</strong><span className={'os-badge ' + (stage.state === 'DONE' ? 'done' : stage.state === 'ACTIVE' ? 'active' : '')}>{stateLabel[stage.state]}</span><small>{stage.detail}</small></li>)}</ol>
            {!data.project.client_id && <div className="os-panel"><h3>Cliente non associato</h3><p className="os-hint">La consegna richiede un cliente: è lui a vedere i deliverable nel portale.</p><label className="os-field">Cliente<select aria-label="Cliente da associare" defaultValue="" onChange={e => { const value = e.target.value; if (value) void run('Cliente associato al progetto.', () => call('/api/records/projects/' + encodeURIComponent(projectId), { method: 'PATCH', body: JSON.stringify({ client_id: value }) })); }}><option value="">Seleziona…</option>{clients.map(c => <option key={String(c.id)} value={String(c.id)}>{text(c.name)}</option>)}</select></label></div>}
            <div className="os-panel"><h3>Attività</h3><table className="os-table"><thead><tr><th>Attività</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>{work.map(task => <tr key={String(task.id)}><td>{text(task.name)}</td><td><span className="os-badge">{text(task.status)}</span></td><td>{task.status === 'TODO' && <button className="os-text-button" disabled={busy} onClick={() => void run('Attività in lavorazione.', () => call('/api/records/tasks/' + encodeURIComponent(String(task.id)), { method: 'PATCH', body: JSON.stringify({ status: 'IN_PROGRESS' }) }))}>Avvia lavorazione</button>}{['IN_PROGRESS', 'REVIEW'].includes(String(task.status)) && !pending.has(String(task.id)) && <button className="os-text-button" disabled={busy} onClick={() => void run('QA richiesta: attende un esito motivato.', () => post('/api/tasks/' + encodeURIComponent(String(task.id)) + '/request-qa'))}>Richiedi QA</button>}{pending.has(String(task.id)) && <small>QA in attesa</small>}</td></tr>)}{!work.length && <tr><td colSpan={3}>Nessuna attività di lavoro nel progetto.</td></tr>}</tbody></table></div>
            <div className="os-panel"><h3>Verifiche QA</h3>{data.reviews.length ? data.reviews.map(review => <article className="os-activity" key={String(review.id)}><div><strong>QA · {taskName(review.task_id)}</strong><p><span className={'os-badge ' + (review.status === 'PASS' ? 'done' : '')}>{text(review.status)}</span> {review.notes ? text(review.notes) : ''}</p>{review.status === 'PENDING' && <><label className="os-field">Motivazione dell’esito<textarea rows={2} value={notes[String(review.id)] || ''} onChange={e => setNotes({ ...notes, [String(review.id)]: e.target.value })} /></label><div className="os-inline-actions"><button className="os-button" disabled={busy || (notes[String(review.id)] || '').trim().length < 5} onClick={() => void run('QA superata: attività chiusa.', () => post('/api/qa/' + encodeURIComponent(String(review.id)) + '/outcome', { outcome: 'PASS', notes: notes[String(review.id)] }))}>Supera QA</button><button className="os-button secondary" disabled={busy || (notes[String(review.id)] || '').trim().length < 5} onClick={() => void run('QA rifiutata: l’attività torna in lavorazione.', () => post('/api/qa/' + encodeURIComponent(String(review.id)) + '/outcome', { outcome: 'REJECT', notes: notes[String(review.id)] }))}>Rifiuta QA</button></div></>}</div></article>) : <p className="os-hint">Nessuna verifica richiesta.</p>}</div>
            <div className="os-panel"><h3>Consegna</h3><form onSubmit={createDeliverable}><label className="os-field">Nome del deliverable<input name="name" required minLength={2} maxLength={160} /></label><label className="os-field">Contenuto per il cliente<textarea name="body" required rows={3} maxLength={30000} /></label><button className="os-button" disabled={busy}>Prepara deliverable</button></form>{data.deliverables.map(item => <article className="os-activity" key={String(item.id)}><div><strong>{text(item.name)} · v{text(item.version)}</strong><p><span className={'os-badge ' + (item.status === 'APPROVED' ? 'done' : '')}>{text(item.status)}</span> {Boolean(item.client_note) && <>Nota del cliente: {text(item.client_note)}</>}</p>{['DRAFT', 'CHANGES_REQUESTED'].includes(String(item.status)) && <button className="os-button" disabled={busy} onClick={() => void run('Deliverable consegnato: il cliente lo vede nel portale.', () => post('/api/deliverables/' + encodeURIComponent(String(item.id)) + '/deliver'))}>Consegna al cliente</button>}</div></article>)}</div>
            <div className="os-panel"><h3>Manutenzione</h3>{data.tickets.length ? data.tickets.map(ticket => <article className="os-activity" key={String(ticket.id)}><div><strong>{text(ticket.name)}</strong><p><span className="os-badge">{text(ticket.status)}</span> priorità {text(ticket.priority)}</p></div></article>) : <p className="os-hint">Nessun ticket dal cliente.</p>}<Link className="os-text-button" to="/admin/issues">Gestisci i ticket ↗</Link></div>
            <div className="os-panel"><h3>Eventi della pipeline · {data.events.length}</h3>{data.events.map(event => <div className="os-activity" key={String(event.id)}><div><strong>{text(event.stage)} · {text(event.event_type)}</strong><p>{new Date(Number(event.created_at)).toLocaleString('it')}</p></div></div>)}</div>
        </>}
    </section>;
}
