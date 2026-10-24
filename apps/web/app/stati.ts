// Etichette stato condivise tra admin e portale. Un solo file, nessun valore tecnico in vista.
export const STATI: Record<string, string> = {
  OPEN: 'Aperto', CLOSED: 'Chiuso', PENDING: 'In attesa', IN_PROGRESS: 'In lavorazione', DONE: 'Fatto',
  NEW: 'Nuovo', ACTIVE: 'Attivo', APPROVED: 'Approvato', REJECTED: 'Rifiutato', DELIVERED: 'Consegnato',
  DRAFT: 'Bozza', WON: 'Vinta', LOST: 'Persa', CONFIGURED: 'Configurato', RESOLVED: 'Risolto',
  COMPLETED: 'Completato', CHANGES_REQUESTED: 'Modifiche richieste', SENT: 'Inviato', PAID: 'Pagato',
  SIGNED: 'Firmato', CANCELLED: 'Annullato',
};
// Il portale parla al cliente: femminile dove il soggetto è richiesta/fattura, "Da approvare" per la consegna.
const PORTALE: Record<string, string> = {
  DELIVERED: 'Da approvare', OPEN: 'Aperta', RESOLVED: 'Risolta', CLOSED: 'Chiusa', PAID: 'Pagata', SENT: 'Inviata',
  CANCELLED: 'Annullata',
};
// Stato sconosciuto: "NOT_YET_SET" -> "Not yet set", mai il valore grezzo.
const umano = (s: string) => { const t = s.replaceAll('_', ' ').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); };
export function etichettaStato(v: unknown, contesto: 'admin' | 'portale' = 'admin'): string {
  const s = String(v ?? '').trim();
  if (!s) return '—';
  return (contesto === 'portale' ? PORTALE[s] : undefined) ?? STATI[s] ?? umano(s);
}
