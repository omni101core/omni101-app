# Scenari A–G — Acceptance e Stato (REC-011)

| ID | Scenario | Acceptance verificabile | Stato | Dipendenze | Test esistente |
|----|----------|------------------------|-------|------------|----------------|
| A | lead → progetto | Lead creato da intake, qualificato in pipeline, preventivo approvato da due Owner, progetto creato, portale cliente isola i dati | IN_PROGRESS | — | `tests/commercial-chain.test.ts` (copre intake→lead→pipeline→pricing→second-Owner→progetto→portal isolation) |
| B | campagna | Campagna persistente con contenuti email/social in bozza, calendar, metriche, responsabile revisione; nessun invio senza connessione autorizzata | PLANNED | email-foundation, social-internal | nessun test |
| C | agente con MCP | Agente creato da template con tool MCP, budget, knowledge; test sicuro; pubblicazione versionata; registro mostra versione e run | PLANNED | integrations-mcp | nessun test |
| D | workflow visuale | Drag nodi, trigger CRM, condizione, test (dry-run), publish, evento, run visibile nel debugger, effetto persistito | IN_PROGRESS | design-system (REC-026), workflow-builder-editor (REC-008/009) | `tests/e2e/workflow-builder.spec.ts` (copre save/validate/start, conflict, undo/copy-paste, minimap) |
| E | tutorial | Percorso riprendibile per ruolo, reduced motion, accessibilità, progresso persistente; nessun demo fittizio | PLANNED | education | nessun test |
| F | coding agent | Collaborazione GitHub (branch protection, PR, checks, preview, deploy approval, Connect Your Agent, brief copiabile); sandbox cloud BLOCKED con decisione costi | PLANNED | coding-agents | nessun test |
| G | integrazione non disponibile | Wizard mostra dipendenza mancante e apre guida; template eseguibili in test mode; quelli che richiedono integrazioni assenti mostrano la dipendenza | PLANNED | integrations-mcp | nessun test |

**Note stato**:
- `VERIFIED` solo con prova (run ID, test verde, evidence collegato)
- `IN_PROGRESS` = codice esiste, acceptance parzialmente coperta
- `PLANNED` = acceptance definita, lavoro non iniziato o solo progettato