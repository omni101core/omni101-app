export type EmailInput = {
  subject: string;
  preheader: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type EmailLayout = 'studio' | 'update' | 'proposal';

type Starter = EmailInput & {id: string; name: string};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const CHROME: Record<EmailLayout, {kicker: string; frame: string; border: string}> = {
  studio: {
    kicker: 'Studio',
    frame: 'Messaggio dello studio, in bozza.',
    border: 'border:1px solid #353535;border-top:4px solid #d2b77b;',
  },
  update: {
    kicker: 'Aggiornamento',
    frame: 'Aggiornamento di lavoro, in bozza.',
    border: 'border:1px solid #353535;border-left:4px solid #d2b77b;',
  },
  proposal: {
    kicker: 'Proposta',
    frame: 'Presentazione in bozza. Non è un preventivo e non contiene un prezzo.',
    border: 'border:1px solid #d2b77b;',
  },
};

export const starterCopy: readonly Starter[] = [
  {
    id: 'benvenuto',
    name: 'Benvenuto',
    subject: 'Benvenuto nello studio',
    preheader: 'Digital Possibility Studio. Una bozza di benvenuto, non un incarico.',
    body: 'La tua idea. Oltre il software.\n\nDigital Possibility Studio progetta e realizza applicazioni, sistemi intelligenti ed esperienze creative. Dall’idea al prodotto che funziona.\n\nQuesta bozza non descrive un incarico reale e non promette un esito economico.',
    ctaLabel: 'Apri lo studio',
    ctaUrl: 'https://omni101.app/',
  },
  {
    id: 'aggiornamento-progetto',
    name: 'Aggiornamento progetto',
    subject: 'Aggiornamento sul lavoro',
    preheader: 'Dove siamo in questa bozza. Nessuna data garantita.',
    body: 'La traccia di lavoro è aperta.\n\nIl passo successivo è leggerla insieme allo studio.\n\nIn questa bozza non ci sono scadenze fissate. Nessun cliente reale è citato e nessun messaggio è partito.',
    ctaLabel: 'Vedi la traccia',
    ctaUrl: 'https://omni101.app/',
  },
  {
    id: 'presentazione-proposta',
    name: 'Presentazione proposta',
    subject: 'Una proposta, in bozza',
    preheader: 'Perimetro e prossimo passo. Nessun prezzo in questa email.',
    body: 'Questa presentazione descrive un modo di lavorare.\n\nIl perimetro si chiude prima dei numeri. Qui non c’è un prezzo.\n\nLa bozza non è un impegno e non è un’offerta inviata.',
    ctaLabel: 'Parla con lo studio',
    ctaUrl: 'https://omni101.app/',
  },
];

function fail(message: string): never {
  throw new Error(message);
}

function asText(value: unknown, field: string): string {
  if (typeof value !== 'string') fail('Campo testuale non valido: ' + field);
  return value;
}

function esc(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function httpsCta(label: string, url: string): {label: string; href: string} | null {
  const text = label.trim();
  const raw = url.trim();
  if (/[\u0000-\u001F\u007F]/.test(url)) fail('URL della CTA non valido.');
  if (!text && !raw) return null;
  if (!text || !raw) fail('Etichetta e URL della CTA sono obbligatori.');
  if (/[\u0000-\u001F\u007F]/.test(raw) || /[\u0000-\u001F\u007F]/.test(text)) {
    fail('URL della CTA non valido.');
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    fail('URL della CTA non valido.');
  }
  if (parsed.protocol !== 'https:' || parsed.username !== '' || parsed.password !== '') {
    fail('URL della CTA: solo https, senza credenziali.');
  }
  return {label: text, href: parsed.href};
}

function paragraphs(body: string): string {
  const blocks = body.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split(/\n{2,}/);
  const html: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const kept = lines.map(esc).join('<br>');
    if (!kept.trim()) continue;
    html.push(
      '<p style="margin:0 0 16px;font-family:' +
        FONT +
        ';font-size:16px;line-height:1.5;color:#f2eee6;">' +
        kept +
        '</p>',
    );
  }
  return html.join('\n');
}

export function renderEmail(input: EmailInput, layout: EmailLayout = 'studio'): string {
  if (layout !== 'studio' && layout !== 'update' && layout !== 'proposal') fail('Layout non valido.');
  const subject = asText(input.subject, 'subject');
  const preheader = asText(input.preheader, 'preheader');
  const body = asText(input.body, 'body');
  const cta = httpsCta(asText(input.ctaLabel, 'ctaLabel'), asText(input.ctaUrl, 'ctaUrl'));
  const chrome = CHROME[layout];
  const pad = 'padding:28px 32px;';
  return [
    '<!DOCTYPE html>',
    '<html lang="it">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="color-scheme" content="dark">',
    '<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;">',
    '<title>' + esc(subject) + '</title>',
    '<style>',
    '@media only screen and (max-width:600px){',
    '.omni-card{width:100%!important;}',
    '.omni-pad{padding:20px 16px!important;}',
    '}',
    '</style>',
    '</head>',
    '<body style="margin:0;padding:0;background:#101112;color:#f2eee6;">',
    '<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">' +
      esc(preheader) +
      '&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#101112;margin:0;padding:0;">',
    '<tr>',
    '<td align="center" style="padding:24px 12px;">',
    '<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->',
    '<table role="presentation" class="omni-card" data-layout="' +
      layout +
      '" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#191a1c;' +
      chrome.border +
      '">',
    '<tr>',
    '<td class="omni-pad" style="' + pad + 'border-bottom:1px solid #353535;">',
    '<p style="margin:0;font-family:' +
      FONT +
      ';font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#b0ada6;">Bozza · Digital Possibility Studio</p>',
    '<p style="margin:8px 0 0;font-family:' +
      FONT +
      ';font-size:13px;line-height:1.4;color:#d2b77b;">' +
      esc(chrome.kicker) +
      '</p>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td class="omni-pad" style="' + pad + '">',
    '<h1 style="margin:0 0 12px;font-family:' +
      FONT +
      ';font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-0.03em;color:#f2eee6;">' +
      esc(subject) +
      '</h1>',
    '<p style="margin:0 0 20px;font-family:' +
      FONT +
      ';font-size:14px;line-height:1.5;color:#b0ada6;">' +
      esc(chrome.frame) +
      '</p>',
    paragraphs(body),
    ...(cta ? [
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">',
    '<tr>',
    '<td bgcolor="#d2b77b" style="background:#d2b77b;border-radius:4px;">',
    '<a href="' +
      esc(cta.href) +
      '" style="display:inline-block;padding:14px 22px;font-family:' +
      FONT +
      ';font-size:16px;line-height:1.2;font-weight:700;color:#101112;text-decoration:none;">' +
      esc(cta.label) +
      '</a>',
    '</td>',
    '</tr>',
    '</table>',
    ] : []),
    '</td>',
    '</tr>',
    '<tr>',
    '<td class="omni-pad" style="' + pad + 'border-top:1px solid #353535;">',
    '<p style="margin:0;font-family:' +
      FONT +
      ';font-size:14px;line-height:1.5;color:#b0ada6;">Bozza non inviata · Digital Possibility Studio</p>',
    '</td>',
    '</tr>',
    '</table>',
    '<!--[if mso]></td></tr></table><![endif]-->',
    '</td>',
    '</tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('\n');
}
