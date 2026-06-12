import type { IItemRepository, CreateItemInput } from '$lib/domain/item/repositories/IItemRepository'
import { CreateItemInputSchema } from '$lib/domain/item/schemas'
import type { Item } from '$lib/domain/item/entities/Item'

export class CreateItem {
  constructor(private readonly items: IItemRepository) {}

  async execute(data: CreateItemInput): Promise<Item> {
    CreateItemInputSchema.parse({
      title: data.title,
      description: data.description,
      category: data.category,
      gender: data.gender,
      clothingSize: data.clothingSize,
      condition: data.condition,
      priceCents: data.priceCents,
    })

    return this.items.create(data)
  }
}
