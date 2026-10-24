// Message for a public /demo or /proposal link that did not load. 404 = gone for good (expired, revoked, replaced, unknown: the server never says which). 429, 5xx, network = try again.
export const GONE = 'Questo link non è più valido: potrebbe essere scaduto o sostituito. Scrivi allo studio e ti inviamo quello aggiornato. · This link is no longer valid; it may have expired or been replaced. Write to the studio and we will send you a new one.';
export const RETRY = 'Il servizio è momentaneamente occupato. Riprova tra poco. · The service is briefly busy. Please try again shortly.';
export const linkMessage = (status: number | null) => (status !== null && status < 500 && status !== 429 ? GONE : RETRY);
