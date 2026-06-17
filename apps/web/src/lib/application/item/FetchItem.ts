import type { IItemRepository } from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';

export class FetchItem {
  constructor(private readonly items: IItemRepository) {}

  async execute(id: string): Promise<Item> {
    return this.items.findById(id);
  }
}
