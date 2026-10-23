# Esito: scelta motore email — email-foundation

Contesto: app su Cloudflare Workers + D1, nessun servizio a pagamento attivato, invii solo con consenso, tracking/pixel DISATTIVATI di default (scadenza Garante 29 ottobre 2026). Ricerca su fonti pubbliche, niente install, niente account.

## 1) React Email (resend/react-email)
- Licenza: MIT (repo: github.com/resend/react-email)
- Tipo: libreria template email React (render HTML), non invia di suo
- Cloudflare Workers: compatibile (render lato server; esempio ufficiale resend-cloudflare-workers-example)
- Costi zero: sì, libreria OSS
- Consenso/disiscrizione: no nativo, va gestito dall'app su D1
- Tracking: non esiste (solo HTML), quindi pixel disattivati di default
- Maturità: attiva, react-email v6.9.1 su npm (ultima pubblicazione ~7 giorni fa)
- Fonte: https://github.com/resend/react-email
- Verdetto: USARE come libreria

## 2) Plunk (useplunk/plunk)
- Licenza: AGPL-3.0 (useplunk.com/open-source-email-platform FAQ)
- Tipo: piattaforma self-host (Docker: API + dashboard + SMTP)
- Cloudflare Workers: indiretto via API HTTP, non nativo
- Costi zero: sì self-host; cloud gestito $0,001/email
- Consenso/disiscrizione: funzioni di piattaforma, da verificare nel dettaglio
- Tracking: open/click presenti, disattivabili da verificare
- Maturità: v0.7.1, 10 marzo 2026
- Fonte: https://github.com/useplunk/plunk
- Verdetto: DA VALUTARE (solo se serve piattaforma self-host completa; AGPL da controfirmare)

## 3) Dittofeed (dittofeed/dittofeed)
- Licenza: MIT (docs.dittofeed.com/guide/license)
- Tipo: piattaforma engagement omnicanale self-host (TypeScript/React)
- Cloudflare Workers: indiretto via API HTTP
- Costi zero: sì self-host; cloud futuro a pagamento
- Consenso/disiscrizione: funzioni di piattaforma
- Tracking: da verificare
- Maturità: repo attivo (sdk-web aggiornato 3 agosto 2025)
- Fonte: https://github.com/dittofeed/dittofeed
- Verdetto: DA VALUTARE

## 4) Mautic (mautic/mautic)
- Licenza: GPL-3.0
- Tipo: self-host PHP + MySQL
- Cloudflare Workers: NO (PHP, non gira su Workers/D1)
- Costi zero: sì self-host, ma richiede server proprio
- Consenso/disiscrizione: sì (marketing automation)
- Tracking: pixel inclusi, disattivabili
- Maturità: 7.2.1 (2026), attivo
- Fonte: https://github.com/mautic/mautic
- Verdetto: NO (incompatibile Workers; troppo pesante)

## Alternative recenti (max 2)
- Resend (resend.com): servizio SaaS proprietario, API ufficiale per Cloudflare Workers, free tier poi pagamento, tracking/unsubscribe configurabili. Non self-host. Verdetto: DA VALUTARE solo come provider di invio esterno; viola "nessun servizio a pagamento attivato" oltre la free tier. Fonte: https://resend.com/docs/send-with-cloudflare-workers
- Novu (novu.co): piattaforma notifiche open source self-host (Docker/K8s), MIT, API HTTP quindi Workers-compatibile. Verdetto: DA VALUTARE. Fonte: https://github.com/novuhq/novu (licenza da riconfermare sul repo)

## Raccomandazione finale (Ponytail: la cosa più piccola che funziona)
1. Usa React Email come libreria di template (MIT, zero cost, nessun tracking, Workers-compatibile).
2. Invia tramite un provider già esistente (SMTP o API Resend già in uso) dal Worker: niente nuovi account, niente servizi a pagamento attivati.
3. Gestisci consenso e disiscrizione in app su D1 (tabella contatti con opt-in/opt-out).
4. Nessun pixel di tracking nelle email: rispetta la scadenza Garante del 29 ottobre 2026.
5. Plunk/Dittofeed da rivalutare solo se serve in futuro una piattaforma self-host completa; Mautic escluso.
