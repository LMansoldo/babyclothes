import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$lib/env';
import { flags, HOME_ROUTE } from '$lib/feature-flags';
import { RegisterPFInputSchema } from '$lib/domain/user/schemas';
import { setAuthCookies } from '$lib/server/auth-cookies';
import { t } from '$lib/i18n';
import { get } from 'svelte/store';
import type { Actions, PageServerLoad } from './$types';

const ACCESS_COOKIE = 'babyclothes_token';

export const load: PageServerLoad = async ({ locals }) => {
  if (flags.pjRegistration) {
    if (!locals.session) throw redirect(303, '/login');
    if (locals.session.type) throw redirect(303, HOME_ROUTE);
    return {};
  }

  // Agent mode: register is always accessible (user may create a new account)
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const type = form.get('type');

    if (flags.pjRegistration) {
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
    }

    if (type === 'pj') return fail(400, { error: 'pj_disabled' });

    const translate = get(t);

    const name = form.get('name');
    const email = form.get('email');
    const password = form.get('password');
    const cpf = form.get('cpf');
    const phone = form.get('phone');
    const nationality = form.get('nationality');
    const cep = form.get('cep');
    const addressLine = form.get('addressLine');
    const city = form.get('city');
    const state = form.get('state');

    const parsed = RegisterPFInputSchema.safeParse({
      name, email, password, cpf, phone, nationality, cep, addressLine, city, state,
    });

    if (!parsed.success) {
      const details: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        details[field] = translate(issue.message);
      }
      return fail(422, { error: 'validation_failed', details });
    }

    const res = await fetch(`${PUBLIC_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        cpf: parsed.data.cpf,
        phone: parsed.data.phone,
        nationality: parsed.data.nationality,
        cep: parsed.data.cep,
        address_line: parsed.data.addressLine,
        city: parsed.data.city,
        state: parsed.data.state,
      }),
    });

    if (res.status === 422) {
      // The API returns Ecto changeset errors as arrays per field, e.g.
      // { details: { email: ['has already been taken'] } }. Flatten to a
      // single string before matching or surfacing to the UI.
      const body = (await res.json()) as { details?: Record<string, string | string[]> };
      const details: Record<string, string> = {};
      if (body.details) {
        for (const [field, raw] of Object.entries(body.details)) {
          const message = Array.isArray(raw) ? raw.join(', ') : raw;
          const isTaken = message.includes('unique') || message.includes('taken');
          if (field === 'email' && isTaken) {
            details.email = translate('auth.register_pf.error_email_taken');
          } else if (field === 'cpf' && isTaken) {
            details.cpf = translate('auth.register_pf.error_cpf_taken');
          } else {
            details[field] = message;
          }
        }
      }
      return fail(422, { error: 'validation_failed', details });
    }

    if (!res.ok) return fail(502, { error: 'signup_failed' });

    const { token, refresh_token } = (await res.json()) as {
      token: string;
      refresh_token: string;
    };

    setAuthCookies(cookies, token, refresh_token);
    throw redirect(303, '/onboarding');
  },
};
