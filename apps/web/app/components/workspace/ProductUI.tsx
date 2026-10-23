import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {useBlocker} from 'react-router';

export type FeedbackState =
  | 'loading'
  | 'empty'
  | 'error'
  | 'success'
  | 'pending'
  | 'unauthorized'
  | 'read-only'
  | 'offline';

const FEEDBACK_COPY: Record<FeedbackState, string> = {
  loading: 'Caricamento in corso…',
  empty: 'Nessun elemento da mostrare.',
  error: 'Operazione non riuscita. Controlla i dati e riprova.',
  success: 'Operazione completata.',
  pending: 'Operazione in attesa…',
  unauthorized: 'Non hai i permessi per questa azione.',
  'read-only': 'Solo lettura. Non puoi modificare questi dati.',
  offline: 'Sei offline. Riprova quando torni in rete.',
};

function feedbackRole(state: FeedbackState): 'alert' | 'status' {
  return state === 'error' || state === 'unauthorized' ? 'alert' : 'status';
}

export function ActionButton({
  busy = false,
  pending = false,
  variant = 'primary',
  children,
  disabled,
  confirm,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  pending?: boolean;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  /** Se true o stringa: conferma inline a due passi (niente window.confirm). */
  confirm?: boolean | string;
}) {
  const isBusy = Boolean(busy || pending);
  const [awaiting, setAwaiting] = useState(false);
  const needsConfirm = Boolean(confirm);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isBusy) setAwaiting(false);
  }, [isBusy]);

  useEffect(() => {
    if (!awaiting) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAwaiting(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [awaiting]);

  if (needsConfirm && awaiting) {
    const label = typeof confirm === 'string' ? confirm : 'Conferma';
    return (
      <span className="pui-confirm">
        <button
          {...props}
          ref={confirmRef}
          type={props.type || 'button'}
          className={'os-button pui-confirm-go ' + (variant === 'secondary' ? 'secondary' : '')}
          disabled={disabled || isBusy}
          aria-busy={isBusy ? true : undefined}
          onClick={e => {
            setAwaiting(false);
            onClick?.(e);
          }}
        >
          {isBusy ? 'Operazione in corso…' : label}
        </button>
        <button
          type="button"
          className="os-button secondary pui-confirm-cancel"
          disabled={isBusy}
          onClick={() => setAwaiting(false)}
        >
          Annulla
        </button>
      </span>
    );
  }

  return (
    <button
      {...props}
      type={props.type || 'button'}
      className={'os-button ' + (variant === 'secondary' ? 'secondary' : '')}
      disabled={disabled || isBusy}
      aria-busy={isBusy ? true : undefined}
      onClick={e => {
        if (needsConfirm) {
          e.preventDefault();
          setAwaiting(true);
          return;
        }
        onClick?.(e);
      }}
    >
      {isBusy ? 'Operazione in corso…' : children}
    </button>
  );
}

export function TextField({
  label,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {label: string; hint?: string; error?: string}) {
  const generated = useId();
  const id = props.id || generated;
  return (
    <div className="os-field">
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? id + '-hint' : undefined}
      />
      {hint || error ? (
        <small id={id + '-hint'} className={error ? 'os-error' : 'os-hint'}>
          {error || hint}
        </small>
      ) : null}
    </div>
  );
}

export function Panel({title, children, hint}: {title: string; children: ReactNode; hint?: string}) {
  const id = useId();
  return (
    <section className="os-panel" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {hint ? <p className="os-hint">{hint}</p> : null}
      {children}
    </section>
  );
}

export function Feedback({
  error,
  notice,
  state,
  message,
  onRetry,
}: {
  error?: string;
  notice?: string;
  state?: FeedbackState;
  message?: string;
  onRetry?: () => void;
}) {
  const busy = state === 'loading' || state === 'pending';
  const text = message || (state ? FEEDBACK_COPY[state] : '');
  return (
    <>
      {error ? (
        <p className="os-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="os-notice" role="status">
          {notice}
        </p>
      ) : null}
      {state ? (
        <div
          className={'pui-feedback pui-feedback--' + state}
          data-state={state}
          data-busy={busy ? 'true' : 'false'}
          role={feedbackRole(state)}
          aria-busy={busy ? true : undefined}
          aria-live={feedbackRole(state) === 'alert' ? 'assertive' : 'polite'}
        >
          <p className="pui-feedback-text">{text}</p>
          {onRetry ? (
            <button type="button" className="os-button secondary pui-feedback-retry" onClick={onRetry}>
              Riprova
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** Avviso beforeunload + blocco navigazione React Router con dialog accessibile (IT). */
export function useUnsavedChanges(dirty: boolean): ReactNode {
  const titleId = useId();
  const descId = useId();
  const stayRef = useRef<HTMLButtonElement>(null);
  const blocker = useBlocker(dirty);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (blocker.state === 'blocked') stayRef.current?.focus();
  }, [blocker.state]);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') blocker.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocker]);

  if (blocker.state !== 'blocked') return null;

  return (
    <div className="pui-unsaved-overlay">
      <div
        className="pui-unsaved-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <h2 id={titleId} className="pui-unsaved-title">
          Modifiche non salvate
        </h2>
        <p id={descId} className="pui-unsaved-body">
          Hai modifiche non salvate. Se esci ora le perdi.
        </p>
        <div className="pui-unsaved-actions">
          <button
            ref={stayRef}
            type="button"
            className="os-button"
            onClick={() => blocker.reset()}
          >
            Resta qui
          </button>
          <button
            type="button"
            className="os-button secondary"
            onClick={() => blocker.proceed()}
          >
            Esci senza salvare
          </button>
        </div>
      </div>
    </div>
  );
}
