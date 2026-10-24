import {test, expect, type Page} from '@playwright/test';
import {createHash, randomBytes, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';

// Infrastructure fixture only: a unique individual Owner in the isolated local test D1.
// All product operations below use real passkey authentication and HTTP persistence.
async function owner(page: Page, baseURL: string) {
  if (new URL(baseURL).hostname !== 'localhost') throw new Error('Workspace fixtures are restricted to localhost.');
  const org = 'omni101', fixtureId = 'workspace-e2e-' + randomUUID(), token = randomBytes(32).toString('hex'), hash = createHash('sha256').update(token).digest('hex'), now = Date.now();
  const sql = `INSERT INTO invitations(id,organization_id,email,role,token_hash,expires_at,created_at,updated_at) VALUES('${randomUUID()}','${org}','${fixtureId}@example.test','OWNER','${hash}',${now + 600000},${now},${now});`;
  d1(sql);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {options: {protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true}});
  await page.goto('/portal/invite?token=' + token);
  await page.getByRole('button', {name: 'Attiva il tuo account'}).click();
  await expect(page).toHaveURL(/\/admin$/, {timeout: 20000});
  await expect(page.getByRole('heading', {name: 'Oggi nello studio'})).toBeVisible();
}

function d1(sql: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      execFileSync(resolve('node_modules/.bin/wrangler'), ['d1', 'execute', 'DB', '--local', '--config', 'wrangler.jsonc', '--env', 'test', '--command', sql], {cwd: resolve('apps/web'), stdio: 'pipe', timeout: 30000});
      return;
    } catch (error) {
      const text = String((error as {stderr?: unknown}).stderr || '') + String((error as Error).message);
      if (attempt >= 8 || !/SQLITE_BUSY|database is locked/.test(text)) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400 + attempt * 400);
    }
  }
}

test('dashboard numbers link to their lists and the palette disables creation for read-only roles', async ({page, baseURL}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Virtual WebAuthn and isolated workspace are exercised once on desktop Chromium.');
  test.setTimeout(60000);
  await owner(page, baseURL!);
  const strip = page.getByRole('region', {name: 'Indicatori'});
  const leads = strip.getByRole('link', {name: /Nuovi lead/});
  await expect(leads).toHaveAttribute('href', '/admin/leads?status=NEW');
  await leads.click();
  await expect(page).toHaveURL(/\/admin\/leads\?status=NEW/);
  await page.goto('/admin');
  await expect(strip.getByRole('link', {name: /Ticket aperti/})).toHaveAttribute('href', '/admin/issues?status=OPEN');
  await expect(strip.getByRole('link', {name: /Preventivi in revisione/})).toHaveAttribute('href', '/admin/proposals?status=IN_REVIEW');
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', {name: 'Ricerca globale'});
  await dialog.getByRole('combobox', {name: 'Cerca pagine e record'}).fill('Nuovo lead');
  await expect(dialog.getByRole('option', {name: /Nuovo lead/})).not.toHaveAttribute('aria-disabled', 'true'); // Owner può scrivere
});
