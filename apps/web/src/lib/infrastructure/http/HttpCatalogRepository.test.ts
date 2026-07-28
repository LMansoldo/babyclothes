import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpCatalogRepository } from './HttpCatalogRepository';
import { HttpError } from './httpClient';

const apiResponse = {
  items: [
    {
      id: 7,
      title: 'Macacão floral',
      category: 'romper',
      gender: 'female',
      clothing_size: 'P',
      condition: 'new',
      price_cents: 8900,
      photo_url: 'https://cdn.example.com/p1.jpg',
      seller: { id: 2, name: 'Maria', avatar_url: '' },
      inserted_at: '2026-07-01T00:00:00Z',
    },
  ],
  pagination: { page: 1, per_page: 20, total: 1 },
};

describe('HttpCatalogRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the real API contract ({items, pagination}) to Item[]', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(apiResponse), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpCatalogRepository();
    const items = await repo.fetch({ size: 'P', gender: 'female' });

    expect(fetchMock).toHaveBeenCalledWith('/api/catalog?size=P&gender=female', expect.anything());
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      id: '7',
      sellerId: '2',
      title: 'Macacão floral',
      description: '',
      category: 'romper',
      gender: 'female',
      clothingSize: 'P',
      condition: 'new',
      priceCents: 8900,
      status: 'active',
      photoUrls: ['https://cdn.example.com/p1.jpg'],
    });
  });

  it('maps null photo_url and null seller safely', async () => {
    const response = {
      items: [{ ...apiResponse.items[0], photo_url: null, seller: null }],
      pagination: apiResponse.pagination,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    );

    const repo = new HttpCatalogRepository();
    const items = await repo.fetch({});

    expect(items[0].photoUrls).toEqual([]);
    expect(items[0].sellerId).toBe('');
  });

  it('throws HttpError on non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 500 })),
    );
    const repo = new HttpCatalogRepository();
    await expect(repo.fetch({})).rejects.toThrow(HttpError);
  });
});
