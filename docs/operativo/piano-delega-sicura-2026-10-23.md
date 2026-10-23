# Piano delega sicura alle CLI gratuite — 2026-10-23

Pianificatore: Opus 5.5 (effort high). Sola scrittura: questo file. Nessun worker lanciato, nessun file di runtime toccato. Ownership runtime/release resta all'owner Sonnet della CI 39962720977.

## Fatto chiave (cambia il default)

Il modello di default della skill Orca, `opencode/nemotron-3-ultra-free`, è un endpoint trial NVIDIA: *«Trial use only — do not submit personal or confidential data»*, uso loggato per migliorare prodotti NVIDIA (pagina Zen di OpenCode e pagina free di Kilo, lette oggi). Va retrocesso a "solo dati pubblici". Default nuovo per codice: `opencode/glm-5.3-flash-free` o `opencode/deepseek-v4.1-flash-free`, che Zen dichiara zero-retention e senza training. Entrambi risultano nel catalogo locale (`opencode models`, 2026-10-23).

Policy dichiarate dei provider (dichiarazioni, non audit):

| Endpoint | Training | Retention | Fonte |
|---|---|---|---|
| OpenCode Zen: glm-5.3-flash-free, deepseek-v4.1-flash-free | no | zero | Zen privacy |
| OpenCode Zen: beam-free | no | 30 gg (safety) | Zen privacy |
| OpenCode Zen: big-pickle, exo-free, mimo-v2.6/2.5, flint-40b-free | **sì** (periodo free) | flint 30 gg | Zen privacy |
| OpenCode/Kilo: nemotron-* free (NVIDIA) | logga per "improve" | log | Zen + Kilo docs |
| Kilo: `kilo-auto/free`, `openrouter/free` e altri `:free` | possibile (per provider) | possibile | Kilo docs, OpenRouter docs |
| Grok CLI / Hermes default (`grok-4.7`, provider `xai-oauth`, base api.x.ai) | API: no di default (fonte secondaria); OAuth consumer: **NOT_VERIFIED** | 30 gg (secondaria) | vedi Fonti |
| Hermes su LLM locale (`qwen3.8-27b-mlx`, 127.0.0.1:8018) | no, resta sul Mac | locale | config Hermes |

Regola: endpoint non elencato o non verificato = trattato come "training + log".

## 1. Classi di dati

**A — mai ai gratuiti (né cloud gratuiti né Grok OAuth):**
- Segreti: `.env*`, `.dev.vars`, config/stato wrangler, `~/.omni101/state/`, token, link di invito, credenziali CI.
- Dati clienti reali: DB D1/SQLite, `*.sqlite`, `*.sql` con righe reali, export, contratti, email/telefono/nomi di clienti.
- Finanza: fatture, IBAN, P.IVA, margini e costi reali, `docs/moduli/finanza.md`.
- Mandati originali del founder: `docs/mandati/*` (strategia verbatim).
- Codice di sicurezza (regola 22): auth, passkey, sessioni, guardie `server/api.ts`, `scripts/cloud-verify.py` (publisher + scan), `cloudflare-client.py`, `seed-owner.py`, `invite-collaborator.py`, `refresh-deploy-auth.py`, `tests/owner-fixture.sql`.
- Git: niente `.git`, niente comandi git ai worker.

