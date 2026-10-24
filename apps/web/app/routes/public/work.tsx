import {useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {Link} from 'react-router';
import {gsap} from 'gsap';
import {PageHero} from '../../components/public/shell/PageHero';
import {Filters} from '../../components/public/Filters';
import SpatialGallery from '../../components/public/SpatialGallery';
import {WorkPreview} from '../../components/public/WorkPreview';
import {KINDS,WorkMedia,kindOf,type KindId} from '../../components/public/WorkMedia';
import {boxOf,flipFrom,takeFlip,type Box} from '../../components/public/flipRect';
import {projects} from '../../components/public/shell/site-data';
import {localePath,t,useLocale} from '../../components/public/shell/i18n';
import caseStudiesIt from '../../content/case-studies.it.json';
import caseStudiesEn from '../../content/case-studies.en.json';
import '../../styles/work-studio.css';
type CaseStudy={slug:string;problem:string;approach:string;what_we_built:string[];cta:{label:string;href:string}};

/**
 * /work: depth gallery (SpatialGallery, the only one on this route) as the index, then a grid.
 * Clicking a grid card grows its thumbnail into a full preview; from there "Apri il caso" lands on
 * the case page, whose hero continues from the preview frame. Reduced motion: cards are plain links.
 */
export function WorkIndex(){const locale=useLocale();return <><PageHero kicker={t('work_kicker',locale)} title={<>{t('work_title_a',locale)}<br/><em>{t('work_title_b',locale)}</em></>} text={t('work_hero_text',locale)}/><WorkGallery/><WorkKinds/><SpatialGallery variant="work"/></>}

function WorkKinds(){
 const locale=useLocale();
 const ids=Object.keys(KINDS) as KindId[];
 return <section className="section work-kinds" aria-label={t('work_kinds_label',locale)}><dl>{ids.map(id=>{const count=projects.filter(p=>kindOf(p.type)===id).length;return <div className={'work-kind work-kind-'+id.toLowerCase()} key={id}><dt>{KINDS[id].label}</dt><dd><strong>{count?String(count).padStart(2,'0'):'—'}</strong><span>{KINDS[id].text}</span></dd></div>})}</dl></section>;
}

export function WorkCase({pathname}:{pathname:string}){
 const locale=useLocale();
 const p=projects.find(p=>pathname.endsWith('/'+p.slug))!;
 const study=((locale==='en'?caseStudiesEn:caseStudiesIt) as CaseStudy[]).find(c=>c.slug===p.slug),built=study?.what_we_built??p.scope;
 const index=projects.indexOf(p),hero=useRef<HTMLDivElement>(null);
 // Continue from the preview frame of /work. The page transition transforms the incoming layer
 // while it runs, so the hero waits for its end event (or a timeout) before measuring.
 useLayoutEffect(()=>{
  const el=hero.current,from=takeFlip(p.slug);
  if(!el||!from||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const scope=el.closest<HTMLElement>('[data-public-transition]');
  let tween:gsap.core.Tween|null=null,started=false,timer=0;
  const run=()=>{if(started)return;started=true;scope?.removeEventListener('omni:public-transition-end',later);window.clearTimeout(timer);tween=flipFrom(el,from,{duration:1,onComplete:()=>{gsap.set(el,{clearProps:'all'})}})};
  // the end event fires inside PublicTransition's gsap.context: start on the next frame so its revert cannot undo this tween
  const later=()=>{requestAnimationFrame(run)};
  gsap.set(el,{autoAlpha:0});
  if(!scope||scope.dataset.phase==='idle')run();
  else{scope.addEventListener('omni:public-transition-end',later);timer=window.setTimeout(run,2600)}
  return()=>{scope?.removeEventListener('omni:public-transition-end',later);window.clearTimeout(timer);tween?.kill();gsap.set(el,{clearProps:'all'})};
 },[p.slug]);
 return <><div className="case-hero case-flip" ref={hero} data-kind={kindOf(p.type)}><WorkMedia index={index} kind={p.kind} eager/></div><PageHero kicker={p.type+' / '+p.category} title={<>{p.name.split(' / ')[0]}<br/><em>{p.name.split(' / ')[1]}</em></>} text={t('work_case_prefix',locale)+p.description}/><section className="section case-detail"><div className="case-facts"><div><small>{t('work_fact_type',locale)}</small>{KINDS[kindOf(p.type)].label}</div><div><small>{t('work_fact_field',locale)}</small>{p.category}</div><div><small>{t('work_fact_client',locale)}</small>{t('work_no_client',locale)}</div><Link className="text-link" to={localePath('/work',locale)}>{t('work_back',locale)}</Link></div><div><h2 className="section-heading">{t('work_case_title_a',locale)}<br/><em>{t('work_case_title_b',locale)}</em></h2><p>{t('work_case_note',locale)}</p><p>{study?.problem??(p.challenge||p.description)}</p>{study?<p>{study.approach}</p>:null}{built?<ul className="case-scope">{built.map(item=><li key={item}>{item}</li>)}</ul>:null}{study?<><Link className="text-link" to={study.cta.href}>{study.cta.label}</Link><br/></>:null}<Link className="text-link" to={p.category==='Commerce'?'/explore/commerce':p.category==='Automazioni'?'/explore/workflow':'/explore'}>{t('work_lab_link',locale)}</Link><br/><Link className="text-link" to="/start-project">{t('work_similar_cta',locale)}</Link></div></section></>;
}

export function WorkCard({project:p,index,onOpen}:{project:typeof projects[number];index:number;onOpen?:(event:MouseEvent<HTMLAnchorElement>,project:typeof projects[number])=>void}){
 const kind=KINDS[kindOf(p.type)],locale=useLocale();
 return <Link className="work-card scroll-reveal" to={localePath('/work/'+p.slug,locale)} onClick={event=>onOpen?.(event,p)}><div className="work-preview"><WorkMedia index={projects.indexOf(p)} kind={p.kind}/><span className="case-type">{kind.tag}</span></div><div className="work-card-heading"><div><h3>{p.name}</h3><p><span className="work-concept">Concept</span> · {p.sector||p.category} / {kind.tag}</p></div><span className="work-number">0{index+1} ↗</span></div></Link>;
}

export function WorkGallery(){
 const locale=useLocale();
 const [sector,setSector]=useState('Tutti'),[category,setCategory]=useState('Tutti'),[query,setQuery]=useState(''),[open,setOpen]=useState<{project:typeof projects[number];box:Box;card:HTMLAnchorElement}|null>(null);
 const filtered=[...projects].sort((a,b)=>Number(!!b.sector)-Number(!!a.sector)).filter(p=>(sector==='Tutti'||p.sector===sector)&&(category==='Tutti'||category===p.category)&&(p.name+p.description+(p.sector||'')).toLowerCase().includes(query.toLowerCase()));
 const select=(event:MouseEvent<HTMLAnchorElement>,project:typeof projects[number])=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const thumb=event.currentTarget.querySelector('.work-preview');
  if(!thumb)return;
  event.preventDefault();
  setOpen({project,box:boxOf(thumb),card:event.currentTarget});
 };
 return <section className="section" aria-labelledby="work-grid-title"><div className="work-lead"><h2 id="work-grid-title">{t('work_grid_title',locale)}</h2><p>{t('work_grid_lead',locale)}</p></div><label className="work-sector">{t('work_sector',locale)} <select aria-label={t('work_sector',locale)} value={sector} onChange={event=>setSector(event.target.value)}>{['Tutti',...new Set(projects.flatMap(p=>p.sector?[p.sector]:[]))].map(value=><option key={value} value={value}>{value==='Tutti'?t('work_filter_all',locale):value}</option>)}</select></label><Filters values={['Tutti','Software','Commerce','Automazioni','Creative']} active={category} setActive={setCategory} query={query} setQuery={setQuery} labels={{Tutti:t('work_filter_all',locale),Commerce:t('work_label_commerce',locale),Automazioni:t('work_label_automation',locale),Creative:t('work_label_creative',locale)}}/><div className="work-grid">{filtered.map((p,i)=><WorkCard key={p.slug} project={p} index={i} onOpen={select}/>)}</div>{!filtered.length?<p className="empty-results">{t('work_empty',locale)} <button className="text-link" type="button" onClick={()=>{setSector('Tutti');setCategory('Tutti');setQuery('')}}>{t('work_reset',locale)}</button></p>:null}{open?<WorkPreview project={open.project} index={projects.indexOf(open.project)} from={open.box} onClose={()=>setOpen(null)}/>:null}</section>;
}
