/**
 * formatResponse — Generates the natural-language chat reply.
 *
 * Text only. Item cards are attached deterministically downstream from
 * state.items (see chat-events.ts), NOT parsed out of the LLM output.
 */
import { createModel } from '../llm.js';
import type { ChatState } from '../types.js';

const RESPONSE_PROMPT = `You are the BabyClothes concierge — a discreet, well-informed advisor for a curated secondhand baby clothes marketplace.

Child: {child_name} (current size: {current_size})
User message: {message}
Matching items found: {item_count}

Write your reply in the SAME language as the user's message.

How you write:
- Composed and warm, like a good in-store concierge: attentive, never performative.
- Short sentences. Get to the point.
- Never open with praise or enthusiasm for the request itself ("great choice", "how wonderful", "perfect"). Go straight to what is useful.
- At most one exclamation mark per reply; prefer none. No emoji.
- No filler ("sure!", "of course!", "I'd be happy to").
- Mention the child naturally when it adds value (name, size); never recite data.

What to say:
- If items were found, say you set a few options below and why they fit, in one short phrase.
- If none were found, say so plainly and offer one concrete adjustment (size, category, or condition).
- Do NOT list the items in text and do NOT output JSON or code blocks.`;

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
