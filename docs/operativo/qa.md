# QA

Misure del 22/10. I numeri stanno in `esiti/omni101-codex-ripresa/qa/out/summary.json`. Il racconto è `ESITO-07-QA.md`. Questo file non rilancia le misure.

## Script

`esiti/omni101-codex-ripresa/qa/measure.mjs`, lanciato fuori dal repo app. Finestra 13:23–13:29 UTC. Lighthouse 12.8.2, Chrome headless con GPU, axe-core 4.10.3 (wcag2a/aa, wcag21a/aa, wcag22aa). Bersagli: `https://preview.omni101.app` (revisione `b6e61e9a94e3ad8ad13c58ffbfaa714f796af6c8`) e `https://omni101.app` (`revision` assente). Nove pagine, mobile e desktop. `/admin` solo la login. 36 Lighthouse, 36 axe, 4 tastiere, 18 motion, 36 pesi. Repo app non modificato da quel lavoro.

In CI, il gate del codice è un altro: `npm run typecheck`, `npm test`, Playwright (`playwright.config.ts`, progetti `desktop` e `mobile` / iPhone 13, base `http://localhost:4174`). Non include Lighthouse.

## Soglie usate il 22/10

| Soglia | Valore | Esito di quella finestra |
|---|---|---|
| LCP | ≤ 2,5 s | Mobile staging: passano `/explore`, `/solutions`, `/contact`. Cadono `/`, `/work`, `/start-project`, `/insights`. Solo LCP: `/studio`, `/admin`. Home staging 17,24 s. |
| CLS | ≤ 0,1 | Mobile sotto soglia. Desktop admin staging 0,192 sulla login (font TTF). |
| Performance mobile | ≥ 90 | Stesse pagine pesanti sotto. |
| Accessibilità Lighthouse | ≥ 95 | Tutte le pagine misurate sopra o uguali. |
| WCAG 2.2 AA (axe) | zero serious | `color-contrast` serious su `#tab-build`, `#tab-automate`, `#tab-create`, `#tab-grow`, 3,79:1. Lighthouse resta ≥ 95. |
| INP di campo | non usato | `inpMs` null su 36/36. Il laboratorio dà il TBT. |

Una passata per cella. Non è una mediana.

## Altri fatti di quella misura

- Atlas PNG 2 636 514 byte, 2172×724, sullo staging. In produzione quella HEAD era 404.
- `/favicon.ico` 404 su 36/36.
- Canonical dello staging sempre `https://omni101.app` + path.
- Reduced motion: l'h1 resta; in home staging spariscono i preload di three, Cinematic e SpatialGallery.
- Best practices spesso 93 per source map assenti più il favicon.

## Cosa non rifare sul Mac

Con il disco sotto il 15% non si rilancia Lighthouse, Playwright o un build per «rifare il numero». La prossima misura è di chi ha il permesso, sullo staging dopo una CI verde, e aggiorna questo file con la finestra e lo SHA.
