import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChatState } from '../../src/types.js';

const { mockInvoke } = vi.hoisted(() => {
  const mockInvoke = vi.fn().mockResolvedValue({
    content:
      'Encontrei alguns bodies para a Sofia!\n\n```json\n{"type":"carousel","data":{"items":[{"id":"1","title":"Body Rosa"}]}}\n```\n\nGostou de algum?',
  });
  return { mockInvoke };
});

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));

const { formatResponse } = await import('../../src/nodes/format-response.js');

const baseState: ChatState = {
  message: 'Quero bodies para Sofia',
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
  items: [
    {
      id: '1',
      title: 'Body Rosa',
      category: 'body',
      clothing_size: 'P',
      condition: 'like_new',
      price_cents: 3500,
    },
  ],
};

describe('formatResponse', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    mockInvoke.mockResolvedValue({
      content:
        'Encontrei alguns bodies para a Sofia!\n\n```json\n{"type":"carousel","data":{"items":[{"id":"1","title":"Body Rosa"}]}}\n```\n\nGostou de algum?',
    });
  });

  it('generates response with component references', async () => {
    const result = await formatResponse(baseState);

    expect(result.response).toContain('Sofia');
    expect(result.components).toHaveLength(1);
    expect(result.components![0].type).toBe('carousel');
  });

  it('cleans JSON blocks from response text', async () => {
    const result = await formatResponse(baseState);

    // Response text should not contain the raw JSON block
    expect(result.response).not.toContain('```json');
    expect(result.response).not.toContain('"type":"carousel"');
  });

  it('handles errors gracefully', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('API error'));

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

    const result = await formatResponse(state);
    expect(result.response).toContain('problema');
    expect(result.components).toEqual([]);
  });
});
