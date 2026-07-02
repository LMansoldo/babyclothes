import type {
  IItemRepository,
  CreateItemInput,
} from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';

export class HttpItemRepository implements IItemRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  private authHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }

  async create(data: CreateItemInput): Promise<Item> {
    const form = new FormData();
    form.append('title', data.title);
    form.append('description', data.description ?? '');
    form.append('category', data.category);
    form.append('gender', data.gender);
    form.append('clothing_size', data.clothingSize);
    form.append('condition', data.condition);
    form.append('price_cents', String(data.priceCents));
    for (const photo of data.photos) {
      form.append('photos[]', photo);
    }

    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Create item failed: ${res.status}`);
    }

    const { item } = (await res.json()) as { item: ApiItemDTO };
    return mapItem(item);
  }

  async findById(id: string): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}`);

    if (!res.ok) {
      throw new Error(`Item ${id} not found: ${res.status}`);
    }

    const { item } = (await res.json()) as { item: ApiItemDTO };
    return mapItem(item);
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Delete item ${id} failed: ${res.status}`);
    }
  }
}

type ApiItemDTO = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  status: 'active' | 'sold' | 'paused';
  photo_urls: string[];
};

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
  };
}
