import {it,expect} from 'vitest';
import {calculatePricing,pricingInput} from '../apps/web/app/server/pricing';
// Formula: costCents=round(unitCost*qtyMilli/1000) per riga; direct=somma per cadenza;
// overhead=round(direct*ohBp/1e4); cont=round((direct+oh)*cBp/1e4); adjusted=direct+oh+cont;
// target=ceil(adjusted*1e4/(1e4-margin)); discount=round(target*dBp/1e4); net=target-discount;
// tax=round(net*taxBp/1e4) se taxBp!=null; USAGE ha quantityMilli fissata a 1000.
const line=(over:Record<string,unknown>={})=>({name:'Riga base',category:'LABOR',cadence:'ONE_TIME',unit:'ora',quantityMilli:1000,unitCostCents:10000,...over});
const input=(over:Record<string,unknown>={},lines?:unknown[])=>({name:'Preventivo di prova sintetico',leadId:'lead-1',currency:'EUR',scope:'Ambito di lavoro sintetico per i test unitari della formula.',terms:'Termini standard di prova.',assumptions:'Assunzioni standard di prova.',lines:lines??[line()],overheadBp:0,contingencyBp:0,marginBp:0,discountBp:0,taxBp:null,taxNote:'',...over});
const parse=(v:unknown)=>calculatePricing(pricingInput.parse(v));

