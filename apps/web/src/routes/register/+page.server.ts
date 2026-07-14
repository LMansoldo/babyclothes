import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$lib/env';
import { HOME_ROUTE } from '$lib/feature-flags';
import type { Actions, PageServerLoad } from './$types';

const ACCESS_COOKIE = 'babyclothes_token';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login');
  if (locals.session.type) throw redirect(303, HOME_ROUTE);
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const type = form.get('type');
    const document = form.get('document');
    const token = cookies.get(ACCESS_COOKIE);

    if (!token) return fail(401, { error: 'not_authenticated' });
    if (type !== 'pf' && type !== 'pj') return fail(400, { error: 'invalid_type' });
    if (typeof document !== 'string' || !document) return fail(400, { error: 'missing_document' });

    const body = type === 'pf' ? { type, cpf: document } : { type, cnpj: document };

    const res = await fetch(`${PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (res.status === 409) throw redirect(303, HOME_ROUTE);
    if (res.status === 422) return fail(422, { error: 'invalid_document' });
    if (!res.ok) return fail(res.status === 401 ? 401 : 500, { error: 'register_failed' });

    throw redirect(303, HOME_ROUTE);
  },
};
