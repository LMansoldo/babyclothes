import { env } from '$env/dynamic/public'
import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository'
import type { Filter } from '$lib/domain/catalog/value-objects/Filter'
import type { Item } from '$lib/domain/item/entities/Item'
import { getAuthToken } from './HttpAuthRepository'

export class HttpCatalogRepository implements ICatalogRepository {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = env.PUBLIC_API_URL ?? ''
  }

  async fetch(filter: Filter): Promise<Item[]> {
    const params = new URLSearchParams()
    if (filter.size) params.set('size', filter.size)
    if (filter.category) params.set('category', filter.category)
    if (filter.gender) params.set('gender', filter.gender)
    if (filter.condition) params.set('condition', filter.condition)

    const token = getAuthToken()
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {}

    const res = await fetch(`${this.baseUrl}/catalog?${params.toString()}`, { headers })

    if (!res.ok) {
      throw new Error(`Catalog fetch failed: ${res.status}`)
    }

    const { items } = await res.json() as { items: ApiItemDTO[]; total: number }
    return items.map(mapItem)
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
