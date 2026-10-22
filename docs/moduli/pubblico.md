# Pubblico

## Scopo

Far capire cosa fa lo studio e portare a un brief. Pagine: home, soluzioni, lavori, studio, insights, contatto, avvio progetto, login, privacy e termini. Le demo stanno nel modulo playground.

## File

- Rotte: `apps/web/app/routes.ts`, `routes/home.tsx` (ri-esporta il catch-all), `routes/public.tsx`, `routes/explore.tsx`, `routes/solutions.tsx`, `routes/public/{home,work,studio,start,contact,insights,legal,explore-demos}.tsx`.
- Shell: `apps/web/app/components/public/shell/{PublicLayout,Header,Footer,PageHero,RevealTitle,site-data}.tsx`; CSS della grammatica in `styles/public-grammar.css`.
- Catalogo: `apps/web/app/content/capabilities.ts`, `components/public/capabilities/{panels,panelMedia,SolutionsView,CapabilityCarousel,DealWheel,FamilyPanel,FamilyTabs,SegmentGrid,segments,CapabilityCatalog,PublicShell}.ts(x)`.
- Explore: `components/public/explore/{ExplorePath,ExploreScene,stations}.tsx`.
- Motion ancora montata: `ReelOrbit`, `CinematicExperience`, `CinematicScene`, `SpatialGallery`, `SpatialGalleryScene`, `PublicTransition`, `Process`, `PortalCanvas` (solo `/studio`), `PortalNarrative`, `Visual`, `Filters`.
- Stile: `apps/web/app/styles/public.css` e i CSS cinematic, reel, spatial, explore, capabilities, portal-narrative, public-transition.
- Copy legale: `routes/public/legal.tsx`.

`public.tsx` `loader` risponde 404 se il path non è nell'elenco e non matcha un servizio, una demo `commerce|workflow|creative|vision`, un progetto o un articolo. `/explore` e `/solutions` non passano da quel loader: hanno route proprie. `/explore/voice` è una route dedicata e non è nell'elenco del loader.

## API

Nessuna scrittura dalle pagine, salvo il form che posta `/api/intake` (modulo assistente e sicurezza) e `GET /api/public-config` per la site key Turnstile. Meta OG e canonical sono nelle `meta()` delle route. Il canonical è sempre `https://omni101.app` + path, anche se la pagina è servita da preview.

## Dati

Testi e sei concept in `site-data.ts`. 75 capacità in `capabilities.ts`. Non sono righe D1. Vedi `docs/dati.md` per `services`, `portfolio_items`, `content_entries`: esistono, il pubblico non le renderizza.

## Test

`tests/e2e/public.spec.ts` (home, rotte, commerce, workflow simulato, API private 401, reduced motion, vision manuale, brief assistente). `tests/e2e/explore-solutions.spec.ts`. `tests/e2e/motion-gallery.spec.ts`. L'ultima CI citata come verde è la `39772792713`. La run `39775631432` ha fallito il test di transizione (`ESITO-01-GAP.md`): su desktop `data-phase` restava `running`.

## Stato

Parziale, 2026-10-22. Le route e il catalogo ci sono. La home è quella della regia v2 (SPEC-26, vedi sotto). Gli screenshot di critica (`ESITO-08-CRITICA.md`) sul preview del pomeriggio contavano zero immagini e zero video sulle pagine misurate, e un atlas PNG: da allora le immagini per pubblico sono in `content/media.ts`.

## Decisioni

Vedi `docs/decisioni.md`: due grammatiche, catalogo con disponibilità, canonical di produzione, niente clienti inventati.

## Trappole

- Aggiungere una route pubblica nel catch-all senza aggiornare `loader` in `public.tsx` produce 404. Le route dedicate vanno in `routes.ts` prima di `route('*')`.
- `PortalNarrative.tsx` esiste ancora ma la home non lo monta più; `Process` è usato solo da `/studio`. Non rimontarli in home né su una seconda pagina.
- Il form di `/start-project` e `/contact` non va animato.
- `src/pages/*.astro` non è questo sito.

## Home e grammatica comune (SPEC-26, 2026-10-22)

