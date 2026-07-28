import { describe, it, expect, vi, beforeEach } from 'vitest';

const userPayload = {
  user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: 'pf', is_seller: false },
};

function makeEvent(cookieStore: Record<string, string>, pathname = '/catalog') {
  const cookies = {
    get: (k: string) => cookieStore[k],
    set: vi.fn((k: string, v: string) => (cookieStore[k] = v)),
    delete: vi.fn((k: string) => delete cookieStore[k]),
  };
  return {
    cookies,
    url: new URL(`http://localhost${pathname}`),
    locals: {} as Record<string, unknown>,
  };
}

describe('handle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PUBLIC_MOCK_DATA', 'false');
    vi.stubEnv('PUBLIC_API_URL', 'http://localhost:4000');
    // Fixa o modo full para os testes serem herméticos — o modo agent é coberto via vi.doMock de $lib/feature-flags
    vi.stubEnv('PUBLIC_APP_MODE', 'full');
  });

  it('populates session when access token is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' });
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect((event.locals as { session?: { userId: string } }).session?.userId).toBe('1');
  });

  it('refreshes when access is expired but refresh is valid', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 })) // /auth/session
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'new-a', refresh_token: 'new-r', ...userPayload }), { status: 200 }),
      ); // /auth/refresh
    vi.stubGlobal('fetch', fetch);
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'expired', babyclothes_refresh: 'valid' });
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);

    expect(event.cookies.set).toHaveBeenCalledWith('babyclothes_token', 'new-a', expect.any(Object));
    expect((event.locals as { session?: { userId: string } }).session?.userId).toBe('1');
  });

  it('redirects an unregistered session to /register', async () => {
    const unregisteredPayload = {
      user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: null, is_seller: false },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(unregisteredPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/catalog');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await expect(handle({ event, resolve } as never)).rejects.toMatchObject({ status: 303, location: '/register' });
  });

  it('lets an unregistered session access /register', async () => {
    const unregisteredPayload = {
      user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: null, is_seller: false },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(unregisteredPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/register');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect(resolve).toHaveBeenCalled();
  });

  it('lets an anonymous visitor access /register', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({}, '/register');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect(resolve).toHaveBeenCalled();
  });

  it('does not redirect a registered session to /register', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/catalog');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect(resolve).toHaveBeenCalled();
  });

  it('redirects /catalog to /agent when marketplace flag is off', async () => {
    vi.doMock('$lib/feature-flags', () => ({
      flags: { marketplace: false, pjRegistration: false, marketplaceNav: false, agentOnboarding: true, emailLogin: true },
      MARKETPLACE_ROUTES: ['/catalog', '/sell'],
      HOME_ROUTE: '/agent',
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/catalog');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await expect(handle({ event, resolve } as never)).rejects.toMatchObject({ status: 303, location: '/agent' });
  });

  it('redirects /sell to /agent when marketplace flag is off', async () => {
    vi.doMock('$lib/feature-flags', () => ({
      flags: { marketplace: false, pjRegistration: false, marketplaceNav: false, agentOnboarding: true, emailLogin: true },
      MARKETPLACE_ROUTES: ['/catalog', '/sell'],
      HOME_ROUTE: '/agent',
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/sell');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await expect(handle({ event, resolve } as never)).rejects.toMatchObject({ status: 303, location: '/agent' });
  });

  it('does not redirect /catalog when marketplace flag is on', async () => {
    vi.doMock('$lib/feature-flags', () => ({
      flags: { marketplace: true, pjRegistration: true, marketplaceNav: true, agentOnboarding: false, emailLogin: false },
      MARKETPLACE_ROUTES: ['/catalog', '/sell'],
      HOME_ROUTE: '/catalog',
    }));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(userPayload), { status: 200 })));
    const { handle } = await import('./hooks.server');
    const event = makeEvent({ babyclothes_token: 'good' }, '/catalog');
    const resolve = vi.fn().mockResolvedValue(new Response('ok'));

    await handle({ event, resolve } as never);
    expect(resolve).toHaveBeenCalled();
  });
});
