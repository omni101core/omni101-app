import {useEffect} from 'react';
import {PageHero} from '../../components/public/shell/PageHero';
import {Process} from '../../components/public/Process';
import {StudioPortal} from '../../components/public/StudioPortal';
import {media} from '../../content/media';
import {t,useLocale} from '../../components/public/shell/i18n';
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
 const locale=useLocale();
 useStudioScroll();
 return <><PageHero kicker={t('studio_kicker',locale)} title={<>{t('studio_title_a',locale)}<br/><em>{t('studio_title_b',locale)}</em></>} text={t('studio_hero_text',locale)}/>{media.studio.src&&<img className="studio-hero-img" src={media.studio.src} alt={media.studio.alt} width={media.studio.w} height={media.studio.h} loading="lazy" style={{display:'block',width:'100%',height:'auto',objectFit:'cover'}}/>}<section className="section manifesto"><span className="section-index">{t('studio_way',locale)}</span><div><h2 className="editorial">{t('studio_manifesto_a',locale)}<br/>{t('studio_manifesto_b',locale)}<br/><em>{t('studio_manifesto_c',locale)}</em></h2><p>{t('studio_manifesto_text',locale)}</p></div></section><StudioPortal/><Process/></>;
}
