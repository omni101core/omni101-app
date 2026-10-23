# Importazione contesto — prova deterministica

23 ottobre 2026. Nessuna chiamata cloud nella prova.

Eseguito `node scripts/seed-reviewed-context.mjs --sql`, output eseguito due volte su SQLite in memoria inizializzato con tutte le migrazioni ordinate. Esito: 18 knowledge_records, 18 knowledge_revisions, 12 task; nessuna fonte/task orfano o di altra organizzazione. Gli hash dei tre originali sono verificati dal generatore prima di produrre SQL. Le scritture sono insert-or-ignore e non modificano versioni o task preesistenti.

Il CLI --sql usa scrittura sincrona dello stdout: il primo controllo ha trovato output troncato perché console.log seguito da process.exit non garantisce flush di output grande. Corretto il generatore, rieseguita prova con esito sopra. Nessun contenuto o dato sensibile del database stampato nel report.

Import remoto: leggere il passo Import reviewed founder context della CI e i conteggi finali prima di dichiararlo popolato. Nessun budget, pubblicazione, invito o agente viene attivato dal seed.

Inventario esteso: aggiunti i tre allegati precedenti ancora accessibili. Ripetuta la prova su tutte le migrazioni: 21 record/versioni (6 mandati, 12 requisiti, 3 reference) e 12 task dopo due applicazioni. Il manifest include ID stabili e titoli leggibili; nessun originale sovrascritto.
