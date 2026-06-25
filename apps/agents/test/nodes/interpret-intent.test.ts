import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChatState } from '../../src/types.js';

// vi.hoisted ensures this is available when vi.mock is hoisted
const { mockInvoke } = vi.hoisted(() => {
  const mockInvoke = vi.fn().mockResolvedValue({ content: 'search_items' });
  return { mockInvoke };
});

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

const { interpretIntent } = await import('../../src/nodes/interpret-intent.js');

const baseState: ChatState = {
  message: 'Quero comprar um body para minha filha',
  child_context: {
    child_id: '1',
    name: 'Sofia',
    birth_date: '2023-01-15',
    gender: 'female',
    measurements: [],
  },
};

describe('interpretIntent', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue({ content: 'search_items' });
  });

  it('classifies search intent', async () => {
    const result = await interpretIntent(baseState);
    expect(result.intent).toBe('search_items');
  });

  it('returns unknown on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('API error'));

    const result = await interpretIntent(baseState);
    expect(result.intent).toBe('unknown');
  });
});
