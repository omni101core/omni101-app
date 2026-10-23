import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Feedback, type FeedbackState} from './ProductUI';

type Row = Record<string, unknown>;
type Data = {
  canPrepareBacklog: boolean;
  today: string;
  priorities: Row[];
  projects: Row[];
  notifications: Row[];
  failedRuns: Row[];
  approvals: Row[];
  overdueCount: number;
  finance: null | {balance: Row; projects: Row[]; note: string};
  algorithm: string;
};

const text = (v: unknown) => String(v ?? '—');
const money = (v: unknown) =>
  new Intl.NumberFormat('it-IT', {style: 'currency', currency: 'EUR'}).format(Number(v || 0) / 100);

function pageState(data: Data | null, busy: boolean, error: string): FeedbackState | null {
  if (busy && !data) return 'loading';
  if (busy) return 'pending';
  if (error) return 'error';
  if (!data) return 'empty';
  return null;
}

function nextStep(data: Data): string {
  const task = data.priorities[0];
  if (task) return `Apri l'attività «${text(task.name)}».`;
  const approval = data.approvals[0];
  if (approval) return `Apri l'approvazione «${text(approval.name)}».`;
  const run = data.failedRuns[0];
  if (run) return `Controlla l'esecuzione «${text(run.name)}» nell'elenco.`;
  const note = data.notifications[0];
  if (note) return `Segna come letta «${text(note.name)}».`;
  if (data.canPrepareBacklog) return 'Prepara il backlog operativo: nessuna attività aperta.';
  return 'Niente in coda sui record caricati.';
}

