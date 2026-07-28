/**
 * Turns final graph state into ordered SSE chunk objects.
 * Text first, then a deterministic item-cards component when items exist.
 */
import type { ChatState, CatalogItem } from './types.js';

export type ChatEvent =
  | { type: 'text'; content: string }
  | { type: 'component'; component: 'itemCarousel'; props: { items: CatalogItem[] } };

export function buildChatEvents(state: ChatState): ChatEvent[] {
  const events: ChatEvent[] = [];

  if (state.response) {
    events.push({ type: 'text', content: state.response });
  }

  if (state.items && state.items.length > 0) {
    events.push({ type: 'component', component: 'itemCarousel', props: { items: state.items } });
  }

  return events;
}
