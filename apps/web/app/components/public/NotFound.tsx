import {useEffect,useRef,type CSSProperties} from 'react';
import {Link} from 'react-router';
import '../../styles/not-found.css';

/**
 * 404 (rendered by the root ErrorBoundary): a short cylinder of 3D CSS text that turns with the
 * page scroll. After Codrops "3D Text Scroll" (MIT); original implementation, no code copied.
 * Reduced motion: the cylinder stands still and the page does not stretch.
 */
const rows=['404','PAGINA NON TROVATA','NIENTE QUI','404','FORSE ALTROVE','RIPARTI DA QUI','404','STRADA CHIUSA','UN’ALTRA APERTA','404','SCEGLI DOVE','TORNA ALLO STUDIO'];
const links=[['/','Inizio','Lo studio'],['/work','Progetti','Idee da vedere'],['/solutions','Soluzioni','Cosa possiamo costruire'],['/explore','Playground','Il laboratorio'],['/studio','Studio','Come lavoriamo'],['/start-project','Parliamone','Raccontaci la tua idea']];
export function NotFound(){
 const track=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=track.current;
  if(!el||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let frame=0;
  const update=()=>{frame=0;const range=el.offsetHeight-innerHeight,progress=range>0?Math.min(1,Math.max(0,-el.getBoundingClientRect().top/range)):0;el.style.setProperty('--nf-rot',(progress*360).toFixed(1)+'deg')};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  return()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);cancelAnimationFrame(frame)};
 },[]);
 return <main className="nf">
  <title>Pagina non trovata · OMNI101</title>
  <Link className="nf-brand" to="/">OMNI<span>101</span></Link>
  <div className="nf-track" ref={track}>
   <div className="nf-sticky">
    <div className="nf-copy">
     <span className="eyebrow">ERRORE 404</span>
     <h1>Questa pagina non esiste.</h1>
     <p>Il link è cambiato o non è mai esistito. Da qui puoi andare dove ti serve.</p>
     <nav aria-label="Pagine utili"><ul>{links.map(([to,name,hint])=><li key={to}><Link to={to}><strong>{name}</strong><span>{hint}</span><i aria-hidden="true">↗</i></Link></li>)}</ul></nav>
    </div>
    <div className="nf-cyl-wrap" aria-hidden="true"><div className="nf-cyl">{rows.map((text,i)=><span className="nf-row" key={i} style={{'--i':i} as CSSProperties}>{text}</span>)}</div></div>
   </div>
  </div>
 </main>;
}
