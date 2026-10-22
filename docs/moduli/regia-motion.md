# Regia motion

## Scopo

Dire dove sta ogni animazione. Il testo vincolante del coordinatore è `esiti/omni101-codex-ripresa/REGIA-MOTION.md` (22/10, dopo la correzione del founder). Questo file dice come il codice ci sta rispetto a quel testo.

## File

Componenti in `apps/web/app/components/public/`: `PublicTransition.tsx`, `ReelOrbit.tsx`, `reel-ring.ts`, `HomeShowcase.tsx`, `ImageExpansionTypography.tsx`, `shell/RevealTitle.tsx`, `CinematicExperience.tsx`, `CinematicScene.tsx`, `SpatialGallery.tsx`, `SpatialGalleryScene.tsx`, `PortalCanvas.tsx`, `PortalNarrative.tsx`, `Process.tsx`, `explore/ExplorePath.tsx`, `capabilities/SolutionsView.tsx`, `webglSlot.ts`. CSS accanto in `apps/web/app/styles/`.

## API

Nessuna.

## Dati

Nessuna tabella. L'atlas è un file: `apps/web/public/media/omni-cinematic-atlas.png`, 2 636 514 byte, citato in `ESITO-07-QA.md` come peso sul primo paint di home, work ed explore in staging.

## Test

`tests/e2e/motion-gallery.spec.ts` controlla la galleria di `/work`, il reduced motion e la transizione (`data-public-transition`, `data-phase`). `explore-solutions.spec.ts` controlla il percorso di explore e la ruota deal di solutions. Reduced motion: `PublicTransition` si chiude subito; gli spec chiedono il contenuto fermo e i link veri.

## Stato

Decisione fatta, implementazione parziale, 2026-10-22.

| Pagina | Effetto che la regia assegna | Nel codice letto oggi |
|---|---|---|
| `/` | Anello di reel con loader che è la stessa scena, frase con porte, un capitolo sulla parete curva con quattro tappe, porte. Un solo canvas, nessun pin. | Fatto (SPEC-26): `ReelOrbit` + `CinematicExperience` + porte. Vedi `moduli/pubblico.md`. |
| `/solutions` | Ruota deal: il mazzo si apre dal centro e si alza, una carta per famiglia (`DealWheel.tsx`). `/solutions/:family`: nessun effetto. | SPEC-17b. Dettagli in `moduli/pubblico.md`. |
| `/explore` | Percorso camera. | `ExplorePath` è la route. |
| `/work` | Galleria di profondità, unica nel sito. | `SpatialGallery` è anche in home. |
| `/studio` | Oggetto scultoreo OMNI PORTAL. | `PortalCanvas` esiste; va verificato al momento del tocco se è solo qui. |
| `/insights`, form, 404 | Nessun effetto firma, salvo il testo 3D corto sulla 404. | Non ricontrollato pagina per pagina in questo lavoro di documentazione. |

Effetti del catalogo Codrops non elencati in `REGIA-MOTION.md` non si aggiungono senza modificare quella mappa (`ESITO-04-CODROPS.md`).

## Decisioni

Un effetto, una pagina, uno scopo scritto. Un canvas. Scroll nativo. Hover immagini: zoom 1.03 e velatura, niente tilt. Menu: overlay a clip. Titoli: reveal a righe, niente glitch. Grammatica completa nel file di regia.

## Trappole

- Riusare `SpatialGallery` o `CinematicExperience` «in piccolo» su un'altra route rompe la regola 1.
- Due canvas nella stessa pagina rompono la regola 3. Gli spec contano i canvas WebGL.
- Un pin nuovo, non scritto nella tabella della regia, non si aggiunge.
- Il poster del capitolo scarica l'atlas solo quando la sezione è vicina (`data-near`); rimetterlo nel CSS di base riapre l'LCP. L'atlas da 2,6 MB sul telefono ha portato l'LCP di home staging a 17,2 s. Una modifica motion che lo rimette nel primo paint riapre quel numero.

## Chi lo possiede ora

SPEC-02b (home e `routes/public.tsx`), SPEC-17 (`/solutions`), SPEC-18 (`/work`, caso, `/studio`, 404). La mappa resta del coordinatore: un worker non la riscrive per farci stare un effetto nuovo.

## Grammatica e home, come sono nel codice (SPEC-26, 2026-10-22)

`PublicTransition` unica; `RevealTitle` per i titoli (mai nascosto l'`h1` al primo caricamento); `.scroll-reveal` fade 8 px una volta; menu `site-menu` a clip in `shell/Header.tsx`; `.img-hover` 1.03 e velatura; niente tilt. Home: anello (formation → expansion) con loader saltabile, capitolo con quattro tappe, quattro porte. `tests/regia-signature.test.ts` fa fallire la CI se `ReelOrbit` o `CinematicExperience` compaiono fuori dalla home, o se la home rimonta gli effetti ritirati.

## Correzione profondità — 2026-10-22 sera

`SpatialGallery` usa track CSS stabile `560svh` e stage sticky nativo, senza pin-spacer GSAP. Fine scroll `bottom bottom`. Evita la variazione di altezza che faceva saltare «Studio successivo» da Essenza a OMNI Portal. Il test diagnostico che falliva deliberatamente è ora regressione: prossimo = Atelier, profondità tra 0.8 e 1.2. Un effetto per route e un canvas restano invariati.
