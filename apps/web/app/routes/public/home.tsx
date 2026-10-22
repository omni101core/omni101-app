import {Link} from 'react-router';
import ReelOrbit from '../../components/public/ReelOrbit';
import CinematicExperience from '../../components/public/CinematicExperience';
import {homeStages} from '../../components/public/HomeShowcase';
import {RevealTitle} from '../../components/public/shell/RevealTitle';
import {projects,services} from '../../components/public/shell/site-data';
import '../../styles/home-regia.css';

/** Home: the reel ring (loader and hero are one scene), one cinematic chapter with four moments, then four doors. */
const stages=homeStages();
const demos=4;
const doors=[
 ['/solutions','Soluzioni','Quattro famiglie di servizio, dal prodotto alla crescita.'],
 ['/work','Progetti','Idee da vedere e da esplorare.'],
 ['/explore','Playground','Le possibilità, da provare con le tue mani.'],
 ['/start-project','Raccontaci la tua idea','Un brief in poche righe.'],
];

export function Home(){
 return <>
  <ReelOrbit
   head={<>
    <div className="home-top"><span className="eyebrow">DIGITAL POSSIBILITY STUDIO</span><span className="availability">NUOVE IDEE, NUOVE POSSIBILITÀ</span></div>
    <h1 className="home-title">La tua idea.<em>Oltre il software.</em></h1>
   </>}
   foot={<>
    <p className="home-sentence">Costruiamo <Link to="/solutions/build">prodotti</Link>, automatizziamo <Link to="/solutions/automate">processi</Link>, creiamo <Link to="/solutions/create">contenuti</Link> e facciamo crescere <Link to="/solutions/grow">ciò che hai già</Link>.</p>
    <div className="home-foot">
     <div className="hero-actions"><Link className="button" to="/start-project">Raccontaci la tua idea <span>↗</span></Link><a className="text-link" href="#capitolo">Guarda come lavoriamo <span>↓</span></a></div>
     <dl className="home-numbers"><div><dt>famiglie di servizio</dt><dd>{services.length}</dd></div><div><dt>progetti da esplorare</dt><dd>{projects.length}</dd></div><div><dt>demo da provare</dt><dd>{demos}</dd></div></dl>
    </div>
   </>}
  />
  <div id="capitolo"><CinematicExperience stages={stages}/></div>
  <section className="home-doors" aria-label="Da dove cominciare">
   <RevealTitle as="h2" className="home-doors-title">Da dove vuoi<br/><em>cominciare?</em></RevealTitle>
   <ul>{doors.map(([to,name,line],i)=><li key={to}><Link className="home-door" to={to}><span className="home-door-index">0{i+1} /</span><span className="home-door-name">{name}</span><span className="home-door-line">{line}</span><span className="home-door-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
  </section>
 </>;
}
