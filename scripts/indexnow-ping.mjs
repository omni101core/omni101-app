#!/usr/bin/env node
// Sends every URL of the live sitemap to IndexNow. Run by the publisher after a release, never by a worker.
// Usage: node scripts/indexnow-ping.mjs [--dry]   (--dry prints the payload and sends nothing)
import {readdirSync} from 'node:fs';
const origin='https://omni101.app',publicDir=new URL('../apps/web/public/',import.meta.url);
// The key file is public/<32 hex chars>.txt and holds the same key; it is not a secret.
const key=readdirSync(publicDir).map(f=>f.match(/^([0-9a-f]{32})\.txt$/)?.[1]).find(Boolean);
if(!key){console.error('IndexNow key file missing in apps/web/public');process.exit(1)}
const res=await fetch(origin+'/sitemap.xml');
if(!res.ok){console.error('sitemap.xml answered '+res.status);process.exit(1)}
const urlList=[...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
if(!urlList.length){console.error('sitemap.xml has no URLs');process.exit(1)}
const body={host:new URL(origin).host,key,keyLocation:origin+'/'+key+'.txt',urlList};
if(process.argv.includes('--dry')){console.log(JSON.stringify(body,null,1));process.exit(0)}
const r=await fetch('https://api.indexnow.org/IndexNow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify(body)});
console.log('IndexNow '+r.status+' for '+urlList.length+' URLs');
process.exit(r.status===200||r.status===202?0:1);
