import {useEffect} from 'react';
import {PageHero} from '../../components/public/shell/PageHero';
import {Process} from '../../components/public/Process';
import {StudioPortal} from '../../components/public/StudioPortal';
import '../../styles/work-studio.css';

/** Lenis runs on /studio only (REGIA v2): smooth wheel scroll over native scroll, sticky stage, no pin. Off with reduced motion and loaded on demand. */
function useStudioScroll(){
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let stop=()=>{},gone=false;
  import('lenis').then(({default:Lenis})=>{
   if(gone)return;
   const lenis=new Lenis({lerp:.1,prevent:node=>!!node.closest('[role="dialog"]')});
   let frame=requestAnimationFrame(function raf(time){lenis.raf(time);frame=requestAnimationFrame(raf)});
   stop=()=>{cancelAnimationFrame(frame);lenis.destroy()};
  });
  return()=>{gone=true;stop()};
 },[]);
}
export function Studio(){
 useStudioScroll();
 return <><PageHero kicker="04 / LO STUDIO" title={<>Curiosi per natura.<br/><em>Concreti per scelta.</em></>} text="OMNI101 è uno studio digitale che unisce strategia, design e sviluppo. Ci occupiamo di possibilità, e del lavoro necessario per farle accadere."/><section className="section manifesto"><span className="section-index">OUR APPROACH</span><div><h2 className="editorial">Lavoriamo dove si incontrano<br/>le idee, le persone<br/><em>e la tecnologia.</em></h2><p>Crediamo nel dialogo diretto, nelle scelte spiegate bene e nei prodotti che risolvono problemi reali. L’AI amplia ciò che possiamo fare: la responsabilità delle scelte resta umana.</p></div></section><StudioPortal/><Process/></>;
}