it('una tantum semplice: cost 10000*1000/1000=10000; oh0, cont0, marg0 → target=ceil(10000*1e4/1e4)=10000; net=10000-0=10000',()=>{
 const r=parse(input());
 expect(r.groups).toHaveLength(1);
 const g=r.groups[0];
 expect(g.cadence).toBe('ONE_TIME');expect(g.directCents).toBe(10000);expect(g.overheadCents).toBe(0);expect(g.contingencyCents).toBe(0);expect(g.adjustedCostCents).toBe(10000);expect(g.targetCents).toBe(10000);expect(g.discountCents).toBe(0);expect(g.netCents).toBe(10000);expect(g.taxCents).toBe(null);expect(g.totalCents).toBe(null);
 expect(g.belowTarget).toBe(false);expect(g.belowCost).toBe(false);expect(g.effectiveMarginBp).toBe(0); // (10000-10000)*1e4/10000=0
 expect(r.oneTimeNetCents).toBe(10000);expect(r.method).toBe('cost-margin-v1');expect(r.currency).toBe('EUR');expect(r.taxStatus).toBe('NOT_CONFIGURED');expect(r.combinedTotal).toBe(null);
});
it('arrotondamento per riga: 15c*1750/1000=26.25 → costCents=26 (round per riga, non per gruppo)',()=>{
 const g=parse(input({},[line({name:'Riga frazionaria',quantityMilli:1750,unitCostCents:15})])).groups[0];
 expect(g.directCents).toBe(26); // round(26.25)=26
 expect(g.targetCents).toBe(26); // margine 0: target=ceil(26*1e4/1e4)=26
});
it('cadenze diverse restano separate: diretti 5000 e 2000, margine 0 → net 5000 e 2000, combinedTotal=null',()=>{
 const r=parse(input({},[line({name:'Setup iniziale',cadence:'ONE_TIME',unit:'progetto',quantityMilli:1000,unitCostCents:5000}),line({name:'Canone mensile',cadence:'MONTHLY',unit:'mese',quantityMilli:1000,unitCostCents:2000})]));
 expect(r.groups).toHaveLength(2);
 expect(r.groups.find(g=>g.cadence==='ONE_TIME')?.netCents).toBe(5000); // 5000c
 expect(r.groups.find(g=>g.cadence==='MONTHLY')?.netCents).toBe(2000); // 2000c
 expect(r.groups.find(g=>g.cadence==='MONTHLY')?.unit).toBe(null); // unit esposta solo per USAGE
 expect(r.oneTimeNetCents).toBe(5000);expect(r.combinedTotal).toBe(null); // mai sommate
});
it('overhead 10% e contingency 5% a catena: d=10000 → oh=round(10000*0.1)=1000; cont=round(11000*0.05)=550; adj=11550',()=>{
 const g=parse(input({overheadBp:1000,contingencyBp:500})).groups[0];
 // base = 10000c (default line), non 1000c: 10000→1000→550→11550
 expect(g.overheadCents).toBe(1000);expect(g.contingencyCents).toBe(550);expect(g.adjustedCostCents).toBe(11550);
 expect(g.targetCents).toBe(11550); // margine 0
});
it('margine 20%: adj=10000 → target=ceil(10000*1e4/8000)=12500; margine effettivo=(2500*1e4/12500)=2000bp',()=>{
 const g=parse(input({marginBp:2000})).groups[0];
 // 10000*1e4/8000=12500 esatto, ceil invariato; net 12500, margine 2000bp
 expect(g.targetCents).toBe(12500);expect(g.netCents).toBe(12500);expect(g.effectiveMarginBp).toBe(2000);expect(g.belowTarget).toBe(false);
});
it('target arrotondato per eccesso: adj=1001, margine 10% → 1001*1e4/9000=1112.2… → ceil=1113',()=>{
 const g=parse(input({marginBp:1000},[line({quantityMilli:1000,unitCostCents:1001})])).groups[0];
 expect(g.targetCents).toBe(1113);
});
it('sconto 10% dopo target: t=10000 → disc=round(10000*0.1)=1000; net=9000<10000 → belowTarget',()=>{
 const g=parse(input({discountBp:1000})).groups[0];
 // 10000 - round(10000*0.1=1000) = 9000, non 900
 expect(g.targetCents).toBe(10000);expect(g.discountCents).toBe(1000);expect(g.netCents).toBe(9000);
 expect(g.belowTarget).toBe(true);expect(g.belowCost).toBe(true); // 9000<10000 anche del costo
 expect(g.effectiveMarginBp).toBe(-1111); // round(-1000*1e4/9000)=round(-1111.1)=-1111
});
it('prezzo sotto costo: d=10000, oh20%, margine10%, sconto30% → adj=12000; t=ceil(12000*1e4/9000)=13334; disc=round(13334*0.3)=4000; net=9334<12000',()=>{
 const g=parse(input({overheadBp:2000,marginBp:1000,discountBp:3000})).groups[0];
 // 12000*1e4/9000=13333.33 → ceil 13334; disc 13334*0.3=4000.2 → 4000
 expect(g.adjustedCostCents).toBe(12000);expect(g.targetCents).toBe(13334);expect(g.discountCents).toBe(4000);expect(g.netCents).toBe(9334);
 expect(g.belowCost).toBe(true);expect(g.belowTarget).toBe(true);
});
it('tax 22% su net 9000: t=10000, disc=1000 → net=9000; tax=round(9000*0.22)=1980; total=10980; taxStatus USER_DECLARED',()=>{
 const r=parse(input({discountBp:1000,taxBp:2200,taxNote:'IVA 22% ordinaria, riscossa a termine.'}));
 const g=r.groups[0];
 // 9000*2200/10000=1980 esatto; totale 9000+1980=10980
 expect(g.taxCents).toBe(1980);expect(g.totalCents).toBe(10980);expect(r.taxStatus).toBe('USER_DECLARED');
});
it('limite valido: sconto 100% e margine 0 → t=500, disc=500, net=0; margine effettivo null per net=0',()=>{
 const g=parse(input({discountBp:10000},[line({quantityMilli:1000,unitCostCents:500})])).groups[0];
 expect(g.targetCents).toBe(500);expect(g.discountCents).toBe(500);expect(g.netCents).toBe(0);
 expect(g.effectiveMarginBp).toBe(null); // net=0 → null
 expect(g.belowCost).toBe(true);expect(g.belowTarget).toBe(true);
});
it('USAGE: quantityMilli obbligata a 1000, direct=round(120*1000/1000)=120; unit esposta',()=>{
 const g=parse(input({taxBp:null},[line({name:'Token a consumo',category:'AI_API',cadence:'USAGE',unit:'1k token',quantityMilli:1000,unitCostCents:120})])).groups[0];
 expect(g.cadence).toBe('USAGE');expect(g.directCents).toBe(120);expect(g.unit).toBe('1k token');expect(g.netCents).toBe(120);
});
it('deterministico: stessa input → stesso output (deep equal su due run)',()=>{
 const a=parse(input({overheadBp:1000,contingencyBp:500,marginBp:2500,discountBp:1500}));
 const b=parse(input({overheadBp:1000,contingencyBp:500,marginBp:2500,discountBp:1500}));
 expect(b).toEqual(a);
});
it('zod rifiuta: USD non è EUR',()=>{
 expect(()=>pricingInput.parse({...input(),currency:'USD'})).toThrow();
});
it('zod rifiuta: quantityMilli 0 sotto il minimo 1',()=>{
 expect(()=>pricingInput.parse(input({},[line({quantityMilli:0})]))).toThrow();
});
it('zod rifiuta: USAGE con quantityMilli 500 (deve essere 1000)',()=>{
 expect(()=>pricingInput.parse(input({},[line({cadence:'USAGE',quantityMilli:500})]))).toThrow();
});
it('zod rifiuta: taxBp non nullo con taxNote corta (<10)',()=>{
 expect(()=>pricingInput.parse(input({taxBp:2200,taxNote:'corta'}))).toThrow();
});
it('zod rifiuta: campo extra fuori schema strict',()=>{
 expect(()=>pricingInput.parse({...input(),colonnino:1})).toThrow();
});
it('costo aggregato per cadenza oltre 1e10 → HttpError 400: 1e8c*1e6/1000=1e11 diretto',()=>{
 // una riga al massimo zod basta: 100000000c × 1000000 milli / 1000 = 1e11 > 1e10
 expect(()=>parse(input({},[line({quantityMilli:1000000,unitCostCents:100000000})]))).toThrow();
});
it('netto massimo raggiungibile con input validi: 4e10 adj, margine 9500 → 8e11 < 1e12 (nessun throw)',()=>{
 // direct 1e10 (limite) + oh 100% 1e10 + cont 100% 2e10 = adj 4e10; /(1-0.95)=8e11, sotto il tetto 1e12
 const g=parse(input({overheadBp:10000,contingencyBp:10000,marginBp:9500},[line({quantityMilli:100000,unitCostCents:100000000})])).groups[0];
 expect(g.adjustedCostCents).toBe(40000000000);expect(g.netCents).toBe(800000000000);expect(g.netCents).toBeLessThan(1000000000000);
});
