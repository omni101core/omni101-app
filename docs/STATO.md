# Stato per area

Osservato il 2026-10-22 sul working tree locale, branch `reinvenzione-2026-10`, non committato. I worker del run Orca `run_9fb3449e1717` stanno ancora scrivendo le pagine pubbliche: una riga «parziale» può essere già cambiata. Chi chiude un'area aggiorna la riga.

Staging misurato nel pomeriggio: `https://preview.omni101.app`, revisione `b6e61e9a94e3ad8ad13c58ffbfaa714f796af6c8` alle 13:23 UTC (`ESITO-07-QA.md`). Quella revisione non è questo working tree. Produzione `https://omni101.app`: stessa finestra, `revision` assente, `database: true`, `storage: false`. Ultima CI verde citata in `docs/UPGRADE-EXECUTION.md`: run `39772792713` sul commit `fcdbb73758f9f9cf590f60fc5f3c4f36f0e5528a`. Run `39775631432` sullo SHA `4fdcda9` rossa su Playwright, deploy non partito (`ESITO-01-GAP.md`).

| Area | Stato | Data | Dove si vede |
|---|---|---|---|
| Runtime Worker, D1, due Workflow | Fatto nel codice e in `wrangler.jsonc`. Code di Cloudflare assenti. | 2026-10-22 | `apps/web/workers/app.ts`, `apps/web/wrangler.jsonc` |
| Auth passkey, due Owner | Fatto nei test. E2E Owner solo desktop. Invito reale del collaboratore: lo manda il founder. | 2026-10-22 | `apps/web/app/server/passkeys.ts`, `tests/e2e/owners.spec.ts` |
| Sito pubblico (route, catalogo 75) | Parziale. Route dedicate per `/`, `/explore`, `/solutions`, playground. Home ancora con tre pezzi 3D. | 2026-10-22 | `apps/web/app/routes.ts`, `routes/public/home.tsx` |
| Regia motion | Decisione scritta, codice non allineato. | 2026-10-22 | `REGIA-MOTION.md` nel fascicolo esiti; home importa `ReelOrbit`, `CinematicExperience`, `SpatialGallery` |
| Playground commerce e workflow demo | Parziale. Demo locali, senza pagamento e senza scrittura CRM. | 2026-10-22 | `tests/e2e/public.spec.ts` |
| Vision Lab e voce | Codice locale di SPEC-12, non passato in CI da quel lavoro. Microfono bloccato dalla Permissions-Policy. Webcam non provata su hardware. | 2026-10-22 | `ESITO-12.md`, `apps/web/workers/app.ts` |
| OMNI ASSIST | Parziale. NVIDIA, schema, navigazione consentita, cronologia isolata. Il lead parte solo da `/api/intake` dopo conferma. | 2026-10-22 | `apps/web/app/server/assistant.ts` |
| CRM (contatti, aziende, lead, trattative, clienti) | Fatto nel codice e nei test di integrazione. Vista tabella. Niente timeline, filtri salvati, commenti, menzioni. | 2026-10-22 | `apps/web/app/server/schema.ts`, `routes/admin.tsx` |
| Kanban | Fatto sul desktop E2E della CI precedente. Mobile skippato in quello spec. | 2026-10-22 | `KanbanBoard.tsx`, `tests/e2e/workspace.spec.ts` |
| Progetti, task, QA, consegna | Parziale. Pipeline PLANNING→EXECUTION→QA→DELIVERY→MAINTENANCE nel server. Niente Gantt. | 2026-10-22 | `apps/web/app/server/pipeline.ts` |
| Workflow builder | Parziale. 9 tipi di nodo, grafo aciclico, esecuzione durevole, dry run. Il mandato chiede 18 nodi, loop e subflow: non ci sono. | 2026-10-22 | `workflow-runtime.ts` `nodeKinds` |
| Mission Control | Parziale. Run, step, artefatti, cancel. Pausa manuale dichiarata non supportata. Senza `AI_API_KEY` l'agente risponde 503. | 2026-10-22 | `apps/web/app/server/mission.ts`, `api.ts` `runAgent` |
| Portale cliente | Parziale. Progetti, preventivi approvati, fatture non in bozza, consegne, ticket. | 2026-10-22 | `api.ts` `portal`, `routes/portal.tsx` |
| Finanza | Parziale. Preventivi, spese, fatture come registri. Nessuna emissione fiscale. Ricavi e costo AI solo a OWNER, ADMIN, FINANCE. | 2026-10-22 | `schema.ts`, `api.ts` `dashboard` |
| Contenuti e media | Parziale. Testi pubblici in file TypeScript. Tabelle CMS presenti. R2 non legato: `storage` false in produzione. | 2026-10-22 | `wrangler.jsonc` senza `r2_buckets`; `public/media/omni-cinematic-atlas.png` |
| Analytics e SEO | Parziale. `robots.txt` e `sitemap.xml` nel Worker. Tabella `analytics_events` senza scrittura vista nel client. Admin analytics riusa la dashboard. Niente JSON-LD in `apps/web`. Favicon 404 nella misura del 22/10. | 2026-10-22 | `api.ts`, `ESITO-07-QA.md` |
| Prestazioni | Misurate, non a soglia sul mobile delle pagine pesanti. | 2026-10-22 | `docs/operativo/qa.md` |
| Documentazione di questo albero | Scritta il 22/10. Dal 22/10 sera `cloud-verify.py` pubblica `docs/` e i file di istruzioni, con scansione anti-segreti. | 2026-10-22 | `docs/README.md` |
| Identità legale, P.IVA, testi di retention verificati | Mancante. Lo chiude il founder. | 2026-10-22 | `MAPPA-MANDATO.md` |
| R2, code Cloudflare, companion desktop, voce e video live a pagamento, sandbox di codice | Mancante. Pagamenti non autorizzati. | 2026-10-22 | `Env` in `auth.ts` ha `MEDIA` e `QUEUE`; `wrangler.jsonc` non li lega |

