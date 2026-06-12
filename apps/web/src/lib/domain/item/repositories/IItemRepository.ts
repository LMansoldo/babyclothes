import type { Item } from '../entities/Item'

export type CreateItemInput = {
  title: string
  description: string
  category: string
  gender: 'male' | 'female' | 'unisex'
  clothingSize: string
  condition: 'new' | 'like_new' | 'used'
  priceCents: number
  photos: File[]
}

export interface IItemRepository {
  create(data: CreateItemInput): Promise<Item>
  findById(id: string): Promise<Item>
  delete(id: string): Promise<void>
}
