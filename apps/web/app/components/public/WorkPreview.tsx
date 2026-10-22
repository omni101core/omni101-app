import {useLayoutEffect,useRef} from 'react';
import {Link} from 'react-router';
import * as Dialog from '@radix-ui/react-dialog';
import {gsap} from 'gsap';
import {KINDS,WorkMedia,kindOf} from './WorkMedia';
import {flipFrom,flipInto,rememberFlip,type Box} from './flipRect';
import type {projects} from './shell/site-data';
import '../../styles/work-studio.css';

type Project=typeof projects[number];

/**
 * Full preview of a /work grid card: the thumbnail grows into a large frame (FLIP), the visitor
 * reads what it is and chooses to open the case. Radix Dialog gives focus trap, Esc and scroll lock.
 * Closing flies the frame back to its card. "Apri il caso" hands the frame's box to the case page,
 * whose hero continues from there (see WorkCase).
 */
export function WorkPreview({project,index,from,onClose}:{project:Project;index:number;from:Box;onClose:()=>void}){
 const close=useRef<()=>void>(()=>onClose());
 return <Dialog.Root open onOpenChange={open=>{if(!open)close.current()}}>
  <Dialog.Portal>
   <Dialog.Overlay className="wp-overlay"/>
   <Dialog.Content className="wp" onClick={event=>{if(event.target===event.currentTarget)close.current()}}>
    <PreviewBody project={project} index={index} from={from} onClose={onClose} register={fn=>{close.current=fn}}/>
   </Dialog.Content>
  </Dialog.Portal>
 </Dialog.Root>;
}

function PreviewBody({project:p,index,from,onClose,register}:{project:Project;index:number;from:Box;onClose:()=>void;register:(fn:()=>void)=>void}){
 const frame=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null),closing=useRef(false);
 const kind=KINDS[kindOf(p.type)];
 useLayoutEffect(()=>{
  const el=frame.current,info=panel.current;
  if(!el||!info)return;
  const context=gsap.context(()=>{
   flipFrom(el,from,{duration:.9});
   gsap.fromTo(info,{autoAlpha:0,y:28},{autoAlpha:1,y:0,duration:.6,delay:.4,ease:'power2.out'});
  });
  register(()=>{
   if(closing.current)return;
   closing.current=true;
   context.revert();
   gsap.to(info,{autoAlpha:0,duration:.2});
   flipInto(el,from,{duration:.65,onComplete:onClose});
  });
  return()=>context.revert();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <>
  <div className="wp-frame" ref={frame} data-kind={kindOf(p.type)}><WorkMedia index={index} kind={p.kind} eager/></div>
  <div className="wp-panel" ref={panel}>
   <div><span className="wp-kind">{kind.tag} / {p.category.toUpperCase()}</span><Dialog.Title className="wp-title">{p.name}</Dialog.Title></div>
   <Dialog.Description className="wp-text">{p.description}</Dialog.Description>
   <div className="wp-actions">
    <Link className="button" to={'/work/'+p.slug} onClick={()=>{if(frame.current)rememberFlip(p.slug,frame.current);onClose()}}>Apri il caso <span aria-hidden="true">↗</span></Link>
    <Dialog.Close className="wp-close">Chiudi</Dialog.Close>
   </div>
  </div>
 </>;
}
