import { describe, it, expect, vi } from 'vitest';

const { ChatGoogleGenerativeAI } = vi.hoisted(() => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation((opts: unknown) => ({ opts })),
}));

vi.mock('@langchain/google-genai', () => ({ ChatGoogleGenerativeAI }));

const { createModel } = await import('../src/llm.js');

describe('createModel', () => {
  it('builds a Gemini model with api key, env model, and temperature', () => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_MODEL = 'gemini-test';

    createModel({ temperature: 0.7, maxOutputTokens: 500 });

    expect(ChatGoogleGenerativeAI).toHaveBeenCalledWith({
      apiKey: 'test-key',
      model: 'gemini-test',
      temperature: 0.7,
      maxOutputTokens: 500,
    });
  });
});