**B — solo dopo pseudonimizzazione (e solo verso endpoint zero-retention o LLM locale):**
- Prezzi/tariffe/listino (`src/data/prezzi.ts`, kit vendita, preventivi d'esempio): importi → `⟦EUR_n⟧`.
- Docs di modulo con nomi di clienti/nicchie, CRM, revenue, preventivatore: nomi/email → segnaposto.
- Bozze commerciali con dati di un cliente reale.

**C — liberi (comunque passano il gate):**
- Codice app non di sicurezza: componenti UI `apps/web/app/components`, route, stili, logica pricing *senza tariffe reali*, test con dati sintetici.
- Docs tecnici generici: architettura, brand, README, operativo senza ID/run sensibili.
- Materiale che sarà pubblico comunque (copy sito già online).

Nemotron e i modelli "training sì": **solo C pubblico** (cosa che pubblicheresti su GitHub open source).

## 2. Anonimizzazione: cosa riusare, cosa no

| Strumento | Licenza | Stato sul Mac | Verdetto |
|---|---|---|---|
| gitleaks 8.30.1 | MIT | installato | **usare**: `gitleaks dir <cartella> --redact` sulla copia da inviare. `gitleaks dir docs` oggi: 0 finding. |
| trufflehog 3.99.2 | AGPL-3.0 | installato | secondo parere manuale; la verifica live dei token genera traffico verso i provider, quindi fuori dal gate. |
| detect-secrets 1.5.0 | Apache-2.0 | installato | ridondante con gitleaks; non usare nel gate. |
| `scripts/cloud-verify.py` SECRET_RULES | repo | presente | regole già buone (IBAN, JWT, sk-, gh*, URL con credenziali). Non importabile (codice top-level): il gate copre le stesse classi con gitleaks + grep. Nessuna modifica a `scripts/`. |
| Microsoft Presidio | MIT | assente | NER buono per nomi liberi, ma richiede spaCy + modello (centinaia di MB). **Rimandato**: disco al 4%. |
| LLM Guard (Protect AI) Anonymize/Deanonymize + Vault | MIT (da verificare nel LICENSE) | assente | stesso schema reversibile che serve, ma tira torch/transformers. **Rimandato**. |

Soluzione pigra adottata: copia filtrata + gitleaks + pseudonimizzatore stdlib reversibile (sotto, provato oggi: round-trip identico, mappa `0600`). Limite: le regex trovano email, IBAN, CF, P.IVA, telefono +39, importi; **non** trovano nomi liberi. I nomi vanno in un `nomi.txt` locale (clienti dal CRM, scritti a mano). Si passa a Presidio quando il disco torna sopra il 15% e i nomi saltati diventano un problema misurato.

```python
# pseudo.py — uso: python3 -I pseudo.py in|out <cartella> <mappa.json> [nomi.txt]
import re, sys, json, pathlib
R = {'IBAN': r'\bIT\d{2}[A-Z]\d{10}[0-9A-Z]{12}\b', 'CF': r'\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b',
     'EMAIL': r'[\w.%+-]+@[\w-]+(?:\.[\w-]+)+', 'PIVA': r'\b\d{11}\b', 'TEL': r'\+39\s?\d{2,4}[\s.]?\d{5,8}\b',
     'EUR': r'€\s?\d[\d.,]*|\b\d[\d.,]*\s?(?:€|(?:EUR|euro)\b)'}
mode, root, mappa = sys.argv[1:4]
if len(sys.argv) > 4:  # nomi clienti/persone: la regex non li trova da sola
    nomi = [n.strip() for n in open(sys.argv[4], encoding='utf-8') if n.strip()]
    if nomi: R = {'NOME': '|'.join(map(re.escape, sorted(nomi, key=len, reverse=True))), **R}
mf = pathlib.Path(mappa)
m = json.loads(mf.read_text()) if mf.exists() else {}  # segnaposto -> originale
rev = {v: k for k, v in m.items()}
def tag(kind, val):
    if val not in rev:
        rev[val] = f'⟦{kind}_{len(rev) + 1}⟧'; m[rev[val]] = val
    return rev[val]
for p in pathlib.Path(root).rglob('*'):
    if not p.is_file(): continue
    try: t = p.read_text(encoding='utf-8')
    except UnicodeDecodeError: continue
    if mode == 'in':
        for k, rx in R.items(): t = re.sub(rx, lambda x, k=k: tag(k, x.group()), t)
    else:
        for ph, val in m.items(): t = t.replace(ph, val)
    p.write_text(t, encoding='utf-8')
mf.write_text(json.dumps(m, ensure_ascii=False)); mf.chmod(0o600)
```

La mappa sta **fuori** dalla cartella del worker (`/tmp/omni101-deleghe/<task>/mappa.json`, non in `in/`) e non va mai nel prompt. Prompt e istruzioni passano dalla stessa pseudonimizzazione. Un worker che legge un file manda al provider il file intero: conta *cosa vede*, non solo cosa scrivi nel prompt.

## 3. Gate minimo (prima di ogni lancio)

Principio: il worker non lavora mai nel repo. Lavora su una **copia filtrata** dei soli file del task. Niente `.git`, niente altro.

```sh
#!/bin/sh
# delega-gate.sh — uso (dal root repo): delega-gate.sh <task-id> <file>...  -> /tmp/omni101-deleghe/<task-id>/in
set -eu
T=/tmp/omni101-deleghe/$1; shift
umask 077; mkdir -p "$T/in"
for f in "$@"; do
  case "$f" in
    *.env*|*.dev.vars*|*wrangler*|*.wrangler/*|*/.omni101/state/*|*.sqlite*|*.sql|docs/mandati/*|docs/moduli/finanza.md|\
    scripts/seed-owner.py|scripts/invite-collaborator.py|scripts/refresh-deploy-auth.py|scripts/cloud-verify.py|scripts/cloudflare-client.py|\
    *auth*|*passkey*|*session*|*/server/api.ts|tests/owner-fixture.sql)
      echo "CLASSE A, vietato: $f" >&2; exit 2;;
  esac
  mkdir -p "$T/in/$(dirname "$f")"; cp "$f" "$T/in/$f"
done
gitleaks dir "$T/in" --no-banner --redact -l error || { echo "SEGRETI: stop" >&2; exit 3; }
if grep -rnIE '[[:alnum:]._%+-]+@[[:alnum:]-]+\.[[:alpha:]]{2,}|IT[0-9]{2}[A-Z][0-9]{10}|[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]|\+39 ?[0-9]{6,}|€ ?[0-9]|[0-9] ?(€|EUR)' "$T/in" | grep -vE '@(example\.(com|org)|omni101\.app)'; then
  echo "PII/importi: pseudonimizza (pseudo.py in) o togli il file" >&2; exit 4
fi
echo "GATE_OK $T/in"
```

Provato oggi su 3 casi: `portal.tsx`+`architettura.md` → `GATE_OK`; `docs/mandati/sources.json` → rc 2 (classe A); `docs/moduli/preventivatore.md` → `GATE_OK`. Copie di prova rimaste in `/tmp/omni101-deleghe/prova-gate*` (non cancellate, regola 19c).

Dove salvarli: il coordinatore crea `~/.omni101/bin/delega-gate.sh` e `~/.omni101/bin/pseudo.py` copiando i blocchi sopra (fuori dal mio perimetro di scrittura). Nessuna dipendenza nuova.

Checklist (ogni lancio, 6 righe):
1. Classe dei file decisa (A/B/C). Se c'è A, stop.
2. `delega-gate.sh <task> <file>...` → `GATE_OK`. Exit 4 su materiale B → `pseudo.py in`, poi di nuovo il gate.
3. Modello scelto dalla tabella §5, presente oggi in `opencode models` / `kilo models`.
4. Quota/limiti del giorno controllati, carico Mac ok (load<20, RAM libera >30%).
5. Spec su file in `$T/spec.md`: obiettivo, fatto-quando, file consentiti, divieti, path esito.
6. Il prompt contiene solo il path della spec, nessun dato.

## 4. Regola di lancio

Prompt standard. Caveman/Ponytail sono skill, non flag della CLI, e il worker non deve leggere file fuori dalla copia: le regole vanno inline.

```text
Modo Caveman full: prosa compressa, niente preamboli. Modo Ponytail full: soluzione più pigra che funziona, stdlib prima, nessuna dipendenza nuova, diff minimo.
Lavora SOLO dentro questa cartella. Niente rete, niente git, niente install, niente file fuori da qui.
Leggi ../spec.md ed esegui solo quella. Scrivi l'esito in ../esito.md: file toccati, cosa resta NOT_VERIFIED.
```

Lancio primario (sempre visibile):
```sh
orca agent launch --agent opencode --worktree path:/tmp/omni101-deleghe/<task>/in \
  --model opencode/glm-5.3-flash-free --surface terminal --focus --prompt "$PROMPT" --json
```
Fallback solo se la receipt dice `capability_unsupported` senza risorse avviate (caso già visto con OpenCode):
```sh
orca terminal create --worktree path:"$HOME/omni101/01-Projects/active/omni101-app" --title '<task>' \
  --command "cd /tmp/omni101-deleghe/<task>/in && opencode run --model opencode/glm-5.3-flash-free $(printf %q "$PROMPT")" --json
```
- `--worktree path:/tmp/...` va accettato da Orca: **NOT_VERIFIED**. Se lo rifiuta, fallback diretto (workspace repo, `cd` nella copia).
- Effort: OpenCode v2 → `provider/model#variant`; Kilo → `--variant low|high`; Orca `--effort` → solo CLI premium. Grok CLI: nessun flag effort nell'help → "non supportato". Mai tradurre "non supportato" in high in silenzio.
- Mai `--always-approve`, `--yolo`, `--auto`. Un worker per task. Ownership disgiunta: ogni task scrive solo nella propria copia; due task non condividono mai un file.
- Verifica del coordinatore (obbligatoria): `diff -ru` tra copia e originale, solo i file in spec; `gitleaks dir` sull'output; `pseudo.py out` se B. Il riporto nel repo lo fa il coordinatore (o l'owner runtime) solo dopo il rilascio in corso; test solo in CI (AGENTS.md). Un "fatto" del worker senza diff letto non vale.

