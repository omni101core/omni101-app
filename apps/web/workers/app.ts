import {indexPolicy} from '../app/server/public-seo';
import {executeWorkflowRun} from '../app/server/workflow-runtime';
import {WorkflowEntrypoint,type WorkflowEvent,type WorkflowStep} from 'cloudflare:workers';
import {processIntakeAI} from '../app/server/intake-workflow';
import {createRequestHandler} from 'react-router';
import {handleApi} from '../app/server/api';
import type {Env} from '../app/server/auth';
import {permissionsPolicy} from '../app/server/permissions';
declare module 'react-router' {interface AppLoadContext {cloudflare:{env:Env;ctx:ExecutionContext}}}
const handler=createRequestHandler(()=>import('virtual:react-router/server-build'),import.meta.env.MODE);
export default {async fetch(request:Request,env:Env,ctx:ExecutionContext){
 const api=await handleApi(request,env);
 const response=api||await handler(request,{cloudflare:{env,ctx}});
 const headers=new Headers(response.headers);
 headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');headers.set('Permissions-Policy',permissionsPolicy(new URL(request.url).pathname));
 const indexing=indexPolicy(new URL(request.url).pathname,env.ENVIRONMENT,response.status);if(indexing)headers.set('X-Robots-Tag',indexing);
 if(new URL(request.url).pathname.startsWith('/admin')||new URL(request.url).pathname.startsWith('/portal'))headers.set('Cache-Control','no-store');
 return new Response(response.body,{status:response.status,headers});
}} satisfies ExportedHandler<Env>;

export class LeadIntakeWorkflow extends WorkflowEntrypoint<Env,{leadId:string;orgId:string}>{async run(event:WorkflowEvent<{leadId:string;orgId:string}>,step:WorkflowStep){return await step.do("classify-and-brief",{retries:{limit:1,delay:"10 seconds",backoff:"exponential"},timeout:"1 minute"},()=>processIntakeAI(this.env,event.payload.leadId,event.payload.orgId))}}

export class AgencyWorkflow extends WorkflowEntrypoint<Env,{runId:string;orgId:string}>{async run(event:WorkflowEvent<{runId:string;orgId:string}>,step:WorkflowStep){return executeWorkflowRun(this.env,event.payload.runId,event.payload.orgId,step)}}
