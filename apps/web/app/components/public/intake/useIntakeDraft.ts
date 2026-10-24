import {useEffect,useRef,useState} from 'react';
import {clearLocal,clearRemote,isEmpty,loadLocal,loadRemote,saveLocal,saveRemote,type IntakeDraft} from './intake-draft';
type Status='idle'|'saved'|'error';
/** Autosave to this device (and to the server once a resume link exists); restore on mount. Never submits anything. */
export function useIntakeDraft(draft:IntakeDraft,apply:(d:IntakeDraft)=>void){
 const [token,setToken]=useState(''),[link,setLink]=useState(''),[status,setStatus]=useState<Status>('idle'),[restored,setRestored]=useState(false);
 const ready=useRef(false),applyRef=useRef(apply);applyRef.current=apply;
 useEffect(()=>{let off=false;(async()=>{
  const q=new URLSearchParams(window.location.search),t=q.get('riprendi');let d:IntakeDraft|null=null;
  if(t){try{d=await loadRemote(t);if(d&&!off)setToken(t)}catch{}}
  // ?brief= (assistant hand-off) wins over any saved draft.
  if(!d&&!q.has('brief'))d=loadLocal();
  if(off)return;
  if(d&&!isEmpty(d)){applyRef.current(d);setRestored(true)}
  ready.current=true;
 })();return()=>{off=true}},[]);
 const key=JSON.stringify(draft);
 useEffect(()=>{if(!ready.current)return;const h=setTimeout(()=>{
  if(isEmpty(draft)){clearLocal();setStatus('idle');return}
  saveLocal(draft);setStatus('saved');
  if(token)saveRemote(draft,token).catch(()=>setStatus('error'));
 },600);return()=>clearTimeout(h)},[key,token]);
 return {
  status,restored,link,
  async createLink(){try{const t=await saveRemote(draft,token);setToken(t);const u=window.location.origin+window.location.pathname+'?riprendi='+t;setLink(u);try{await navigator.clipboard.writeText(u)}catch{}setStatus('saved')}catch{setStatus('error')}},
  /** After a successful submit: the request is stored, the draft is not needed any more. */
  finish(){clearLocal();if(token)clearRemote(token).catch(()=>{});setToken('');setLink('')},
 };
}
