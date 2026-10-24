# Email design — bozza HTML

Renderer puro in `packages/email/render.ts`. Produce HTML per anteprima ed export. Non invia, non parla con un provider, non legge un database e non aggiunge tracciamento.

Il caller server `email-drafts.ts` fornisce il testo semplice accanto all’HTML. `renderEmail` non costruisce un MIME multipart.

Scegliere `studio`, `update` o `proposal` cambia solo la cornice visiva. Non collega il messaggio a un record, a un invio o a un prezzo.

## Contratto

```ts
export type EmailInput = {
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

export function renderEmail(
  input: EmailInput,
  layout: 'studio' | 'update' | 'proposal' = 'studio',
): string;
```

`starterCopy` è un array di tre oggetti: `id`, `name`, più i campi di `EmailInput`.

| id | name | layout suggerito |
| --- | --- | --- |
| `benvenuto` | Benvenuto | `studio` |
| `aggiornamento-progetto` | Aggiornamento progetto | `update` |
| `presentazione-proposta` | Presentazione proposta | `proposal` |

Il layout suggerito non è applicato da solo. Il caller passa il secondo argomento.

I tre testi sono in italiano, dichiarativi, senza prezzi e senza un cliente reale. I link di partenza puntano a `https://omni101.app/`. Si sostituiscono con un altro URL https prima dell’uso.

## Output

Documento HTML completo.

- `<!DOCTYPE html>`, lingua `it`.
- CSP: `default-src 'none'`. In più `style-src 'unsafe-inline'`, così gli stili inline e l’unica media query possono dipingere. Nessun `script-src`. Nessuna immagine, font remoto, iframe o foglio esterno.
- Tabelle `role="presentation"`, `cellpadding="0"`, `cellspacing="0"`, `border="0"`.
- Larghezza fluida `width="100%"` con `max-width:600px`. Un commento condizionale MSO fissa 600px. È markup pratico: Outlook non è stato testato e non è dichiarato compatibile.
- Sotto i 600px, una regola in `<style>` riduce il padding. Il resto è inline.
- Font di sistema. I woff2 Satoshi e i TTF Instrument Serif restano sul sito: in email sarebbero risorse esterne.
- Colori del brand: grafite `#101112`, surface `#191a1c`, ivory `#f2eee6`, champagne `#d2b77b`, secondario `#b0ada6`, filetto `#353535`. Il pulsante è testo `#101112` su fondo `#d2b77b`.
- Preheader nascosto, poi il corpo. I paragrafi del `body` si separano su una riga vuota. L’a capo singolo diventa `<br>`.
- Un solo link: la CTA. CTA facoltativa: etichetta e URL entrambi vuoti omettono il pulsante; una coppia incompleta viene rifiutata.

Header visibile: «Bozza · Digital Possibility Studio» e il nome del layout (Studio, Aggiornamento, Proposta). Footer: «Bozza non inviata · Digital Possibility Studio» Nessun link di disiscrizione. Nessun badge di consegna.

## Sicurezza degli input

Ogni stringa è trattata come non fidata. `subject`, `preheader`, `body`, etichetta e URL sono escapati (`&`, `<`, `>`, `"`, `'`). Il layout accetta solo i tre valori. Non esiste un campo HTML libero e non esiste un flag per saltare i controlli.

Errori, tutti `Error`:

| Condizione | Messaggio |
| --- | --- |
| `layout` diverso dai tre valori | `Layout non valido.` |
| un campo non è una stringa | `Campo testuale non valido: ` + nome |
| solo uno fra etichetta e URL vuoto, dopo il trim | `Etichetta e URL della CTA sono obbligatori.` |
| URL non analizzabile, o con caratteri di controllo | `URL della CTA non valido.` |
| schema diverso da `https`, oppure username o password nell’URL | `URL della CTA: solo https, senza credenziali.` |

L’`href` scritto è `URL.href` normalizzato, poi escapato. Il renderer non aggiunge parametri.

## Cosa non fa

Non crea l’invio, non calcola un prezzo, non legge segreti, non apre socket. Il testo semplice, l’API e il salvataggio della bozza restano al caller server.

## Integrazione locale 24 ottobre 2026

Preview e download delle bozze salvate usano questo renderer. `GET /api/email-drafts/:id/preview?layout=studio|update|proposal` e `GET /api/email-drafts/:id/export?format=html|text&layout=...` validano lo stesso enum; default Studio. Il testo semplice resta indipendente dal layout. Un valore sconosciuto restituisce 400, dopo autorizzazione e caricamento tenant della bozza.

Il selettore nella UI vale per anteprima ed export nella sessione: non è persistito, non modifica la versione e non entra nell’approvazione del testo. I tre pulsanti starter avviano una nuova bozza nel modulo, con conferma se esiste testo locale non salvato. Solo i campi esistenti sono salvati; nessuna migrazione.

Compatibilità con bozze esistenti prive di CTA preservata. URL https ricontrollato anche nel renderer, con rifiuto di credenziali e controlli prima della normalizzazione. Nessun provider, destinatario, invio o pixel aggiunto. Versioni/CAS, ruoli, tenant e revisione restano nei flussi esistenti.

Revisione statica effettuata. Test Vitest aggiunti per escaping, CSP, HTTPS, tre varianti, CTA facoltativa, parità preview/export e layout sconosciuto; suite e build non eseguite localmente per il limite disco. Verifica CI necessaria prima del rilascio; nessuna compatibilità visuale client email dichiarata.