export default function OperationsOverview({financeOnly = false}: {financeOnly?: boolean}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const retry = useRef<() => void>(() => {});

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/operations');
      const body = (await res.json()) as Data & {error?: string};
      if (!res.ok) throw new Error(body.error || 'Caricamento non riuscito');
      setData(body);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      retry.current = () => void load();
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function prepare() {
    setBusy(true);
    try {
      const response = await fetch('/api/setup/operating-backlog', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: '{}',
      });
      if (!response.ok) throw new Error('Backlog non preparato');
      await load();
    } catch (e) {
      setError((e as Error).message);
      retry.current = () => void prepare();
    } finally {
      setBusy(false);
    }
  }

  async function read(id: unknown) {
    try {
      const res = await fetch('/api/notifications/' + encodeURIComponent(text(id)) + '/read', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: '{}',
      });
      if (!res.ok) throw new Error('Notifica non aggiornata');
      await load();
    } catch (e) {
      setError((e as Error).message);
      retry.current = () => void read(id);
    }
  }

  const state = pageState(data, busy, error);
  const message =
    state === 'loading'
      ? 'Caricamento del centro operativo…'
      : state === 'pending'
        ? 'Aggiornamento del centro in corso…'
        : state === 'error'
          ? error
          : state === 'empty'
            ? 'Nessun dato ricevuto. Riprova per ricaricare il centro.'
            : undefined;

  const finance = data?.finance ? (
    <section className="os-panel">
      <h3>Incassi, crediti e costi registrati</h3>
      <p className="os-hint">{data.finance.note}</p>
      <div className="os-metrics">
        {(
          [
            ['Incassato', 'received_cents'],
            ['Da incassare', 'receivable_cents'],
            ['Spese pagate', 'paid_expenses_cents'],
            ['Costo AI totale', 'ai_cost_cents'],
          ] as const
        ).map(([label, key]) => (
          <article className="os-metric" key={key}>
            <span>{label}</span>
            <strong>{money(data.finance!.balance[key])}</strong>
          </article>
        ))}
      </div>
      {data.finance.projects.length ? (
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Progetto</th>
                <th>Budget</th>
                <th>Incassi</th>
                <th>Spese registrate</th>
                <th>Differenza parziale</th>
              </tr>
            </thead>
            <tbody>
              {data.finance.projects.map(p => (
                <tr key={text(p.id)}>
                  <td>{text(p.name)}</td>
                  <td>{p.budget_cents == null ? 'Non definito' : money(p.budget_cents)}</td>
                  <td>{money(p.received_cents)}</td>
                  <td>{money(p.recorded_expenses_cents)}</td>
                  <td>{money(Number(p.received_cents) - Number(p.recorded_expenses_cents))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Feedback state="empty" message="Nessun progetto con importi registrati." />
      )}
    </section>
  ) : financeOnly ? (
    <Feedback state="unauthorized" message="Vista riservata ai ruoli Owner, Admin e Finance." />
  ) : null;

  return (
    <section className="os-operations">
      <div className="os-panel-title">
        <div>
          <h2>{financeOnly ? 'Situazione economica' : 'Centro operativo'}</h2>
          <p className="os-hint">
            {data
              ? `Giorno registrato: ${data.today}. Numeri dai record, senza stime.`
              : 'Numeri dai record, senza stime.'}
          </p>
        </div>
        <button className="os-button secondary" type="button" disabled={busy} onClick={() => void load()}>
          Ricarica il centro
        </button>
      </div>
      {state ? (
        <Feedback
          state={state}
          message={message}
          onRetry={
            state === 'error' ? () => void retry.current() : state === 'empty' ? () => void load() : undefined
          }
        />
      ) : null}
      {data ? (
        financeOnly ? (
          finance
        ) : (
          <>
            <section className="os-panel os-ops-now-panel" aria-labelledby="os-ops-now">
              <h3 id="os-ops-now">Da affrontare adesso</h3>
              <p className="os-ops-now">{nextStep(data)}</p>
              <p className="os-hint">{data.algorithm}</p>
              {data.priorities.length ? (
                <ol className="os-priority-list">
                  {data.priorities.map(t => (
                    <li key={text(t.id)}>
                      <Link to={'/admin/tasks?record=' + encodeURIComponent(text(t.id))}>
                        <strong>{`Apri attività: ${text(t.name)}`}</strong>
                        <small>
                          {`${text(t.project_name)} · ${text(t.priority)} · ${text(t.assignee_name)} · ${text(t.due_date)}`}
                        </small>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <Feedback
                  state="empty"
                  message={
                    data.canPrepareBacklog
                      ? 'Nessuna attività aperta. Prepara il backlog operativo qui sotto.'
                      : 'Nessuna attività aperta.'
                  }
                />
              )}
            </section>
            {data.canPrepareBacklog ? (
              <section className="os-panel">
                <h3>Continuità dello studio</h3>
                <p>
                  Prepara 15 attività, 3 traguardi e 3 workflow in bozza. Ripetere conserva le modifiche. Nessun agente
                  viene avviato.
                </p>
                <button className="os-button secondary" type="button" disabled={busy} onClick={() => void prepare()}>
                  Prepara backlog operativo
                </button>
              </section>
            ) : null}
            <section className="os-panel">
              <h3>Approvazioni e problemi</h3>
              {data.approvals.length ? (
                data.approvals.map(a => (
                  <p key={text(a.id)}>
                    <Link to={'/admin/approvals?record=' + encodeURIComponent(text(a.id))}>
                      {`Apri approvazione: ${text(a.name)}`}
                    </Link>
                  </p>
                ))
              ) : null}
              {data.failedRuns.length ? (
                data.failedRuns.map(r => (
                  <p key={text(r.id)}>
                    <Link to="/admin/agent-runs">
                      {`Apri elenco esecuzioni: ${text(r.name)}, stato ${text(r.status)}`}
                    </Link>
                  </p>
                ))
              ) : null}
              {data.approvals.length || data.failedRuns.length ? null : (
                <Feedback state="empty" message="Nessuna approvazione in attesa e nessuna esecuzione da verificare." />
              )}
            </section>
            <section className="os-panel">
              <h3>Notifiche non lette</h3>
              {data.notifications.length ? (
                data.notifications.map(n => (
                  <article className="os-activity" key={text(n.id)}>
                    <div>
                      <strong>{text(n.name)}</strong>
                      <p>{text(n.body)}</p>
                      <button className="os-text-button" type="button" onClick={() => void read(n.id)}>
                        {`Segna come letta: ${text(n.name)}`}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <Feedback state="empty" message="Nessuna notifica non letta." />
              )}
            </section>
            <div className="os-metrics">
              <article className="os-metric">
                <span>Attività scadute</span>
                <strong>{data.overdueCount}</strong>
                <small>Aperte, non completate, scadenza già passata. Data UTC.</small>
              </article>
              <article className="os-metric">
                <span>Approvazioni in lista</span>
                <strong>{data.approvals.length}</strong>
                <small>Solo questa lista, massimo 20. Non è lo storico.</small>
              </article>
              <article className="os-metric">
                <span>Notifiche non lette in lista</span>
                <strong>{data.notifications.length}</strong>
                <small>Solo questa lista, massimo 30.</small>
              </article>
            </div>
            <section className="os-panel">
              <h3>Avanzamento progetti</h3>
              {data.projects.length ? (
                data.projects.map(p => {
                  const all = Number(p.total_tasks);
                  const done = Number(p.done_tasks);
                  return (
                    <article className="os-project-progress" key={text(p.id)}>
                      <Link to={'/admin/planning?project=' + encodeURIComponent(text(p.id))}>
                        {`Apri pianificazione: ${text(p.name)}`}
                      </Link>
                      <span>{`${done}/${all} attività · ${text(p.due_date)}`}</span>
                      <progress value={done} max={Math.max(all, 1)} aria-label={'Avanzamento ' + text(p.name)} />
                    </article>
                  );
                })
              ) : (
                <Feedback state="empty" message="Nessun progetto aperto." />
              )}
            </section>
            {finance}
          </>
        )
      ) : null}
    </section>
  );
}
