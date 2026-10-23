# Analytics e SEO

## Scopo

Farsi trovare sulle pagine pubbliche e non far indicizzare workspace e portale. Capire i numeri dello studio senza un tracker di terza parte acceso di nascosto.

## File

- `robots.txt` e `sitemap.xml` generati in `handleApi` (`apps/web/app/server/api.ts`). Non sono file in `public/`.
- Meta title, description, `og:*`, canonical: `routes/public.tsx`, `routes/explore.tsx`, `routes/solutions.tsx`, `routes/playground-vision.tsx`, `routes/playground-voice.tsx`.
- `noindex` admin: `routes/admin.tsx` `meta()`.
- Tabella `analytics_events` in `0001_initial.sql`.
- Nav `/admin/analytics`: in `load()` usa `GET /api/dashboard`, gli stessi quattro indicatori della panoramica (lead, pipeline, progetti, approvazioni). Non legge `analytics_events`.
- Controllo vecchio: `docs/SEO-CHECK-free.md` (Astro, 2026-10-02, 19 URL). Non descrive il Worker.

Path nella sitemap, tutti sotto `https://omni101.app`: home, solutions, le quattro famiglie, explore, commerce, workflow, creative, work, studio, start-project, contact, insights. Non ci sono i singoli casi, gli articoli, vision, voice, privacy, termini.

## API

`GET /robots.txt`, `GET /sitemap.xml`. Nessun `POST /api/analytics` trovato. `analytics_events` non ha una risorsa in `resources`.

## Dati

`analytics_events`: `name`, `path`, `source`, `occurred_at`, più `organization_id`. Senza una scrittura nel server, la tabella resta vuota.

## Test

Nessun test Vitest dedicato al sitemap. La misura esterna è `ESITO-07-QA.md`: Lighthouse SEO 100 sulle pubbliche, 54 su `/admin` per il noindex (va tenuto). Best practices 93 anche per `/favicon.ico` 404. Canonical di preview punta a `omni101.app`.

JSON-LD: nessuna occorrenza di `application/ld+json` sotto `apps/web` il 22/10.

## Stato

Parziale, 2026-10-22. Robot e sitemap minimi ci sono. Mancano favicon, JSON-LD, hreflang (l'inglese è predisposizione di SPEC-16, non una route), eventi analytics, Web Vitals in app. SPEC-16 (code, osservabilità, backup D1, SEO completo) è in coda dopo SPEC-06. SPEC-07 ha misurato e non ha patchato.

## Decisioni

Admin e portale restano fuori dall'indice. Il noindex vale più di uno SEO 100 sulla login. Lo staging può canonicalizzare verso la produzione finché preview non deve essere indicizzato: lo score di laboratorio era già 100. Un tracker nuovo è una decisione di privacy, non uno script incollato.

## Trappole

- Aggiungere una pagina pubblica e dimenticare l'array `paths` in `sitemap.xml` la lascia fuori. Il canonical nella `meta()` è un secondo punto da aggiornare.
- Coprire il noindex dell'admin per «aggiustare il 54» indicizza la login.
- `docs/SEO-CHECK-free.md` parla di `sitemap-index.xml` e di un manifest. Quei file sono del build Astro. Il Worker risponde con un sitemap unico.
- INP di campo non è stato raccolto il 22/10 (`inpMs` null). Non citarlo come numero.

## Chi lo possiede ora

SPEC-16 quando parte. Fino ad allora chi tocca title, canonical o sitemap aggiorna questo file.
