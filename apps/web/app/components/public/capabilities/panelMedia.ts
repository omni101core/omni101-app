import type {CSSProperties} from 'react';

/** Image of a family panel. `app/content/media.ts` (SPEC-11) owns the final pictures under the key `solutions`; it may not
 * exist yet, so it is read with a glob that is empty when the file is missing. Until a family has its own picture, a
 * crop of the atlas already published in /media (4 scenes side by side) stands in. */
interface Original{src:string;alt:string;w?:number;h?:number}
const found=import.meta.glob<{media?:{solutions?:Record<string,Original|undefined>}}>('../../../content/media.ts',{eager:true});
const originals=Object.values(found)[0]?.media?.solutions||{};

const atlas='/media/omni-cinematic-atlas.png';
// background-size is a multiple of the figure width, so each scene is cropped from the 3:1 atlas by its position.
const crops:Record<string,{alt:string;size:string;x:string;y:string}>={
 build:{alt:'Arco in ottone lucido su una terrazza di pietra, davanti al mare.',size:'400% auto',x:'0%',y:'55%'},
 automate:{alt:'Nastro di vetro e ottone che si avvolge in una corte di cemento.',size:'400% auto',x:'100%',y:'45%'},
 create:{alt:'Ritratto editoriale con un panneggio avorio su cielo blu.',size:'400% auto',x:'66.7%',y:'30%'},
 grow:{alt:'Flacone di vetro ambrato su un blocco di pietra al sole.',size:'400% auto',x:'33.3%',y:'60%'},
 emerging:{alt:'Particolare di un nastro di vetro e ottone controluce.',size:'700% auto',x:'93.75%',y:'30%'},
};

export interface FamilyImage{fallback:boolean;alt:string;src?:string;width?:number;height?:number;style?:CSSProperties}
export function familyImage(slug:string):FamilyImage{
 const own=originals[slug];
 if(own)return {fallback:false,alt:own.alt,src:own.src,width:own.w,height:own.h};
 const crop=crops[slug]||crops.build;
 return {fallback:true,alt:crop.alt,style:{backgroundImage:`url(${atlas})`,backgroundSize:crop.size,backgroundPosition:`${crop.x} ${crop.y}`}};
}
