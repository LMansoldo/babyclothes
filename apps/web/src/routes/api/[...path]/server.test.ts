import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './+server';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.stubEnv('PUBLIC_API_URL', 'http://localhost:4000');
});

it('forwards GET with the Bearer token from the cookie', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
  const cookies = { get: vi.fn().mockReturnValue('tok-123') };
  const request = new Request('http://localhost/api/children?x=1', { method: 'GET' });

  await GET({ params: { path: 'children' }, url: new URL('http://localhost/api/children?x=1'), request, cookies, fetch } as never);

  expect(fetch).toHaveBeenCalledWith(
    'http://localhost:4000/children?x=1',
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
