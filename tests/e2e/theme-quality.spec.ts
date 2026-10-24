import {test,expect,type Page} from '@playwright/test';

type Pair={text:string;ratio:number;need:number;fg:string;bg:string};

/**
 * Measured WCAG 1.4.3 pairs for every visible text node under a root: computed text colour (with its alpha and the
 * opacity of its ancestors) over the first opaque background behind it, translucent layers composited on the way.
 * Large text (24px, or 18.67px bold) needs 3:1, the rest 4.5:1. A background image on the way stops the test: a flat
 * pair would then be a guess. This checks colour pairs only; it is not a compliance audit.
 */
async function contrast(page:Page,root:string):Promise<Pair[]>{
 return page.locator(root).first().evaluate(rootEl=>{
  const parse=(value:string)=>{
   const rgb=value.match(/^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/);
   if(rgb)return [+rgb[1],+rgb[2],+rgb[3],rgb[4]===undefined?1:+rgb[4]];
   const srgb=value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
   if(srgb)return [+srgb[1]*255,+srgb[2]*255,+srgb[3]*255,srgb[4]===undefined?1:+srgb[4]];
   throw new Error('Colore non misurabile: '+value);
  };
  const over=(top:number[],under:number[])=>[0,1,2].map(i=>top[i]*top[3]+under[i]*(1-top[3])).concat(1);
  const luminance=(c:number[])=>{const [r,g,b]=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
  const background=(el:Element)=>{
   const layers:number[][]=[];
   for(let node:Element|null=el;node;node=node.parentElement){
    const style=getComputedStyle(node),color=parse(style.backgroundColor);
    if(color[3]===0)continue;
    if(style.backgroundImage!=='none')throw new Error('Sfondo con immagine dietro il testo: '+node.className);
    layers.push(color);
    if(color[3]===1)break;
   }
   if(!layers.length||layers[layers.length-1][3]!==1)throw new Error('Nessuno sfondo opaco dietro '+el.className);
   return layers.reduceRight((under,top)=>over(top,under));
  };
  const pairs:Pair[]=[];
  const walker=document.createTreeWalker(rootEl,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   const text=(node.textContent||'').trim(),el=node.parentElement;
   if(!text||!el)continue;
   const style=getComputedStyle(el),rect=el.getBoundingClientRect();
   if(style.visibility!=='visible'||style.display==='none'||rect.width<1||rect.height<1||el.closest('.sr-only'))continue;
   let opacity=1;
   for(let up:Element|null=el;up;up=up.parentElement)opacity*=+getComputedStyle(up).opacity;
   const fg=parse(style.color),bg=background(el);
   const shown=over([fg[0],fg[1],fg[2],fg[3]*opacity],bg);
   const [a,b]=[luminance(shown),luminance(bg)].sort((x,y)=>y-x);
   const size=parseFloat(style.fontSize),bold=+style.fontWeight>=700;
   pairs.push({text:text.slice(0,40),ratio:Math.round((a+.05)/(b+.05)*100)/100,need:size>=24||(bold&&size>=18.66)?3:4.5,fg:style.color,bg:'rgb('+bg.slice(0,3).map(Math.round).join(',')+')'});
  }
  return pairs;
 });
}

function expectReadable(pairs:Pair[]){
 expect(pairs.length).toBeGreaterThan(3);
 expect(pairs.filter(pair=>pair.ratio<pair.need)).toEqual([]);
}

async function visit(page:Page,theme:'light'|'dark',path:string){
 await page.addInitScript(value=>{try{localStorage.setItem('omni:theme:public',value)}catch{}},theme);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(path);
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
}

for(const theme of ['light','dark'] as const){
 test(`footer text stays readable on its dark surface in the ${theme} theme`,async({page})=>{
  await visit(page,theme,'/start-project');
  const footer=page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  expectReadable(await contrast(page,'.site-footer'));
 });

 test(`mobile menu text stays readable on its dark surface in the ${theme} theme`,async({page,isMobile})=>{
  test.skip(!isMobile,'the menu button only exists on small screens');
  await visit(page,theme,'/work');
  await page.getByRole('button',{name:'Apri menu'}).click();
  const menu=page.getByRole('dialog',{name:'Menu principale'});
  await expect(menu).toBeVisible();
  try{
   // On failure the received object names who holds focus and whether the close button could take it.
   await expect.poll(()=>page.evaluate(()=>{
    const active=document.activeElement,close=document.querySelector('#site-menu>header button')!,style=getComputedStyle(close);
    return {active:active?.getAttribute('aria-label')||active?.tagName,activeClass:active?.className||'',hasFocus:document.hasFocus(),inertAncestor:close.closest('[inert]')?.className||null,visibility:style.visibility,display:style.display,open:(document.querySelector('#site-menu') as HTMLElement).dataset.open};
   })).toMatchObject({active:'Chiudi menu',hasFocus:true});
  }finally{
   // Probe for CI logs (list reporter prints console.log). It runs after the poll, even when the poll fails, so its own focus() cannot mask the failure: duplicate nodes, stale refs, or focus() failing on a touch-emulated click.
   console.log('menu-focus-probe '+theme+' '+JSON.stringify(await page.evaluate(()=>{
    const active=()=>document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName;
    const close=document.querySelector<HTMLElement>('#site-menu>header button'),activeBefore=active();
    close?.focus();
    return {menus:document.querySelectorAll('#site-menu').length,triggers:document.querySelectorAll('button[aria-label="Apri menu"]').length,activeBefore,focusResult:active(),inert:!!close?.closest('[inert]'),isConnected:close?.isConnected};
   })));
  }
  // A native focus default or another control must not leave an aria-modal panel's focus outside it.
  await page.getByRole('button',{name:'Apri menu'}).focus();
  await expect(menu.getByRole('button',{name:'Chiudi menu'})).toBeFocused();
  expectReadable(await contrast(page,'#site-menu'));
  const outside=await menu.locator('a,small,p,.wordmark').evaluateAll(els=>els.filter(el=>{const r=el.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5}).map(el=>el.textContent));
  expect(outside).toEqual([]);
  await page.keyboard.press('Shift+Tab');
  await expect(menu.getByRole('link',{name:'Parliamone ↗'})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Chiudi menu'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.getByRole('button',{name:'Apri menu'})).toBeFocused();
  // Reopening by keyboard and touch must obey the same focus contract as the mouse click above.
  await page.keyboard.press('Enter');
  await expect(menu.getByRole('button',{name:'Chiudi menu'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Apri menu'})).toBeFocused();
  await page.getByRole('button',{name:'Apri menu'}).tap();
  await expect(menu.getByRole('button',{name:'Chiudi menu'})).toBeFocused();
  await menu.getByRole('button',{name:'Chiudi menu'}).tap();
  await expect(menu).toBeHidden();
  await expect(page.getByRole('button',{name:'Apri menu'})).toBeFocused();
 });

 // The accessibility contract: keyboard opening (focus the trigger, press Enter) lands focus on "Chiudi menu".
 test(`mobile menu opened from the keyboard moves focus to the close button in the ${theme} theme`,async({page,isMobile})=>{
  test.skip(!isMobile,'the menu button only exists on small screens');
  await visit(page,theme,'/work');
  await page.getByRole('button',{name:'Apri menu'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:'Menu principale'}).getByRole('button',{name:'Chiudi menu'})).toBeFocused();
 });
}

test('footer contacts reflow inside narrow phones without clipping or breaking the address',async({page,isMobile})=>{
 test.skip(!isMobile,'the clipped contact column is a phone layout');
 await visit(page,'light','/start-project');
 for(const width of [320,375,390]){
  await page.setViewportSize({width,height:740});
  const footer=page.locator('.site-footer');
  await footer.scrollIntoViewIfNeeded();
  const layout=await footer.evaluate(el=>{
   const edge=document.documentElement.clientWidth;
   const outside=Array.from(el.querySelectorAll('a,small,span,p')).filter(child=>{const r=child.getBoundingClientRect();return r.width>0&&(r.left<-.5||r.right>edge+.5)}).map(child=>child.textContent);
   const mail=el.querySelector('a[href^="mailto:"]')!,range=document.createRange();
   range.selectNodeContents(mail);
   const lines=new Set(Array.from(range.getClientRects()).map(r=>Math.round(r.top))).size;
   const smallest=(selector:string)=>Math.min(...Array.from(el.querySelectorAll(selector)).map(node=>parseFloat(getComputedStyle(node).fontSize)));
   return {outside,lines,scroll:document.documentElement.scrollWidth,edge,mail:mail.textContent,links:smallest('.footer-links a'),legal:smallest('.footer-bottom span,.footer-bottom a')};
  });
  expect(layout.outside,`a ${width}px`).toEqual([]);
  expect(layout.links,`link del footer a ${width}px`).toBeGreaterThanOrEqual(14);
  expect(layout.legal,`testo legale a ${width}px`).toBeGreaterThanOrEqual(12);
  expect(layout.lines,`email su una riga a ${width}px`).toBe(1);
  expect(layout.scroll).toBeLessThanOrEqual(layout.edge);
  expect(layout.mail).toContain('info@omni101.app');
 }
});

test('intake text entry is 16px on phones while captions keep their size',async({page,isMobile})=>{
 test.skip(!isMobile,'the 16px entry size is the phone rule');
 await visit(page,'light','/start-project');
 const sizes=await page.locator('.intake-form').evaluate(form=>{
  const visible=(el:Element)=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility==='visible'};
  const fields=Array.from(form.querySelectorAll('input,select,textarea')).filter(el=>!['checkbox','radio','hidden'].includes((el as HTMLInputElement).type)&&visible(el));
  return {fields:fields.map(el=>parseFloat(getComputedStyle(el).fontSize)),consent:parseFloat(getComputedStyle(form.querySelector('.consent')!).fontSize)};
 });
 expect(sizes.fields.length).toBeGreaterThanOrEqual(3);
 expect(sizes.fields.every(size=>size>=16)).toBe(true);
 expect(sizes.consent).toBeLessThan(16);
});
