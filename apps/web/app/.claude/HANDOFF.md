# Agent Handoff — 2026-10-24 10:01:48
## Session: d5a852c7-0194-428c-9841-a1d7cc57b15e
## Project: app
## Path: /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app
## Branch: reinvenzione-2026-10

---
## Files Modified This Session
```
(no file edits this session)
```

## Recent Actions (last 40)
```
2026-10-24 10:00:37 | Bash | cd /tmp/omni101-deleghe; cat w5-asset-audit/esito.md | head -120; echo ----; python3 -c "
import json;d=json.load(open('
2026-10-24 10:00:41 | Bash | cd /tmp/omni101-deleghe; sed -n 40,110p w5-asset-audit/esito.md | cut -c1-400; python3 -c "
import json
for l in open('w
2026-10-24 10:00:46 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; python3 -c "
import json
d=json.load(ope
2026-10-24 10:00:50 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; cat content/media.ts | cut -c1-300; echo
2026-10-24 10:00:56 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; cat components/public/capabilities/panel
2026-10-24 10:01:01 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; sed -n 54,60p components/public/explore/
2026-10-24 10:01:04 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; grep -o "slug:'[^']*'" components/public
2026-10-24 10:01:08 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; grep -o "slug:'[^']*'" components/public
2026-10-24 10:01:12 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/public/media; for f in originali/work-07-casa
2026-10-24 10:01:24 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; python3 - <<'E'
def sub(p,a,b,n=1):
    
2026-10-24 10:01:31 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; python3 - <<'E'
import re
def sub(p,a,b)
2026-10-24 10:01:41 | Bash | cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app; grep -o 'filtered.map.\{0,420\}' routes/
```

## Git Uncommitted Changes
```
 M ../../../AGENTS.md
 M ../../../docs/CONTEXT.md
 M ../../../package.json
 M ../../../worker/prova-locale.sh
 M ../../../worker/schema.sql
 M ../../../worker/src/index.ts
 M ../../../worker/wrangler.toml
?? ../../../.claude/
?? ../../../.github/
?? ../../../CLAUDE.md
?? ../../../GEMINI.md
?? ../../../README.md
?? ../../
?? ../../../docs/MASTER-CONTRACT.md
?? ../../../docs/README.md
?? ../../../docs/STATO.md
?? ../../../docs/UPGRADE-EXECUTION.md
?? ../../../docs/architettura.md
?? ../../../docs/brand.md
?? ../../../docs/dati.md
```

## Git Log (last 10 commits)
```
35d1063 fix(worker): Turnstile con chiave di test, fallback nome audit, suite locale aggiornata
0ac823f docs(sanita): rigenera i prezzi del pacchetto Studio Essenziale dal motore
d87342c refactor: sync-prezzi.mjs legge il motore invece di duplicarne la formula
ab64acc feat(studi-sanitari): leva concreta in apertura, sezioni giornata/psicologo/privacy
39e3de7 docs: pacchetto vendita studi sanitari e revisione kit
929c2ea feat: pagina studi sanitari, title e description SEO su 20 pagine, llms.txt
0af5ff0 feat: unifica i prezzi del sito al motore (config_prezzi.json)
51c776e feat: kit vendita OMNI101 allineato al motore prezzi + trasparenza AI
fbdc7d3 fix: hydration mismatch React #418 sul widget Turnstile
d6c809d docs: aggiorna CONTEXT.md con lo stato reale di install/build/preview
```

