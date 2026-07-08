import type { ICatalogRepository } from '$lib/domain/catalog/repositories/ICatalogRepository';
import type { Filter } from '$lib/domain/catalog/value-objects/Filter';
import type { Item } from '$lib/domain/item/entities/Item';

type CatalogItemDTO = {
  id: number | string;
  title: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  photo_url: string | null;
  seller: { id: number | string; name: string; avatar_url: string } | null;
  inserted_at?: string;
};

type CatalogResponse = {
  items: CatalogItemDTO[];
  pagination: { page: number; per_page: number; total: number };
};

export class HttpCatalogRepository implements ICatalogRepository {
  private readonly baseUrl = '/api';

  async fetch(filter: Filter): Promise<Item[]> {
    const params = new URLSearchParams();
    if (filter.size) params.set('size', filter.size);
    if (filter.category) params.set('category', filter.category);
    if (filter.gender) params.set('gender', filter.gender);
    if (filter.condition) params.set('condition', filter.condition);

    const res = await fetch(`${this.baseUrl}/catalog?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Catalog fetch failed: ${res.status}`);
    }

    const body = (await res.json()) as CatalogResponse;
    return body.items.map(mapCatalogItem);
  }
}

function mapCatalogItem(dto: CatalogItemDTO): Item {
  return {
    id: String(dto.id),
    sellerId: dto.seller ? String(dto.seller.id) : '',
    title: dto.title,
    description: '',
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: 'active',
    photoUrls: dto.photo_url ? [dto.photo_url] : [],
  };
}
