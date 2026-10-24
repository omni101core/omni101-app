export type LandingConfiguration = {
  version: 1;
  theme: 'studio' | 'hospitality' | 'professional';
  businessName: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  features: {title: string; description: string}[];
};

const ROOT_KEYS = ['version', 'theme', 'businessName', 'headline', 'description', 'ctaLabel', 'ctaUrl', 'features'];

function fail(message: string): never {
  throw new Error(message);
}

function isTheme(value: unknown): value is LandingConfiguration['theme'] {
  return value === 'studio' || value === 'hospitality' || value === 'professional';
}

function text(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== 'string') fail(label + ': serve un testo.');
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    fail(label + ': tra ' + min + ' e ' + max + ' caratteri.');
  }
  if (/[<>]/.test(trimmed) || /[\u0000-\u001F\u007F]/.test(trimmed)) {
    fail(label + ': niente HTML né caratteri di controllo.');
  }
  return trimmed;
}

function httpsUrl(value: unknown): string {
  if (typeof value !== 'string') fail('URL del pulsante: serve un testo.');
  const raw = value.trim();
  if (!raw) fail('URL del pulsante: serve un indirizzo https.');
  if (/[<>]/.test(raw) || /[\u0000-\u001F\u007F]/.test(raw)) {
    fail('URL del pulsante: niente HTML né caratteri di controllo.');
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    fail('URL del pulsante non valido.');
  }
  if (parsed.protocol !== 'https:' || parsed.username !== '' || parsed.password !== '') {
    fail('URL del pulsante: solo https, senza credenziali.');
  }
  return parsed.href;
}

export function validateConfiguration(input: unknown): LandingConfiguration {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Configurazione non valida.');
  const record = input as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ROOT_KEYS.includes(key)) fail('Campo non previsto: ' + key);
  }
  if (record.version !== 1) fail('Versione non valida. Attesa la versione 1.');
  if (!isTheme(record.theme)) fail('Tema non valido. Usa studio, hospitality o professional.');
  if (!Array.isArray(record.features) || record.features.length < 1 || record.features.length > 6) {
    fail('Servono da 1 a 6 funzioni.');
  }
  const features = record.features.map((item, index) => {
    const n = String(index + 1);
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail('Funzione ' + n + ' non valida.');
    const row = item as Record<string, unknown>;
    for (const key of Object.keys(row)) {
      if (key !== 'title' && key !== 'description') fail('Campo non previsto nella funzione ' + n + ': ' + key);
    }
    return {
      title: text(row.title, 'Titolo della funzione ' + n, 1, 80),
      description: text(row.description, 'Descrizione della funzione ' + n, 1, 400),
    };
  });
  return {
    version: 1,
    theme: record.theme,
    businessName: text(record.businessName, 'Nome attività', 2, 100),
    headline: text(record.headline, 'Titolo', 5, 160),
    description: text(record.description, 'Descrizione', 10, 1200),
    ctaLabel: text(record.ctaLabel, 'Etichetta del pulsante', 2, 60),
    ctaUrl: httpsUrl(record.ctaUrl),
    features,
  };
}
