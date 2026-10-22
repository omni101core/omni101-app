/** Shared by CreativeDemo (explore-demos) and the create scene of /explore: one source for message and formats. */
export type Formato='social'|'story'|'wide';
export const messaggi:Record<string,string>={it:'Il tempo per ciò che conta.',en:'Time for what matters.',fr:'Le temps de l’essentiel.'};
export const formati:{id:Formato;etichetta:string;breve:string;aspetto:string}[]=[
 {id:'social',etichetta:'SOCIAL / 1:1',breve:'1:1',aspetto:'1 / 1'},
 {id:'story',etichetta:'STORY / 9:16',breve:'9:16',aspetto:'9 / 16'},
 {id:'wide',etichetta:'CAMPAIGN / 16:9',breve:'16:9',aspetto:'16 / 9'},
];
export const aspettoDi=(formato:string)=>formati.find(f=>f.id===formato)?.aspetto??'1 / 1';
export const etichettaDi=(formato:string)=>formati.find(f=>f.id===formato)?.etichetta??'SOCIAL / 1:1';
