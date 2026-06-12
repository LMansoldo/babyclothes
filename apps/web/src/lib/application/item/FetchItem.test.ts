import { describe, it, expect, vi } from 'vitest'
import { FetchItem } from './FetchItem'
import type { IItemRepository } from '$lib/domain/item/repositories/IItemRepository'
import type { Item } from '$lib/domain/item/entities/Item'

describe('FetchItem', () => {
  const mockItem: Item = {
    id: 'item-42',
    sellerId: 'u-1',
    title: 'Body branco',
    description: '',
    category: 'body',
    gender: 'unisex',
    clothingSize: 'P',
    condition: 'new',
    priceCents: 2000,
    status: 'active',
    photoUrls: [],
  }

  it('returns item by id', async () => {
    const items: IItemRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockItem),
      delete: vi.fn(),
    }

    const useCase = new FetchItem(items)
    const item = await useCase.execute('item-42')

    expect(items.findById).toHaveBeenCalledWith('item-42')
    expect(item.id).toBe('item-42')
  })
})
