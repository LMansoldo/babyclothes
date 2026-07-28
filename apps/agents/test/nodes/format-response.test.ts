import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChatState } from '../../src/types.js';

const { mockInvoke } = vi.hoisted(() => {
  const mockInvoke = vi
    .fn()
    .mockResolvedValue({ content: 'Encontrei alguns bodies para a Sofia! Gostou de algum?' });
  return { mockInvoke };
});

vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
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
      { recorded_at: '2024-01-15', weight_g: 5000, height_cm: 60, clothing_size: 'P' },
    ],
  },
  items: [
    {
      id: '1',
      title: 'Body Rosa',
      category: 'bodysuit',
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
      content: 'Encontrei alguns bodies para a Sofia! Gostou de algum?',
    });
  });

  it('returns the LLM text as response', async () => {
    const result = await formatResponse(baseState);
    expect(result.response).toContain('Sofia');
  });

  it('does not return components', async () => {
    const result = await formatResponse(baseState);
    expect(result.components).toBeUndefined();
  });

  it('returns a friendly fallback on error', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('API error'));
    const result = await formatResponse(baseState);
    expect(result.response).toContain('problema');
  });
});
