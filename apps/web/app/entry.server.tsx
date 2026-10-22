import type {AppLoadContext,EntryContext} from 'react-router';
import {ServerRouter} from 'react-router';
import {renderToReadableStream} from 'react-dom/server';
import {isbot} from 'isbot';
export default async function handleRequest(request:Request,status:number,headers:Headers,context:EntryContext,_load:AppLoadContext){
 const stream=await renderToReadableStream(<ServerRouter context={context} url={request.url}/>,{onError(){status=500}});
 if(isbot(request.headers.get('user-agent')||''))await stream.allReady;
 headers.set('Content-Type','text/html; charset=utf-8');
 return new Response(stream,{status,headers});
}