## Cosa non è questa app

`src/**/*.astro` e `worker/` restano sul disco. `package.json` di root ha un solo workspace: `apps/web`. Il deploy di CI usa `apps/web`.

## Aggiornamento riallineamento successivo a Claude — 2026-10-22 sera

Health letto prima delle modifiche: preview e produzione rispondono entrambe `24ac9b74ac99faa1072f9842c5048845635fb908`, database vero, storage falso. Questo dato sostituisce la misura pomeridiana sopra per il live. Codice locale esteso con temi distinti, narrativa home completa, Avatar/Software Lab e quattro registri Growth/Creative/Ops; migrazione 0006 ancora da verificare/applicare attraverso CI staging. Test nuovi per temi/demo e persistenza/isolamento/permessi. Ultima CI preesistente `39808455672` rossa (diagnostica volutamente fallente, galleria che saltava, hit target ruota, SQLITE_BUSY). Correzioni preparate. Produzione non modificata da questa ripresa; completamento globale del mandato non dichiarato.

## Prove e continuità — aggiornamento successivo

CI `39833548394`, SHA `7289881681d00cad1bfe109e9d187a379691f555`: 87 test server + 99 browser superati, 9 skip preesistenti; build completate. Deploy non eseguito: migrazione remota bloccata da Cloudflare D1 7403 (token CI con restrizione IP e scope insufficienti). Artefatto servito solo in locale su 4176. Il live resta alla revisione indicata sopra.

Nuovi centro operativo, aggregati finanziari, pianificazione/percorso critico/dipendenze/commenti e bootstrap backlog sono successivi a quella prova. CI `39836488222` ha rilevato errori di tipo nelle nuove viste; corretti localmente, nuova verifica necessaria. Migrazione 0007 e backlog **non applicati al live**. Preparazione Owner disponibile nel codice: 15 task, 3 milestone e 3 workflow DRAFT, nessuna esecuzione automatica. Dettagli e prossime azioni in `docs/operativo/ripresa.md`.

Backlog ora popolato **nel solo D1 locale**: conteggi verificati 15 task, 3 milestone, 3 workflow DRAFT, 0 esecuzioni agenti/workflow. Nuovi casi portfolio Casa Luce/Tavola/Studio Forma con immagini originali e filtro settore preparati nel codice, in verifica CI.
