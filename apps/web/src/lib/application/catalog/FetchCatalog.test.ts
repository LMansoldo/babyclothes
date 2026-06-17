import { describe, it, expect, vi } from 'vitest';
import { FetchCatalog } from './FetchCatalog';
import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository';
import type { Item } from '$lib/domain/item/entities/Item';
import type { Filter } from '$lib/domain/catalog/value-objects/Filter';

describe('FetchCatalog', () => {
  const mockItems: Item[] = [
    {
      id: 'item-1',
      sellerId: 'u-2',
      title: 'Macacão',
      description: '',
      category: 'macacao',
      gender: 'female',
      clothingSize: 'M',
      condition: 'like_new',
      priceCents: 3500,
      status: 'active',
      photoUrls: [],
    },
  ];

  it('fetches items with the given filter', async () => {
    const catalog: ICatalogRepository = {
      fetch: vi.fn().mockResolvedValue(mockItems),
    };

    const useCase = new FetchCatalog(catalog);
    const filter: Filter = { size: 'M', gender: 'female' };
    const items = await useCase.execute(filter);

    expect(catalog.fetch).toHaveBeenCalledWith(filter);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-1');
  });

  it('returns empty array when no items match', async () => {
    const catalog: ICatalogRepository = {
      fetch: vi.fn().mockResolvedValue([]),
    };

    const useCase = new FetchCatalog(catalog);
    const items = await useCase.execute({});

    expect(items).toEqual([]);
  });
});
