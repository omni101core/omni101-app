import {test,expect,type Page} from '@playwright/test';

type Box={x:number;y:number;width:number;height:number;name:string};

/** Border box plus the painted focus ring. An unfocused control adds nothing. */
async function rings(page:Page,selector:string):Promise<Box[]>{
 return page.locator(selector).evaluateAll(els=>els.flatMap(el=>{
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

/** Measure at rest: a smooth scroll still in flight makes the overlap depend on the frame. */
async function settle(page:Page){
 await expect.poll(async()=>{const a=await page.evaluate(()=>window.scrollY);await page.waitForTimeout(150);return a===await page.evaluate(()=>window.scrollY)}).toBe(true);
}

async function assertClear(page:Page){
 await settle(page);
 const launch=await rings(page,'.omni-assist-launch');
 const commands=await rings(page,'#capitolo button, #capitolo a, #capitolo input, #capitolo select, #capitolo textarea');
 expect(launch).toHaveLength(1);
 expect(commands.length).toBeGreaterThan(0);
 const hit=commands.find(command=>overlaps(launch[0],command));
 expect(hit,hit?launch[0].name+' copre '+hit.name:undefined).toBeUndefined();
}

async function showChapter(page:Page){
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const chapter=page.locator('#capitolo');
 await chapter.scrollIntoViewIfNeeded();
 await expect(chapter).toBeVisible();
 await expect(page.getByRole('button',{name:'OMNI ASSIST',exact:true})).toBeVisible();
}

/** The chapter has no dock any more: the launcher only has to stay clear of the cards' links and demo controls. */
async function walkLinks(page:Page){
 const links=page.locator('#capitolo .capitolo-cards footer a');
 const count=await links.count();
 expect(count).toBeGreaterThan(2);
 for(let index=0;index<count;index++){
  await links.nth(index).focus();
  await assertClear(page);
 }
 return links;
}

for(const motion of ['no-preference','reduce'] as const){
 test('assistant trigger stays clear of the chapter cards on a small screen, motion '+motion,async({page,isMobile},testInfo)=>{
  test.skip(!isMobile,'The launcher overlap is the narrow viewport');
  await page.emulateMedia({reducedMotion:motion});
  await page.setViewportSize({width:320,height:640});
  await showChapter(page);
  await expect(page.locator('.omni-assist-dialog')).not.toBeVisible();
  const links=await walkLinks(page);
  await assertClear(page);
  const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});
  const box=await launch.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.width).toBeLessThanOrEqual(160);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeLessThanOrEqual(48);
  expect(640-(box!.y+box!.height)).toBeGreaterThanOrEqual(14);
  const last=links.last();
  await last.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await assertClear(page);
  await launch.focus();
  await expect(launch).toBeFocused();
  await settle(page);
  const y=await page.evaluate(()=>window.scrollY);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(launch).toBeFocused();
  await page.evaluate(top=>window.scrollTo(0,top),y);
  await assertClear(page);
  await page.screenshot({path:'test-results/assist-mobile-capitolo-'+motion+'-'+testInfo.project.name+'.png'});
 });
}
