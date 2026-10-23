# Playground

## Scopo

Far provare un pezzo di prodotto senza scrivere il CRM e senza incassare. Quattro demo storiche più Vision Lab e voce.

## File

- Route catch-all: `apps/web/app/routes/public/explore-demos.tsx` per `/explore/commerce`, `/explore/workflow`, `/explore/creative`, `/explore/vision` se ci si arriva dal catch-all.
- Route dedicate, prima del catch-all: `routes/playground-vision.tsx` (`/explore/vision`), `routes/playground-voice.tsx` (`/explore/voice`).
- `apps/web/app/components/vision/{VisionLab,hand,ObjectStage}.tsx`.
- `apps/web/app/components/voice/{VoiceDemo,commands}.ts(x)`.
- `apps/web/app/styles/playground.css`.
- Stazioni del percorso: `components/public/explore/stations.ts`.
- Policy camera: `apps/web/workers/app.ts`.
- Showcase (SPEC-25, 2026-10-22): `apps/web/app/components/showcase/` con `BancoVoce`, `PrimaDopo`, `Binario`, `Vetrina`, `TiPuoServire` (+ `Stato`), `logica.ts` (parte pura: testi, passi, chiusure, coppia di immagini), `creativo.ts` (messaggio e formati condivisi), `showcase.css`. Si importa da `components/showcase/index.ts`: la home (SPEC-26) usa lo stesso indice.
- Scene di `/explore`: `components/public/explore/{Scena,ScenaCreate,ScenaVision}.tsx`, `scene.css`; la stazione ha il campo `scena` in `stations.ts`.

## API

Nessuna API di playground. Il carrello di commerce è stato di pagina. La simulazione workflow non chiama `/api/workflows`.

## Dati

Nessuna tabella. Vision non registra frame in D1 né in R2.

## Test

`tests/e2e/public.spec.ts`: commerce cambia variante e totale in pagina; workflow mostra «Nessun dato viene scritto nel CRM reale»; vision parte con «Videocamera spenta» e lo slider arriva a `rotateY(120deg)`. `tests/e2e/showcase.spec.ts` (SPEC-25): un test per primitivo, la scena voce nel primo schermo a 390px, reduced motion, nessuna chiamata a servizi a pagamento. `tests/showcase.test.ts` (vitest): la logica pura. `tests/e2e/playground.spec.ts` (SPEC-12) copre frecce, assenza di `getUserMedia` prima del click, comandi di testo, reduced motion. Quello spec non è stato eseguito nel lavoro SPEC-12. `tsc` dell'app intera, in quel lavoro, non è partito: mancavano i tipi Cloudflare nel nodo locale.

## Stato

Parziale, 2026-10-22.

- Commerce e workflow demo: coperti dagli e2e già nel repo. Nessun pagamento.
- Vision: codice con controlli manuali, pinch, palmo, pugno, un canvas R3F caricato dopo l'effetto client. Webcam reale non provata. Non dire che i gesti funzionano su un computer.
- Voce: Web Speech e un campo testo con gli stessi intenti. `microphone=()` su ogni path, incluso `/explore/voice`, quindi il pulsante del microfono si disabilita se la policy è letta. Testo e sintesi restano. Nessun provider vocale a pagamento.

- Showcase, 2026-10-22: quattro primitivi + `TiPuoServire`. Ognuno dichiara SIMULATA o OPERATIVA (`<Stato>`). `Commerce`, `WorkflowDemo` e `CreativeDemo` di `explore-demos.tsx` ora montano `Vetrina`, `Binario`, `PrimaDopo`: nessuna copia del carrello o dei sei passi.
- BancoVoce: la voce è quella del browser (Web Speech). Il browser NON espone l'audio della propria voce, quindi un AnalyserNode non può leggerla. La waveform vera è quella del segnale di avvio (due note generate con WebAudio, lette dall'AnalyserNode); durante la voce si vede l'inviluppo delle parole (eventi `boundary`), non una registrazione. Lo dice la pagina. Il microfono non serve: `Permissions-Policy` lo chiude comunque.
- PrimaDopo: coppia `reel-01` / `reel-08` (bottega) da `content/media.ts`; senza i due file non si monta. Maniglia = `input type=range` nativo.
- `/explore`: la stazione `voice` è la prima (controllo nel primo schermo a 390px); 10 stazioni, non 9. Forma d'onda in SVG, non canvas: i test dell'explore vietano più di un canvas.

