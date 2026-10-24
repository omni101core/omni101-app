#!/usr/bin/env node
// Checks apps/web/messages/*.json against the base locale. Exit 1 on any problem. Stdlib only.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';

const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join(',');
const hasWord=(s,w)=>new RegExp('(^|[^A-Za-z0-9])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^A-Za-z0-9])').test(s);
const MIN_LEN=12,MIN_RATIO=0.4,MAX_RATIO=2.5,UNTRANSLATED_LEN=25;

/** Returns a list of problem strings. `messages` maps locale to {key:value}; `$`-prefixed keys are metadata. */
export function check({baseLocale,locales,messages,glossary}){
 const out=[],base=messages[baseLocale]??{},keys=Object.keys(base).filter(k=>k[0]!=='$'),sigs=glossary?.signatures??[];
 for(const l of locales){
  if(l===baseLocale)continue;
  const cur=messages[l]??{};
  for(const k of keys){
   const b=base[k],v=cur[k];
   if(v===undefined){out.push(`${l}: missing key ${k}`);continue}
   if(typeof v!=='string'||v.trim()===''){out.push(`${l}: empty value ${k}`);continue}
   if(placeholders(b)!==placeholders(v))out.push(`${l}: placeholders differ in ${k} (${placeholders(b)||'none'} vs ${placeholders(v)||'none'})`);
   for(const s of sigs)if(hasWord(b,s)!==hasWord(v,s))out.push(`${l}: signature "${s}" altered in ${k}`);
   if(b.length>=MIN_LEN){const r=v.length/b.length;if(r<MIN_RATIO||r>MAX_RATIO)out.push(`${l}: suspicious length in ${k} (${v.length} vs ${b.length} chars)`)}
   if(v===b&&b.length>=UNTRANSLATED_LEN&&/[a-z]/i.test(sigs.reduce((x,w)=>x.split(w).join(''),b)))out.push(`${l}: ${k} is identical to ${baseLocale}, likely untranslated`);
  }
  for(const k of Object.keys(cur))if(k[0]!=='$'&&!(k in base))out.push(`${l}: extra key ${k} not in ${baseLocale}`);
 }
 return out;
}

export function load(dir){
 const settings=JSON.parse(readFileSync(join(dir,'project.inlang/settings.json'),'utf8'));
 const messages={};
 for(const l of settings.locales)messages[l]=JSON.parse(readFileSync(join(dir,'messages',l+'.json'),'utf8'));
 return {baseLocale:settings.baseLocale,locales:settings.locales,messages,glossary:JSON.parse(readFileSync(join(dir,'messages/glossary.json'),'utf8'))};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const problems=check(load(resolve(fileURLToPath(import.meta.url),'../../apps/web')));
 if(problems.length){console.error(problems.join('\n')+`\n${problems.length} i18n problem(s)`);process.exit(1)}
 console.log('i18n ok');
}
