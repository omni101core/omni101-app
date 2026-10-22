import {useEffect,useState} from 'react';

export type ThemeScope='public'|'workspace';
export function applyTheme(scope:ThemeScope){
 let theme=scope==='public'?'light':'dark';
 try{const saved=localStorage.getItem('omni:theme:'+scope);if(saved==='light'||saved==='dark')theme=saved}catch{/* Storage can be unavailable in private sessions. */}
 document.documentElement.dataset.theme=theme;
 document.documentElement.dataset.themeScope=scope;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='light'?'#f5f1e9':'#101112');
 return theme;
}
export function ThemeToggle({scope='public'}:{scope?:ThemeScope}){
 const [theme,setTheme]=useState(scope==='public'?'light':'dark');
 useEffect(()=>{const update=()=>setTheme(applyTheme(scope));update();window.addEventListener('omni:theme',update);window.addEventListener('storage',update);return()=>{window.removeEventListener('omni:theme',update);window.removeEventListener('storage',update)}},[scope]);
 return <button type="button" className="theme-toggle" aria-label={theme==='light'?'Attiva tema scuro':'Attiva tema chiaro'} aria-pressed={theme==='dark'} onClick={()=>{const next=theme==='light'?'dark':'light';try{localStorage.setItem('omni:theme:'+scope,next)}catch{}document.documentElement.dataset.theme=next;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',next==='light'?'#f5f1e9':'#101112');setTheme(next);/* Local state also works when browser storage is blocked. */}}><span aria-hidden="true">{theme==='light'?'◐':'◑'}</span><span className="sr-only">Tema {theme==='light'?'chiaro':'scuro'}</span></button>;
}
