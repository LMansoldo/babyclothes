import { describe, it, expect } from 'vitest';
import { rankItems } from '../../src/nodes/rank-items.js';
import type { ChatState, CatalogItem } from '../../src/types.js';

describe('rankItems', () => {
  const childContext = {
    child_id: '1',
    name: 'Sofia',
    birth_date: '2023-01-15',
    gender: 'female' as const,
    measurements: [
      {
        recorded_at: '2024-01-15',
        weight_g: 5000,
        height_cm: 60,
        clothing_size: 'P',
      },
    ],
  };

  it('ranks exact size match higher', async () => {
    const items: CatalogItem[] = [
      {
        id: '1',
        title: 'Item G',
        category: 'body',
        clothing_size: 'G',
        condition: 'new',
        price_cents: 3000,
      },
      {
        id: '2',
        title: 'Item P',
        category: 'body',
        clothing_size: 'P',
        condition: 'new',
        price_cents: 3000,
      },
    ];

    const state: ChatState = {
      message: 'test',
      child_context: childContext,
      items,
    };

    const result = await rankItems(state);
    expect(result.items![0].id).toBe('2'); // P should rank higher
  });

  it('ranks gender match higher', async () => {
    const items: CatalogItem[] = [
      {
        id: '1',
        title: 'Item Male',
        category: 'body',
        clothing_size: 'P',
        condition: 'new',
        price_cents: 3000,
        gender: 'male',
      },
      {
        id: '2',
        title: 'Item Female',
        category: 'body',
        clothing_size: 'P',
        condition: 'new',
        price_cents: 3000,
        gender: 'female',
      },
    ];

    const state: ChatState = {
      message: 'test',
      child_context: childContext,
      items,
    };

    const result = await rankItems(state);
    expect(result.items![0].id).toBe('2'); // Female should rank higher for female child
  });

  it('ranks lower price higher for similar items', async () => {
    const items: CatalogItem[] = [
      {
        id: '1',
        title: 'Expensive',
        category: 'body',
        clothing_size: 'P',
        condition: 'new',
        price_cents: 8000,
      },
      {
        id: '2',
        title: 'Cheap',
        category: 'body',
        clothing_size: 'P',
        condition: 'new',
        price_cents: 2000,
      },
    ];

    const state: ChatState = {
      message: 'test',
      child_context: childContext,
      items,
    };

    const result = await rankItems(state);
    expect(result.items![0].id).toBe('2'); // Cheaper should rank higher
  });

  it('returns empty for no items', async () => {
    const state: ChatState = {
      message: 'test',
      child_context: childContext,
      items: [],
    };

    const result = await rankItems(state);
    expect(result.items).toEqual([]);
  });
});
