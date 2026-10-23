import {test,expect} from '@playwright/test';

test('cinematic scene returns after leaving the viewport and intentional GPU teardown',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.keyboard.press('Escape');
 const cinema=page.locator('.cinema-experience'),canvas=cinema.locator('canvas');
 await cinema.scrollIntoViewIfNeeded();
 await expect(cinema).toHaveAttribute('data-near','true');
 await expect(canvas).toHaveCount(1,{timeout:15000});
 // Observe the real renderer's asynchronous teardown; its context loss must not become a permanent failure.
 await page.evaluate(async()=>{
  const old=document.querySelector<HTMLCanvasElement>('.cinema-experience canvas');
  if(!old)throw new Error('Scene did not mount before reentry test.');
  await new Promise<void>(resolve=>{
   let timer:ReturnType<typeof setTimeout>;
   const done=()=>{clearTimeout(timer);old.removeEventListener('webglcontextlost',done);resolve()};
   old.addEventListener('webglcontextlost',done,{once:true});
   timer=setTimeout(done,2500);
   window.scrollTo({top:0,behavior:'instant'});
  });
 });
 await expect(canvas).toHaveCount(0);
 await expect(cinema).not.toHaveAttribute('data-near','true');
 await cinema.scrollIntoViewIfNeeded();
 await expect(cinema).toHaveAttribute('data-near','true');
 await expect(canvas).toHaveCount(1,{timeout:15000});
 await expect(cinema.getByRole('heading',{level:2})).toBeVisible();
 await page.screenshot({path:'test-results/cinematic-reentry-'+testInfo.project.name+'.png'});
});
