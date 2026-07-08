import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_MOCK_DATA } from '$lib/env';
import { mockItems, mockSellers } from '$lib/mocks/data';
import { mapApiItem, type ApiItemDTO } from '$lib/infrastructure/http/apiItemMapper';
import type { Item } from '$lib/domain/item/entities/Item';

export type SellerInfo = {
  name: string;
  avatarUrl: string;
  verified: boolean;
};

type ItemDetail = { item: Item; seller: SellerInfo | null };

export const load: PageServerLoad = async ({ params, fetch }): Promise<ItemDetail> => {
  if (PUBLIC_MOCK_DATA === 'true') {
    return loadFromMocks(params.id);
  }

  const res = await fetch(`/api/items/${params.id}`);
  if (res.status === 404) throw error(404, 'Item not found');
  if (!res.ok) throw error(502, 'Failed to load item');

  const dto = (await res.json()) as ApiItemDTO;
  return { item: mapApiItem(dto), seller: mapSeller(dto) };
};

function mapSeller(dto: ApiItemDTO): SellerInfo | null {
  if (!dto.seller) return null;
  return {
    name: dto.seller.name,
    avatarUrl: dto.seller.avatar_url,
    verified: dto.seller.verified,
  };
}

function loadFromMocks(id: string): ItemDetail {
  const item = mockItems.find((mock) => mock.id === id);
  if (!item) throw error(404, 'Item not found');

  const seller = mockSellers[item.sellerId];
  return {
    item,
    seller: seller
      ? { name: seller.name, avatarUrl: seller.avatarUrl, verified: seller.verified }
      : null,
  };
}
