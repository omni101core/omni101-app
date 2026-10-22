import {createRequestHandler} from 'react-router';
import {handleApi} from '../app/server/api';
import type {Env} from '../app/server/auth';
declare module 'react-router' {interface AppLoadContext {cloudflare:{env:Env;ctx:ExecutionContext}}}
const handler=createRequestHandler(()=>import('virtual:react-router/server-build'),import.meta.env.MODE);
export default {async fetch(request:Request,env:Env,ctx:ExecutionContext){
 const api=await handleApi(request,env); if(api)return api;
 const response=await handler(request,{cloudflare:{env,ctx}});
 const headers=new Headers(response.headers);
 headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(new URL(request.url).pathname.startsWith('/admin')||new URL(request.url).pathname.startsWith('/portal'))headers.set('Cache-Control','no-store');
 return new Response(response.body,{status:response.status,headers});
}} satisfies ExportedHandler<Env>;
