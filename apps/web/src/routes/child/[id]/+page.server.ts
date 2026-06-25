import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Child data is fetched client-side via HttpChildRepository
  return { id: params.id };
};
