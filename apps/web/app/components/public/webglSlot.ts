import {useEffect,useState} from 'react';

/**
 * One live WebGL context per public page. Scenes ask for the slot only while they are near the
 * viewport; when the owner leaves (or a route transition removes it) the waiting scene is woken.
 */
const FREE='omni:webgl-free';
let owner:string|null=null;
function claim(id:string){if(owner&&owner!==id)return false;owner=id;return true;}
function release(id:string){if(owner!==id)return;owner=null;window.dispatchEvent(new Event(FREE));}
export function useWebGLSlot(id:string,wanted:boolean){
 const [granted,setGranted]=useState(false);
 useEffect(()=>{
  if(!wanted){setGranted(false);return;}
  const sync=()=>setGranted(claim(id));
  sync();
  window.addEventListener(FREE,sync);
  return()=>{window.removeEventListener(FREE,sync);release(id);setGranted(false);};
 },[id,wanted]);
 return granted;
}
