/**
 * Single place that constructs the LLM used by all chat nodes.
 * Provider: Google Gemini via @langchain/google-genai.
 */
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const DEFAULT_MODEL = 'gemini-pro-latest';

export function createModel(opts: {
  temperature: number;
  maxOutputTokens?: number;
}): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    temperature: opts.temperature,
    maxOutputTokens: opts.maxOutputTokens,
  });
}
