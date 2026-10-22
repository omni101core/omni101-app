# Brand

Decisioni del mandato del 22/10 (`MANDATO-UPGRADE.md` §3) e token letti in `apps/web/app/styles/public.css`.

Identità: **Digital Possibility Studio**.

Headline in home (`routes/public/home.tsx`): «La tua idea. Oltre il software.»

Sottotitolo: «Progettiamo e realizziamo applicazioni, sistemi intelligenti ed esperienze creative. Dall’idea al prodotto che funziona.»

Quattro famiglie commerciali, più una quinta nel catalogo: BUILD, AUTOMATE, CREATE, GROW, e EMERGING solo in `apps/web/app/content/capabilities.ts`. EMERGING non è un valore dell'intake (`schema.ts` accetta solo le prime quattro).

## Palette

| Token CSS | Hex | Uso nel mandato |
|---|---|---|
| `--bg` | `#101112` | Graphite |
| `--surface` | `#191a1c` | Surface |
| `--elevated` | `#252629` | Elevated |
| `--ivory` | `#f2eee6` | Ivory |
| `--gold` | `#d2b77b` | Champagne. Focus visibile e selezione. |
| `--muted` | `#b0ada6` | Testo secondario |
| `--line` | `#353535` | Filetti |

`color-scheme: dark`. Il contrasto dei numeri di tab `#6d7168` su `#101112` è stato misurato 3,79:1 il 22/10 (`ESITO-07-QA.md`): sotto WCAG AA. Non è stato corretto in quel lavoro.

## Tipografia

Satoshi 400, 500, 700 in woff2: `apps/web/public/fonts/Satoshi-*.woff2`. Corpo in `public.css`.

Instrument Serif regular e italic, file TTF: `apps/web/public/fonts/InstrumentSerif-*.ttf`, con `InstrumentSerif-LICENSE.txt`. `font-display: swap`. Il TTF è citato come causa di LCP e di un CLS 0,192 sulla login di staging.

Wordmark: peso 700, 28px, tracking -1.8px. Nav: 11px.

## Voce

Italiano, frasi corte, dichiarative. Niente esito economico garantito. Le demo si presentano come demo: il carrello non incassa, il workflow pubblico non scrive il CRM, le anteprime creative non sono lavori di clienti. I progetti in `site-data.ts` sono concept (slug `essenza`, `atelier`, `flow`, `identity`, `editorial`, `portal`). Gli articoli in quella stessa fonte sono tre pezzi dello studio, non casi cliente.

Il sito Astro in `src/` usava un altro registro («Calibro») e `MOSTRA_PREZZI=false` in `src/data/prezzi.ts`. Quel flag non governa `apps/web`.

## Regia e pubblico

La motion vincolante è `docs/moduli/regia-motion.md`, che rimanda al testo del coordinatore `esiti/omni101-codex-ripresa/REGIA-MOTION.md`. Un effetto firma per pagina. Il workspace non usa quella grammatica.

I segmenti di pubblico stanno in `esiti/omni101-codex-ripresa/PUBBLICO.md` (SPEC-22, 2026-10-22): proposta, nessuna pagina aggiunta al sito. I testi nel codice stanno in `apps/web/app/components/public/shell/site-data.ts` e in `apps/web/app/content/capabilities.ts` (75 schede: 16 BUILD, 16 AUTOMATE, 16 CREATE, 12 GROW, 15 EMERGING; disponibilità 53 DISPONIBILE, 7 SU_MISURA, 15 SPERIMENTALE).
