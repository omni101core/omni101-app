import {useEffect,useRef,useState,type ReactNode} from 'react';
import {Link} from 'react-router';
import {RevealTitle} from './shell/RevealTitle';
import type {HomeStage} from './HomeShowcase';
import '../../styles/home-capitolo.css';

/** Mounts the demo only once its card is near the viewport, so the home pays for none of them until then. */
function Demo({children}:{children:ReactNode}){
 const box=useRef<HTMLDivElement>(null),[seen,setSeen]=useState(false);
 useEffect(()=>{
  if(seen||!box.current)return;
  const watch=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)setSeen(true)},{rootMargin:'240px'});
  watch.observe(box.current);
  return()=>watch.disconnect();
 },[seen]);
 return <div ref={box} className="capitolo-demo">{seen?children:null}</div>;
}

/** Home chapter: one card per option, each with its live demo and a link to the matching offer. Native scroll, no pin, no canvas. */
export default function HomeCapitolo({stages}:{stages:HomeStage[]}){
 return <section id="capitolo" className="home-capitolo section" aria-label="Possibilità da provare">
  <header>
   <span className="eyebrow">OMNI101 / ENTER THE POSSIBILITY</span>
   <RevealTitle as="h2" className="section-heading">Scegli una possibilità.<br/><em>Provala qui, adesso.</em></RevealTitle>
   <p>Dimostrazioni dello studio, da usare senza registrarti. Quella che ti serve diventa un progetto.</p>
  </header>
  <ol className="capitolo-cards">{stages.map((stage,i)=><li key={stage.id} data-stage={stage.id}>
   <article aria-labelledby={'capitolo-'+stage.id}>
    <span className="capitolo-num">0{i+1} / {stage.label}</span>
    <h3 id={'capitolo-'+stage.id}>{stage.title}</h3>
    <p>{stage.body}</p>
    {stage.demo&&<Demo>{stage.demo}</Demo>}
    <footer><small>{stage.detail}</small><Link to={stage.to}>{stage.cta} <span aria-hidden="true">↗</span></Link></footer>
   </article>
  </li>)}</ol>
  <p className="capitolo-close">Hai già in mente altro? <Link to="/start-project">Raccontaci la tua idea <span aria-hidden="true">↗</span></Link></p>
 </section>;
}
