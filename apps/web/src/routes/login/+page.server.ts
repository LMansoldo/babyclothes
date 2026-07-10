import { fail, redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { PUBLIC_API_URL } from '$lib/env';
import type { Actions } from './$types';

const ACCESS_COOKIE = 'babyclothes_token';
const REFRESH_COOKIE = 'babyclothes_refresh';

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

function cookieOpts(maxAge: number) {
  return { path: '/', httpOnly: true, secure: !dev, sameSite: 'lax' as const, maxAge };
}

function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
  cookies.set(ACCESS_COOKIE, accessToken, cookieOpts(60 * 60)); // 1h
  cookies.set(REFRESH_COOKIE, refreshToken, cookieOpts(60 * 60 * 24 * 30)); // 30d
}

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

export const actions: Actions = {
  login: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const credential = form.get('credential');

    if (typeof credential !== 'string' || !credential) {
      return fail(400, { error: 'missing_credential' });
    }

    const res = await fetch(`${PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });

    if (!res.ok) {
      return fail(401, { error: 'login_failed' });
    }

    const { token, refresh_token, user } = (await res.json()) as {
      token: string;
      refresh_token: string;
      user: ApiUser;
    };

    setAuthCookies(cookies, token, refresh_token);
    return { session: mapUser(user) };
  },

  devLogin: async ({ cookies, fetch }) => {
    const res = await fetch(`${PUBLIC_API_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    if (!res.ok) return fail(401, { error: 'dev_login_failed' });

    const { token, refresh_token, user } = (await res.json()) as {
      token: string;
      refresh_token: string;
      user: ApiUser;
    };

    setAuthCookies(cookies, token, refresh_token);
    return { session: mapUser(user) };
  },

  logout: async ({ cookies }) => {
    cookies.delete(ACCESS_COOKIE, { path: '/' });
    cookies.delete(REFRESH_COOKIE, { path: '/' });
    throw redirect(303, '/login');
  },
};
