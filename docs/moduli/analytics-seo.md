# SEO, SEM, GEO e fiducia

23 ottobre 2026. Online nella revisione 3fa90a5, run 39889662855 verde: test server, browser e canary cloud. Canonical/JSON-LD/robots confermati anche sul dominio principale.

## SEO e GEO

`app/content/seo.ts` centralizza pagine pubbliche reali, meta/canonical/OG e JSON-LD derivato dai contenuti visibili: Organization come brand, WebSite, WebPage, Article, CreativeWork per i concept, Service e breadcrumb. Nessun cliente, recensione, risultato o identità legale inventati. JSON serializzato con escape di `<`.

`server/public-seo.ts` genera sitemap anche per casi/articoli/lab, robots e favicon SVG. Redirect 308 solo degli alias pubblici conosciuti. Worker applica X-Robots-Tag noindex su staging, pagine private ed errori. La canonical punta al dominio principale. Non introdurre hreflang senza traduzioni reali.

GEO significa qui contenuti SSR chiari, fonti e descrizioni verificabili per motori generativi. Non promette citazioni, ranking o presenza nelle risposte. Local SEO è una categoria operativa distinta, senza sedi o schede locali inventate.

## Workspace marketing

`/admin/growth`: iniziative reali, stato canali dichiarato, UTM builder locale (solo HTTPS, niente credenziali/query riservate), registro esclusioni, verifica destinatario e bozze email. `/admin/growth-plans` distingue SEO, SEM, GEO, LOCAL_SEO, PRIVACY e altri piani. Campagne sono registri di pianificazione: nessun account Ads collegato, nessuna spesa, nessuna pubblicazione, nessun ROAS/CPA inventato. Analytics riusa ancora i dati gestionali; non è analytics di traffico.

## Bozze email

Migrazione `0013_email_drafts.sql`, `server/email-drafts.ts`, pannello `EmailDraftWorkspace` dentro `/admin/growth`. Ruoli come il marketing: Owner, Admin, Project Manager, Sales. Campi: oggetto, preheader, testo, CTA solo https, campagna facoltativa dello stesso tenant. La versione è ottimistica: un conflitto risponde 409 e il modulo tiene il testo locale. Il salvataggio resta `DRAFT`. «Chiedi revisione» apre una riga `approvals` in `PENDING` e porta la bozza a `IN_REVIEW`. `APPROVED` arriva solo da `POST /api/approvals/:id/decision`. Un rifiuto riporta la bozza a `DRAFT` e lascia la decisione `REJECTED`. Anteprima in iframe `sandbox` ed export HTML/testo escapati, senza script, immagini remote o pixel. `provider` è null e `sendingEnabled` è false. Nessun destinatario, SMTP o account.

## Controlli privacy tecnici

Migrazione 0008: esclusioni marketing pseudonimizzate e isolate per organizzazione; evidenze di consenso con UUID idempotente e audit; ritiro aggiunge un blocco. Un nuovo consenso documentato non rimuove il blocco. `canSend` resta false, nessun canale collegato. Il modulo registra una prova già acquisita: non acquisisce consenso dall'interessato.

Registro `/admin/privacy-requests`, solo Owner/Admin: richieste diritti, stato, responsabile e scadenza da verificare. Chiusura richiede una descrizione dell'intervento. Nessuna esportazione/cancellazione automatica o termine legale inventato. Il registro contiene email dell'interessato, quindi accesso ristretto. Hash delle esclusioni = pseudonimizzazione, non anonimizzazione.

Identità del titolare, P.IVA, contatti, fornitori/DPA, trasferimenti, retention e procedura di verifica identità richiedono dati verificati. Questi controlli non certificano conformità GDPR. Nessun tracker opzionale acceso e nessun banner finto. Testi pubblici da riallineare ai trattamenti effettivi prima dell'attivazione dei canali.

## Verifica

`tests/seo.test.ts`, `tests/growth-tools.test.ts`, `tests/email-drafts.test.ts`, integrazioni marketing/privacy in `tests/integration.test.ts`. Aggiungere prova browser autenticata e verifica live dopo CI. Niente claim di pubblicazione prima della revisione confermata dall'health.

Verifica conclusa: 0008 applicata in staging e produzione; 102 test server e 103 browser complessivi passati. Nessuna campagna o invio attivato. Testo privacy pubblico aggiornato ai trattamenti reali di OMNI ASSIST (NVIDIA), passkey e R2 assente; dati legali e policy da completare restano dichiarati.

Revenue operativo dal rilascio f53fe2c / run 39950784094: riusa campagne e date originali, associazioni CRM ed eventi operativi manuali v1. Questo non abilita tracking di traffico, invii, social o account Ads. Canali esplicitamente NOT_CONNECTED, nessun READY_FOR_CONNECTION prematuro.
