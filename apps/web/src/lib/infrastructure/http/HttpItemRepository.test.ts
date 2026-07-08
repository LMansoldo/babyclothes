import { describe, it, expect, vi, afterEach } from 'vitest';
import { HttpItemRepository } from './HttpItemRepository';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

const createdItem = {
  id: 42,
  seller_id: 1,
  title: 'Body listrado',
  description: 'Novo',
  category: 'bodysuit',
  gender: 'unisex',
  clothing_size: 'M',
  condition: 'new',
  price_cents: 4500,
  status: 'active',
};

const validInput = {
  title: 'Body listrado',
  description: 'Novo',
  category: 'bodysuit',
  gender: 'unisex' as const,
  clothingSize: 'M',
  condition: 'new' as const,
  priceCents: 4500,
  photos: [] as File[],
};

describe('HttpItemRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates the item via JSON and uploads photos via presigned URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createdItem, 201))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            upload_url: 'https://bucket.example.com/put',
            photo: { id: 1, url: 'https://cdn.example.com/f.jpg', position: 0 },
          },
          201,
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpItemRepository();
    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });
    const item = await repo.create({ ...validInput, photos: [file] });

    // 1a chamada: POST /api/items com JSON (nunca multipart)
    const [createUrl, createInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toBe('/api/items');
    expect((createInit.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    );
    expect(JSON.parse(createInit.body as string)).toMatchObject({
      title: 'Body listrado',
      clothing_size: 'M',
      price_cents: 4500,
    });

    // 2a chamada: registra a foto e recebe a presigned URL
    expect(fetchMock.mock.calls[1][0]).toBe('/api/items/42/photos');

    // 3a chamada: PUT direto na presigned URL (fora do proxy /api)
    const [putUrl, putInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(putUrl).toBe('https://bucket.example.com/put');
    expect(putInit.method).toBe('PUT');
    expect((putInit.headers as Record<string, string>)['Content-Type']).toBe('image/jpeg');

    expect(item.id).toBe('42');
    expect(item.photoUrls).toEqual(['https://cdn.example.com/f.jpg']);
  });

  it('parses findById without {item} wrapper and sorts photos by position', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          ...createdItem,
          photos: [
            { id: 1, url: 'https://cdn.example.com/b.jpg', position: 1 },
            { id: 2, url: 'https://cdn.example.com/a.jpg', position: 0 },
          ],
        }),
      ),
    );

    const repo = new HttpItemRepository();
    const item = await repo.findById('42');

    expect(item.photoUrls).toEqual([
      'https://cdn.example.com/a.jpg',
      'https://cdn.example.com/b.jpg',
    ]);
  });

  it('throws when photo upload PUT fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(createdItem, 201))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            upload_url: 'https://bucket.example.com/put',
            photo: { id: 1, url: 'https://cdn.example.com/f.jpg', position: 0 },
          },
          201,
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);

    const repo = new HttpItemRepository();
    const file = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' });

    await expect(repo.create({ ...validInput, photos: [file] })).rejects.toThrow(
      'Photo upload failed: 403',
    );
  });
});
