import { describe, it, expect } from 'vitest';
import { mapAgentItem } from './mapAgentItem';

describe('mapAgentItem', () => {
  it('maps snake_case agent item to a domain Item', () => {
    const item = mapAgentItem({
      id: '7',
      title: 'Body Rosa',
      category: 'bodysuit',
      clothing_size: 'M',
      condition: 'like_new',
      price_cents: 4500,
      photo_url: 'https://img/1.jpg',
    });

    expect(item).toEqual({
      id: '7',
      sellerId: '',
      title: 'Body Rosa',
      description: '',
      category: 'bodysuit',
      gender: 'unisex',
      clothingSize: 'M',
      condition: 'like_new',
      priceCents: 4500,
      status: 'active',
      photoUrls: ['https://img/1.jpg'],
    });
  });

  it('uses an empty photo list when photo_url is missing', () => {
    const item = mapAgentItem({
      id: '8',
      title: 'X',
      category: 'set',
      clothing_size: 'P',
      condition: 'new',
      price_cents: 100,
      photo_url: null,
    });
    expect(item.photoUrls).toEqual([]);
  });
});
