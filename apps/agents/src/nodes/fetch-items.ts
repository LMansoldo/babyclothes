/**
 * fetchItems — Fetches relevant catalog items based on intent and child context.
 *
 * Determines search parameters from:
 * - Message content (extracted keywords)
 * - Child's current clothing size
 * - Child's gender
 */

import { createModel } from '../llm.js';
import { apiClient } from '../api-client.js';
import type { ChatState } from '../types.js';

const EXTRACT_PARAMS_PROMPT = `Extract search parameters from the user message.
Child context: {child_context}

Available categories: romper, bodysuit, dress, coat, set, accessory
Available sizes: RN, P, M, G, GG, 1, 2, 3, 4, 5, 6
Available genders: male, female, unisex

User message: {message}

Respond with JSON only:
{{"category": "string|null", "size": "string|null", "gender": "string|null", "keywords": ["string"]}}`;

const model = createModel({ temperature: 0, maxOutputTokens: 1500 });

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('{');
  return start === -1 ? text.trim() : text.slice(start).trim();
}

export async function fetchItems(state: ChatState): Promise<Partial<ChatState>> {
  try {
    // Extract search parameters using LLM
    const response = await model.invoke(
      EXTRACT_PARAMS_PROMPT
        .replace('{child_context}', JSON.stringify(state.child_context))
        .replace('{message}', state.message)
    );

    const params = JSON.parse(extractJson(response.content.toString()));

    // Use child's current size if no size specified
    const currentSize =
      state.child_context.measurements.length > 0
        ? state.child_context.measurements[state.child_context.measurements.length - 1]
            .clothing_size
        : undefined;

    // Fetch items from API
    const items = await apiClient.searchItems({
      category: params.category || undefined,
      size: params.size || currentSize,
      gender: params.gender || state.child_context.gender,
      limit: 10,
    });

    return { items };
  } catch (error) {
    console.error('fetchItems error:', error);
    return { items: [] };
  }
}
