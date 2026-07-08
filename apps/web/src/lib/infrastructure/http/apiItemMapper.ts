import type { Item } from '$lib/domain/item/entities/Item';

export type ApiPhotoDTO = {
  id: number | string;
  url: string;
  position: number | null;
};

export type ApiItemDTO = {
  id: number | string;
  seller_id: number | string;
  title: string;
  description: string | null;
  category: string;
  gender: 'male' | 'female' | 'unisex';
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  status: 'active' | 'sold' | 'removed';
  photos?: ApiPhotoDTO[];
  seller?: {
    id: number | string;
    name: string;
    avatar_url: string;
    verified: boolean;
  } | null;
};

export function mapApiItem(dto: ApiItemDTO): Item {
  return {
    id: String(dto.id),
    sellerId: String(dto.seller_id),
    title: dto.title,
    description: dto.description ?? '',
    category: dto.category,
    gender: dto.gender,
    clothingSize: dto.clothing_size,
    condition: dto.condition,
    priceCents: dto.price_cents,
    status: dto.status,
    photoUrls: sortedPhotoUrls(dto.photos),
  };
}

function sortedPhotoUrls(photos: ApiPhotoDTO[] | undefined): string[] {
  if (!photos) return [];
  return [...photos]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((photo) => photo.url);
}
