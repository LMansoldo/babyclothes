import { describe, it, expect, vi, beforeEach } from 'vitest';

const API = 'http://localhost:4000';

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
    const body = new URLSearchParams({ credential: 'google-jwt' });
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
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
    const body = new URLSearchParams({ credential: 'bad' });
    const request = new Request('http://x', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    const result = await actions.login({ request, cookies, fetch } as never);
    expect((result as { status: number }).status).toBe(401);
  });
});
