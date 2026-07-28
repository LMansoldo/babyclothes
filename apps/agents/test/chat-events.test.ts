import { describe, it, expect } from 'vitest';
import { buildChatEvents } from '../src/chat-events.js';
import type { ChatState } from '../src/types.js';

const base: ChatState = {
  message: 'oi',
  child_context: { child_id: '1', name: 'Sofia', birth_date: '2023-01-15', gender: 'female', measurements: [] },
  response: 'Achei algumas opções!',
};

describe('buildChatEvents', () => {
  it('emits a text event', () => {
    const events = buildChatEvents(base);
    expect(events[0]).toEqual({ type: 'text', content: 'Achei algumas opções!' });
  });

  it('emits an itemCarousel component when items exist', () => {
    const items = [
      { id: '1', title: 'Body Rosa', category: 'bodysuit', clothing_size: 'P', condition: 'like_new', price_cents: 3500 },
    ];
    const events = buildChatEvents({ ...base, items });
    expect(events).toContainEqual({ type: 'component', component: 'itemCarousel', props: { items } });
  });

  it('emits no component when items are empty', () => {
    const events = buildChatEvents({ ...base, items: [] });
    expect(events.some((e) => e.type === 'component')).toBe(false);
  });
});
