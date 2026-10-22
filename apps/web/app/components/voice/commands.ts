export type VoiceIntent='commerce'|'services'|'home'|'speak'|'unknown';

export function interpretCommand(raw:string):VoiceIntent{
 const text=raw.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 if(!text)return 'unknown';
 if(/\b(leggi|ascolta|ripeti)\b/.test(text))return 'speak';
 if(/\b(inizio|home|indietro|chiudi)\b/.test(text))return 'home';
 if(/\b(commerce|negozio|catalogo|carrello)\b/.test(text))return 'commerce';
 if(/\b(servizi|soluzioni)\b/.test(text))return 'services';
 return 'unknown';
}
