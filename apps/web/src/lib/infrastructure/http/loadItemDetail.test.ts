import { describe, it, expect, vi } from 'vitest';
import { loadItemDetail } from './loadItemDetail';

describe('loadItemDetail', () => {
  it('fetches, maps item and seller', async () => {
    const dto = {
      id: 7,
      seller_id: 3,
      title: 'Body Rosa',
      description: 'macio',
      category: 'bodysuit',
      gender: 'unisex',
      clothing_size: 'M',
      condition: 'like_new',
      price_cents: 4500,
      status: 'active',
      photos: [{ id: 1, url: 'https://img/1.jpg', position: 0 }],
      seller: { id: 3, name: 'Maria', avatar_url: 'https://a/1.jpg', verified: true },
    };
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(dto) });

    const result = await loadItemDetail('7', fetchFn as unknown as typeof fetch);

    expect(fetchFn).toHaveBeenCalledWith('/api/items/7');
    expect(result.item.id).toBe('7');
    expect(result.item.photoUrls).toEqual(['https://img/1.jpg']);
    expect(result.seller).toEqual({ name: 'Maria', avatarUrl: 'https://a/1.jpg', verified: true });
  });

  it('throws when the response is not ok', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });
    await expect(loadItemDetail('9', fetchFn as unknown as typeof fetch)).rejects.toThrow();
  });
});
