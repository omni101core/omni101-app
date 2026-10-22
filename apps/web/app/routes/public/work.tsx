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
import '../../styles/work-studio.css';

/**
 * /work: depth gallery (SpatialGallery, the only one on this route) as the index, then a grid.
 * Clicking a grid card grows its thumbnail into a full preview; from there "Apri il caso" lands on
 * the case page, whose hero continues from the preview frame. Reduced motion: cards are plain links.
 */
export function WorkIndex(){return <><PageHero kicker="02 / SELECTED POSSIBILITIES" title={<>Idee da vedere.<br/><em>E da esplorare.</em></>} text="Prototipi, progetti interni e concept originali. Un laboratorio aperto su quello che possiamo creare."/><WorkKinds/><SpatialGallery variant="work"/><section className="section"><WorkGallery/></section></>}

function WorkKinds(){
 const ids=Object.keys(KINDS) as KindId[];
 return <section className="section work-kinds" aria-label="Tipi di progetto"><dl>{ids.map(id=>{const count=projects.filter(p=>kindOf(p.type)===id).length;return <div className={'work-kind work-kind-'+id.toLowerCase()} key={id}><dt>{KINDS[id].label}</dt><dd><strong>{count?String(count).padStart(2,'0'):'—'}</strong><span>{KINDS[id].text}</span></dd></div>})}</dl></section>;
}

export function WorkCase({pathname}:{pathname:string}){
 const p=projects.find(p=>pathname.endsWith('/'+p.slug))!;
 const index=projects.indexOf(p),hero=useRef<HTMLDivElement>(null);
 // Continue from the preview frame of /work. The page transition transforms the incoming layer
 // while it runs, so the hero waits for its end event (or a timeout) before measuring.
 useLayoutEffect(()=>{
  const el=hero.current,from=takeFlip(p.slug);
  if(!el||!from||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const scope=el.closest<HTMLElement>('[data-public-transition]');
  let tween:gsap.core.Tween|null=null,started=false,timer=0;
  const run=()=>{if(started)return;started=true;scope?.removeEventListener('omni:public-transition-end',run);window.clearTimeout(timer);tween=flipFrom(el,from,{duration:1})};
  gsap.set(el,{autoAlpha:0});
  if(!scope||scope.dataset.phase==='idle')run();
  else{scope.addEventListener('omni:public-transition-end',run);timer=window.setTimeout(run,2600)}
  return()=>{scope?.removeEventListener('omni:public-transition-end',run);window.clearTimeout(timer);tween?.kill();gsap.set(el,{clearProps:'all'})};
 },[p.slug]);
 return <><div className="case-hero case-flip" ref={hero} data-kind={kindOf(p.type)}><WorkMedia index={index} kind={p.kind} eager/></div><PageHero kicker={p.type+' / '+p.category} title={<>{p.name.split(' / ')[0]}<br/><em>{p.name.split(' / ')[1]}</em></>} text={p.description}/><section className="section case-detail"><div className="case-facts"><div><small>TIPO</small>{KINDS[kindOf(p.type)].label}</div><div><small>AMBITO</small>{p.category}</div><div><small>CLIENTE</small>Nessun cliente commerciale dichiarato</div><Link className="text-link" to="/work">← Tutti i progetti</Link></div><div><h2 className="section-heading">Un’idea.<br/><em>Una possibilità concreta.</em></h2><p>{p.description} Questo progetto esplora un approccio di design e interazione. Non rappresenta un risultato commerciale di un cliente e non attribuisce metriche o performance non misurate.</p><Link className="text-link" to={p.category==='Commerce'?'/explore/commerce':p.category==='Automazioni'?'/explore/workflow':'/explore'}>Esplora il laboratorio ↗</Link></div></section></>;
}

export function WorkCard({project:p,index,onOpen}:{project:typeof projects[number];index:number;onOpen?:(event:MouseEvent<HTMLAnchorElement>,project:typeof projects[number])=>void}){
 const kind=KINDS[kindOf(p.type)];
 return <Link className="work-card scroll-reveal" to={'/work/'+p.slug} onClick={event=>onOpen?.(event,p)}><div className="work-preview"><WorkMedia index={projects.indexOf(p)} kind={p.kind}/><span className="case-type">{kind.tag}</span></div><div className="work-card-heading"><div><h3>{p.name}</h3><p>{p.category} / Esplorazione digitale</p></div><span className="work-number">0{index+1} ↗</span></div></Link>;
}

export function WorkGallery(){
 const [category,setCategory]=useState('Tutti'),[query,setQuery]=useState(''),[open,setOpen]=useState<{project:typeof projects[number];box:Box}|null>(null);
 const filtered=projects.filter(p=>(category==='Tutti'||category===p.category)&&(p.name+p.description).toLowerCase().includes(query.toLowerCase()));
 const select=(event:MouseEvent<HTMLAnchorElement>,project:typeof projects[number])=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const thumb=event.currentTarget.querySelector('.work-preview');
  if(!thumb)return;
  event.preventDefault();
  setOpen({project,box:boxOf(thumb)});
 };
 return <section className="section"><Filters values={['Tutti','Software','Commerce','Automazioni','Creative']} active={category} setActive={setCategory} query={query} setQuery={setQuery}/><div className="work-grid">{filtered.map((p,i)=><WorkCard key={p.slug} project={p} index={i} onOpen={select}/>)}</div>{!filtered.length&&<p className="empty-results">Nessun progetto corrisponde alla ricerca.</p>}{open&&<WorkPreview project={open.project} index={projects.indexOf(open.project)} from={open.box} onClose={()=>setOpen(null)}/>}</section>;
}
