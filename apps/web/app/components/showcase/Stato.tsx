import type {StatoDemo} from './logica';

/** The declared state of a demo: SIMULATA (the result is invented and written on the page) or OPERATIVA (the gesture works in the browser). */
export function Stato({stato,nota}:{stato:StatoDemo;nota?:string}){
 return <p className="sc-stato" data-stato={stato}><strong>{stato}</strong>{nota&&<span> · {nota}</span>}</p>;
}
