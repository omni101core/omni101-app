import {Children,Fragment,isValidElement,useEffect,useRef,type CSSProperties,type ReactNode} from 'react';
import {gsap} from 'gsap';
import '../../../styles/public-grammar.css';

/** Splits a title on its `<br/>` elements: every authored line gets its own mask. */
function toLines(node:ReactNode){
 const lines:ReactNode[][]=[[]];
 const walk=(n:ReactNode)=>Children.forEach(n,child=>{
  if(isValidElement(child)&&child.type==='br'){lines.push([]);return}
  if(isValidElement(child)&&child.type===Fragment){walk((child.props as {children?:ReactNode}).children);return}
  lines[lines.length-1].push(child);
 });
 walk(node);
 return lines.filter(line=>line.length);
}

/**
 * The one title reveal of the public site: each line rises from its own mask, once, when the title
 * first enters the viewport. The text is always in the DOM; CSS only hides it while scripting is on
 * and motion is allowed, with a timed failsafe if the script never runs.
 * An `h1` is never hidden on the first load (it is the LCP element): its lines rise only after an in-app navigation.
 */
export function RevealTitle({as='h2',className,children}:{as?:'h1'|'h2'|'h3';className?:string;children:ReactNode}){
 const ref=useRef<HTMLHeadingElement>(null),Tag=as as 'h2';
 useEffect(()=>{
  const element=ref.current;
  if(!element)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){element.classList.add('is-in');return}
  if(as==='h1'){
   if(document.documentElement.dataset.omniNav!=='1')return;
   const tween=gsap.fromTo(element.querySelectorAll('.rt-line-inner'),{yPercent:112},{yPercent:0,duration:.9,ease:'expo.out',stagger:.09,delay:.2,clearProps:'transform'});
   return()=>{tween.kill()};
  }
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){element.classList.add('is-in');observer.disconnect()}},{rootMargin:'0px 0px -6% 0px'});
  observer.observe(element);
  return()=>observer.disconnect();
 },[as]);
 return <Tag ref={ref} className={'reveal-title'+(className?' '+className:'')} data-reveal-title>{toLines(children).map((line,i)=><Fragment key={i}>{i>0&&' '}<span className="rt-line"><span className="rt-line-inner" style={{'--rt-i':i} as CSSProperties}>{line.map((part,j)=><Fragment key={j}>{part}</Fragment>)}</span></span></Fragment>)}</Tag>;
}
