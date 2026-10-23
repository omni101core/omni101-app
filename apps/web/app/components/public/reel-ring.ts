/**
 * Pure geometry of the home reel ring. The loader and the hero are one scene at two moments:
 * `formation` (0..1) deals the cards from a single stack around the ring, `expansion` (0..1) opens the small
 * tilted ring into the level carousel. Nothing else is animated by hand; ReelOrbit only feeds these two numbers.
 * Original implementation of the principle documented by Avi Vashishta (no source or asset copied).
 */
export type RingScene={radius:number;perspective:number;tilt:number;roll:number;scale:number};
export type RingPose={x:number;z:number;yaw:number;appear:number};

/** Share of the formation each card spends travelling; the rest is the stagger between cards. */
export const DEAL=.34;
export const RING_CLOSED:RingScene={radius:150,perspective:820,tilt:-60,roll:-14,scale:.42};
export const RING_OPEN:RingScene={radius:540,perspective:1150,tilt:-5,roll:0,scale:1};

const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
const mix=(from:number,to:number,t:number)=>from+(to-from)*t;

/** Angle of a slot once the whole ring has turned by `spin`, folded to -180..180 (0 = nearest the camera). */
export function slotAngle(slot:number,slots:number,spin:number){
 return((slot*360/slots+spin+180)%360+360)%360-180;
}

/** Closed ring -> open ring. The squared scale keeps the cards small for the first half of the opening. */
export function ringScene(expansion:number):RingScene{
 const e=clamp01(expansion);
 return{
  radius:mix(RING_CLOSED.radius,RING_OPEN.radius,e),
  perspective:mix(RING_CLOSED.perspective,RING_OPEN.perspective,e),
  tilt:mix(RING_CLOSED.tilt,RING_OPEN.tilt,e),
  roll:mix(RING_CLOSED.roll,RING_OPEN.roll,e),
  scale:mix(RING_CLOSED.scale,RING_OPEN.scale,e*e),
 };
}

/**
 * Where one card sits. Undealt cards share the stack at angle 0 (front of the ring) and swing to their own angle
 * with an ease-out cubic; cards are ordered by angle so the deal travels once around the ring.
 */
export function ringPose(angle:number,formation:number,radius:number):RingPose{
 const order=(angle+180)/360;
 const t=clamp01((formation-order*(1-DEAL))/DEAL);
 const dealt=1-(1-t)**3;
 const placed=angle*dealt;
 const r=placed*Math.PI/180;
 return{
  x:Math.sin(r)*radius,
  z:Math.cos(r)*(radius-(1-dealt)*order*18),
  yaw:placed,
  appear:clamp01(t*3),
 };
}

/** Asset-driven counter: what is shown never runs ahead of the cards that are really loaded. */
export function loadProgress(loaded:number,total:number,formation:number){
 const assets=total>0?loaded/total:1;
 return Math.round(100*Math.min(clamp01(formation),clamp01(assets)));
}
