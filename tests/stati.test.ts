import {describe,expect,it} from 'vitest';
import {etichettaStato} from '../apps/web/app/stati';
describe('etichette stato condivise',()=>{
 it('traduce gli stati che mancavano in admin',()=>{expect(etichettaStato('CHANGES_REQUESTED')).toBe('Modifiche richieste');expect(etichettaStato('SENT')).toBe('Inviato');expect(etichettaStato('PAID')).toBe('Pagato')});
 it('il portale usa la forma per il cliente',()=>{expect(etichettaStato('DELIVERED','portale')).toBe('Da approvare');expect(etichettaStato('OPEN','portale')).toBe('Aperta');expect(etichettaStato('OPEN')).toBe('Aperto')});
 it('stato ignoto non mostra underscore né maiuscolo tecnico',()=>{expect(etichettaStato('WAITING_FOR_X')).toBe('Waiting for x');expect(etichettaStato(null)).toBe('—')});
});
