# Checkpoint coordinatore

Aggiornato: 2026-10-23, push release in questo commit. Coordinatore: Grok. Altra CLI: zero ownership, zero file. Lock staffetta in `/tmp/omni101-deleghe/staffetta.lock`.

## SHA e CI

- LIVE ancora `01805108595ba1bc21866bcc84825fae829792ff`, run `39962720977`. Health si ricontrolla dopo la CI di `release-commercial`.
- STAGING verde: `735174da12821ea6b0891f898e8a7f8921e8c78e`, run `39980811933` attempt 2, verify verde, production saltato. 148 test, Playwright 105 pass / 13 skip, smoke a slice verticale completa. Il 503 sul workflow dell'attempt 1 non si è ripetuto.
- Questo `--release` porta gli stessi byte di `735174d` più `docs/CONTEXT.md`, questo checkpoint, `docs/STATO.md`, `docs/decisioni.md`. Lo SHA di release è quello stampato da `cloud-verify.py`.

## Locali non pubblicati

Nessun codice fuori da questo push. Esiti pronti, non copiati (release successiva):

- U4 area soci: `admin.tsx` + solo regole `os-nav-*` in fondo a `admin.css`. Non toccare KanbanBoard né il CSS del drag.
- P2 listino UI: `PricingCatalog.tsx`, `PricingWorkspace.tsx`. Confronto visivo, calcolo invariato.
- UX1–UX5: copy su file disgiunti. UX6 si sovrappone a U4 su `admin.tsx`/`admin.css`: non copiare UX6 sopra U4.
- W-email: esito presente, non in `docs/operativo/`.

## Ownership

- Grok coordina. Non rifare `integra` di S4k: il DOM S4k è già nel tree e S4l (mousedown/mouseup, niente `draggable`) è il path che ha reso verde Playwright.
- Modello UI pesante `cursor-grok-4.5-high` già usato su U4 e P2. Stesso pool di Grok. Non lanciare un terzo worker su `admin.tsx`, `admin.css`, `PricingWorkspace.tsx`, `PricingCatalog.tsx`.

## Backlog reale nell'app

Drag kanban (mouse), `GET /api/calendar`, listino `0012` + UI catalogo, seeder con `source_id` anche per le 6 voci senza mandato in `sources.json` (REFERENCE da `origin`). Ancora fuori da questo codice: copy UX1–UX5, menu soci U4, confronto listino P2, email. Decisioni founder aperte: repo pubblico con mandati visibili; deroga separazione compiti con un solo Owner; testata preventivi solo ricorrenti; P.IVA/telefono.

## Blocchi

- Un solo push alla volta. Niente `--release` se la CI di release è rossa.
- Non sovrascrivere `.os-card-body`, `.os-card-open` piccolo, `user-select:none`.
- Classe A non ai modelli gratuiti.

## Rollback

Codice live precedente: `01805108595ba1bc21866bcc84825fae829792ff`. Migrazioni additive (0011, 0012). Non cancellare tabelle.

## Prossimo comando

Dopo questo push, lo SHA è nell'output di cloud-verify. Poi:

`python3 -I ~/.omni101/bin/omni-delega/omni-delega.py ci <sha> --branch release-commercial`

Verde: `curl -s https://omni101.app/api/health` deve mostrare quello SHA. Poi integra U4 e P2 su una release nuova, dopo `--check`.
