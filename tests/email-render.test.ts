import {describe, expect, it} from 'vitest';
import {renderEmail, starterCopy, type EmailInput, type EmailLayout} from '../packages/email/render';

const valid: EmailInput = {
  subject: 'Oggetto',
  preheader: 'Anteprima',
  body: 'Primo paragrafo.\n\nSecondo paragrafo.',
  ctaLabel: 'Apri',
  ctaUrl: 'https://omni101.app/percorso',
};

function credentialUrl():string {const url=new URL('https://omni101.app/');url.username='synthetic-user';url.password='synthetic-password';return url.href}

function count(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

describe('renderEmail', () => {
  it('parte dal doctype e resta deterministico', () => {
    const html = renderEmail(valid);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toBe(renderEmail(valid));
    expect(html).toBe(renderEmail(valid, 'studio'));
  });

  it('mette CSP, tabelle e il tetto a 600px', () => {
    const html = renderEmail(valid, 'update');
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain("default-src &#39;none&#39;");
    expect(html).toContain('role="presentation"');
    expect(html).toContain('max-width:600px');
    expect(html).toContain('width="600"');
    expect(html).toContain('width="100%"');
    expect(html).toContain('font-size:16px');
    expect(html).toContain('@media only screen and (max-width:600px)');
    expect(count(html, 'role="presentation"')).toBeGreaterThanOrEqual(3);
  });

  it('distingue i tre layout senza html libero', () => {
    const layouts: EmailLayout[] = ['studio', 'update', 'proposal'];
    const seen = new Set<string>();
    for (const layout of layouts) {
      const html = renderEmail(valid, layout);
      expect(html).toContain('data-layout="' + layout + '"');
      seen.add(html);
    }
    expect(seen.size).toBe(3);
    expect(renderEmail(valid, 'studio')).toContain('Messaggio dello studio, in bozza.');
    expect(renderEmail(valid, 'update')).toContain('Aggiornamento di lavoro, in bozza.');
    expect(renderEmail(valid, 'proposal')).toContain('Non è un preventivo e non contiene un prezzo.');
    expect(() => renderEmail(valid, 'libero' as EmailLayout)).toThrow('Layout non valido.');
  });

  it('escapa subject, preheader, body e CTA', () => {
    const html = renderEmail({
      subject: 'a<b>&"\'',
      preheader: '<img src=x onerror=alert(1)>',
      body: 'prima\n\n<script>alert(1)</script>',
      ctaLabel: 'clicca <qui> & "là"',
      ctaUrl: 'https://omni101.app/ok?q=1&x="<>',
    });
    expect(html).toContain('<title>a&lt;b&gt;&amp;&quot;&#39;</title>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('clicca &lt;qui&gt; &amp; &quot;là&quot;');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<iframe');
    expect(html.match(/<a /g)).toHaveLength(1);
    expect(html).toContain('href="https://omni101.app/ok?q=1&amp;x=%22%3C%3E"');
  });

  it('accetta solo https senza credenziali', () => {
    expect(() => renderEmail({...valid, ctaLabel: '  ', ctaUrl: 'https://omni101.app/'})).toThrow(
      'Etichetta e URL della CTA sono obbligatori.',
    );
    expect(() => renderEmail({...valid, ctaLabel: 'Apri', ctaUrl: '   '})).toThrow(
      'Etichetta e URL della CTA sono obbligatori.',
    );
    expect(() => renderEmail({...valid, ctaUrl: 'http://omni101.app/'})).toThrow(
      'URL della CTA: solo https, senza credenziali.',
    );
    expect(() => renderEmail({...valid, ctaUrl: 'javascript:alert(1)'})).toThrow(
      'URL della CTA: solo https, senza credenziali.',
    );
    expect(() => renderEmail({...valid, ctaUrl: credentialUrl()})).toThrow(
      'URL della CTA: solo https, senza credenziali.',
    );
    expect(() => renderEmail({...valid, ctaUrl: 'nota-un-url'})).toThrow('URL della CTA non valido.');
    expect(() => renderEmail({...valid, subject: 1 as unknown as string})).toThrow(
      'Campo testuale non valido: subject',
    );
  });

  it('preserva bozze senza CTA e rifiuta controlli prima della normalizzazione URL', () => {
    expect(renderEmail({...valid,ctaLabel:'',ctaUrl:''})).not.toContain('<a ');
    for(const ctaUrl of ['https://omni101.app/\n','https://omni101.app/\tpath',credentialUrl(),'data:text/html,test']){
      expect(()=>renderEmail({...valid,ctaUrl})).toThrow();
    }
  });

  it('segna la bozza e non simula invio o disiscrizione', () => {
    const html = renderEmail(valid);
    expect(html).toContain('Bozza · Digital Possibility Studio');
    expect(html).toContain('Bozza non inviata');
    expect(html.toLowerCase()).not.toContain('unsubscribe');
    expect(html.toLowerCase()).not.toContain('tracking');
    expect(html).not.toContain('pixel');
  });
});

describe('starterCopy', () => {
  it('ha tre testi utilizzabili, senza prezzi', () => {
    expect(starterCopy.map(item => item.id)).toEqual([
      'benvenuto',
      'aggiornamento-progetto',
      'presentazione-proposta',
    ]);
    const blob = JSON.stringify(starterCopy);
    expect(blob).not.toMatch(/€|\$|\bEUR\b|\d+[.,]\d{2}/);
    for (const item of starterCopy) {
      const html = renderEmail(item);
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
      expect(html).toContain(item.subject);
      expect(html).toContain('https://omni101.app/');
      expect(html).toContain('Bozza non inviata');
    }
    expect(renderEmail(starterCopy[0], 'studio')).toContain('data-layout="studio"');
    expect(renderEmail(starterCopy[1], 'update')).toContain('data-layout="update"');
    expect(renderEmail(starterCopy[2], 'proposal')).toContain('data-layout="proposal"');
  });
});
