# Checkpoint coordinatore

Aggiornato: 2026-10-23, push release in questo commit. Coordinatore: Grok. Altra CLI: zero ownership, zero file. Lock staffetta in `/tmp/omni101-deleghe/staffetta.lock`.

## SHA e CI

- LIVE `3101815c9aee44ce6679f0e4fec6e01bda217258`. Run `39984184634` verify e production verdi. Health `https://omni101.app/api/health` ha quello SHA, `database` true, `storage` false. Rollback al Worker `01805108595ba1bc21866bcc84825fae829792ff`.
- STAGING `14e4434` run `39987421101`: un solo e2e rosso, preventivo a 390px (`scrollWidth` > viewport). Causa: `<pre>` del comando listino. Sostituito con un paragrafo che va a capo. Nuovo SHA nello output di cloud-verify.
- RELEASE push: `3101815c9aee44ce6679f0e4fec6e01bda217258` su `release-commercial`, 21 file diversi dal live precedente. CI in corso. Questa riga è locale, non è nel commit `3101815`.

## Locali non pubblicati

Nel push di staging dopo il live `3101815`: U4 (`admin.tsx`, regole `os-nav-*` aggiunte in coda a `admin.css` senza sostituire il file) e P2 (confronto prezzo vs listino). Il `role` del preventivo resta `session.membership.role`, non `session.role`. CSS drag (`user-select:none`, `.os-card-body`, `.os-card-open`) tenuto.

Ancora fuori:

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

Staging del tree U4+P2 (non `--release` finché verify non è verde):

`python3 scripts/cloud-verify.py --check && python3 scripts/cloud-verify.py`

Poi `python3 -I ~/.omni101/bin/omni-delega/omni-delega.py ci <sha> --branch rebuild-commercial`. Verde: `python3 scripts/cloud-verify.py --release` e health deve mostrare il nuovo SHA.
