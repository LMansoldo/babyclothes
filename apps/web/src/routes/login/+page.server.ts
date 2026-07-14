import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$lib/env';
import { flags, HOME_ROUTE } from '$lib/feature-flags';
import { LoginInputSchema } from '$lib/domain/user/schemas';
import { setAuthCookies, ACCESS_COOKIE, REFRESH_COOKIE } from '$lib/server/auth-cookies';
import type { Actions } from './$types';

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

  email: async ({ request, cookies, fetch }) => {
    if (!flags.emailLogin) {
      return fail(404, { error: 'not_found' });
    }

    const form = await request.formData();
    const email = form.get('email');
    const password = form.get('password');

    const parsed = LoginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      return fail(422, { error: 'invalid_fields' });
    }

    const res = await fetch(`${PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });

    if (res.status === 401) {
      return fail(401, { error: 'invalid_credentials' });
    }

    if (!res.ok) {
      return fail(502, { error: 'login_failed' });
    }

    const { token, refresh_token } = (await res.json()) as {
      token: string;
      refresh_token: string;
    };

    setAuthCookies(cookies, token, refresh_token);
    throw redirect(303, HOME_ROUTE);
  },

  logout: async ({ cookies }) => {
    cookies.delete(ACCESS_COOKIE, { path: '/' });
    cookies.delete(REFRESH_COOKIE, { path: '/' });
    throw redirect(303, '/login');
  },
};
