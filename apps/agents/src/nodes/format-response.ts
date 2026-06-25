/**
 * formatResponse — Generates the final chat response with component references.
 *
 * Uses Anthropic Claude with the Component Manifest to:
 * 1. Generate natural language response
 * 2. Include appropriate component references (Carousel, ItemList)
 * 3. Format in the user's language
 */

import { ChatAnthropic } from '@langchain/anthropic';
import { COMPONENT_MANIFEST } from '../manifest.js';
import type { ChatState, ComponentReference } from '../types.js';

const RESPONSE_PROMPT = `${COMPONENT_MANIFEST}

## Current Context

Child: {child_name} (size: {current_size})
User message: {message}
Available items: {items}

Generate a helpful response. If showing items, include a Carousel or ItemList component reference as JSON.
Respond in the same language as the user's message.`;

const model = new ChatAnthropic({
  modelName: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 500,
});

function extractComponents(response: string): ComponentReference[] {
  const components: ComponentReference[] = [];
  const jsonRegex = /```json\s*({[\s\S]*?})\s*```/g;
  let match;

  while ((match = jsonRegex.exec(response)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.type && parsed.data) {
        components.push(parsed as ComponentReference);
      }
    } catch {
      // Skip invalid JSON
    }
  }

  return components;
}

function cleanResponse(response: string): string {
  // Remove JSON code blocks from the response text
  return response
    .replace(/```json\s*{[\s\S]*?}\s*```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function formatResponse(state: ChatState): Promise<Partial<ChatState>> {
  try {
    const currentSize =
      state.child_context.measurements.length > 0
        ? state.child_context.measurements[state.child_context.measurements.length - 1]
            .clothing_size
        : 'unknown';

    const response = await model.invoke(
      RESPONSE_PROMPT
        .replace('{child_name}', state.child_context.name)
        .replace('{current_size}', currentSize)
        .replace('{message}', state.message)
        .replace('{items}', JSON.stringify(state.items || []))
    );

    const rawResponse = response.content.toString();
    const components = extractComponents(rawResponse);
    const cleanText = cleanResponse(rawResponse);

    return {
      response: cleanText,
      components,
    };
  } catch (error) {
    console.error('formatResponse error:', error);
    return {
      response: 'Desculpe, tive um problema. Pode tentar novamente?',
      components: [],
    };
  }
}
