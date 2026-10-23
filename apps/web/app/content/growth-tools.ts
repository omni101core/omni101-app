/** Builds a link only. It does not load a pixel, store attribution or send traffic. */
export function buildCampaignUrl(base:string,source:string,medium:string,campaign:string){
 let url:URL;try{url=new URL(base)}catch{throw new Error('Inserisci un indirizzo HTTPS completo.');}
 if(url.protocol!=='https:'||url.username||url.password)throw new Error('Usa HTTPS senza credenziali nell’indirizzo.');
 for(const key of url.searchParams.keys())if(/token|secret|password|session|email|authorization/i.test(key))throw new Error('Rimuovi i dati riservati dai parametri del link.');
 for(const value of [source,medium,campaign])if(!/^[a-zA-Z0-9][a-zA-Z0-9 _.-]{0,99}$/.test(value.trim()))throw new Error('Sorgente, mezzo e campagna: usa lettere, numeri, spazi, punto, trattino o underscore (massimo 100).');
 for(const key of [...url.searchParams.keys()])if(/^utm_/i.test(key)||/^(gclid|fbclid|msclkid)$/i.test(key))url.searchParams.delete(key);
 for(const [key,value]of [['utm_source',source],['utm_medium',medium],['utm_campaign',campaign]])url.searchParams.set(key,value.trim().replace(/\s+/g,'_').toLowerCase());
 return url.toString();
}