## 5. Tabella compito → CLI → modello → effort → dati

| Compito tipo | CLI | Modello | Effort | Dati ammessi |
|---|---|---|---|---|
| Codice UI/route/test sintetici | OpenCode | `opencode/glm-5.3-flash-free` | `#variant` NOT_VERIFIED, altrimenti default | C |
| Refactor/logica non di sicurezza, test unitari | OpenCode | `opencode/deepseek-v4.1-flash-free` | idem | C, B pseudonimizzato |
| Docs: link, coerenza, riformattazione | OpenCode | `opencode/glm-5.3-flash-free` | default | C, B pseudonimizzato |
| Meccanico rapido (rinomine in spec, lint testuale) | Kilo | `kilo/reflection/beam-free` (no training, 30 gg) | `--variant low` | C |
| Seconda opinione statica | Grok CLI (`-p`) | modello xAI dell'account | non supportato | C pubblico (opt-out training NOT_VERIFIED) |
| Dati riservati, prove "AI in sede" | Hermes | LLM locale `qwen3.8-27b-mlx` @127.0.0.1:8018 | default | B senza pseudonimi, mai segreti |
| Copy pubblica, esperimenti usa-e-getta | OpenCode/Kilo | nemotron-*, big-pickle, exo, mimo, `kilo-auto/free` | default | solo C pubblico |

