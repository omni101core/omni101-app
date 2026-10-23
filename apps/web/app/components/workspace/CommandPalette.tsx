import {useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import {useNavigate} from 'react-router';
import {Search, X} from 'lucide-react';

type Nav = {label: string; path: string; group: string};
type Item = {key: string; label: string; group: string; path: string; hint: string; disabled: boolean};
type Load = 'loading' | 'ok' | 'unauth' | 'error';
type Section = {key: string; label: string; state: Load};
type Source = {key: string; label: string; url: string; href: (id: string) => string};

const SOURCES: Source[] = [
  {key: 'leads', label: 'Lead', url: '/api/records/leads', href: id => '/admin/leads?record=' + encodeURIComponent(id)},
  {key: 'projects', label: 'Progetti', url: '/api/records/projects', href: id => '/admin/projects?record=' + encodeURIComponent(id)},
  {key: 'clients', label: 'Clienti', url: '/api/records/clients', href: id => '/admin/clients?record=' + encodeURIComponent(id)},
  {key: 'workflows', label: 'Workflow', url: '/api/workflows', href: id => '/admin/automations?record=' + encodeURIComponent(id)},
  {key: 'agents', label: 'Agenti', url: '/api/agents', href: id => '/admin/agents?record=' + encodeURIComponent(id)},
];

// ponytail: MCP e nuovo agente non hanno creazione nella shell. Restano visibili, non spariscono.
const ACTIONS: Item[] = [
  {key: 'act-lead', label: 'Nuovo lead', group: 'Azioni', path: '/admin/leads', hint: 'Apre Richieste. Lì premi Nuovo.', disabled: false},
  {key: 'act-project', label: 'Nuovo progetto', group: 'Azioni', path: '/admin/projects', hint: 'Apre Progetti. Lì premi Nuovo.', disabled: false},
  {key: 'act-client', label: 'Nuovo cliente', group: 'Azioni', path: '/admin/clients', hint: 'Apre Clienti. Lì premi Nuovo.', disabled: false},
  {key: 'act-flow', label: 'Nuovo workflow', group: 'Azioni', path: '/admin/automations', hint: 'Apre Automazioni. Lì salvi il workflow.', disabled: false},
  {key: 'act-agent', label: 'Nuovo agente', group: 'Azioni', path: '', hint: 'non disponibile', disabled: true},
  {key: 'act-mcp', label: 'Tool MCP', group: 'Azioni', path: '', hint: 'non disponibile', disabled: true},
];

const blank = (): Section[] => SOURCES.map(s => ({key: s.key, label: s.label, state: 'loading'}));

function rowsOf(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return [];
  const bag = data as {records?: unknown; agents?: unknown};
  const raw = Array.isArray(bag.records) ? bag.records : Array.isArray(bag.agents) ? bag.agents : [];
  return raw.filter((row): row is Record<string, unknown> => row !== null && typeof row === 'object');
}

function toItems(source: Source, data: unknown): Item[] {
  const out: Item[] = [];
  for (const row of rowsOf(data)) {
    const id = String(row.id ?? '');
    if (!id) continue;
    out.push({key: source.key + ':' + id, label: String(row.name || row.title || row.email || id), group: source.label, path: source.href(id), hint: 'Apre la scheda', disabled: false});
  }
  return out;
}

async function loadSource(source: Source): Promise<{state: Load; items: Item[]}> {
  try {
    const response = await fetch(source.url);
    if (response.status === 401 || response.status === 403) return {state: 'unauth', items: []};
    if (!response.ok) return {state: 'error', items: []};
    return {state: 'ok', items: toItems(source, await response.json())};
  } catch {
    return {state: 'error', items: []};
  }
}

function hit(item: Item, q: string) {
  if (!q) return true;
  return (item.label + ' ' + item.group + ' ' + item.hint).toLocaleLowerCase('it').includes(q);
}

export default function CommandPalette({navigation}: {navigation: Nav[]}) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [sections, setSections] = useState<Section[]>(blank);
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  const openPalette = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openRef.current = true;
    setQuery('');
    setIndex(0);
    setItems([]);
    setSections(blank());
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    const back = returnFocus.current;
    queueMicrotask(() => back?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.repeat || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      if (openRef.current) closePalette();
      else openPalette();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette, closePalette]);

  useEffect(() => {
    openRef.current = open;
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
      inputRef.current?.focus();
      return;
    }
    if (node.open) node.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setSections(blank());
    void Promise.all(SOURCES.map(async source => ({source, result: await loadSource(source)}))).then(all => {
      if (!live) return;
      setSections(all.map(({source, result}) => ({key: source.key, label: source.label, state: result.state})));
      setItems(all.flatMap(({result}) => result.items));
    });
    return () => { live = false; };
  }, [open, tick]);

  const view = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('it');
    const pages: Item[] = navigation.map(n => ({key: 'page:' + n.path, label: n.label, group: n.group, path: n.path, hint: 'Apre la pagina', disabled: false}));
    const local = [...ACTIONS, ...pages].filter(item => hit(item, q));
    const remote = items.filter(item => hit(item, q));
    // ponytail: pagine e azioni intere; record tagliati a 40. Togli il tetto se una ricerca reale ne chiede di più.
    return {rows: [...local, ...remote.slice(0, 40)], more: remote.length > 40};
  }, [navigation, items, query]);

  const active = view.rows.length === 0 ? -1 : Math.min(index, view.rows.length - 1);
  const loading = sections.some(section => section.state === 'loading');
  const denied = sections.filter(section => section.state === 'unauth');
  const failed = sections.filter(section => section.state === 'error');
  const showEmpty = !loading && view.rows.length === 0;

  useEffect(() => {
    if (!open || active < 0) return;
    document.getElementById('os-cmd-' + active)?.scrollIntoView({block: 'nearest'});
  }, [open, active]);

  function go(item: Item) {
    if (item.disabled || item.path === '') return;
    setQuery('');
    closePalette();
    navigate(item.path);
  }

  function move(delta: number) {
    setIndex(i => {
      const size = view.rows.length;
      if (size === 0) return 0;
      const base = Math.min(Math.max(i, 0), size - 1);
      return Math.min(size - 1, Math.max(0, base + delta));
    });
  }
  function onListKey(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
    const target = e.target;
    const inList = target === inputRef.current || (target instanceof HTMLElement && target.closest('.os-command-hit') !== null);
    if (!inList) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const item = active >= 0 ? view.rows[active] : undefined;
      if (item) go(item);
    }
  }

  return <>
    <button type="button" className="os-command-trigger" onClick={openPalette} aria-label="Ricerca globale" title="Ctrl+K oppure ⌘K"><Search size={15} aria-hidden="true"/><span>Cerca ovunque</span><kbd>⌘ K</kbd></button>
    <dialog ref={dialogRef} className="os-dialog os-command" role="dialog" aria-modal="true" aria-labelledby="os-command-title" aria-describedby="os-command-help" onCancel={e => { e.preventDefault(); closePalette(); }} onMouseDown={e => { if (e.target === e.currentTarget) closePalette(); }} onKeyDown={onListKey}>
      <h2 id="os-command-title">Ricerca globale</h2>
      <p id="os-command-help" className="os-hint">Ctrl+K o ⌘K. Frecce per scegliere, Invio apre, Esc chiude.</p>
      <button type="button" className="os-command-close" aria-label="Chiudi ricerca" onClick={closePalette}><X size={18} aria-hidden="true"/></button>
      <input ref={inputRef} className="os-command-input" role="combobox" aria-label="Cerca pagine e record" aria-expanded={open} aria-controls="os-command-list" aria-autocomplete="list" aria-activedescendant={active >= 0 ? 'os-cmd-' + active : undefined} placeholder="Pagine, lead, progetti, clienti, workflow, agenti…" value={query} autoComplete="off" onChange={e => { setQuery(e.target.value); setIndex(0); }}/>
      {loading ? <p role="status" className="os-command-note">Ricerca in corso…</p> : null}
      {denied.map(section => <p key={section.key} role="status" className="os-command-note">{section.label}: non autorizzato</p>)}
      {failed.length > 0 ? <p role="alert" className="os-command-alert">{failed.map(section => section.label).join(', ')}: errore. <button type="button" className="os-button secondary" onClick={() => setTick(n => n + 1)}>Riprova</button></p> : null}
      <div className="os-command-results">
        {showEmpty ? <p role="status" className="os-command-note">Nessun risultato per {query.trim() ? query.trim() : '…'}</p> : null}
        <ul id="os-command-list" role="listbox" aria-label="Risultati" className="os-command-list">
          {view.rows.map((item, i) => {
            const name = item.label + '. ' + item.hint + '. ' + item.group;
            return <li key={item.key} id={'os-cmd-' + i} role="option" aria-label={name} aria-selected={i === active} aria-disabled={item.disabled ? true : undefined}>
              <button type="button" tabIndex={-1} className="os-command-hit" disabled={item.disabled} aria-label={name} onMouseEnter={() => setIndex(i)} onClick={() => go(item)}>
                <span>{item.label}<em>{item.hint}</em></span>
                <small>{item.group}</small>
              </button>
            </li>;
          })}
        </ul>
        {view.more ? <p className="os-command-note">Mostrati 40 record. Aggiungi una parola per vedere il resto.</p> : null}
      </div>
    </dialog>
  </>;
}
