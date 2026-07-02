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
});
