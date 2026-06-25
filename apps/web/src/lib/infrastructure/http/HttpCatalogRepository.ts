import { PUBLIC_API_URL } from '$lib/env';
import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository';
import type { Filter } from '$lib/domain/catalog/value-objects/Filter';
import type { Item } from '$lib/domain/item/entities/Item';
import { getAuthToken } from './HttpAuthRepository';

export class HttpCatalogRepository implements ICatalogRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = PUBLIC_API_URL;
  }

  async fetch(filter: Filter): Promise<Item[]> {
    const params = new URLSearchParams();
    if (filter.size) params.set('size', filter.size);
    if (filter.category) params.set('category', filter.category);
    if (filter.gender) params.set('gender', filter.gender);
    if (filter.condition) params.set('condition', filter.condition);

    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(`${this.baseUrl}/catalog?${params.toString()}`, { headers });

    if (!res.ok) {
      throw new Error(`Catalog fetch failed: ${res.status}`);
    }

    const body = (await res.json()) as CatalogResponse;
    // API returns { sections: { trending: [...], newborn: [...], ... } }
    // Flatten all sections into a single items array, deduplicating by id
    const seen = new Set<string>();
    const items: Item[] = [];
    for (const section of Object.values(body.sections)) {
      for (const dto of section) {
        if (!seen.has(String(dto.id))) {
          seen.add(String(dto.id));
          items.push(mapItem(dto));
        }
      }
    }
    return items;
  }
}

type CatalogResponse = {
  sections: Record<string, ApiItemDTO[]>;
};

type ApiItemDTO = {
  id: number | string;
  seller_id: string | number;
  title: string;
  description: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  status: 'active' | 'sold' | 'paused';
  photo_urls?: string[];
  inserted_at?: string;
};

function mapItem(dto: ApiItemDTO): Item {
  return {
    id: String(dto.id),
    sellerId: String(dto.seller_id),
    title: dto.title,
    description: dto.description,
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: dto.status,
    photoUrls: dto.photo_urls ?? [],
  };
}
