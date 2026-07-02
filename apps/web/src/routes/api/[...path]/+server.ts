import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from '$lib/env';

const ACCESS_COOKIE = 'babyclothes_token';

const proxy: RequestHandler = async ({ params, url, request, cookies, fetch }) => {
  const token = cookies.get(ACCESS_COOKIE);
  const target = `${PUBLIC_API_URL}/${params.path}${url.search}`;

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const method = request.method;
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  const res = await fetch(target, { method, headers, body });

  return new Response(res.body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  });
};

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
