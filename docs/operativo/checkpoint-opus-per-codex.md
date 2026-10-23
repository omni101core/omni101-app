# Checkpoint coordinatore

Aggiornato: 2026-10-23, push release in questo commit. Coordinatore: Grok. Altra CLI: zero ownership, zero file. Lock staffetta in `/tmp/omni101-deleghe/staffetta.lock`.

## SHA e CI

- LIVE `80a5165f59e92de927fad8775a6f71e43511221d`. Run `39989548616` verify e production verdi. Health ha quello SHA, `database` true, `storage` false. Rollback al Worker `3101815c9aee44ce6679f0e4fec6e01bda217258`.
- STAGING verde: `d64de4b858f5e383dd945b36fca628a7bede23ba`, run `39988347856`. 148 test, Playwright 105/13, smoke intero. Dentro: menu soci U4, confronto listino P2, h1 `Oggi nello studio`, comando listino che va a capo.
- RELEASE `80a5165f59e92de927fad8775a6f71e43511221d` su `release-commercial`, 9 file rispetto a `3101815`. CI in corso. Questa riga è locale, non è nel commit.

## Locali non pubblicati

Nel push di staging dopo il live `3101815`: U4 (`admin.tsx`, regole `os-nav-*` aggiunte in coda a `admin.css` senza sostituire il file) e P2 (confronto prezzo vs listino). Il `role` del preventivo resta `session.membership.role`, non `session.role`. CSS drag (`user-select:none`, `.os-card-body`, `.os-card-open`) tenuto.

Staging fix UX `d08d9a6fc43f4b6870eabdc651a133758062496a`, run `39992571933` in corso. Porte home: `/work`, `/explore`, `/start-project`. Escape duplicato su `/work` rimosso. Non live. UX6 non copiato. Riga locale.
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

LIVE è `80a5165`. Prossimo è lo staging UX1–UX5 (non UX6), poi CI su `rebuild-commercial`. `--release` solo se verify è verde.
