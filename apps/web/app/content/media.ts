export const media: {
  reel: {src: string; alt: string; w: number; h: number}[];
  work: {src: string; alt: string; w: number; h: number}[];
  explore: {src: string; alt: string; w: number; h: number}[];
  solutions: {
    build?: {src: string; alt: string; w: number; h: number};
    automate?: {src: string; alt: string; w: number; h: number};
    create?: {src: string; alt: string; w: number; h: number};
    grow?: {src: string; alt: string; w: number; h: number};
  };
  cinema: {src: string; alt: string; w: number; h: number}[];
  insights: {src: string; alt: string; w: number; h: number}[];
  studio: {src?: string; alt?: string; w?: number; h?: number};
  menu: {src?: string; alt?: string; w?: number; h?: number};
} = {
  reel: [
    {src: "/media/originali/reel-01-commerce-experience.jpg", alt: "Mani posano una ciotola sul banco, il tablet mostra la scheda del prodotto", w: 720, h: 960},
    {src: "/media/originali/reel-02-digital-products.jpg", alt: "Mani sistemano fascicoli, il portatile mostra i passi di una lezione", w: 720, h: 960},
    {src: "/media/originali/reel-03-creative-intelligence.jpg", alt: "Cuoco di spalle in sala, tablet con il calendario delle prenotazioni", w: 720, h: 960},
    {src: "/media/originali/reel-04-connected-workflows.jpg", alt: "Mani tengono un telefono a colazione, con un flusso di passi", w: 720, h: 960},
    {src: "/media/originali/reel-05-brand-systems.jpg", alt: "Mani su carta avorio, portatile con una tavola di identità", w: 720, h: 960},
    {src: "/media/originali/reel-06-omni-portal.jpg", alt: "Reception di uno studio, monitor con gli appuntamenti del giorno", w: 720, h: 960},
    {src: "/media/originali/reel-07-custom-software.jpg", alt: "Guanti su un pezzo metallico, tablet con la scheda di lavorazione", w: 720, h: 960},
    {src: "/media/originali/reel-08-digital-storefronts.jpg", alt: "Vetrina serale: oggetti in fila e un tablet che ripete la stessa fila", w: 720, h: 960},
    {src: "/media/originali/reel-09-content-in-motion.jpg", alt: "Reception di una palestra, telefono con una campagna", w: 720, h: 960},
    {src: "/media/originali/reel-10-ai-operations.jpg", alt: "Cuoco di spalle al piano d'acciaio, schermo con lo stato del servizio", w: 720, h: 960},
    {src: "/media/originali/reel-11-editorial-experiences.jpg", alt: "Mani su una pianta e telefono con l'annuncio di un immobile", w: 720, h: 960},
    {src: "/media/originali/reel-12-new-possibilities.jpg", alt: "Ospite di spalle rifà il letto, telefono con la prenotazione della camera", w: 720, h: 960},
  ],
  work: [
    {src: "/media/originali/work-01-essenza.jpg", alt: "Oggetto artigianale e confezione di carta avorio", w: 1600, h: 1000},
    {src: "/media/originali/work-02-atelier.jpg", alt: "Banco visto dall'alto: forbici, squadra, campioni e telefono", w: 1600, h: 1000},
    {src: "/media/originali/work-03-flow.jpg", alt: "Tovagliolo, bicchiere, telefono e chiave in fila", w: 1600, h: 1000},
    {src: "/media/originali/work-04-identity.jpg", alt: "Segno a rilievo su carta spessa, senza lettere", w: 1600, h: 1000},
    {src: "/media/originali/work-05-editorial.jpg", alt: "Quaderno aperto con margine largo, luce di finestra", w: 1600, h: 1000},
    {src: "/media/originali/work-06-portal.jpg", alt: "Porta di uno studio socchiusa e appendiabiti vuoto", w: 1600, h: 1000},
  ],
  explore: [
    {src: "/media/originali/explore-01-commerce.jpg", alt: "Tablet con una griglia di prodotti e l'oggetto vero davanti allo schermo", w: 1600, h: 1000},
    {src: "/media/originali/explore-02-workflow.jpg", alt: "Mani su un vassoio e telefono con quattro passi collegati", w: 1600, h: 1000},
    {src: "/media/originali/explore-03-studio-creativo.jpg", alt: "Due schermi a campi di colore e un menu visto di dorso", w: 1600, h: 1000},
    {src: "/media/originali/explore-04-vision.jpg", alt: "Lente e pezzo meccanico attraversati da una lama di luce", w: 1600, h: 1000},
  ],
  solutions: {
    build: {src: "/media/originali/solutions-01-build.jpg", alt: "Sala apparecchiata, mani su un laptop con la pagina del ristorante", w: 1400, h: 900},
    automate: {src: "/media/originali/solutions-02-automate.jpg", alt: "Vassoio della colazione e telefono con un flusso di passi", w: 1400, h: 900},
    create: {src: "/media/originali/solutions-03-create.jpg", alt: "Mani con la foto di un corso e portatile con la campagna", w: 1400, h: 900},
    grow: {src: "/media/originali/solutions-04-grow.jpg", alt: "Faldoni e portatile con un grafico di crescita", w: 1400, h: 900},
  },
  cinema: [
    {src: "/media/originali/cinema-01-capitolo.jpg", alt: "Sala di un ristorante all'alba, bancone scuro e sedie", w: 1920, h: 1080},
    {src: "/media/originali/cinema-02-capitolo.jpg", alt: "Chiave di ottone su lino avorio", w: 1920, h: 1080},
    {src: "/media/originali/cinema-03-capitolo.jpg", alt: "Foglio da disegno e pezzo di metallo in controluce", w: 1920, h: 1080},
    {src: "/media/originali/cinema-04-capitolo.jpg", alt: "Stanza vuota, finestra grande e pianta arrotolata sul pavimento", w: 1920, h: 1080},
  ],
  insights: [
    {src: "/media/originali/insights-01-brief-al-prodotto.jpg", alt: "Pezzo da vendere, lente e segni a matita illeggibili sul banco", w: 1600, h: 900},
    {src: "/media/originali/insights-02-automazione-controllo.jpg", alt: "Interruttore fisico e telefono capovolto, nessuno sul pulsante", w: 1600, h: 900},
    {src: "/media/originali/insights-03-ai-nel-processo.jpg", alt: "Faldoni chiusi attraversati da una linea di piccole luci", w: 1600, h: 900},
  ],
  studio: {src: "/media/originali/studio-01-tavolo.jpg", alt: "Chiave, lino, campione, fascicolo e lente sullo stesso tavolo", w: 1600, h: 900},
  menu: {src: "/media/originali/menu-01-dettaglio.jpg", alt: "Dettaglio di una chiave e di un lembo di carta avorio", w: 720, h: 960},
};
