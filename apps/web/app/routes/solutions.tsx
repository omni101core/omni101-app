import {buildMeta} from '../content/seo';
import {useParams,type LoaderFunctionArgs} from 'react-router';
import SolutionsView from '../components/public/capabilities/SolutionsView';
import {familyFromSlug,panels} from '../components/public/capabilities/panels';

export function meta({params}:{params:{family?:string}}){
 const family=familyFromSlug(params.family),panel=panels.find(p=>p.family===family),path=family?'/solutions/'+params.family:'/solutions';
 const title=panel?`${panel.name} · ${panel.title}`:'Soluzioni',description=panel?`${panel.claim} ${panel.count} soluzioni, ognuna con un esempio concreto e la sua disponibilità.`:'App, automazioni, contenuti creativi e crescita: 75 soluzioni con un esempio concreto e la loro disponibilità, dal disponibile oggi allo sperimentale.';
 return buildMeta(path,title,description);
}
export function loader({params}:LoaderFunctionArgs){if(params.family&&!familyFromSlug(params.family))throw new Response('Pagina non trovata',{status:404});return null}
export default function Solutions(){return <SolutionsView slug={useParams().family}/>}
