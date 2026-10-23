import {test,expect,type Page} from '@playwright/test';

async function gotoStartProject(page:Page){
  await page.goto('/start-project');
  await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
}

test('assist does not steal focus from Express button on mount',async({page})=>{
  await gotoStartProject(page);
  const express=page.getByRole('button',{name:/Express/});
  await express.focus();
  await expect(express).toBeFocused();
  await expect(page.locator('.omni-assist-launch')).toBeVisible();
  await expect(express).toBeFocused();
});

test('assist focus moves to dialog on explicit open and returns on close',async({page})=>{
  await gotoStartProject(page);
  const express=page.getByRole('button',{name:/Express/});
  const launch=page.getByRole('button',{name:'OMNI ASSIST',exact:true});
  await express.focus();
  await expect(express).toBeFocused();
  await expect(page.locator('.omni-assist-launch')).toBeVisible();
  await launch.click();
  await expect(page.locator('.omni-assist-dialog')).toBeVisible();
  const input=page.locator('.omni-assist-dialog textarea, .omni-assist-dialog input').first();
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.omni-assist-dialog')).not.toBeVisible();
  await expect(launch).toBeFocused();
});