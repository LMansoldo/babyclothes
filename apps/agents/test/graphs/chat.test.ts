import { describe, it, expect, vi } from 'vitest';

// Mock all nodes
vi.mock('../../src/nodes/interpret-intent.js', () => ({
  interpretIntent: vi.fn().mockResolvedValue({ intent: 'search_items' }),
}));

vi.mock('../../src/nodes/fetch-items.js', () => ({
  fetchItems: vi.fn().mockResolvedValue({
    items: [{ id: '1', title: 'Body Rosa', category: 'body', clothing_size: 'P', condition: 'like_new', price_cents: 3500 }],
  }),
}));

vi.mock('../../src/nodes/rank-items.js', () => ({
  rankItems: vi.fn().mockResolvedValue({
    items: [{ id: '1', title: 'Body Rosa', category: 'body', clothing_size: 'P', condition: 'like_new', price_cents: 3500 }],
  }),
}));

vi.mock('../../src/nodes/format-response.js', () => ({
  formatResponse: vi.fn().mockResolvedValue({
    response: 'Encontrei um body rosa!',
    components: [{ type: 'carousel', data: { items: [] } }],
  }),
}));

import { chatGraph } from '../../src/graphs/chat.js';

describe('chatGraph', () => {
  it('processes search intent through full pipeline', async () => {
    const result = await chatGraph({
      message: 'Quero um body rosa',
      child_context: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
    });

    expect(result.intent).toBe('search_items');
    expect(result.items).toHaveLength(1);
    expect(result.response).toContain('body rosa');
    expect(result.components).toHaveLength(1);
  });
});
