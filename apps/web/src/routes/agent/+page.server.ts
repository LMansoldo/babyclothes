import { redirect } from '@sveltejs/kit';
import { flags } from '$lib/feature-flags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login');
  if (flags.marketplace) throw redirect(303, '/chat');
  return {};
};
