import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './+server';
// O proxy resolve PUBLIC_API_URL no load do modulo; o teste asserta contra a
// mesma fonte para nao depender do valor do ambiente (host vs container)
import { PUBLIC_API_URL } from '$lib/env';

beforeEach(() => {
  vi.restoreAllMocks();
});

it('forwards GET with the Bearer token from the cookie', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
  const cookies = { get: vi.fn().mockReturnValue('tok-123') };
  const request = new Request('http://localhost/api/children?x=1', { method: 'GET' });

  await GET({ params: { path: 'children' }, url: new URL('http://localhost/api/children?x=1'), request, cookies, fetch } as never);

  expect(fetch).toHaveBeenCalledWith(
    `${PUBLIC_API_URL}/children?x=1`,
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ authorization: 'Bearer tok-123' }),
    }),
  );
});

it('forwards POST body', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
  const cookies = { get: vi.fn().mockReturnValue('tok') };
  const request = new Request('http://localhost/api/children', {
    method: 'POST',
    body: JSON.stringify({ name: 'X' }),
  });

  await POST({ params: { path: 'children' }, url: new URL('http://localhost/api/children'), request, cookies, fetch } as never);

  const call = fetch.mock.calls[0][1] as RequestInit;
  expect(call.method).toBe('POST');
  expect(call.body).toBe(JSON.stringify({ name: 'X' }));
});
