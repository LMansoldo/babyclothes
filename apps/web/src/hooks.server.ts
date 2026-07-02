import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

const ACCESS_COOKIE = 'babyclothes_token';
const REFRESH_COOKIE = 'babyclothes_refresh';
const publicRoutes = ['/login'];

const mockSession = {
  userId: 'mock-user-1',
  email: 'mock@babyclothes.app',
  name: 'Dev User',
  avatarUrl: '',
  type: 'pf' as const,
  cpf: undefined,
  cnpj: undefined,
  isSeller: true,
};

type ApiUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  type: string | null;
  cpf?: string;
  cnpj?: string;
  is_seller: boolean;
};

function mapUser(user: ApiUser) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    type: user.type as 'pf' | 'pj' | null,
    cpf: user.cpf,
    cnpj: user.cnpj,
    isSeller: user.is_seller,
  };
}

function cookieOpts(maxAge: number) {
  return { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const, maxAge };
}

export const handle: Handle = async ({ event, resolve }) => {
  if (import.meta.env.PUBLIC_MOCK_DATA === 'true') {
    event.locals.session = mockSession;
    return resolve(event);
  }

  const apiUrl = import.meta.env.PUBLIC_API_URL ?? '';
  const accessToken = event.cookies.get(ACCESS_COOKIE);

  event.locals.session = undefined;

  if (accessToken) {
    try {
      const res = await fetch(`${apiUrl}/auth/session`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const { user } = (await res.json()) as { user: ApiUser };
        event.locals.session = mapUser(user);
      } else {
        await tryRefresh(event, apiUrl);
      }
    } catch (err) {
      console.error('Auth session validation failed:', err);
    }
  } else {
    await tryRefresh(event, apiUrl);
  }

  const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));
  if (!event.locals.session && !isPublicRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};

async function tryRefresh(event: Parameters<Handle>[0]['event'], apiUrl: string) {
  const refreshToken = event.cookies.get(REFRESH_COOKIE);
  if (!refreshToken) {
    event.cookies.delete(ACCESS_COOKIE, { path: '/' });
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const { token, refresh_token, user } = (await res.json()) as {
        token: string;
        refresh_token: string;
        user: ApiUser;
      };
      event.cookies.set(ACCESS_COOKIE, token, cookieOpts(60 * 60));
      event.cookies.set(REFRESH_COOKIE, refresh_token, cookieOpts(60 * 60 * 24 * 30));
      event.locals.session = mapUser(user);
    } else {
      event.cookies.delete(ACCESS_COOKIE, { path: '/' });
      event.cookies.delete(REFRESH_COOKIE, { path: '/' });
    }
  } catch (err) {
    console.error('Auth refresh failed:', err);
  }
}
