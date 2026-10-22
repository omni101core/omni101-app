import {gsap} from 'gsap';

/**
 * Rect-to-rect FLIP used by /work: grid thumbnail -> full preview -> case hero.
 * Technique after Codrops GridToFullPreview and OneElementScroll (MIT, Codrops); no code copied,
 * OMNI101 reimplementation on the GSAP already in the bundle.
 */
export type Box={left:number;top:number;width:number;height:number};
export const boxOf=(el:Element):Box=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height}};

// The box of the element the visitor just left, handed to the next page. Valid for a few seconds only.
let pending:{slug:string;box:Box;at:number}|null=null;
export const rememberFlip=(slug:string,el:Element)=>{pending={slug,box:boxOf(el),at:Date.now()}};
export const takeFlip=(slug:string):Box|null=>{const p=pending;pending=null;return p&&p.slug===slug&&Date.now()-p.at<4000?p.box:null};

/** Animate `el` from `from` (viewport box) to where it sits now. */
export function flipFrom(el:HTMLElement,from:Box,vars:gsap.TweenVars={}){
 gsap.set(el,{clearProps:'transform'});
 const to=boxOf(el);
 if(!to.width||!to.height)return null;
 return gsap.fromTo(el,{x:from.left-to.left,y:from.top-to.top,scaleX:from.width/to.width,scaleY:from.height/to.height,transformOrigin:'0 0',autoAlpha:1},{x:0,y:0,scaleX:1,scaleY:1,duration:.9,ease:'power3.inOut',clearProps:'transform',...vars});
}

/** Animate `el` from where it sits now into `to` (viewport box). */
export function flipInto(el:HTMLElement,to:Box,vars:gsap.TweenVars={}){
 gsap.killTweensOf(el);
 gsap.set(el,{clearProps:'transform'});
 const now=boxOf(el);
 return gsap.to(el,{x:to.left-now.left,y:to.top-now.top,scaleX:to.width/now.width,scaleY:to.height/now.height,transformOrigin:'0 0',duration:.7,ease:'power3.inOut',...vars});
}
