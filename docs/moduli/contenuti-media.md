# Contenuti e media

## Scopo

Testi dello studio, catalogo servizi, portfolio, e i file che le pagine mostrano. Oggi i testi pubblici stanno nel codice. Il CMS in D1 è il cassetto, non la pagina.

## File

- Pubblico: `apps/web/app/components/public/shell/site-data.ts`, `apps/web/app/content/capabilities.ts`, `routes/public/insights.tsx`, `routes/public/work.tsx`, `routes/public/studio.tsx`.
- Admin: risorse `services`, `portfolio`, `content`, `media` in `schema.ts` e nella nav Studio.
- Asset: `apps/web/public/fonts/*`, `apps/web/public/media/omni-cinematic-atlas.png` (2 636 514 byte). Sotto `public/media/originali/` la cartella c'è; un elenco file va rifatto al momento del tocco perché SPEC-11 e SPEC-21 stanno generando originali.
- Vecchio sito: `src/pages/*.astro`, `docs/SEO-CHECK-free.md`. Non è il deploy di `apps/web`.

## API

CRUD `/api/records/services|portfolio|content` per i manager. `media` ha `write: []`. Nessun endpoint di upload trovato in `handleApi`. `GET /api/health` espone `storage: true` solo se il binding `MEDIA` esiste.

L'assistente pubblico legge fino a 6 `content_entries` pubblicati.

## Dati

`services`, `portfolio_items` (`kind`: `INTERNAL`, `CONCEPT`, `CLIENT_AUTHORIZED`), `content_entries` (`DRAFT` o `PUBLISHED`), `content_revisions`, `media_assets` (`r2_key`, `sha256`, `scan_result`), `attachments`.

`wrangler.jsonc` non dichiara un bucket R2. Produzione misurata il 22/10: `storage: false` (`ESITO-07-QA.md`).

## Test

`public.spec.ts` visita `/work`, `/studio`, `/insights` e si aspetta un h1. Non controlla un CMS. Nessun test di upload.

## Stato

Parziale, 2026-10-22. Pagine e catalogo da file: presenti. Upload, quarantena, rendition video: assenti finché R2 non è acceso dal founder. Il mandato vieta di attivare R2 in questo giro. Favicon assente: 404 su `/favicon.ico` in tutte le 36 misure Lighthouse del pomeriggio, e `app/root.tsx` non ha `rel=icon`.

Le immagini per segmento (SPEC-21, SPEC-22, SPEC-11) non vanno descritte qui come già in pagina.

## Decisioni

Niente media di clienti veri senza `CLIENT_AUTHORIZED` e un permesso. I concept restano concept. I provider video e voce live sono un'integrazione separata, spenta.

## Trappole

- Riscrivere una pagina pubblica in `content_entries` non cambia il sito: la route non fa quella SELECT.
- Mettere un PNG da megabyte in `public/` e referenziarlo nel CSS del primo schermo rifà l'LCP da 17 s. L'atlas è il precedente.
- `worker/` (Astro, Turnstile, D1 vecchio) non è il bucket dei media nuovi.
- Licenza Instrument Serif: il file `InstrumentSerif-LICENSE.txt` sta accanto ai TTF. Satoshi è in woff2 nella stessa cartella: controllare la licenza del file prima di ridistribuirlo altrove.

## Chi lo possiede ora

SPEC-11 per i visual originali. SPEC-16 per SEO e favicon, in coda. Questo documento lo aggiorna chi cambia una pagina o un asset.
