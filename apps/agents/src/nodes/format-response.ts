/**
 * formatResponse — Generates the natural-language chat reply.
 *
 * Text only. Item cards are attached deterministically downstream from
 * state.items (see chat-events.ts), NOT parsed out of the LLM output.
 */
import { createModel } from '../llm.js';
import type { ChatState } from '../types.js';

const RESPONSE_PROMPT = `You are BabyClothes AI, a friendly assistant for a baby clothes marketplace.

Child: {child_name} (size: {current_size})
User message: {message}
Number of matching items found: {item_count}

Write a short, warm reply in the SAME language as the user's message.
If items were found, tell the user you selected some options below for them.
If no items were found, say you could not find matches right now and suggest adjusting the search.
Do NOT list the items in text and do NOT output JSON or code blocks.`;

export async function formatResponse(state: ChatState): Promise<Partial<ChatState>> {
  try {
    const currentSize =
      state.child_context.measurements.length > 0
        ? state.child_context.measurements[state.child_context.measurements.length - 1]
            .clothing_size
        : 'unknown';

    const model = createModel({ temperature: 0.7, maxOutputTokens: 2048 });
    const response = await model.invoke(
      RESPONSE_PROMPT.replace('{child_name}', state.child_context.name || '')
        .replace('{current_size}', currentSize)
        .replace('{message}', state.message)
        .replace('{item_count}', String(state.items?.length ?? 0)),
    );

    return { response: response.content.toString().trim() };
  } catch (error) {
    console.error('formatResponse error:', error);
    return { response: 'Desculpe, tive um problema. Pode tentar novamente?' };
  }
}