## Decisioni

La demo è lo spettacolo: niente effetto decorativo sopra (`REGIA-MOTION.md`). Companion desktop per controllare il Mac: fuori, è un altro prodotto (`MANDATO-UPGRADE.md` §1). Gesti solo dentro il laboratorio.

## Trappole

- Allargare `camera=(self)` o `microphone=(self)` a tutto il sito cambia una policy di sicurezza. Il microfono è aperto solo su `/explore/voice` (`microphone=(self)`, dal 22/10, SPEC-17b) e la camera solo su `/explore/vision`; il resto resta chiuso (`app/server/permissions.ts`). Quel file è il Worker, spesso di un altro proprietario.
- `getUserMedia` e `recognition.start()` stanno dietro un click. Non spostarli nel render.
- MediaPipe è un `import()` dentro `start()`. Un import in cima manda il modello a ogni visita.
- `/explore/vision` compare sia nel catch-all (`public.tsx` loader) sia come route dedicata. La dedicata vince perché sta prima in `routes.ts`.

## Chi lo possiede ora

SPEC-12 ha scritto Vision e voce il 22/10. Le demo commerce, workflow e creative seguono chi ha `routes/public.tsx` (SPEC-02) e explore (SPEC-05).

## Sette laboratori — 2026-10-22 sera

Aggiunti `/explore/avatar` e `/explore/software` nel catch-all e nelle stazioni. `routes/public/product-labs.tsx`: Avatar prepara script, lingua predefinita, direzione e storyboard; dichiara video/lip-sync non integrati. Software offre CRM a colonne con modifica stato e prenotazione simulata, solo memoria locale. Nessun provider o CRM produttivo invocato. Home collega tutti i sette lab. Test `realignment.spec.ts` copre storyboard e mini prodotti. Vision e voce esistenti preservati.

Avatar include ascolto dello script con SpeechSynthesis, scelta fra voci disponibili per lingua e arresto audio; cancella playback all'uscita. Ritratto originale fisso dichiarato concept. Nessun microfono o video generativo. I servizi vocali dipendono dal browser/dispositivo.

## Lab → etichetta → limiti

Etichette (`LabStatus`: REALE | SIMULATA | PARZIALE | RAPPRESENTATIVA) allineate a questo documento, non a ipotesi. Badge visibile vicino al titolo su avatar, software, vision, voice.

| Lab | Etichetta | Limiti |
| --- | --- | --- |
| Avatar (`/explore/avatar`) | RAPPRESENTATIVA | Nessun avatar video, nessun lip-sync, nessuna clonazione vocale. Ritratto concept fisso; storyboard simulato; TTS solo voci del browser. |
| Voice (`/explore/voice`) | PARZIALE | Nessun provider vocale a pagamento; microfono solo su richiesta. Testo e sintesi restano; waveform non è registrazione dell'audio del browser. |
| Vision (`/explore/vision`) | PARZIALE | Frame non salvati (né D1 né R2); gesti non garantiti su ogni computer; webcam reale non assunta. Controlli manuali sì. |
| Agent Workflow (`/explore/workflow`) | SIMULATA | Nessuna scrittura sul CRM reale; non chiama `/api/workflows`. |
| Commerce (`/explore/commerce`) | SIMULATA | Carrello di pagina; nessun pagamento. |
| Creative AI (`/explore/creative`) | SIMULATA | Showcase/primitivi in pagina; nessun job media né provider creativo live. |
| Software (`/explore/software`) | SIMULATA | CRM e prenotazioni solo in memoria di pagina; nessun CRM produttivo. |
