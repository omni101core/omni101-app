# Checkpoint Opus per il rientro del coordinatore precedente

Aggiornato: 2026-10-23 16:45. Coordinatore e publisher unico: Opus (term_e5a19495). Mandato complessivo: PARTIAL.

## LIVE / IN VERIFICA

- **LIVE**: produzione `01805108595ba1bc21866bcc84825fae829792ff` (run 39962720977). Health verificato alle 16:40: revision esatta, database true, storage false.
- **Release bloccata**: `0feb0a6` run 39969074214, verify fallito su 1 e2e (`workspace.spec.ts:17`: sul 409 del kanban manca il prefisso "Spostamento non salvato"); produzione non toccata. Fix S4h in corso (Cursor). Server: 139 test verdi nella run 65c06ca dopo S4g.
- **Nella prossima release**: S1 (separazione compiti, 409 versione/stato, aritmetica intera, requestId per org, test portale), S1b (19 test calcolo), S1c (e2e con secondo Owner), S3 (sync conservativo del backlog in app + priorità + 6 gruppi pricing-hardening), S4a-g (CRM: 409 concorrenza, duplicati contatti con override solo per telefono, timeline, filtri URL, a11y), T2 (convertitore listino, solo script locale + test), CONTEXT/STATO.
- **Locale**: ancora f53 su 127.0.0.1:4176 (workerd). Script di aggiornamento pronto e testato: `/tmp/omni101-deleghe/S2-local-update/in/local-update.py` (dry run di default, `--apply` dopo la release). Non eseguito.

## Lavoro attivo

| Task | Esecutore | Esito atteso |
|---|---|---|
| S4h messaggio 409 kanban | Cursor composer-2.5 (pool xAI) | `/tmp/omni101-deleghe/S4h-msg-409/esito.md` |
| T3 registro CLI (agent-context.json + startup AGENTS) | OpenCode deepseek free | `/tmp/omni101-deleghe/T3-registro-cli/esito.md` |
| T4 fusione copertura mandati nel backlog (≤15 nuovi gruppi) | OpenCode deepseek free | `/tmp/omni101-deleghe/T4-backlog-merge/esito.md` |
| Controfattuali copertura R2c (Goose) e R2d (Kilo poolside) | gratuiti, dati già pubblici | `esito-SECONDO.md` nelle cartelle R2c/R2d |

Registro dei lanci: `/tmp/omni101-deleghe/registro.jsonl`. Contratti Sonnet: `/tmp/omni101-opus-20261023/`.

## Copertura mandati (R2a-d, 4 worker gratuiti + controfattuali)

29 gruppi proposti, in fusione (T4). Punti da non perdere, verificati sul testo:
- Garante: **29 ottobre 2026** per pixel/tracking nelle email (revenue-growth riga 74). Oggi conformi per assenza (nessun invio, nessun pixel).
- "Pronto per il collegamento" ≠ collegato ≠ autorizzato ≠ verificato: stati onesti.
- Percorso completo prima di schermate sparse: CRM → evento → workflow → agente con tool reale → approvazione → preventivo → CRM.
- Bloccato non vuol dire fermo: bozze, approvazioni e calendario social/ads costruibili senza connessione.
- Input dei clienti = dati, non istruzioni. Nessun servizio a pagamento senza autorizzazione.

## Strumenti nuovi (verificati)

- `~/.omni101/bin/omni-delega/omni-delega.py`: `quote`, `lancia` (gate + copia + Orca + registro, blocco se pool xAI occupato), `ci`, `integra`. Gate: gitleaks + grep PII/importi + rizzo-flow locale (:8017) + home path → `~`.
- Skill Orca aggiornata (sezione "Deleghe sicure con script").
- CLI: OpenCode glm/deepseek free (codice, B pseudonimizzato); Kilo solo `--pure --model kilo/poolside/laguna-s-2.1:free` (dati pubblici); Goose = NVIDIA nemotron (dati pubblici); Cursor/Grok/Hermes = pool xAI, uno alla volta.

## Decisioni aperte del founder

1. Repo `omni101core/omni101-app` è **PUBBLICO**: mandati originali, decisioni e stato sono su GitHub. Voluto (regola 100) o da rendere privato (attenzione a costi Actions)?
2. Tenant con un solo Owner: deroga alla separazione dei compiti sui preventivi?
3. Testata dei preventivi solo ricorrenti (oggi 0, riepilogo per cadenza).
4. Campi identificativi per aziende/lead (P.IVA, telefono) per la deduplicazione.
5. Download di modelli: disco al 3-4%, nessuno finché non si libera spazio.

## Prossima azione (comando)

1. Integrare S4h (`omni-delega.py integra S4h-msg-409 apps/web/app/routes/admin.tsx`) → `python3 scripts/cloud-verify.py --check` → `python3 scripts/cloud-verify.py --release` → `omni-delega.py ci <sha> --branch release-commercial` → health a SHA esatto.
2. Dopo la release: `local-update.py --zip <artefatto> --sha <sha> ...` (dry run, poi `--apply`), aggiornare CONTEXT/STATO/moduli.
3. Integrare T3/T4, `node scripts/seed-reviewed-context.mjs --dry-run`, release successiva: il backlog in app riceve i nuovi gruppi.
4. Slice prodotto successiva: catalogo listino in app (import dell'Owner nel DB, mai nel repo pubblico) + vista "prezzo di listino" nel preventivatore.

## Rollback

Codice `01805108`. Migrazioni additive: non cancellare tabelle per tornare indietro.

## Blocchi

- MemPalace read-only ("Peer MCP writer active"): stato su questo file e nella memoria di progetto.
- Docs-only senza CI impossibile con il publisher attuale.
- Kilo con la maggior parte dei modelli free: limite 128 tool.
