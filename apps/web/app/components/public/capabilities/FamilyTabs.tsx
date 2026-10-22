import {useRef,type KeyboardEvent} from 'react';
import {panels} from './panels';

const LAST=panels.length-1;

/** The five family tabs. Arrow keys, Home and End move the selection and the focus together; the wheel and the
 * catalogue below follow the selected tab. */
export default function FamilyTabs({active,onSelect}:{active:number;onSelect:(index:number)=>void}){
 const tabs=useRef<(HTMLButtonElement|null)[]>([]);
 const onKey=(event:KeyboardEvent<HTMLDivElement>)=>{
  const next=event.key==='ArrowRight'?(active+1)%panels.length:event.key==='ArrowLeft'?(active+LAST)%panels.length:event.key==='Home'?0:event.key==='End'?LAST:-1;
  if(next<0)return;
  event.preventDefault();onSelect(next);tabs.current[next]?.focus();
 };
 return <div className="cap-tabs" role="tablist" aria-label="Famiglia di soluzioni" onKeyDown={onKey}>
  {panels.map((p,i)=><button key={p.slug} ref={node=>{tabs.current[i]=node}} type="button" role="tab" id={'cap-tab-'+p.slug} aria-selected={i===active} aria-controls="catalogo" tabIndex={i===active?0:-1} onClick={()=>onSelect(i)}><span>0{i+1}</span>{p.name}</button>)}
 </div>;
}
