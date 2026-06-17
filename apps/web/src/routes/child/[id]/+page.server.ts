import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { mockChildren, mockGrowthRecords } from '$lib/mocks/data';

export const load: PageServerLoad = async ({ params }) => {
  const child = mockChildren.find((c) => c.id === params.id);
  if (!child) {
    throw error(404, 'Child not found');
  }
  const records = mockGrowthRecords
    .filter((r) => r.childId === params.id)
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  return { child, records };
};
