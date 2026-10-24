import './LandingConfigurator.css';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import LandingProduct from './LandingProduct';
import {validateConfiguration, type LandingConfiguration} from './configuration';

type Saved = {id: string; version: number; configuration: LandingConfiguration; createdAt: number; updatedAt: number};
type Feature = LandingConfiguration['features'][number];

const blank = (): LandingConfiguration => ({
  version: 1,
  theme: 'studio',
  businessName: 'Studio Rossi',
  headline: 'Il tuo studio, a portata di click',
  description: 'Una pagina semplice per presentare lo studio e far partire il contatto.',
  ctaLabel: 'Contattaci',
  ctaUrl: 'https://example.com/contatti',
  features: [{title: 'Prenotazione online', description: 'I clienti scelgono data e ora senza telefonare.'}],
});

async function call(method: string, path: string, body?: unknown) {
  const response = await fetch(path, {method, headers: {'Content-Type': 'application/json'}, body: body === undefined ? undefined : JSON.stringify(body)});
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return {status: response.status, data};
}

export default function LandingConfigurator() {
  const [config, setConfig] = useState<LandingConfiguration>(blank);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [current, setCurrent] = useState<Saved | null>(null);
  const [message, setMessage] = useState('');
  const [stale, setStale] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);

  // Client-side check is feedback only: the server schema is authoritative.
  let problem = '';
  try {
    validateConfiguration(config);
  } catch (error) {
    problem = error instanceof Error ? error.message : 'Configurazione non valida.';
  }

  const refresh = useCallback(async () => {
    const {status, data} = await call('GET', '/api/commerce/configurations');
    if (status === 200) setSaved((data.configurations as Saved[]) || []);
    else setMessage('Elenco non disponibile.');
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const set = (patch: Partial<LandingConfiguration>) => setConfig(prev => ({...prev, ...patch}));
  const setFeature = (index: number, patch: Partial<Feature>) =>
    setConfig(prev => ({...prev, features: prev.features.map((f, i) => (i === index ? {...f, ...patch} : f))}));
  const open = (item: Saved) => {
    setConfig(item.configuration);
    setCurrent(item);
    setStale(null);
    setMessage('');
  };
  // ?id= opens a configuration straight from the lead card.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    void call('GET', '/api/commerce/configurations/' + encodeURIComponent(id)).then(({status, data}) => {
      if (status === 200) open(data as unknown as Saved);
      else setMessage('Configurazione non disponibile.');
    });
  }, []);
  // Only mini-demos answer here; for any other configuration the share button stays hidden.
  const [share, setShare] = useState<{shared: boolean} | null>(null);
  const [link, setLink] = useState('');
  useEffect(() => {
    setShare(null);
    setLink('');
    if (!current) return;
    void call('GET', '/api/mini-demos/' + encodeURIComponent(current.id)).then(({status, data}) => {
      if (status === 200) setShare({shared: data.shared === true});
    });
  }, [current?.id]);
  async function toggleShare(revoke: boolean) {
    if (!current) return;
    const {status, data} = await call(revoke ? 'DELETE' : 'POST', '/api/mini-demos/' + encodeURIComponent(current.id) + '/share');
    if (status >= 200 && status < 300) {
      setShare({shared: !revoke});
      setLink(revoke ? '' : window.location.origin + String(data.path));
    } else {
      setMessage(String(data.error || 'Condivisione non riuscita.'));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (problem) {
      setMessage(problem);
      return;
    }
    setBusy(true);
    setMessage('');
    const result = current
      ? await call('PATCH', '/api/commerce/configurations/' + encodeURIComponent(current.id), {expectedVersion: current.version, configuration: config})
      : await call('POST', '/api/commerce/configurations', {configuration: config});
    setBusy(false);
    if (result.status === 409) {
      setStale((result.data.current as Saved) || null);
      return;
    }
    if (result.status >= 200 && result.status < 300) {
      setCurrent(result.data as unknown as Saved);
      setStale(null);
      setMessage(current ? 'Configurazione aggiornata.' : 'Configurazione salvata.');
      await refresh();
    } else {
      setMessage(String(result.data.error || 'Salvataggio non riuscito.'));
    }
  }

  return (
    <div className="os-app landing-configurator">
      <header className="landing-configurator-head">
        <a href="/admin">← Area soci</a>
        <h2>Configuratore landing</h2>
        <p className="landing-configurator-note">Salvare non crea ordini, pagamenti o pubblicazioni: la configurazione resta una bozza interna.</p>
      </header>
      <div className="landing-configurator-grid">
        <form className="os-panel" onSubmit={submit} noValidate aria-label="Configurazione landing">
          <label className="os-field">Tema
            <select value={config.theme} onChange={e => set({theme: e.target.value as LandingConfiguration['theme']})}>
              <option value="studio">Studio</option>
              <option value="hospitality">Hospitality</option>
              <option value="professional">Professional</option>
            </select>
          </label>
          <label className="os-field">Nome attività
            <input value={config.businessName} onChange={e => set({businessName: e.target.value})} />
          </label>
          <label className="os-field">Titolo
            <input value={config.headline} onChange={e => set({headline: e.target.value})} />
          </label>
          <label className="os-field">Descrizione
            <textarea rows={4} value={config.description} onChange={e => set({description: e.target.value})} />
          </label>
          <label className="os-field">Testo del pulsante
            <input value={config.ctaLabel} onChange={e => set({ctaLabel: e.target.value})} />
          </label>
          <label className="os-field">Indirizzo del pulsante (https)
            <input value={config.ctaUrl} onChange={e => set({ctaUrl: e.target.value})} />
          </label>
          {config.features.map((feature, index) => (
            <fieldset className="landing-configurator-feature" key={index}>
              <legend>Funzione {index + 1}</legend>
              <label className="os-field">Titolo funzione {index + 1}
                <input value={feature.title} onChange={e => setFeature(index, {title: e.target.value})} />
              </label>
              <label className="os-field">Descrizione funzione {index + 1}
                <textarea rows={2} value={feature.description} onChange={e => setFeature(index, {description: e.target.value})} />
              </label>
              {config.features.length > 1 ? (
                <button type="button" className="os-button secondary" onClick={() => set({features: config.features.filter((_, i) => i !== index)})}>
                  Rimuovi funzione {index + 1}
                </button>
              ) : null}
            </fieldset>
          ))}
          {config.features.length < 6 ? (
            <button type="button" className="os-button secondary" onClick={() => set({features: [...config.features, {title: '', description: ''}]})}>
              Aggiungi funzione
            </button>
          ) : null}
          {problem ? <p className="landing-configurator-error" role="alert">{problem}</p> : null}
          {stale ? (
            <p className="landing-configurator-error" role="alert">
              Versione superata: la configurazione è stata modificata altrove.{' '}
              <button type="button" className="os-button secondary" onClick={() => open(stale)}>Ricarica la versione corrente</button>
            </p>
          ) : null}
          {message && !problem ? <p role="status">{message}</p> : null}
          <div className="os-button-row">
            <button type="submit" className="os-button" disabled={busy}>{current ? 'Aggiorna' : 'Salva'}</button>
            {current ? <button type="button" className="os-button secondary" onClick={() => {setCurrent(null); setStale(null); setMessage('');}}>Nuova configurazione</button> : null}
            {share ? <button type="button" className="os-button secondary" onClick={() => void toggleShare(false)}>{share.shared ? 'Nuovo link' : 'Condividi'}</button> : null}
            {share && share.shared ? <button type="button" className="os-button secondary" onClick={() => void toggleShare(true)}>Revoca link</button> : null}
          </div>
          {share ? <p className="landing-configurator-note">Il link mostra l'ultima versione salvata. Salva prima di condividere.{link ? <> Link privato (mostrato una volta): <a href={link}>{link}</a></> : null}</p> : null}
        </form>
        <div className="landing-configurator-side">
          <section className="landing-configurator-preview" aria-label="Anteprima dal vivo">
            <p className="os-eyebrow">Anteprima dal vivo</p>
            {problem ? <p>Correggi i campi per vedere l'anteprima.</p> : <LandingProduct configuration={config} />}
          </section>
          <section className="os-panel" aria-label="Configurazioni salvate">
            <p className="os-eyebrow">Configurazioni salvate</p>
            {saved.length ? (
              <ul className="landing-configurator-list">
                {saved.map(item => (
                  <li key={item.id}>
                    <button type="button" className="os-button secondary" onClick={() => open(item)}>
                      {item.configuration.businessName} · v{item.version}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nessuna configurazione salvata.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
