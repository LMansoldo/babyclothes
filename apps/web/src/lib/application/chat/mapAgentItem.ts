import type { Item } from '$lib/domain/item/entities/Item';

export type AgentItem = {
  id: string;
  title: string;
  category: string;
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  photo_url?: string | null;
  gender?: 'male' | 'female' | 'unisex';
};

export function mapAgentItem(raw: AgentItem): Item {
  return {
    id: String(raw.id),
    sellerId: '',
    title: raw.title,
    description: '',
    category: raw.category,
    gender: raw.gender ?? 'unisex',
    clothingSize: raw.clothing_size,
    condition: raw.condition,
    priceCents: raw.price_cents,
    status: 'active',
    photoUrls: raw.photo_url ? [raw.photo_url] : [],
  };
}
