import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
type Row = Record<string, unknown>;
type Run = { kind: 'agent' | 'workflow'; id: string; name: string; status: string; step: string | null; provider: string | null; model: string | null; tokens: number; costCents: number; error: string | null; retryOf: string | null; createdAt: number; updatedAt: number; canCancel: boolean; canRetry: boolean; canResume: boolean };
type Overview = { runs: Run[]; queue: { queued: number; running: number; awaitingApproval: number; failed: number; pendingApprovals: number }; capabilities: { pause: boolean; pauseReason: string; controlsEnabled: boolean }; storage: { artifacts: string; r2: boolean; limitBytes: number; note: string } };
const text = (v: unknown) => v === undefined || v === null || v === '' ? '—' : String(v);
const kindLabel = (kind: string) => kind === 'workflow' ? 'Workflow durevole' : 'Agente AI';
const euro = (cents: number) => (cents / 100).toLocaleString('it', { style: 'currency', currency: 'EUR' });
async function call(path: string, init?: RequestInit) {
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
    const data = await response.json() as Row;
    if (!response.ok) throw new Error(text(data.error));
    return data;
}
export default function MissionControl() {
    const [overview, setOverview] = useState<Overview | null>(null), [detail, setDetail] = useState<Row | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(true), [selected, setSelected] = useState<Run | null>(null), [filter, setFilter] = useState<'all' | 'agent' | 'workflow'>('all');
    const load = useCallback(async () => {
        try {
            setOverview(await call('/api/mission-control') as unknown as Overview);
            setError('');
        }
        catch (e) {
            setError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }, []);
    const loadDetail = useCallback(async (run: Run) => {
        try {
            setDetail(await call(run.kind === 'workflow' ? '/api/mission-control/workflow/' + encodeURIComponent(run.id) : '/api/agent-runs/' + encodeURIComponent(run.id)));
        }
        catch (e) {
            setError((e as Error).message);
        }
    }, []);
    useEffect(() => { void load(); const interval = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 10000); return () => clearInterval(interval); }, [load]);
    useEffect(() => { if (selected) void loadDetail(selected); }, [selected?.id, selected?.kind, selected?.updatedAt, loadDetail]);
    // Keep the open run in step with the list refresh, so a status change is never stale in the detail.
    useEffect(() => { if (!selected || !overview) return; const fresh = overview.runs.find(r => r.id === selected.id && r.kind === selected.kind); if (fresh && fresh.updatedAt !== selected.updatedAt) { setSelected(fresh); } }, [overview, selected]);
    async function act(run: Run, action: 'cancel' | 'retry' | 'resume') {
        setError(''); setNotice('');
        const base = run.kind === 'workflow' ? '/api/workflow-runs/' : '/api/agent-runs/';
        try {
            await call(base + encodeURIComponent(run.id) + '/' + action, { method: 'POST', body: '{}' });
            setNotice(({ cancel: 'Esecuzione annullata e registrata nel log di audit.', retry: 'Nuovo tentativo avviato.', resume: 'Ripresa richiesta al runtime.' })[action]);
            await load();
            await loadDetail(run);
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    const runs = (overview?.runs || []).filter(r => filter === 'all' || r.kind === filter);
    const tokens = (overview?.runs || []).reduce((n, r) => n + r.tokens, 0), cost = (overview?.runs || []).reduce((n, r) => n + r.costCents, 0);
    const queue = overview?.queue;
    return <section className="os-mission"><div className="os-panel-title"><div><h2>Mission Control</h2><p className="os-hint">Agenti AI e workflow durevoli · aggiornamento ogni 10 secondi</p></div><Link className="os-button secondary" to="/admin/agents">Registro e nuovi incarichi ↗</Link></div><div className="os-mission-metrics"><span><strong>{queue?.running ?? 0}</strong> in corso</span><span><strong>{queue?.queued ?? 0}</strong> in coda</span><span><strong>{queue?.awaitingApproval ?? 0}</strong> da approvare</span><span><strong>{queue?.failed ?? 0}</strong> con errore</span><span><strong>{tokens.toLocaleString('it')}</strong> token misurati</span><span><strong>{euro(cost)}</strong> costo registrato</span></div><div className="os-mission-filter" role="group" aria-label="Filtra esecuzioni">{(['all', 'agent', 'workflow'] as const).map(f => <button key={f} className={'os-text-button' + (filter === f ? ' is-active' : '')} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'Tutte' : f === 'agent' ? 'Agenti AI' : 'Workflow'}</button>)}</div>{notice && <p className="os-notice" role="status">{notice}</p>}{error && <p className="os-error" role="alert">{error}</p>}{busy && <p role="status">Caricamento esecuzioni…</p>}<div className="os-mission-grid"><div className="os-run-list">{runs.map(run => <button className={'os-run ' + (selected?.id === run.id && selected.kind === run.kind ? 'is-selected' : '')} key={run.kind + run.id} onClick={() => { setDetail(null); setSelected(run); setError(''); setNotice(''); }}><span className={'os-badge ' + run.status.toLowerCase()}>{run.status.replaceAll('_', ' ')}</span><strong>{run.name}</strong><small>{kindLabel(run.kind)}{run.kind === 'agent' ? ' · ' + text(run.provider) + ' / ' + text(run.model) : run.step ? ' · passo ' + run.step : ''}</small><small>{run.tokens ? run.tokens.toLocaleString('it') + ' token · ' : ''}{new Date(run.createdAt).toLocaleString('it')}</small>{Boolean(run.error) && <span className="os-run-error">{text(run.error)}</span>}</button>)}{!busy && !runs.length && <div className="os-empty"><h3>Nessuna esecuzione registrata.</h3><p>Assegna un incarico dal registro o avvia un workflow. Qui compariranno stati, consumi e risultati reali.</p></div>}</div><section className="os-panel" aria-live="polite">{!selected ? <><h3>Seleziona un’esecuzione</h3><p>Apri il percorso, i risultati e gli artefatti. Il registro descrive gli agenti disponibili; questa vista mostra il lavoro eseguito.</p></> : !detail ? <p>Caricamento dettagli…</p> : <RunDetail run={selected} detail={detail} overview={overview} onAct={act} />}</section></div></section>;
}
function Confirm({ label, hint, disabled, onConfirm }: { label: string; hint: string; disabled?: boolean; onConfirm: () => void }) {
    const [asking, setAsking] = useState(false);
    if (asking) return <span className="os-inline-actions"><span className="os-hint">{hint}</span><button className="os-text-button" onClick={() => { setAsking(false); onConfirm(); }}>Conferma · {label}</button><button className="os-text-button" onClick={() => setAsking(false)}>Annulla</button></span>;
    return <button className="os-button secondary" disabled={disabled} onClick={() => setAsking(true)}>{label}</button>;
}
function RunDetail({ run, detail, overview, onAct }: { run: Run; detail: Row; overview: Overview | null; onAct: (run: Run, action: 'cancel' | 'retry' | 'resume') => Promise<void> }) {
    const current = (detail.run || detail) as Row, steps = (detail.steps || []) as Row[], artifacts = (detail.artifacts || []) as Row[], events = (detail.events || []) as Row[], approvals = (detail.approvals || []) as Row[];
    const controls = overview?.capabilities.controlsEnabled;
    return <><h3>{text(run.name)}</h3><span className="os-badge">{text(current.status || run.status)}</span><dl className="os-run-facts"><dt>Tipo</dt><dd>{kindLabel(run.kind)}</dd>{run.kind === 'agent' ? <><dt>Provider / modello</dt><dd>{text(current.provider)} / {text(current.model)}</dd><dt>Token misurati</dt><dd>{text(current.tokens_used || 0)}</dd><dt>Costo</dt><dd>{euro(Number(current.cost_cents || 0))}</dd></> : <><dt>Passo corrente</dt><dd>{text(current.current_node)}</dd></>}{Boolean(run.retryOf) && <><dt>Nuovo tentativo di</dt><dd>{text(run.retryOf)}</dd></>}</dl>{controls && <div className="os-run-controls" role="group" aria-label="Controlli esecuzione">{run.canCancel && <Confirm label="Annulla esecuzione" hint={run.kind === 'workflow' ? 'Si ferma al prossimo passaggio.' : 'Libera la prenotazione di budget.'} onConfirm={() => void onAct(run, 'cancel')} />}{run.canRetry && <Confirm label="Riprova" hint="Rilancia lo stesso incarico: usa il budget AI." onConfirm={() => void onAct(run, 'retry')} />}{run.canResume && <Confirm label="Riprendi" hint="Riprende dal passo in cui si è fermata." onConfirm={() => void onAct(run, 'resume')} />}<button className="os-button secondary" disabled aria-describedby="mission-pause-reason">Pausa non disponibile</button><small id="mission-pause-reason" className="os-hint">{overview?.capabilities.pauseReason}</small></div>}<h4>Percorso di esecuzione</h4>{steps.length ? <ol className="os-run-steps">{steps.map(step => <li key={String(step.id)}><strong>{text(step.name || step.node_id)}</strong>{Boolean(step.kind) && <small> · {text(step.kind)}</small>} <span className="os-badge">{text(step.status)}</span>{Boolean(step.duration_ms) && <small> · {text(step.duration_ms)} ms</small>}{Number(step.attempts) > 1 && <small> · {text(step.attempts)} tentativi</small>}{Boolean(step.error) && <span className="os-run-error"> {text(step.error)}</span>}</li>)}</ol> : <p className="os-hint">Nessuno step dettagliato registrato per questa esecuzione.</p>}<h4>Eventi registrati · {events.length}</h4>{events.map(event => <div className="os-activity" key={String(event.id)}><div><strong>{text(event.action)}</strong><p>{new Date(Number(event.created_at)).toLocaleString('it')}</p></div></div>)}{run.kind === 'agent' && <><h4>Approvazioni · {approvals.length}</h4>{approvals.map(approval => <p key={String(approval.id)}><span className="os-badge">{text(approval.status)}</span> {text(approval.name)}</p>)}</>}<h4>Artefatti · {artifacts.length}</h4>{artifacts.map(artifact => run.kind === 'agent' ? <Artifact key={String(artifact.id)} artifact={artifact} /> : <div className="os-artifact" key={String(artifact.id)}><Link className="os-text-button" to={String(artifact.route)}>{text(artifact.kind)} · {text(artifact.name)} ↗</Link><small>{text(artifact.status)} · prodotto dal passo {text(artifact.stepNode)}</small></div>)}{!artifacts.length && <p className="os-hint">Nessun artefatto disponibile.</p>}<p className="os-hint" data-storage={overview?.storage.artifacts}>{overview?.storage.note}</p>{Boolean(current.error) && <p className="os-error">{text(current.error)}</p>}<Link className="os-text-button" to="/admin/approvals">Apri le approvazioni ↗</Link></>;
}
function Artifact({ artifact }: { artifact: Row }) {
    const [content, setContent] = useState(''), [error, setError] = useState('');
    async function open() {
        try {
            const data = await call('/api/artifacts/' + encodeURIComponent(String(artifact.id)));
            const value = (data.artifact || data) as Row;
            setContent(typeof value.content === 'string' ? value.content : JSON.stringify(value, null, 2));
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    const size = Number(artifact.size_bytes || 0);
    return <div className="os-artifact"><button className="os-text-button" onClick={() => void open()}>{text(artifact.name)} · v{text(artifact.version || 1)} ↗</button><small>{text(artifact.kind)} · {size ? (size / 1024).toFixed(1) + ' KB · ' : ''}SHA {text(artifact.sha256).slice(0, 16)}</small>{content && <pre>{content}</pre>}{error && <p role="alert">{error}</p>}</div>;
}
