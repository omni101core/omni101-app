import {test,expect,type Page} from '@playwright/test';

async function arm(page:Page){
 const remote:string[]=[];
 page.on('request',request=>{const url=request.url();if(/mediapipe|gesture_recognizer/.test(url))remote.push(url)});
 await page.addInitScript(()=>{
  const host=window as unknown as {__omniCalls:string[];SpeechRecognition?:new()=>unknown;webkitSpeechRecognition?:new()=>unknown};
  host.__omniCalls=[];
  const note=(name:string)=>host.__omniCalls.push(name);
  if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=async()=>{note('getUserMedia');throw new DOMException('blocked','NotAllowedError')};
  (['SpeechRecognition','webkitSpeechRecognition'] as const).forEach(key=>{
   const Original=host[key];
   if(!Original)return;
   host[key]=function(){note(key);return new Original()} as unknown as new()=>unknown;
  });
 });
 return remote;
}

test('vision loads with manual controls and does not ask for the camera',async({page})=>{
 const remote=await arm(page);
 await page.goto('/explore/vision');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.getByRole('heading',{level:1})).toContainText('Le mani diventano interfaccia');
 await expect(page.locator('.vision-lab').getByRole('status')).toContainText('Videocamera spenta');
 await page.getByRole('button',{name:'BUILD',exact:true}).focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('button',{name:'AUTOMATE',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.keyboard.press('ArrowLeft');
 await expect(page.getByRole('button',{name:'BUILD',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Prossima possibilità'}).click();
 await expect(page.getByRole('button',{name:'AUTOMATE',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByLabel('Rotazione manuale').press('End');
 await expect(page.locator('.vision-object')).toHaveAttribute('style',/rotateY\(120deg\)/);
 expect(await page.evaluate(()=>(window as unknown as {__omniCalls:string[]}).__omniCalls)).toEqual([]);
 expect(remote).toEqual([]);
});

test('voice text fallback navigates the demo without the microphone',async({page})=>{
 await arm(page);
 await page.goto('/explore/voice');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.getByRole('heading',{level:1})).toContainText('Dillo, oppure scrivilo');
 await expect(page.locator('.voice-demo').getByRole('status')).toContainText(/microfono spento/i);
 await page.getByLabel('Comando di testo').fill('apri commerce');
 await page.getByRole('button',{name:'Esegui comando'}).click();
 await expect(page.getByRole('region',{name:/commerce/i})).toBeVisible();
 await expect(page.getByRole('region',{name:/commerce/i})).toContainText('Nessun prezzo da pagare');
 await page.getByLabel('Comando di testo').fill('mostrami i servizi');
 await page.getByRole('button',{name:'Esegui comando'}).click();
 await expect(page.getByRole('region',{name:/servizi/i})).toBeVisible();
 await expect(page.getByRole('link',{name:'Apri Build'})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {__omniCalls:string[]}).__omniCalls)).toEqual([]);
});

test('reduced motion keeps vision and voice usable without permission prompts',async({page})=>{
 await arm(page);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/explore/vision');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.getByRole('button',{name:'Avvia videocamera'})).toBeVisible();
 await expect(page.getByLabel('Rotazione manuale')).toBeVisible();
 await page.goto('/explore/voice');
 await expect(page.getByLabel('Comando di testo')).toBeVisible();
 await expect(page.getByRole('button',{name:'Ascolta il pannello'})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {__omniCalls:string[]}).__omniCalls)).toEqual([]);
});

test('permissions policy opens the microphone only on voice and the camera only on vision',async({request})=>{
 const policy=async(path:string)=>(await request.get(path)).headers()['permissions-policy'];
 expect(await policy('/explore/voice')).toBe('camera=(), microphone=(self), geolocation=()');
 expect(await policy('/explore/vision')).toBe('camera=(self), microphone=(), geolocation=()');
 for(const path of ['/','/explore','/explore/commerce','/solutions'])expect(await policy(path)).toBe('camera=(), microphone=(), geolocation=()');
});
