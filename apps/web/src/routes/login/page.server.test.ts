import { describe, it, expect, vi, beforeEach } from 'vitest';
// A action resolve PUBLIC_API_URL no load do modulo; assertar contra a mesma
// fonte evita depender do valor do ambiente (host vs container)
import { PUBLIC_API_URL as API } from '$lib/env';

vi.mock('$lib/feature-flags', () => ({
  flags: { emailLogin: true, marketplace: false },
  HOME_ROUTE: '/agent',
}));

function makeCookies() {
  const store = new Map<string, string>();
  return {
    set: vi.fn((k: string, v: string) => store.set(k, v)),
    get: vi.fn((k: string) => store.get(k)),
    delete: vi.fn((k: string) => store.delete(k)),
    _store: store,
  };
}

describe('login action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sets auth cookies and returns session on success', async () => {
    const { actions } = await import('./+page.server');

    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 'access-tok',
          refresh_token: 'refresh-tok',
          user: { id: '1', email: 'a@b.com', name: 'Ana', avatar_url: '', type: 'pf', is_seller: false },
        }),
        { status: 200 },
      ),
    );
    const cookies = makeCookies();
    // Body como string: o Request do undici rejeita URLSearchParams criado no realm do jsdom
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ credential: 'google-jwt' }).toString(),
    });

    const result = await actions.login({ request, cookies, fetch } as never);

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/google`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_token', 'access-tok', expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_refresh', 'refresh-tok', expect.any(Object));
    expect((result as { session: { userId: string } }).session.userId).toBe('1');
  });

  it('returns fail(401) when the API rejects', async () => {
    const { actions } = await import('./+page.server');

    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 401 }));
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ credential: 'bad' }).toString(),
    });

    const result = await actions.login({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(401);
  });
});

describe('email action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sets cookies and redirects to /agent on success', async () => {
    const { actions } = await import('./+page.server');

    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          token: 'access-tok',
          refresh_token: 'refresh-tok',
          user: { id: '1', email: 'u@e.com', name: 'U', avatar_url: '', type: 'pf', is_seller: false },
        }),
        { status: 200 },
      ),
    );
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'u@e.com', password: 'secret' }).toString(),
    });

    await expect(() => actions.email({ request, cookies, fetch } as never)).rejects.toMatchObject({
      status: 303,
      location: '/agent',
    });
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_token', 'access-tok', expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_refresh', 'refresh-tok', expect.any(Object));
  });

  it('returns fail(401) with invalid_credentials on 401 from API', async () => {
    const { actions } = await import('./+page.server');

    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401 }),
    );
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'u@e.com', password: 'wrong' }).toString(),
    });

    const result = await actions.email({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(401);
    expect((result as { data: { error: string } }).data.error).toBe('invalid_credentials');
  });

  it('returns fail(422) with invalid_fields on invalid input', async () => {
    const { actions } = await import('./+page.server');

    const fetch = vi.fn();
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'not-an-email', password: 'secret' }).toString(),
    });

    const result = await actions.email({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(422);
    expect((result as { data: { error: string } }).data.error).toBe('invalid_fields');
  });

  it('returns fail(404) when emailLogin flag is off', async () => {
    vi.resetModules();
    vi.doMock('$lib/feature-flags', () => ({
      flags: { emailLogin: false, marketplace: true },
      HOME_ROUTE: '/catalog',
    }));
    const { actions } = await import('./+page.server');

    const fetch = vi.fn();
    const cookies = makeCookies();
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email: 'u@e.com', password: 'secret' }).toString(),
    });

    const result = await actions.email({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(404);
    expect((result as { data: { error: string } }).data.error).toBe('not_found');
  });
});
