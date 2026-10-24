# Agent Handoff — 2026-10-24 11:25:24
## Session: be491722-a32e-4c86-9f41-840ef3741bc2
## Project: shell
## Path: /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell
## Branch: reinvenzione-2026-10

---
## Files Modified This Session
```
(no file edits this session)
```

## Recent Actions (last 40)
```
2026-10-24 11:22:18 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell; python3 - <<'E'
s=open('PublicLayout.t
2026-10-24 11:22:24 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app; python3 - <<'E'
s=open('root.tsx').read()
s=s.replace("import 
2026-10-24 11:22:37 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/landing; cat > offers.ts <<'E'
import prezziP
2026-10-24 11:22:51 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/landing; python3 - <<'E'
s=open('LandingForm.
2026-10-24 11:22:55 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/landing; grep -n "Please\|Thank\|Write to\|Ge
2026-10-24 11:23:03 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/routes/public; cat > en-shared.tsx <<'E'
import type {ReactNode
2026-10-24 11:23:14 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/routes/public; cat > en-offer.tsx <<'E'
import {Link} from 'rea
2026-10-24 11:23:35 | Bash | cd ~/omni101/01-Projects/active/omni101-app; python3 - <<'E'
p='scripts/i18n-check.mjs'; s=open(p).read()
s=s.replace("i
2026-10-24 11:23:43 | Bash | cd ~/omni101/01-Projects/active/omni101-app; cat > tests/i18n-check.test.ts <<'E'
import {describe,expect,it} from 'vite
2026-10-24 11:23:51 | Bash | cd ~/omni101/01-Projects/active/omni101-app; git checkout -p package.json </dev/null >/dev/null 2>&1; python3 - <<'E'
p=
2026-10-24 11:24:02 | Bash | cd ~/omni101/01-Projects/active/omni101-app; cat >> tests/e2e/en-landing.spec.ts <<'E'
test.describe('English shell',()=
2026-10-24 11:24:12 | Bash | cd ~/omni101/01-Projects/active/omni101-app; python3 - <<'E'
p='tests/e2e/en-landing.spec.ts'; s=open(p).read()
a="await
2026-10-24 11:24:15 | Bash | cd ~/omni101/01-Projects/active/omni101-app; sed -n 74,100p tests/e2e/theme-quality.spec.ts | cut -c1-260; sed -n 44,52p
2026-10-24 11:24:19 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/landing; python3 - <<'E'
s=open('landing.css'
2026-10-24 11:24:31 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app; python3 - <<'E'
p='components/public/landing/offers.ts'; s=ope
2026-10-24 11:24:34 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app; grep -n "trust=" components/public/landing/offers.ts | cut -c1
2026-10-24 11:24:40 | Bash | cd ~/omni101/01-Projects/active/omni101-app; grep -rln "/Users/" apps/web/messages apps/web/project.inlang scripts/i18n-
2026-10-24 11:25:05 | Bash | cat > /tmp/omni101-deleghe/w23-i18n-paraglide/esito.md <<'E'
# W23-I18N-PARAGLIDE: esito fase 1

Stato: scritto, NON com
2026-10-24 11:25:08 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell; sed -n 1,10p Header.tsx; sed -n 58,76p
2026-10-24 11:25:11 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell; sed -n 62p Header.tsx | tail -c 80; gr
2026-10-24 11:25:14 | Bash | cd ~/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell; grep -n "menu-description" -B1 Header.
```

## Git Uncommitted Changes
```
 M ../../../../../../AGENTS.md
 M ../../../../../../docs/CONTEXT.md
 M ../../../../../../package-lock.json
 M ../../../../../../package.json
 M ../../../../../../src/data/prezzi.generated.json
 M ../../../../../../worker/prova-locale.sh
 M ../../../../../../worker/schema.sql
 M ../../../../../../worker/src/index.ts
 M ../../../../../../worker/wrangler.toml
?? ../../../../../../.claude/
?? ../../../../../../.github/
?? ../../../../../../CLAUDE.md
?? ../../../../../../GEMINI.md
?? ../../../../../../README.md
?? ../../../../../
?? ../../../../../../docs/MASTER-CONTRACT.md
?? ../../../../../../docs/README.md
?? ../../../../../../docs/STATO.md
?? ../../../../../../docs/UPGRADE-EXECUTION.md
?? ../../../../../../docs/architettura.md
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
1. `cd /Users/alessandropeloso/omni101/01-Projects/active/omni101-app/apps/web/app/components/public/shell`
2. Read `CLAUDE.md` for project context and current task
3. Review files modified above for in-progress work
4. Check git status for uncommitted changes
5. Read `~/.claude/projects/.../memory/*.md` for task-level context
6. If blocked: check `/Users/alessandropeloso/.claude/sessions/be491722-a32e-4c86-9f41-840ef3741bc2/actions.log` for full session trace
