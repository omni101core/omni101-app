import {test,expect} from '@playwright/test';

test('home adapts to reduced-motion changes without reload or lost navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 const hero=page.locator('.omni-reel');
 // Exercise a preference change after the reel accepts a real keyboard action, independently of root hydration.
 await page.keyboard.press('Escape');
 await expect(hero).toHaveAttribute('data-reel-phase','expanded');
 // CI probe: a fresh listener records the media event. The class assertion stays.
 await page.evaluate(() => {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  const read = () => ({matches:mq.matches,hidden:document.hidden,visibility:document.visibilityState,reel:document.querySelector('.omni-reel')?.className||'',phase:document.querySelector('.omni-reel')?.getAttribute('data-reel-phase')||'',cinema:document.querySelector('.cinema-experience')?.className||''});
  const hits:{eventMatches:boolean;listMatches:boolean;reel:string}[] = [];
  const on = (event:MediaQueryListEvent) => {hits.push({eventMatches:event.matches,listMatches:mq.matches,reel:document.querySelector('.omni-reel')?.className||''})};
  mq.addEventListener('change', on);
  (window as unknown as {__omniMotionProbe?:unknown}).__omniMotionProbe = {before:read(),hits,on};
 });
 await page.emulateMedia({reducedMotion:'reduce'});
 const probe = await page.evaluate(() => {
  const bag = (window as unknown as {__omniMotionProbe:{before:unknown;hits:unknown[];on:(event:MediaQueryListEvent)=>void}}).__omniMotionProbe;
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  mq.removeEventListener('change', bag.on);
  const now = {matches:mq.matches,hidden:document.hidden,visibility:document.visibilityState,reel:document.querySelector('.omni-reel')?.className||'',phase:document.querySelector('.omni-reel')?.getAttribute('data-reel-phase')||'',cinema:document.querySelector('.cinema-experience')?.className||''};
  const out = {before:bag.before,hits:bag.hits,now};
  delete (window as unknown as {__omniMotionProbe?:unknown}).__omniMotionProbe;
  return out;
 });
 await expect(hero, JSON.stringify(probe)).toHaveClass(/reel-reduced/);
 await expect(hero).toHaveAttribute('data-reel-phase','expanded');
 await expect(page.locator('.reel-loader')).toBeHidden();
 await expect(page.locator('.reel-card[tabindex="0"]')).toHaveCount(12);
 await expect(page.locator('.reel-card').last()).toBeVisible();
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(hero).not.toHaveClass(/reel-reduced/);
 await expect(page.locator('.reel-card[tabindex="0"]')).toHaveCount(1);
 await page.getByRole('button',{name:'Pausa animazione',exact:true}).click();
 await expect(page.getByRole('button',{name:'Riprendi animazione',exact:true})).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await expect(page.getByRole('button',{name:'Riprendi animazione',exact:true})).toBeVisible();
 await page.locator('.reel-card').first().focus();
 await expect(page.locator('.reel-card[tabindex="0"]')).toHaveAttribute('href','/explore/commerce');
 await page.getByRole('button',{name:'Progetto successivo',exact:true}).click();
 await expect(page.locator('.reel-card[tabindex="0"]')).toHaveAttribute('href','/solutions/build');
 await page.locator('.reel-stage').focus();
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/solutions\/build$/);
});
