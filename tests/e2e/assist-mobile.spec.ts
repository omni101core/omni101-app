import {test,expect,type Page} from '@playwright/test';

type Box={x:number;y:number;width:number;height:number;name:string};

/** Border box plus the painted focus ring. An unfocused control adds nothing. */
async function rings(page:Page,selector:string):Promise<Box[]>{
 return page.locator(selector).evaluateAll(els=>els.flatMap(el=>{
  const story=el.closest('.cinema-static-story');
  if(story){
   const storyStyle=getComputedStyle(story);
   if(storyStyle.position==='absolute'||storyStyle.clipPath!=='none')return [];
  }
  const style=getComputedStyle(el);
  const rect=el.getBoundingClientRect();
  if(style.display==='none'||style.visibility==='hidden'||rect.width<2||rect.height<2)return [];
  if(rect.bottom<=0||rect.top>=innerHeight||rect.right<=0||rect.left>=innerWidth)return [];
  const width=style.outlineStyle==='none'?0:Number.parseFloat(style.outlineWidth)||0;
  const offset=Number.parseFloat(style.outlineOffset)||0;
  const pad=width+Math.max(0,offset);
  const name=(el.getAttribute('aria-label')||el.textContent||'').replace(/\s+/g,' ').trim().slice(0,48);
  return [{x:rect.x-pad,y:rect.y-pad,width:rect.width+pad*2,height:rect.height+pad*2,name}];
 }));
}

function overlaps(a:Box,b:Box){
 return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
}

async function assertClear(page:Page){
 const launch=await rings(page,'.omni-assist-launch');
 const commands=await rings(page,'.cinema-experience button, .cinema-experience a, .cinema-experience input, .cinema-experience select, .cinema-experience textarea');
 expect(launch).toHaveLength(1);
 expect(commands.length).toBeGreaterThan(0);
 const hit=commands.find(command=>overlaps(launch[0],command));
 expect(hit,hit?launch[0].name+' copre '+hit.name:undefined).toBeUndefined();
}

async function showCinema(page:Page){
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const cinema=page.locator('.cinema-experience').first();
 await cinema.scrollIntoViewIfNeeded();
 await expect(cinema).toBeVisible();
 await expect(page.getByRole('button',{name:'OMNI ASSIST',exact:true})).toBeVisible();
}

test('assistant trigger stays clear of visible cinema controls on a small screen',async({page,isMobile},testInfo)=>{
 test.skip(!isMobile,'The chapter dock overlap is the narrow viewport');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:320,height:640});
 await showCinema(page);
 const tabs=page.getByRole('navigation',{name:'Capitoli dell’esperienza'}).getByRole('button');
 await expect(tabs.first()).toBeVisible();
 const count=await tabs.count();
 for(let index=0;index<count;index++){
  const tab=tabs.nth(index);
  const tabBox=await tab.boundingBox();
  if(!tabBox||tabBox.x<0||tabBox.x+tabBox.width/2>320)continue;
  await tab.click();
 }
 await expect(page.locator('.omni-assist-dialog')).not.toBeVisible();
 await assertClear(page);
 const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});
 const box=await launch.boundingBox();
 expect(box).toBeTruthy();
 expect(box!.width).toBeLessThanOrEqual(160);
 expect(box!.height).toBeLessThanOrEqual(36);
 expect(640-(box!.y+box!.height)).toBeGreaterThanOrEqual(64);
 await tabs.last().focus();
 await page.keyboard.press('Tab');
 await page.keyboard.press('Shift+Tab');
 await expect(tabs.last()).toBeFocused();
 await assertClear(page);
 await launch.focus();
 await page.keyboard.press('Shift+Tab');
 await page.keyboard.press('Tab');
 await expect(launch).toBeFocused();
 await assertClear(page);
 await page.screenshot({path:'test-results/assist-mobile-tabs-'+testInfo.project.name+'.png'});
});

test('reduced motion keeps the assistant trigger off the visible cinema commands',async({page,isMobile},testInfo)=>{
 test.skip(!isMobile,'The chapter dock overlap is the narrow viewport');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:320,height:640});
 await showCinema(page);
 await expect(page.locator('nav[aria-label="Capitoli dell’esperienza"]')).toBeHidden();
 await assertClear(page);
 const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});
 await launch.focus();
 const y=await page.evaluate(()=>window.scrollY);
 await page.keyboard.press('Shift+Tab');
 await page.keyboard.press('Tab');
 await expect(launch).toBeFocused();
 await page.evaluate(top=>window.scrollTo(0,top),y);
 await assertClear(page);
 const link=page.locator('.cinema-experience a').first();
 await link.focus();
 await page.keyboard.press('Shift+Tab');
 await page.keyboard.press('Tab');
 await expect(link).toBeFocused();
 await page.evaluate(top=>window.scrollTo(0,top),y);
 await assertClear(page);
 await page.screenshot({path:'test-results/assist-mobile-reduced-'+testInfo.project.name+'.png'});
});
