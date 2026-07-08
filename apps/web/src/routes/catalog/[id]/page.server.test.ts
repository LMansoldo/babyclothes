import { describe, it, expect, vi } from 'vitest';
import { load, type SellerInfo } from './+page.server';
import type { Item } from '$lib/domain/item/entities/Item';

const dto = {
  id: 7,
  seller_id: 2,
  title: 'Vestido tutu',
  description: null,
  category: 'dress',
  gender: 'female',
  clothing_size: 'G',
  condition: 'new',
  price_cents: 12900,
  status: 'active',
  photos: [{ id: 1, url: 'https://cdn.example.com/v.jpg', position: 0 }],
  seller: { id: 2, name: 'Maria', avatar_url: '', verified: true },
};

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { item: Item; seller: SellerInfo | null };

function makeEvent(fetchImpl: unknown, id = '7'): LoadEvent {
  return { params: { id }, fetch: fetchImpl } as unknown as LoadEvent;
}

describe('catalog/[id] +page.server load', () => {
  it('fetches the item from the API and maps item + seller', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(dto), { status: 200 }));

    const result = (await load(makeEvent(fetchMock))) as LoadResult;

    expect(fetchMock).toHaveBeenCalledWith('/api/items/7');
    expect(result.item.title).toBe('Vestido tutu');
    expect(result.item.photoUrls).toEqual(['https://cdn.example.com/v.jpg']);
    expect(result.seller).toEqual({ name: 'Maria', avatarUrl: '', verified: true });
  });

  it('throws 404 when the API returns 404', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 404 }));

    await expect(load(makeEvent(fetchMock, '999'))).rejects.toMatchObject({ status: 404 });
  });
});
