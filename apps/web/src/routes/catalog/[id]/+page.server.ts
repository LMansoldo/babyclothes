import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { mockItems, mockSellers } from '$lib/mocks/data';

export const load: PageServerLoad = async ({ params }) => {
  const item = mockItems.find((i) => i.id === params.id);
  if (!item) {
    throw error(404, 'Item not found');
  }
  const seller = mockSellers[item.sellerId];
  return { item, seller };
};
