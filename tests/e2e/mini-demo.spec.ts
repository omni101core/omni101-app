import {test,expect} from '@playwright/test';

const configuration={version:1,theme:'hospitality',businessName:'Harbour Cafe',headline:'Book a table in one tap',description:'A simple page to present the cafe and collect bookings.',ctaLabel:'Book now',ctaUrl:'https://omni101.app/start-project',features:[{title:'Menu',description:'Today’s menu, always up to date.'}]};
const demoRef='5d1f6c2e-3a4b-4c5d-8e9f-0a1b2c3d4e5f';

test('public demo page: banner, noindex, read-only landing, CTA with brief',async({page})=>{
 await page.route('**/api/demo/'+demoRef,route=>route.fulfill({json:{configuration,language:'en'}}));
 await page.goto('/demo/'+demoRef);
 await expect(page.getByRole('note')).toHaveText('Personalized demo by OMNI101 — not a live site');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Book a table in one tap');
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 const href=await page.getByRole('link',{name:'Book now'}).getAttribute('href');
 expect(href).toContain('/start-project?brief=');
 expect(new URL(href||'').searchParams.get('brief')).toContain('Harbour Cafe');
 // The demo itself is read-only. The assistant widget from root.tsx (always mounted, closed) owns its own form and textarea, so scope to the demo wrapper.
 await expect(page.getByRole('note').locator('..').locator('input,textarea,form')).toHaveCount(0);
});
test('revoked or unknown share shows a neutral message',async({page})=>{
 await page.route('**/api/demo/'+demoRef,route=>route.fulfill({status:404,json:{error:'Demo non disponibile.'}}));
 await page.goto('/demo/'+demoRef);
 await expect(page.getByRole('alert')).toContainText('Questo link non è più valido');
 await expect(page.getByRole('alert')).not.toContainText('Demo non disponibile');
 await expect(page.getByRole('heading',{level:1})).toHaveCount(0);
});
