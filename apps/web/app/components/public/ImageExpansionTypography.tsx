import {Fragment,useEffect,useRef,type CSSProperties,type ReactNode} from 'react';
import {gsap} from 'gsap';
import {Flip} from 'gsap/Flip';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import '../../styles/image-expansion.css';

/**
 * A title whose picture opens inside the sentence while the page scrolls, once. Original React version of the
 * technique in Codrops "ImageExpansionTypography" (Codrops, MIT, see THIRD-PARTY-NOTICES.txt): the open layout is
 * measured with GSAP Flip, the closed layout is restored, and a scrubbed Flip.to plays closed -> open.
 * Reduced motion and small screens get the open layout, static.
 */
export function ImageExpansionTypography({lines,imageAfter=1,image,position='0% 50%',className}:{lines:ReactNode[];imageAfter?:number;image?:string;position?:string;className?:string}){
 const root=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const element=root.current;
  if(!element)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(max-width: 700px)').matches){element.classList.add('ixt--open');return}
  gsap.registerPlugin(Flip,ScrollTrigger);
  const context=gsap.context(()=>{
   const targets=Array.from(element.querySelectorAll('.ixt-anim,.ixt-img'));
   element.classList.add('ixt--open');
   const open=Flip.getState(targets);
   element.classList.remove('ixt--open');
   Flip.to(open,{ease:'power1.inOut',scrollTrigger:{trigger:element,start:'clamp(top bottom)',end:'+=135%',scrub:true}});
  },element);
  return()=>context.revert();
 },[]);
 return <h2 ref={root} className={'ixt'+(className?' '+className:'')}>{lines.map((line,i)=><Fragment key={i}>{i>0&&' '}<span className="ixt-anim">{line}</span>{i===imageAfter-1&&<>{' '}<span className="ixt-img" aria-hidden="true"><span className="ixt-img-inner" style={{backgroundImage:image?'url('+image+')':undefined,backgroundPosition:position} as CSSProperties}/></span></>}</Fragment>)}</h2>;
}
