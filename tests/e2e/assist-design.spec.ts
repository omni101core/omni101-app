import {test,expect,type Page} from '@playwright/test';

/** WCAG relative luminance of an `rgb()`/`rgba()` computed colour. */
function contrast(a:string,b:string){
 const lum=(c:string)=>{
  const [r,g,bl]=(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number).map(v=>{const x=v/255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;});
  return .2126*r+.7152*g+.0722*bl;
 };
 const [hi,lo]=[lum(a),lum(b)].sort((x,y)=>y-x);
 return (hi+.05)/(lo+.05);
}

async function openAssist(page:Page){
 await page.route('**/api/assistant/conversations?*',route=>route.fulfill({json:{conversations:[]}}));
 await page.goto('/start-project');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 return page.getByRole('button',{name:'OMNI ASSIST',exact:true});
}

test('assist launcher keeps AA contrast in light and dark',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Design contract is exercised once with explicit viewports.');
 const launch=await openAssist(page);
 for(const theme of ['light','dark']){
  await page.evaluate(value=>{localStorage.setItem('omni:theme:public',value);document.documentElement.dataset.theme=value},theme);
  await expect(launch).toBeVisible();
  const style=await launch.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color,sub:getComputedStyle(el.querySelector('span')!).color}));
  expect(contrast(style.fg,style.bg),theme+' testo').toBeGreaterThanOrEqual(4.5);
  expect(contrast(style.sub,style.bg),theme+' secondario').toBeGreaterThanOrEqual(4.5);
  const box=await launch.boundingBox();expect(box!.height).toBeGreaterThanOrEqual(44);
 }
});

test('assist is a bottom sheet at 375 with no overflow and a 16px composer',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','Design contract is exercised once with explicit viewports.');
 await page.setViewportSize({width:375,height:667});
 const launch=await openAssist(page);
 await launch.click();
 const panel=page.getByRole('dialog',{name:'OMNI ASSIST AI',exact:true});
 const input=panel.getByRole('textbox',{name:'Descrivi la tua idea',exact:true});
 await expect(input).toBeFocused();
 const box=await panel.boundingBox();
 expect(box!.x).toBe(0);expect(box!.width).toBe(375);
 expect(box!.height).toBeGreaterThanOrEqual(667*.85);
 expect(box!.y+box!.height).toBeLessThanOrEqual(667);
 expect(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 expect(await panel.locator('.omni-assist-body').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await input.evaluate(el=>Number.parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
 for(const name of ['Nuova conversazione','Chiudi assistente']){
  const control=await panel.getByRole('button',{name,exact:true}).boundingBox();
  expect(control!.width).toBeGreaterThanOrEqual(44);expect(control!.height).toBeGreaterThanOrEqual(44);
  expect(control!.x+control!.width).toBeLessThanOrEqual(375);
 }
 await panel.getByRole('button',{name:'Chiudi assistente',exact:true}).click();
 await expect(panel).not.toBeVisible();await expect(launch).toBeFocused();
});
