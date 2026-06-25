import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        category: 'body',
        size: null,
        gender: 'female',
        keywords: ['rosa'],
      }),
    }),
  })),
}));

vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    searchItems: vi.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Body Rosa',
        category: 'body',
        clothing_size: 'M',
        condition: 'like_new',
        price_cents: 3500,
      },
    ]),
  },
}));

import { fetchItems } from '../../src/nodes/fetch-items.js';
import type { ChatState } from '../../src/types.js';

describe('fetchItems', () => {
  it('fetches items based on LLM-extracted params', async () => {
    const state: ChatState = {
      message: 'Quero um body rosa para minha filha',
      child_context: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [
          {
            recorded_at: '2024-01-15',
            weight_g: 5000,
            height_cm: 60,
            clothing_size: 'P',
          },
        ],
      },
    };

    const result = await fetchItems(state);

    expect(result.items).toHaveLength(1);
    expect(result.items![0].title).toBe('Body Rosa');
  });

  it('returns empty array on error', async () => {
    // Override the mocked searchItems to throw
    const { apiClient } = await import('../../src/api-client.js');
    const originalSearch = apiClient.searchItems;
    (apiClient as any).searchItems = vi.fn().mockRejectedValue(new Error('API error'));

    const state: ChatState = {
      message: 'test',
      child_context: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
    };

    try {
      const result = await fetchItems(state);
      expect(result.items).toEqual([]);
    } finally {
      (apiClient as any).searchItems = originalSearch;
    }
  });
});
