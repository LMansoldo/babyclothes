import type {
  IItemRepository,
  CreateItemInput,
} from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';
import { mapApiItem, type ApiItemDTO, type ApiPhotoDTO } from './apiItemMapper';

type PhotoUploadResponse = {
  upload_url: string;
  photo: ApiPhotoDTO;
};

export class HttpItemRepository implements IItemRepository {
  private readonly baseUrl = '/api';

  async create(data: CreateItemInput): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        category: data.category,
        gender: data.gender,
        clothing_size: data.clothingSize,
        condition: data.condition,
        price_cents: data.priceCents,
      }),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(err.error ?? `Create item failed: ${res.status}`);
    }

    const dto = (await res.json()) as ApiItemDTO;

    const photoUrls: string[] = [];
    for (const photo of data.photos) {
      photoUrls.push(await this.uploadPhoto(dto.id, photo));
    }

    return { ...mapApiItem(dto), photoUrls };
  }

  async findById(id: string): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}`);

    if (!res.ok) {
      throw new Error(`Item ${id} not found: ${res.status}`);
    }

    const dto = (await res.json()) as ApiItemDTO;
    return mapApiItem(dto);
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      throw new Error(`Delete item ${id} failed: ${res.status}`);
    }
  }

  private async uploadPhoto(itemId: number | string, file: File): Promise<string> {
    const res = await fetch(`${this.baseUrl}/items/${itemId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    if (!res.ok) {
      throw new Error(`Photo registration failed: ${res.status}`);
    }

    const { upload_url, photo } = (await res.json()) as PhotoUploadResponse;

    // PUT direto no bucket (presigned) — nao passa pelo proxy /api
    const put = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: file,
    });

    if (!put.ok) {
      throw new Error(`Photo upload failed: ${put.status}`);
    }

    return photo.url;
  }
}