- **Home** (`routes/public/home.tsx`): `ReelOrbit` (hero) → `CinematicExperience` con quattro tappe da `HomeShowcase.tsx` → quattro porte (`/solutions`, `/work`, `/explore`, `/start-project`). Fuori dalla home: `SpatialGallery`, `PortalCanvas`, `PortalNarrative`, `Services`, il secondo `Process`. Il `CTA` del layout non compare su `/` (l'ultima porta è già il brief).
- **Anello** (`components/public/ReelOrbit.tsx`, geometria pura in `reel-ring.ts`, test `tests/reel-ring.test.ts`): il loader è la stessa scena. `formation` distribuisce le 12 card da un mazzo a un anello piccolo visto dall'alto; `expansion` lo apre nel carosello. Il contatore legge le copertine vicine alla camera già arrivate (`loadProgress`); l'apertura aspetta il deal e le copertine, al massimo 6 s. Saltabile con Esc, Tab, pulsante «Salta intro», o un tocco sulla scena. L'intro gira una volta per sessione (`sessionStorage` `omni:reel-seen`). Reduced motion e senza script: nessun loader, griglia di link. Card: immagini da `media.reel`, altrimenti `Visual`.
- **Capitolo cinematico**: `CinematicExperience` accetta `stages` (id, titolo, link, `demo`). Le demo (`BancoVoce`, `PrimaDopo`, `Binario` a 3 nodi, `Vetrina` ritaglio) sono DOM sopra la parete, caricate in lazy quando la tappa è corrente. PrimaDopo c'è solo se `coppiaMedia('bottega')` ha le due immagini. Un solo canvas (la parete), come prima.
- **Grammatica**: `PublicTransition` unica; `RevealTitle` (titoli per righe con maschera; un `h1` non si nasconde mai al primo caricamento, per l'LCP, e sale solo dopo una navigazione interna); testo `.scroll-reveal` con fade e 8 px, una volta; `Header` con menu a pannello che si apre dal centro e si richiude con la propria curva (idea Codrops EaseReverseClipMenu, MIT, attribuzione in `public/THIRD-PARTY-NOTICES.txt`); hover immagini `.img-hover` zoom 1.03 e velatura. `ImageExpansionTypography` (Codrops, MIT) esiste ma NON è in home: è per l'hero di `/work/:slug`.
- **Non fatto da me**: `capabilities/PublicShell.tsx` (usato da `/solutions` e `/explore`) ha ancora un proprio Header con Radix e non importa `shell/Header`: finché non lo fa, quelle due route hanno il menu vecchio. Va cambiato dal proprietario di quel file (una riga: `import {Header} from '../shell/Header'`).

## /work, /studio, 404 (SPEC-18, 2026-10-22)

- `/work`: `SpatialGallery` (unica galleria di profondità, solo qui) come indice, legenda dei tre tipi (`WorkMedia.tsx`: `KINDS`, `kindOf`; nessun progetto reale dichiarato, il conteggio è «—») e griglia. Clic su una card = `WorkPreview.tsx` (Radix Dialog) con FLIP della miniatura (`flipRect.ts`); «Apri il caso» passa il box del riquadro a `WorkCase`, il cui hero (ora in cima alla pagina) parte da lì e attende `omni:public-transition-end`. Reduced motion: le card sono link semplici. Immagini da `content/media.ts` (`media.work[i]`) se presenti, altrimenti `Visual`.
- `/work/:slug`: arrivo col FLIP, poi solo grammatica comune. Nessun `Process`.
- `/studio`: `StudioPortal.tsx` + `PortalCanvas.tsx` (R3F), un canvas; sei stati (idle, explore, build, automate, create, grow) legati ai sei principi via IntersectionObserver su stage CSS sticky (niente pin). Fallback statico = anelli CSS (`.sp-fallback`), stesso vocabolario di stati; con reduced motion niente canvas e stato `grow`. Lenis (`lenis`, import dinamico in `routes/public/studio.tsx`) solo su questa route, spento con reduced motion e con dialog aperti.
- 404: `NotFound.tsx` renderizzato da `ErrorBoundary` di `root.tsx` (solo 404; gli altri errori restano com'erano). Cilindro di testo 3D CSS che ruota con lo scroll nativo (`--nf-rot` sul track), link utili in `nav[aria-label="Pagine utili"]`.
- Stile: `styles/work-studio.css`, `styles/not-found.css`. Test: `tests/e2e/work-studio.spec.ts`.
- Trappole: `WorkCase` misura l'hero solo a transizione finita (il layer entrante è trasformato mentre gira). `PortalCanvas` va montato solo da `StudioPortal` (slot WebGL `studio:portal`). Prima versione scritta senza poter eseguire tsc né Playwright in locale (disco): fa fede la CI.

## /solutions (SPEC-17 e SPEC-17b, 2026-10-22)

- `/solutions`: `SolutionsView` → `CapabilityCarousel` → `DealWheel`. Un mazzo si apre dal centro e si alza in una ruota, una carta per famiglia (ricetta «deal» di REGIA-v2, reimplementata: nessun codice Avi). CSS 3D, niente WebGL. Dieci slot a 36° su un cerchio intero (ogni famiglia due volte, a 180°), perno sotto lo stage: se ne vedono cinque. Due valori guidano tutto, `deal` e `lift` (timeline GSAP su un oggetto, un solo ciclo `requestAnimationFrame` che si spegne da fermo); la ruota si ferma sempre su una famiglia intera. La carta in cima ha `data-top="true"`, l'attributo `data-phase` di `.deal` va `deal` → `lift` → `idle`.
- Comandi: tab (frecce, Home, End), trascinamento e swipe orizzontali, rotella solo se orizzontale, click su una carta (la porta in cima; sulla carta in cima apre `/solutions/<famiglia>`). Esc, o un tocco durante l'ingresso, lo chiude subito. L'ingresso parte quando lo stage è visibile per un quarto. Le carte sono `aria-hidden` e senza link: l'accesso passa dai tab e dalla didascalia sotto la ruota (`FamilyDetail`).
- Senza ruota: reduced motion, larghezza <761px o altezza <700px mostrano le cinque famiglie come pannelli fermi impilati (`Panel`). Stesso stato su `/solutions/:family`, ma con la sola famiglia scelta.
- `/solutions/:family`: nessun effetto. Pannello fermo, `SegmentGrid` (segmenti di PUBBLICO.md da `segments.ts`: chi, problema, cosa cambia, capacità della famiglia, UNA demo, CTA brief), catalogo filtrato. La demo di ogni segmento è il primitivo di `components/showcase` (SPEC-25), montato nella card solo quando il visitatore preme «Provala qui» (niente microfono né lavoro prima), più un link alla pagina intera del Playground: `BancoVoce` (sanitario), `Binario` a 3 nodi (ristoranti, B&B, studi, immobiliari, laboratori con campo di testo), `Vetrina` in ritaglio (botteghe, prodotto digitale). `Formati` (palestre, formazione) non ha primitivo: è il link a `/explore/creative`. Ogni primitivo dichiara il proprio stato SIMULATA/OPERATIVA e la card spegne la sua riga di chiusura (`chiusura={false}`).
- Immagini: `familyImage()` legge `app/content/media.ts` chiave `solutions`; finché manca, ritagli dell'atlas `/media/omni-cinematic-atlas.png`.
- Trappole: l'`opacity` su una carta 3D appiattisce `backface-visibility` (il dorso si vedrebbe): il velo di profondità è un livello scuro dentro la faccia, non l'opacità della carta. Il puntatore si cattura solo a trascinamento iniziato, altrimenti il click non raggiunge la carta. Il contrasto 3,79:1 dei numeri dei tab è `public.css` (home, SPEC-26), non di questi file.
- Test: `tests/e2e/explore-solutions.spec.ts` (ruota: fase `idle`, dieci carte, 3–6 visibili, tab, trascinamento, click; reduced motion: cinque pannelli; famiglie: segmenti con una demo ciascuno e nessuna ruota).

## Chi lo possiede ora

SPEC-02, SPEC-02b, SPEC-05, SPEC-17, SPEC-18, SPEC-11, SPEC-22 nel run `run_9fb3449e1717`. Mappa in `esiti/omni101-codex-ripresa/MAPPA-MANDATO.md`. Chi modifica una pagina aggiorna questo file.

## Riallineamento del mandato — 2026-10-22 sera

Home estesa senza rimuovere ReelOrbit o il capitolo: apertura → possibilità → quattro famiglie → SEE/SPEAK/CREATE/ACT → demo cinematiche → sette lab → concept dichiarati → processo → conversione. Immagine proof dal manifest, lazy. Nessun secondo canvas. `themes.css` imposta pubblico avorio per default; il capitolo cinematico conserva palette scura locale. `ThemeToggle.tsx` salva preferenze separate `omni:theme:public` e `omni:theme:workspace`; bootstrap prima del body, sincronizzazione al cambio route. Header condiviso anche da Explore/Solutions (rimosso duplicato). Verifica richiesta in `tests/e2e/realignment.spec.ts`; non dichiarare online prima di CI verde.
