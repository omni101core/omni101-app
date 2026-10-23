# Delega CLI Orca — OMNI101 commerciale

23 ottobre 2026. Workspace esplicito `/Users/alessandropeloso/omni101/01-Projects/active/omni101-app`. Skill letta: `/Users/alessandropeloso/omni101/00-Control-Plane/istruzioni/skill/orca-cli-orchestrator/SKILL.md`. Nessuna modifica al vault, a ceo-os o alle chat altrui.

## Capacità realmente osservate

- Orca 1.4.237 runtime ready. Il repo commerciale inizialmente non era registrato: `selector_not_found` prima di qualsiasi lancio. Registrato il percorso esistente con `orca repo add`, senza checkout/clone/commit o setup script.
- Workspace Orca: `c9dd507c-ba17-451c-adbd-a76eef1836d2::/Users/alessandropeloso/omni101/01-Projects/active/omni101-app`.
- Claude: `agent launch --agent claude --model sonnet --effort medium --surface terminal`, banner conferma Sonnet 5.5 medium / Claude Pro. Handle proprio `term_85d9a3f6-13f7-4666-af02-459a99b9cd4e`; operation `1792761139975-85dae2141dc541b5bf963593eab4a67a`. Prompt handed-to-terminal, letture e report osservati.
- Grok: `grok models` conferma login grok.com, default e modello disponibile grok-4.7. `agent launch` con --model è respinto prima del lancio da questo adapter Orca. Fallback `terminal create` visibile con CLI `grok --model grok-4.7 --reasoning-effort medium --permission-mode default --disable-web-search --no-subagents`, workspace esplicito. Handle proprio `term_09ced518-d5ff-4bd8-85a8-4ce26474fcf2`, surface visible; banner Grok4.7 medium. Nessun --always-approve/yolo aggiunto. Confermata solo la fiducia nella directory già autorizzata dal founder.
- Nessuna stima di costo o risparmio token: non misurati. Il banner/statusline di un plugin non sostituisce la configurazione effettiva del provider.

## Incarichi disgiunti e risultati

Specifiche autosufficienti in `/tmp/omni101-orca-20261023/claude.md` e `grok.md`: obiettivo, file consentiti, divieti, verifica, esito; nessun coding concorrente nel repo, niente build/install/Playwright sul Mac, niente web o segreti.

Claude: review denaro/concorrenza/approvazioni. Il suo hook privacy ha respinto la scrittura del report anche ridotto; istruito a non aggirarlo. Esito ricevuto redatto nel terminale, nessuna richiesta al founder di disattivare guardie. Riscontri accettati: possibile quote v0 in collisione requestId, motivazione esplicita su sconti/sotto costo. Riscontri valutati e non applicati alla cieca: doppia firma non è policy approvata; cadenze non vanno sommate in amount_cents; tetti correnti mantengono prodotti interi sotto 2^53. Test mirati aggiunti, prova CI ancora necessaria.

Grok: review percorso UI/versioni/feedback/portale. Report effettivo `/tmp/omni101-orca-20261023/grok-review.md`, controllato dal parent. Turno proprio cancellato dopo circa5 minuti per limitare il lavoro; il report era già stato scritto. Riscontri accettati: motivazione decisione hardcoded, chiusura prematura dialog, azioni visibili a ruoli senza permesso, campi fiscali/lead non visibili nello snapshot, copertura E2E da estendere. Ipotesi su schema approvazioni/ordine snapshot confrontate con backend e ridimensionate. Correzioni/test in `docs/moduli/preventivatore.md`.

Entrambe sono review statiche, non prove browser o di esecuzione. Nessun “avviato” è stato contato come “completato”. Esiti verificati su sorgente e poi sottoposti alla CI. In nuove chat lanciare nuovi worker con proprietà esplicita: non riutilizzare handle o mailbox di chat altrui senza autorizzazione.
