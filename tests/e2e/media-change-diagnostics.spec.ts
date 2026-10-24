import {test,expect} from '@playwright/test';
const probe="(()=>{\n const records=[];window.__omniMediaProbe=records;\n const original=window.matchMedia.bind(window);\n window.matchMedia=query=>{\n  const mq=original(query);if(!query.includes('prefers-reduced-motion'))return mq;\n  const record={id:records.length+1,query,initial:mq.matches,created:performance.now(),adds:[],removes:0,calls:[]};records.push(record);\n  const add=mq.addEventListener.bind(mq),remove=mq.removeEventListener.bind(mq),mapped=new Map();\n  mq.addEventListener=(type,listener,options)=>{\n   if(type!=='change'||!listener)return add(type,listener,options);\n   record.adds.push({name:listener.name||'object',at:performance.now(),caller:(new Error().stack||'').split('\\n').slice(2,4)});\n   let wrapped=mapped.get(listener);\n   if(!wrapped){wrapped=function(event){record.calls.push({matches:event.matches,current:mq.matches,at:performance.now()});return typeof listener==='function'?listener.call(mq,event):listener.handleEvent(event)};mapped.set(listener,wrapped)}\n   return add(type,wrapped,options);\n  };\n  mq.removeEventListener=(type,listener,options)=>{if(type==='change'){record.removes++;return remove(type,mapped.get(listener)||listener,options)}return remove(type,listener,options)};\n  return mq;\n };\n})();";
for(const instrumented of [false,true])test('media change diagnostics '+(instrumented?'instrumented':'plain'),async({page},testInfo)=>{
 if(instrumented)await page.addInitScript({content:probe});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('.omni-reel')).toHaveAttribute('data-reel-phase','expanded');
 await page.emulateMedia({reducedMotion:'reduce'});
 try{await expect(page.locator('.omni-reel')).toHaveClass(/reel-reduced/)}finally{
  const result=await page.evaluate(()=>({at:performance.now(),reel:document.querySelector('.omni-reel')?.className,cinema:document.querySelector('.cinema-experience')?.className,visibility:document.visibilityState,cssReduce:matchMedia('(prefers-reduced-motion: reduce)').matches,records:(window as unknown as {__omniMediaProbe?:unknown[]}).__omniMediaProbe||[]}));
  console.log('MEDIA_PROBE',JSON.stringify({instrumented,project:testInfo.project.name,...result}));
  await testInfo.attach('media-probe',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 }
});
