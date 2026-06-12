import { env } from '$env/dynamic/public'
import type { IItemRepository, CreateItemInput } from '$lib/domain/item/repositories/IItemRepository'
import type { Item } from '$lib/domain/item/entities/Item'
import { getAuthToken } from './HttpAuthRepository'

export class HttpItemRepository implements IItemRepository {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = env.PUBLIC_API_URL ?? ''
  }

  private authHeaders(): Record<string, string> {
    const token = getAuthToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async create(data: CreateItemInput): Promise<Item> {
    const form = new FormData()
    form.append('title', data.title)
    form.append('description', data.description ?? '')
    form.append('category', data.category)
    form.append('gender', data.gender)
    form.append('clothing_size', data.clothingSize)
    form.append('condition', data.condition)
    form.append('price_cents', String(data.priceCents))
    for (const photo of data.photos) {
      form.append('photos[]', photo)
    }

    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: form,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? `Create item failed: ${res.status}`)
    }

    const { item } = await res.json() as { item: ApiItemDTO }
    return mapItem(item)
  }

  async findById(id: string): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, {
      headers: this.authHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Item ${id} not found: ${res.status}`)
    }

    const { item } = await res.json() as { item: ApiItemDTO }
    return mapItem(item)
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE',
      headers: this.authHeaders(),
    })

    if (!res.ok) {
      throw new Error(`Delete item ${id} failed: ${res.status}`)
    }
  }
}

type ApiItemDTO = {
  id: string
  seller_id: string
  title: string
  description: string
  category: string
  gender: 'male' | 'female' | 'unisex'
  clothing_size: string
  condition: 'new' | 'like_new' | 'used'
  price_cents: number
  status: 'active' | 'sold' | 'paused'
  photo_urls: string[]
}

function mapItem(dto: ApiItemDTO): Item {
  return {
    id: dto.id,
    sellerId: dto.seller_id,
    title: dto.title,
    description: dto.description,
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: dto.status,
    photoUrls: dto.photo_urls,
  }
}
