import {test,expect} from '@playwright/test';

test('home adapts to reduced-motion changes without reload or lost navigation',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');
 await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});
 const hero=page.locator('.omni-reel');
 await expect(hero).toHaveClass(/reel-reduced/);
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
