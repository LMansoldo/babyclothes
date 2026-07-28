import type {
  IItemRepository,
  CreateItemInput,
} from '$lib/domain/item/repositories/IItemRepository';
import type { Item } from '$lib/domain/item/entities/Item';
import { mapApiItem, type ApiItemDTO, type ApiPhotoDTO } from './apiItemMapper';
import { httpClient, httpRequest } from './httpClient';

type PhotoUploadResponse = {
  upload_url: string;
  photo: ApiPhotoDTO;
};

export class HttpItemRepository implements IItemRepository {
  async create(data: CreateItemInput): Promise<Item> {
    const dto = await httpClient.post<ApiItemDTO>('/items', {
      title: data.title,
      description: data.description,
      category: data.category,
      gender: data.gender,
      clothing_size: data.clothingSize,
      condition: data.condition,
      price_cents: data.priceCents,
    });

    const photoUrls: string[] = [];
    for (const photo of data.photos) {
      photoUrls.push(await this.uploadPhoto(dto.id, photo));
    }

    return { ...mapApiItem(dto), photoUrls };
  }

  async findById(id: string): Promise<Item> {
    const dto = await httpClient.get<ApiItemDTO>(`/items/${id}`);
    return mapApiItem(dto);
  }

  async delete(id: string): Promise<void> {
    await httpClient.del(`/items/${id}`);
  }

  private async uploadPhoto(itemId: number | string, file: File): Promise<string> {
    // Register photo — goes through /api
    const { upload_url, photo } = await httpRequest<PhotoUploadResponse>(
      `/items/${itemId}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }
    );

    // PUT directly to bucket (presigned URL) — bypasses /api proxy, no toast needed
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
