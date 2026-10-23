# SEO Technical Check — SOLA LETTURA

Progetto: omni101-app (sito pubblico omni101.app)
Fonte: `dist/` (build statico Astro, 19 pagine)
Controllato: 2026-10-02

## Verifica globale

| Elemento | Stato | Note |
|----------|-------|------|
| `robots.txt` | OK | User-agent: *, Allow: /, Sitemap referenziato |
| `sitemap-index.xml` | OK | 1 indice -> sitemap-0.xml |
| `sitemap-0.xml` | OK | 19 URL |
| `manifest.webmanifest` | OK | lang="it", bg #07080b, icon-192/512 |
| `<html lang="it">` | OK | presente su tutte le pagine |
| Un solo h1 | OK | presente e unico su tutte le pagine |
| Canonical | OK | presente su tutte le pagine |
| JSON-LD | OK | valido (parse JSON) su tutte le pagine |
| og:title / og:image | OK | presenti su tutte le pagine |
| Link interni | OK | nessun link interno rotto |
| Immagini alt | OK | nessuna immagine senza attributo alt |
| Canonical trailing-slash | ATTENZIONE | 18 pagine: canonical senza `/` finale, sitemap con `/` |

## Note

- **Title e description** brevi sono coerenti con il brand voice Calibro (sobrio,
  dichiarativo, frasi corte — regola 95: niente markettaro). Sono indicati per
  consapevolezza: da 50-60c (title) e 150-160c (description) si ottiene più spazio
  cliccabile in SERP, ma allungare significa abbandonare il registro conciso.
- **Canonical trailing-slash**: 18 di 19 pagine hanno canonical `https://omni101.app/<pagina>`
  (senza `/`) mentre il sitemap le elenca con `/` finale. Astro/Cloudflare Pages
  servono la risorsa a `/<pagina>/`. Google indica che canonical e URL servito
  dovrebbero coincidere. Vedere righe pagina-specifiche nella tabella.

## Tabella: pagina | problema | correzione

| Pagina | Problema | Correzione |
|--------|----------|------------|
| /agent | title corto (28c) | Lungare a 50-60 caratteri |
| /agent | meta description corta (69c) | Allungare a 150-160 caratteri |
| /agent | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /audit-gratuito | title corto (24c) | Lungare a 50-60 caratteri |
| /audit-gratuito | meta description corta (71c) | Allungare a 150-160 caratteri |
| /audit-gratuito | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /chi-siamo | title corto (19c) | Lungare a 50-60 caratteri |
| /chi-siamo | meta description corta (88c) | Allungare a 150-160 caratteri |
| /chi-siamo | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /come-funziona | title corto (23c) | Lungare a 50-60 caratteri |
| /come-funziona | meta description corta (104c) | Allungare a 150-160 caratteri |
| /come-funziona | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /desk | title corto (20c) | Lungare a 50-60 caratteri |
| /desk | meta description corta (79c) | Allungare a 150-160 caratteri |
| /desk | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /fiducia | title corto (40c) | Lungare a 50-60 caratteri |
| /fiducia | meta description corta (90c) | Allungare a 150-160 caratteri |
| /fiducia | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /hosting | title corto (17c) | Lungare a 50-60 caratteri |
| /hosting | meta description corta (72c) | Allungare a 150-160 caratteri |
| /hosting | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| / | title corto (37c) | Lungare a 50-60 caratteri |
| /legal/ai-policy | title corto (19c) | Lungare a 50-60 caratteri |
| /legal/ai-policy | meta description corta (44c) | Allungare a 150-160 caratteri |
| /legal/ai-policy | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /legal/privacy | title corto (17c) | Lungare a 50-60 caratteri |
| /legal/privacy | meta description corta (42c) | Allungare a 150-160 caratteri |
| /legal/privacy | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /legal/terms | title corto (17c) | Lungare a 50-60 caratteri |
| /legal/terms | meta description corta (37c) | Allungare a 150-160 caratteri |
| /legal/terms | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /pacchetti | title corto (19c) | Lungare a 50-60 caratteri |
| /pacchetti | meta description corta (91c) | Allungare a 150-160 caratteri |
| /pacchetti | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /partner | title corto (17c) | Lungare a 50-60 caratteri |
| /partner | meta description corta (89c) | Allungare a 150-160 caratteri |
| /partner | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /processi | title corto (18c) | Lungare a 50-60 caratteri |
| /processi | meta description corta (75c) | Allungare a 150-160 caratteri |
| /processi | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /prodotti | title corto (18c) | Lungare a 50-60 caratteri |
| /prodotti | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /risorse | title corto (17c) | Lungare a 50-60 caratteri |
| /risorse | meta description corta (96c) | Allungare a 150-160 caratteri |
| /risorse | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /servizi | title corto (19c) | Lungare a 50-60 caratteri |
| /servizi | meta description corta (77c) | Allungare a 150-160 caratteri |
| /servizi | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /sito | title corto (20c) | Lungare a 50-60 caratteri |
| /sito | meta description corta (82c) | Allungare a 150-160 caratteri |
| /sito | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
| /voce | title corto (26c) | Lungare a 50-60 caratteri |
| /voce | meta description corta (77c) | Allungare a 150-160 caratteri |
| /voce | canonical senza trailing slash (sitemap lo ha) | Allineare canonical a con `/` finale, come sitemap |
