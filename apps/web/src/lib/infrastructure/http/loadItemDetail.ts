import { mapApiItem, type ApiItemDTO } from './apiItemMapper';
import type { Item } from '$lib/domain/item/entities/Item';

export type SellerInfo = {
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type ItemDetail = { item: Item; seller: SellerInfo | null };

export async function loadItemDetail(
  id: string,
  fetchFn: typeof fetch = fetch,
): Promise<ItemDetail> {
  const res = await fetchFn(`/api/items/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load item ${id}: ${res.status}`);
  }
  const dto = (await res.json()) as ApiItemDTO;
  return { item: mapApiItem(dto), seller: mapSeller(dto) };
}

function mapSeller(dto: ApiItemDTO): SellerInfo | null {
  if (!dto.seller) return null;
  return {
    name: dto.seller.name,
    avatarUrl: dto.seller.avatar_url,
    verified: dto.seller.verified,
  };
}
