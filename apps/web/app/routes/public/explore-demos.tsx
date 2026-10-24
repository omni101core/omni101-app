import {useState,lazy,Suspense} from 'react';
import {Link} from 'react-router';
import {Visual} from '../../components/public/Visual';
import {PageHero} from '../../components/public/shell/PageHero';
import {Binario,PrimaDopo,TiPuoServire,Vetrina} from '../../components/showcase';
import {aspettoDi,etichettaDi,messaggi} from '../../components/showcase/creativo';
import {AvatarLab,SoftwareLab} from './product-labs';
import {t,useLocale} from '../../components/public/shell/i18n';
const VisionLab=lazy(()=>import('../../components/vision/VisionLab'));
export function Commerce(){
  const l=useLocale();
  return <><PageHero kicker={t('explore_demos_commerce_kicker',l)} title={<>{t('explore_demos_commerce_title_a',l)}<br/><em>{t('explore_demos_commerce_title_b',l)}</em></>} text={t('explore_demos_commerce_text',l)}/><section className="section"><Vetrina/></section></>
}
export function WorkflowDemo(){
  const l=useLocale();
  return <><PageHero kicker={t('explore_demos_workflow_kicker',l)} title={<>{t('explore_demos_workflow_title_a',l)}<br/><em>{t('explore_demos_workflow_title_b',l)}</em></>} text={t('explore_demos_workflow_text',l)}/><section className="section"><Binario campo nodi={6}/></section></>
}
export function CreativeDemo(){
  const l=useLocale();
  const [language,setLanguage]=useState('it'),[direction,setDirection]=useState('essenza'),[format,setFormat]=useState('social');
  return <>
   <PageHero kicker={t('explore_demos_creative_kicker',l)} title={<>{t('explore_demos_creative_title_a',l)}<br/><em>{t('explore_demos_creative_title_b',l)}</em></>} text={t('explore_demos_creative_text',l)}/>
   <section className="section creative-layout">
    <div className="creative-art" style={{aspectRatio:aspettoDi(format),minHeight:format==='wide'?300:440}}><Visual kind={direction==='essenza'?2:direction==='form'?4:0} large/><div className="creative-overlay"><span>{t('explore_demos_creative_overlay_concept',l)}</span><h2>{messaggi[language]}</h2><span>{etichettaDi(format)}</span></div></div>
    <div className="creative-controls"><span className="eyebrow">{t('explore_demos_creative_eyebrow',l)}</span><h2 style={{fontSize:32,fontWeight:400}}>{t('explore_demos_creative_explore',l)}</h2>
     <label>{t('explore_demos_creative_label_visual',l)}<select value={direction} onChange={e=>setDirection(e.target.value)}><option value="essenza">{t('explore_demos_creative_option_essenza',l)}</option><option value="form">{t('explore_demos_creative_option_forma',l)}</option><option value="orbit">{t('explore_demos_creative_option_orbita',l)}</option></select></label>
     <label>{t('explore_demos_creative_label_lingua',l)}<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="it">{t('explore_demos_creative_option_italiano',l)}</option><option value="en">English</option><option value="fr">Français</option></select></label>
     <label>{t('explore_demos_creative_label_formato',l)}<select value={format} onChange={e=>setFormat(e.target.value)}><option value="social">{t('explore_demos_creative_option_social',l)}</option><option value="story">{t('explore_demos_creative_option_story',l)}</option><option value="wide">{t('explore_demos_creative_option_wide',l)}</option></select></label>
     <p className="demo-note">{t('explore_demos_creative_note',l)}</p>
     <PrimaDopo segmento="bottega" chiusura={false}/>
     <Link className="text-link" to="/start-project">{t('explore_demos_creative_cta',l)}</Link>
    </div>
   </section>
   <section className="section"><TiPuoServire servizio="create"/></section>
  </>;
}
export function ExploreDemo({slug}:{slug:string}){
  const l=useLocale();
  if(slug==='avatar')return <AvatarLab/>;
  if(slug==='software')return <SoftwareLab/>;
  if(slug==='commerce')return <Commerce/>;
  if(slug==='workflow')return <WorkflowDemo/>;
  if(slug==='vision')return <Suspense fallback={<section className="section">{t('explore_demos_vision_loading',l)}</section>}><VisionLab/></Suspense>;
  return <CreativeDemo/>;
}