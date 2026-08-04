import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isSupportedLocale, preferredLocaleFromHeader } from './locale-resolution';

export const load: LayoutServerLoad = ({ params, request }) => {
  const { lang } = params;

  if (!lang) {
    const preferred = preferredLocaleFromHeader(request.headers.get('accept-language') ?? '');
    throw redirect(302, `/${preferred}`);
  }

  if (!isSupportedLocale(lang)) {
    throw redirect(302, '/pt');
  }

  return { lang };
};
