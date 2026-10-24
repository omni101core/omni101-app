import {describe,it,expect} from 'vitest';
import {handleApi} from '../apps/web/app/server/api';
import {publicPaths} from '../apps/web/app/content/seo';
import type {Env} from '../apps/web/app/server/auth';

describe('ux-d-tecnico', () => {
  it('sitemap non elenca /contact (302 verso /start-project)', () => {
    expect(publicPaths).not.toContain('/contact');
    expect(publicPaths).toContain('/start-project');
  });

  it('/api/health espone revision e data build da env', async () => {
    const env = {BUILD_REVISION: 'abc1234', BUILD_DATE: '2026-10-24'} as unknown as Env;
    const res = await handleApi(new Request('https://omni101.app/api/health'), env);
    expect(await res?.json()).toMatchObject({status: 'ok', revision: 'abc1234', builtAt: '2026-10-24'});
  });

  it('/api/health dice solo se il segreto dei link email c\'è, mai il suo valore', async () => {
    const withSecret = await handleApi(new Request('https://omni101.app/api/health'), {EMAIL_LINK_SECRET: 'valore-di-prova'} as unknown as Env);
    const text = JSON.stringify(await withSecret?.json());
    expect(text).toContain('"emailLinks":true');
    expect(text).not.toContain('valore-di-prova');
    const without = await handleApi(new Request('https://omni101.app/api/health'), {} as unknown as Env);
    expect(await without?.json()).toMatchObject({emailLinks: false});
  });

  it('/api/health senza build da env: campi null, nessun errore', async () => {
    const env = {} as unknown as Env;
    const res = await handleApi(new Request('https://omni101.app/api/health'), env);
    expect(await res?.json()).toMatchObject({status: 'ok', revision: null, builtAt: null});
  });
});
