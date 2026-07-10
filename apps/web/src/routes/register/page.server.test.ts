import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUBLIC_API_URL as API } from '$lib/env';

function makeCookies(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    set: vi.fn((k: string, v: string) => store.set(k, v)),
    get: vi.fn((k: string) => store.get(k)),
    delete: vi.fn((k: string) => store.delete(k)),
    _store: store,
  };
}

function makeRequest(fields: Record<string, string>) {
  return new Request('http://x', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
}

describe('register load', () => {
  it('redirects to /login without a session', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: undefined } } as never),
    ).rejects.toMatchObject({ status: 303, location: '/login' });
  });

  it('redirects to /catalog when already registered', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: { type: 'pf' } } } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });
  });

  it('renders for an unregistered session', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: { type: null } } } as never),
    ).resolves.toEqual({});
  });
});

describe('register action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('posts to the API and redirects to /catalog on success', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: '1', type: 'pf' } }), { status: 200 }),
    );
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pf', document: '52998224725' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/register`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer tok' }),
        body: JSON.stringify({ type: 'pf', cpf: '52998224725' }),
      }),
    );
  });

  it('sends cnpj for PJ registrations', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: '1', type: 'pj' } }), { status: 200 }),
    );
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pj', document: '11222333000181' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303 });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/register`,
      expect.objectContaining({ body: JSON.stringify({ type: 'pj', cnpj: '11222333000181' }) }),
    );
  });

  it('fails with invalid_document on 422', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 422 }));
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    const result = await actions.default({
      request: makeRequest({ type: 'pf', document: '12345678900' }),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 422, data: { error: 'invalid_document' } });
  });

  it('redirects to /catalog on 409 already_registered', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 409 }));
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pf', document: '52998224725' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });
  });

  it('fails 401 without a token cookie', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn();
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest({ type: 'pf', document: '52998224725' }),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails 400 for an invalid type', async () => {
    const { actions } = await import('./+page.server');
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    const result = await actions.default({
      request: makeRequest({ type: 'mei', document: '52998224725' }),
      cookies,
      fetch: vi.fn(),
    } as never);

    expect(result).toMatchObject({ status: 400 });
  });
});
