import { redirect } from '@sveltejs/kit'
import { flags, HOME_ROUTE } from '$lib/feature-flags'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login')
  if (!flags.agentOnboarding) throw redirect(303, HOME_ROUTE)
  return {}
}
