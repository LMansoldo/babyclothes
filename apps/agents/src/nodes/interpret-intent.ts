/**
 * interpretIntent — Classifies the user's message intent.
 *
 * Uses Anthropic Claude to determine what the user wants:
 * - search_items: Looking for specific clothing
 * - ask_recommendation: Wants suggestions based on child
 * - general_question: General baby/clothing question
 * - greeting: Hello/hi
 * - unknown: Can't determine
 */

import { ChatAnthropic } from '@langchain/anthropic';
import type { ChatState } from '../types.js';

const INTENT_PROMPT = `Classify the user message into one of these intents:
- search_items: User is looking for specific clothing items
- ask_recommendation: User wants suggestions based on their child
- general_question: General question about baby clothes or sizes
- greeting: Simple greeting or hello
- unknown: Cannot determine intent

Respond with ONLY the intent name, nothing else.

User message: {message}`;

const model = new ChatAnthropic({
  modelName: 'claude-sonnet-4-20250514',
  temperature: 0,
  maxTokens: 20,
});

export async function interpretIntent(state: ChatState): Promise<Partial<ChatState>> {
  try {
    const response = await model.invoke(
      INTENT_PROMPT.replace('{message}', state.message)
    );

    const intent = response.content.toString().trim().toLowerCase();

    const validIntents = [
      'search_items',
      'ask_recommendation',
      'general_question',
      'greeting',
      'unknown',
    ];

    return {
      intent: validIntents.includes(intent)
        ? (intent as ChatState['intent'])
        : 'unknown',
    };
  } catch (error) {
    console.error('interpretIntent error:', error);
    return { intent: 'unknown' };
  }
}
