import {useLocation} from 'react-router';
import * as m from '../../../paraglide/messages.js';
import {baseLocale,locales,type Locale} from '../../../paraglide/runtime.js';
export type {Locale};
export type Key=keyof typeof m;
type Msg=(inputs?:Record<string,string|number>,options?:{locale?:Locale})=>string;
const table=m as unknown as Record<string,Msg>;
/** Message by key for an explicit locale. The locale always comes from the route, never from global state, so concurrent Worker requests cannot mix languages. */
export const t=(key:Key,locale:Locale,inputs?:Record<string,string|number>)=>table[key](inputs,{locale});
const clean=(path:string)=>path.split(/[?#]/)[0];
/** `/` is the base locale (it); `/en` and `/en/*` are English. A new locale only needs a messages file and an entry in project.inlang. */
export function localeFromPath(path:string):Locale{const seg=clean(path).split('/')[1];return (locales as readonly string[]).includes(seg)&&seg!==baseLocale?seg as Locale:baseLocale}
export function stripLocale(path:string){const l=localeFromPath(path);if(l===baseLocale)return path;const rest=path.slice(l.length+1);return rest===''||rest[0]==='#'||rest[0]==='?'?'/'+rest:rest}
export function localePath(path:string,locale:Locale){if(locale===baseLocale)return path;return '/'+locale+(path==='/'?'':path[0]==='/'&&(path[1]==='#'||path[1]==='?')?path.slice(1):path)}
export const useLocale=()=>localeFromPath(useLocation().pathname);
/** The switcher lands on the home page of the other language: `/` and `/en` are the only pages that exist in both so far. */
export const switchPath=(target:Locale)=>localePath('/',target);
/** Link label plus "(Italian)" when the target page exists only in the base language. */
export const flagged=(label:string,href:string,locale:Locale)=>localeFromPath(href)===locale?label:label+' '+t('shell_italian_only',locale);
type Nav={to:string;label:Key;phrase:Key};
const SOL:Nav={to:'/solutions',label:'shell_nav_solutions',phrase:'shell_menu_solutions_phrase'};
const WORK:Nav={to:'/work',label:'shell_nav_work',phrase:'shell_menu_work_phrase'};
const EXPLORE:Nav={to:'/explore',label:'shell_nav_explore',phrase:'shell_menu_explore_phrase'};
const STUDIO:Nav={to:'/studio',label:'shell_nav_studio',phrase:'shell_menu_studio_phrase'};
const NOTES:Nav={to:'/insights',label:'shell_nav_insights',phrase:'shell_menu_insights_phrase'};
const NAV:Record<Locale,Nav[]>={it:[SOL,WORK,EXPLORE,STUDIO],en:[{...SOL,to:'/en#en-offers'},WORK,EXPLORE,STUDIO]};
export const navLinks=(l:Locale)=>NAV[l];
export const menuItems=(l:Locale):Nav[]=>[...NAV[l],NOTES,{to:l===baseLocale?'/start-project':localePath('/#mini-demo',l),label:'shell_menu_start',phrase:'shell_menu_start_phrase'}];
export const headerAction=(l:Locale)=>l===baseLocale?'/start-project':localePath('/#mini-demo',l);
/** Route announcement for the live region. Offer pages announce the offer name. */
const ROUTES:Record<string,Key>={'/':'route_home','/solutions':'route_solutions','/explore':'route_explore','/explore/avatar':'route_explore_avatar','/explore/software':'route_explore_software','/explore/voice':'route_explore_voice','/explore/vision':'route_explore_vision','/explore/creative':'route_explore_creative','/explore/workflow':'route_explore_workflow','/explore/commerce':'route_explore_commerce','/work':'route_work','/studio':'route_studio','/start-project':'route_start_project','/contact':'route_contact','/insights':'route_insights','/privacy':'route_privacy','/terms':'route_terms'};
export function routeLabel(pathname:string,locale:Locale){const p=stripLocale(clean(pathname));if(locale!==baseLocale&&p==='/')return t('route_landing',locale);const offer=p.match(/^\/offers\/([\w-]+)$/);if(offer){const k=('offer_'+offer[1].replace(/-/g,'_')+'_name') as Key;if(k in m)return t(k,locale)}return t(ROUTES[p]??'route_default',locale)}
