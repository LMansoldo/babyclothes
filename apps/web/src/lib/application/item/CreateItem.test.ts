import { describe, it, expect, vi } from 'vitest';
import { CreateItem } from './CreateItem';
import type { IItemRepository } from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';

describe('CreateItem', () => {
  const mockItem: Item = {
    id: 'item-1',
    sellerId: 'u-1',
    title: 'Macacão manga longa azul',
    description: 'Usado poucas vezes',
    category: 'macacao',
    gender: 'male',
    clothingSize: 'M',
    condition: 'like_new',
    priceCents: 3500,
    status: 'active',
    photoUrls: ['https://example.com/photo1.jpg'],
  };

  const validInput = {
    title: 'Macacão manga longa azul',
    description: 'Usado poucas vezes',
    category: 'macacao',
    gender: 'male' as const,
    clothingSize: 'M' as const,
    condition: 'like_new' as const,
    priceCents: 3500,
    photos: [],
  };

  it('validates input and calls items.create()', async () => {
    const items: IItemRepository = {
      create: vi.fn().mockResolvedValue(mockItem),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateItem(items);
    const result = await useCase.execute(validInput);

    expect(items.create).toHaveBeenCalledOnce();
    expect(result.id).toBe('item-1');
  });

  it('throws ZodError for invalid input — invalid clothingSize', async () => {
    const items: IItemRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateItem(items);
    await expect(useCase.execute({ ...validInput, clothingSize: 'XL' })).rejects.toThrow();
    expect(items.create).not.toHaveBeenCalled();
  });

  it('throws ZodError for negative price', async () => {
    const items: IItemRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateItem(items);
    await expect(useCase.execute({ ...validInput, priceCents: -1 })).rejects.toThrow();
    expect(items.create).not.toHaveBeenCalled();
  });
});
