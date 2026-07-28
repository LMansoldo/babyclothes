import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUBLIC_API_URL as API } from '$lib/env';

vi.mock('$lib/feature-flags', () => ({
  flags: { marketplace: true, pjRegistration: true, marketplaceNav: true, agentOnboarding: false, emailLogin: false },
  MARKETPLACE_ROUTES: ['/catalog', '/sell'],
  HOME_ROUTE: '/catalog',
}));

vi.mock('$lib/i18n', () => ({
  t: { subscribe: (fn: (v: (key: string) => string) => void) => { fn((k: string) => k); return () => {}; } },
  get: () => (key: string) => key,
}));

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

describe('register load (full mode)', () => {
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

describe('register action (full mode)', () => {
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

describe('register action (agent mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('$lib/feature-flags', () => ({
      flags: { marketplace: false, pjRegistration: false, marketplaceNav: false, agentOnboarding: true, emailLogin: true },
      MARKETPLACE_ROUTES: ['/catalog', '/sell'],
      HOME_ROUTE: '/agent',
    }));
  });

  const validPfFields = {
    type: 'pf',
    name: 'Maria Clara Santos',
    email: 'maria@example.com',
    password: 'senha-forte-123',
    cpf: '52998224725',
    phone: '11987654321',
    nationality: 'Brasileira',
    cep: '01310100',
    addressLine: 'Av. Paulista, 1000, ap 12',
    city: 'Sao Paulo',
    state: 'SP',
  };

  it('fails 400 when type is pj', async () => {
    const { actions } = await import('./+page.server');
    const result = await actions.default({
      request: makeRequest({ type: 'pj', document: '11222333000181' }),
      cookies: makeCookies(),
      fetch: vi.fn(),
    } as never);
    expect(result).toMatchObject({ status: 400, data: { error: 'pj_disabled' } });
  });

  it('fails 422 with details on invalid fields', async () => {
    const { actions } = await import('./+page.server');
    const result = await actions.default({
      request: makeRequest({ ...validPfFields, email: 'not-an-email' }),
      cookies: makeCookies(),
      fetch: vi.fn(),
    } as never);
    expect(result).toMatchObject({ status: 422, data: { error: 'validation_failed' } });
    expect((result as { data: { details: Record<string, string> } }).data.details).toBeDefined();
  });

  it('sets cookies and redirects to /onboarding on success', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ token: 'access-tok', refresh_token: 'refresh-tok', user: { id: '1' } }),
        { status: 201 },
      ),
    );
    const cookies = makeCookies();

    await expect(
      actions.default({
        request: makeRequest(validPfFields),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303, location: '/onboarding' });

    expect(cookies.set).toHaveBeenCalledWith('babyclothes_token', 'access-tok', expect.any(Object));
    expect(cookies.set).toHaveBeenCalledWith('babyclothes_refresh', 'refresh-tok', expect.any(Object));

    const fetchBody = JSON.parse(fetch.mock.calls[0][1].body as string);
    expect(fetchBody.address_line).toBe('Av. Paulista, 1000, ap 12');
    expect(fetchBody.cpf).toBe('52998224725');
  });

  it('returns details.email for duplicate email (422 from API, array messages)', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'validation_failed', details: { email: ['has already been taken'] } }),
        { status: 422 },
      ),
    );
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest(validPfFields),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 422, data: { error: 'validation_failed' } });
    expect((result as { data: { details: Record<string, string> } }).data.details.email).toBe(
      'auth.register_pf.error_email_taken',
    );
  });

  it('returns details.cpf for duplicate cpf (422 from API, array messages)', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'validation_failed', details: { cpf: ['has already been taken'] } }),
        { status: 422 },
      ),
    );
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest(validPfFields),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 422, data: { error: 'validation_failed' } });
    expect((result as { data: { details: Record<string, string> } }).data.details.cpf).toBe(
      'auth.register_pf.error_cpf_taken',
    );
  });

  it('flattens array messages to a string for other field errors', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: 'validation_failed', details: { phone: ['must be 10 or 11 digits'] } }),
        { status: 422 },
      ),
    );
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest(validPfFields),
      cookies,
      fetch,
    } as never);

    const details = (result as { data: { details: Record<string, string> } }).data.details;
    expect(details.phone).toBe('must be 10 or 11 digits');
    expect(Array.isArray(details.phone)).toBe(false);
  });

  it('fails 502 on unexpected API error', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 500 }));
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest(validPfFields),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 502, data: { error: 'signup_failed' } });
  });
});

describe('register load (agent mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('$lib/feature-flags', () => ({
      flags: { marketplace: false, pjRegistration: false, marketplaceNav: false, agentOnboarding: true, emailLogin: true },
      MARKETPLACE_ROUTES: ['/catalog', '/sell'],
      HOME_ROUTE: '/agent',
    }));
  });

  it('renders even with existing session (user may create new account)', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: { type: 'pf' } } } as never),
    ).resolves.toEqual({});
  });

  it('renders without session (signup starts logged out)', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: undefined } } as never),
    ).resolves.toEqual({});
  });
});