Segreti e codice di sicurezza: nessuna riga della tabella. Restano al modello a pagamento autorizzato o al founder.

## 6. Prossimi 3 task da delegare (dopo la chiusura della CI 39962720977 e il rilascio dei file da parte dell'owner runtime)

1. **Test unitari della formula cost-margin-v1** — OpenCode + deepseek-v4.1-flash-free, classe C.
   Input: `apps/web/app/server/pricing.ts` (sola lettura). Output: nuovo `pricing-formula.test.ts` nella copia.
   Accettazione: almeno 10 casi con numeri sintetici (cadenze distinte, sconto con motivo, sotto costo, arrotondamento centesimi/basispoint, idempotenza requestId se pura); nessun import nuovo; compila nel typecheck CI; `pricing.ts` invariato.
2. **Audit link e indice docs** — OpenCode + glm-5.3-flash-free, classe C (esclusi `docs/mandati/`, `finanza.md`).
   Output: solo `esito.md` con `path:riga → link rotto/target mancante` e moduli assenti da `docs/README.md`.
   Accettazione: report sola lettura, zero modifiche; il coordinatore ricontrolla 3 righe a campione.
3. **Template stampabile del preventivo (PDF assente)** — OpenCode + glm-5.3-flash-free, classe B pseudonimizzata.
   Output: `preventivo-stampa.html` standalone con CSS `@media print`, dati solo `⟦…⟧` o fittizi, campi dello snapshot (`terms`, `pricing_version`, cadenze).
   Accettazione: nessuna dipendenza, nessun costo interno mostrato (come il portale), A4 su una pagina in anteprima di stampa; integrazione decisa dopo dal coordinatore.

## Limiti

- Le policy sono **dichiarazioni** dei provider: non verificabili da qui e mutevoli (modelli free "a tempo limitato"). Ricontrollare la pagina Zen a ogni cambio di modello.
- Grok via `xai-oauth` = account consumer del founder: le condizioni API (no training di default) potrebbero non valere. NOT_VERIFIED: vedere le impostazioni dati dell'account xAI.
- Kilo non documenta la policy dei singoli `:free` oltre NVIDIA/Auto Free: caso peggiore assunto.
- Stesso utente macOS: un worker con tool di lettura può uscire dalla copia se la CLI lo permette. Mitigazioni: prompt, permessi della CLI (es. `external_directory` di OpenCode, NOT_VERIFIED sull'agente `snello`), mappa fuori dalla copia. Isolamento vero = container, oggi fuori perimetro (regola 19b).
- Le regex non coprono nomi liberi, indirizzi, ID cliente interni: servono `nomi.txt` e l'occhio del coordinatore su B.
- La classificazione per path si basa sui nomi file: un file nuovo con dati A sotto nome innocuo passa il `case`; lo fermano gitleaks/grep solo se ha pattern riconoscibili.

## Fonti

- OpenCode Zen, privacy e modelli free: https://opencode.ai/docs/zen
- Kilo, modelli free e avvisi NVIDIA/Auto Free: https://kilo.ai/docs/code-with-ai/agents/free-and-budget-models
- OpenRouter, logging dei provider: https://openrouter.ai/docs/guides/privacy/provider-logging · https://openrouter.ai/docs/guides/privacy/logging
- Analisi free OpenRouter (terza parte): https://www.truefoundry.com/blog/openrouter-free-models-whats-actually-free-and-what-it-costs-you
- xAI API dati (secondarie, da verificare sui termini xAI): https://meetily.ai/llm-privacy/xai · https://opper.ai/provider/xai
- LLM Guard Anonymize/Vault: https://langfuse.com/docs/security · https://appsecsanta.com/llm-guard
- Strumenti: https://github.com/gitleaks/gitleaks · https://github.com/trufflesecurity/trufflehog · https://github.com/Yelp/detect-secrets · https://github.com/microsoft/presidio · https://github.com/protectai/llm-guard
- Locale, eseguiti il 2026-10-23: `opencode models`, `kilo models`, `grok --help`, `kilo run --help`, `opencode run --help`, `~/.hermes/config.yaml` (solo chiavi modello/provider).