## Global Memory Index
```
# OMNI101 Memory Index

## START HERE
- **[NIENTE BLOCCHI](feedback_niente_blocchi_approvazione_permanente.md)** — 04/08 approvazione PERMANENTE su migrazioni additive e promote: non si chiede piu'. Un blocco non si segnala, si rimuove (esempio: backup spostato da launchd a pm2 per aggirare il consenso macOS)
- **[04-08 TRENO: 6 BLOCCHI](project_promote_treno_2026_08_04.md)** — prod a `6f156804` dopo sei fermate; la causa radice di quasi tutte: il checkout di release NON ha `.env` (gitignored), per questo il worker prod girava dal REPO VIVO dichiarando una release non sua da 22h30
- **[LANE PARALLELE: COLLISIONI](reference_lane_parallele_collisioni.md)** — difetti che emergono solo con molte lane: numeri di migrazione duplicati (due 0088 e due 0091 in un giorno), ratchet RLS a doppio senso, worktree stale riusati, lane che dichiarano chiuso cio' che non lo e'
- **[MEMORIA OMNI101](reference_memoria_omni101.md)** — stato (1275 righe, provenienza obbligatoria, contraddizioni risolte), divario e impatto dei due riferimenti: il video insegna che la memoria è il **contratto di voce** che entra in ogni lavoro (non un archivio) e sono 120 note **distillate**, non 1275 grezze; agent-os dà il profilo-per-agente e gli eventi tipizzati come sorgente distillabile. Fonte viva: `docs/MEMORIA-OMNI101.md`
- **[RICHIESTA FOUNDER 08-03](project_richiesta_founder_2026_08_03.md)** — registrata in docs/RICHIESTA-FOUNDER-20260803.md, da riprendere SEMPRE: finestre ricche dal dialogo, modale/selettore incomprensibili, innesti (agent-os, octogent, hermes/openclaw isolati, paperclip/multica), ricerca GitHub. Cause MISURATE: il 3765 sessioni orfane è un numero falso; il riduttore conversazione esiste già ma non è usato; intent globale impedisce finestre multi-widget; routeInformation mai invocato; glm/kimi/codex vivono sul canvas Maestri anche se non nel PATH
- **[08-03 TUTTO ONLINE](project_riprendi_notte_2026_08_03.md)** — prod `9ce32d56`, 59 commit visibili dopo 2 giorni fermi. I due cancelli finali erano STRUTTURALI: il tunnel saltava il router (cutover con replica in overlap, zero buco) e il drain aspettava stream SSE che non finiscono mai (annullava promote già riusciti). Worker crashloop 7h = la vera ragione del "lavoro si interrompe". Backup di stato riparato (transitori che spariscono tra find e tar). Sintassi exec di tutte le 8 CLI + glm non installato
- **[POSTURA CONSEGNA CLIENTI](feedback_postura_consegna_clienti.md)** — dal 08-02 il calcolo clienti NON gira sul Mac del founder e non si spedisce sorgente; la legge ComputeSource esisteva gia' ed e' ATTIVA (`ENFORCE_COMPUTE_SOURCE` non settata = guardia ON, letta al contrario piu' volte)
- **[SECONDO PARERE AVVERSARIALE](feedback_secondo_parere_avversariale.md)** — prima del promote fai contestare da un motore DIVERSO su 3-4 punti nominati; 11 commit con tsc 0 e test verdi nascondevano 2 difetti gravi (due runtime vivi, chiavi del server ereditate dal figlio)
- **[08-02 NOTTE FLOTTA](project_notte_flotta_2026_08_02.md)** — 9 lane fuse; TUTTI i provider immagine morti tranne la corsia premium (nim 504, fal saldo esaurito, openai senza chiave); divario shell ROVESCIATO (hermes gia in allowlist, jcode/kimi non sono corsie); 77% delle lane "non fuse" era rumore; 1362 righe esistevano solo su disco
- **[08-02 P0 PID RICICLATO](project_prod_pid_reuse_heartbeat_2026_08_02.md)** — reboot riassegna il PID al `next dev` del repo di lavoro → guardia heartbeat fail-closed blocca prod per sempre; "online ma porta muta" nei primi minuti = preflight che hasha 1.7GB, non guasto
- **[REGOLA: CHIUSO = VISIBILE](feedback_chiusura_e_visibilita.md)** — richiesta chiusa quando il founder la VEDE nel prodotto, non al merge; [x] non-visibile genera lane di superficie
- **[07-31 PUNTO-RIPRISTINO CONSEGNATA](project_punto_ripristino_canvas_2026_07_31.md)** — commit `8b178019`: canvas_snapshots+0082 RLS, create/restore atomico companyId-forzato, flag OFF; fix tsc db pre-esistente che bloccava ogni lane
- **[07-31 SELECTOR-V2 CONSEGNATA](project_selector_v2_lane_2026_07_31.md)** — commit `cba0dddd` worktree selector-v2: CliPicker AionUI-grade (D3.1-3.3) + preview wirata nei 5 call-site; ricettario repro headless con login (Chrome founder rifiuta loopback, curl+jar+chromium headless)
- **[07-31 SUPER-LOOP + P1 EMAIL](project_superloop_p1_email_2026_07_31.md)** — polso-wave ora GENERA lavoro dalla coda; login email fixato nel contratto; jlist MENTE su pm_exec_path (dump autoritativo, prod giù 7min); retention non ritira MAI (181GB, riga coda retention-vera-store)
- **[07-30 PROMOTE BLOCCATO](project_promote_bloccato_contratto_2026_07_30.md)** — 7 corsie fuse e spinte, ma prod resta `55dabec9`: **il processo che serve os.omni101.app non e' stato avviato dalla…
- **[07-29 RIPRESA DOPO SPEGNIMENTO](project_ripresa_spegnimento_2026_07_29.md)** — 3 guasti silenziosi: custode del sito vivo col figlio morto (pm2 dice online, porta muta)…
- **[07-30 COLLAUDO 360 TIZIANA](project_tiziana_collaudo_360_2026_07_30.md)** — 8 lane maestri: quasi ogni difetto grave è **latente** (il sito non è rotto, non è stato messo alla prova)…
```

---
## How to Resume (for Hermes/OpenClaw/any agent)
1. `cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app`
2. Read `CLAUDE.md` for project context and current task
3. Review files modified above for in-progress work
4. Check git status for uncommitted changes
5. Read `~/.claude/projects/.../memory/*.md` for task-level context
6. If blocked: check `/Users/alessandropeloso/.claude/sessions/d5a852c7-0194-428c-9841-a1d7cc57b15e/actions.log` for full session trace
