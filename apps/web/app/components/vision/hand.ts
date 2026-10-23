import type {NormalizedLandmark} from '@mediapipe/tasks-vision';

export const AREAS=['BUILD','AUTOMATE','CREATE'] as const;
export const LOST_MS=1500;
export const PINCH_GAP_MS=700;
export const SWIPE_GAP_MS=900;
export const SWIPE_MIN=.18;
export const COMMAND_SCORE=.75;

export function clamp01(value:number){
 return Math.max(0,Math.min(1,value));
}

export function cursorFromHand(hand:NormalizedLandmark[],originX:number,originY:number,sensitivity:number){
 const x=1-hand[8].x;
 const y=hand[8].y;
 return {x:clamp01(.5+(x-originX)*sensitivity),y:clamp01(.5+(y-originY)*sensitivity)};
}

export function areaIndex(x:number){
 return Math.min(AREAS.length-1,Math.max(0,Math.floor(clamp01(x)*AREAS.length)));
}

export function stepArea(current:number,direction:1|-1){
 return (current+direction+AREAS.length)%AREAS.length;
}

export function isPinch(hand:NormalizedLandmark[]){
 const scale=Math.hypot(hand[0].x-hand[9].x,hand[0].y-hand[9].y);
 return Math.hypot(hand[4].x-hand[8].x,hand[4].y-hand[8].y)<Math.max(.025,scale*.3);
}

const gloss:Record<string,string>={
 Closed_Fist:'Pugno: ruota l’oggetto',
 Open_Palm:'Palmo aperto: swipe del carosello',
 Pointing_Up:'Indice: cursore',
 Thumb_Up:'Pollice su: nessun comando',
 Thumb_Down:'Pollice giù: nessun comando',
 Victory:'Vittoria: nessun comando',
 ILoveYou:'Gesto ignorato',
 None:'Mano rilevata',
};

export function gestureLabel(name:string){
 return gloss[name]||name||'Mano rilevata';
}
