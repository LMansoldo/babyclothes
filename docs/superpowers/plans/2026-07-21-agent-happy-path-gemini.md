# Agent Happy Path (Gemini) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the agent success path work end to end — from the item-search step onward the agent is powered by Google Gemini, returns selectable item cards, and clicking a card opens a modal with the item detail.

**Architecture:** Keep the client-side `IntakeMachine` (greeting → child count → child registration) unchanged. Swap the agents' LLM from Anthropic to Google Gemini. Make the item-cards component deterministic (attached from `state.items`, not parsed out of LLM text). On the web, render the cards and open a shared `ItemDetailView` inside the DS `Modal`. Seed item photos so results have images.

**Tech Stack:** TypeScript + LangGraph + `@langchain/google-genai` (agents), Elixir/Ecto (api seed), SvelteKit 2 + Svelte 5 runes (web), `@babyclothes/design-system`.

## Global Constraints

- Node 22, Yarn 4 workspaces with `nodeLinker: pnp`. Add deps by editing `package.json` then running `yarn install`.
- All app commands run inside Docker (`yarn dev`, `yarn test`, etc.), but unit tests for a single workspace may be run with `yarn workspace <name> test`.
- Svelte 5 runes only (`$props`, `$state`, `$derived`, `$effect`, `$bindable`). No emojis in UI — use `lucide-svelte` or inline SVG. BEM CSS (`.block__element--modifier`). Component-scoped `<style>`.
- All user-facing strings must exist in both `apps/web/src/lib/i18n/en.json` and `pt.json`, used via `$t('key')`.
- LLM provider is **Google Gemini** via `@langchain/google-genai` (`ChatGoogleGenerativeAI`). Env vars: `GEMINI_API_KEY` (secret, `.env` only, never committed) and `GEMINI_MODEL` (default `gemini-3-pro-preview` — confirm exact id against account access; it is read from env so changing it is a one-line edit).
- Semantic commits: `feat(scope):`, `fix(scope):`, `chore(scope):`.
- The real `GEMINI_API_KEY` value goes ONLY in the gitignored `.env`. Never write it into any committed file or this plan.

---

## File Structure

**apps/agents (create):**
- `src/llm.ts` — single factory that builds a `ChatGoogleGenerativeAI` model.
- `src/chat-events.ts` — pure function turning graph state into SSE chunk objects (testable).
- `test/llm.test.ts`, `test/chat-events.test.ts`

**apps/agents (modify):**
- `src/nodes/interpret-intent.ts`, `src/nodes/fetch-items.ts`, `src/nodes/format-response.ts` — use `createModel()` from `llm.ts`.
- `src/http-server.ts` — use `buildChatEvents()` from `chat-events.ts`.
- `test/setup.ts`, `test/nodes/interpret-intent.test.ts`, `test/nodes/fetch-items.test.ts`, `test/nodes/format-response.test.ts` — mock `@langchain/google-genai`.
- `package.json` — swap dependency.

**Root (modify):** `.env`, `.env.example`.

**apps/api (modify):** `priv/repo/seeds.exs` — add item photos.

**apps/web (create):**
- `src/lib/application/chat/mapAgentItem.ts` + `.test.ts` — agent item → domain `Item`.
- `src/lib/infrastructure/http/loadItemDetail.ts` + `.test.ts` — client fetch `/api/items/:id` → `{ item, seller }`.
- `src/lib/presentation/components/ItemDetailView.svelte` — shared detail view (gallery + tray).

**apps/web (modify):**
- `src/routes/agent/+page.svelte` — handle component chunks, render clickable cards, open modal.
- `src/routes/catalog/[id]/+page.svelte` — render shared `ItemDetailView`.

---

## Task 1: Gemini LLM factory + env + dependency (agents)

**Files:**
- Create: `apps/agents/src/llm.ts`
- Create: `apps/agents/test/llm.test.ts`
- Modify: `apps/agents/package.json`
- Modify: `apps/agents/test/setup.ts`
- Modify: `.env`, `.env.example`

**Interfaces:**
- Produces: `createModel(opts: { temperature: number; maxOutputTokens?: number }): ChatGoogleGenerativeAI` exported from `src/llm.ts`.

- [ ] **Step 1: Write the failing test** — `apps/agents/test/llm.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @babyclothes/agents test llm`
Expected: FAIL — cannot find `../src/llm.js`.

- [ ] **Step 3: Add the dependency to `apps/agents/package.json`**

In the `dependencies` object, remove `"@langchain/anthropic"` and `"@anthropic-ai/sdk"` lines and add:

```json
    "@langchain/google-genai": "^0.1.0",
```

Then install: `yarn install`
(If `^0.1.0` is incompatible with the installed `@langchain/core@^0.3.0`, run `yarn info @langchain/google-genai` and pick the latest version whose peer range includes `@langchain/core@0.3` — pin that exact version.)

- [ ] **Step 4: Create `apps/agents/src/llm.ts`**

```ts
/**
 * Single place that constructs the LLM used by all chat nodes.
 * Provider: Google Gemini via @langchain/google-genai.
 */
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const DEFAULT_MODEL = 'gemini-3-pro-preview';

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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `yarn workspace @babyclothes/agents test llm`
Expected: PASS.

- [ ] **Step 6: Update `apps/agents/test/setup.ts`**

Replace the line `process.env.ANTHROPIC_API_KEY = 'test-key';` with:

```ts
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_MODEL = 'gemini-test';
```

- [ ] **Step 7: Update root `.env` and `.env.example`**

In BOTH files, replace the `ANTHROPIC_API_KEY=...` line. In `.env.example`:

```
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-3-pro-preview
```

In `.env` set `GEMINI_API_KEY` to the real key (provided separately — do NOT commit this file; it is gitignored) and `GEMINI_MODEL=gemini-3-pro-preview`.

- [ ] **Step 8: Commit**

```bash
git add apps/agents/src/llm.ts apps/agents/test/llm.test.ts apps/agents/package.json apps/agents/test/setup.ts .env.example yarn.lock
git commit -m "feat(agents): Gemini LLM factory and env wiring"
```

---

## Task 2: Swap chat nodes to Gemini (agents)

**Files:**
- Modify: `apps/agents/src/nodes/interpret-intent.ts`
- Modify: `apps/agents/src/nodes/fetch-items.ts`
- Modify: `apps/agents/src/nodes/format-response.ts`
- Modify: `apps/agents/test/nodes/interpret-intent.test.ts`
- Modify: `apps/agents/test/nodes/fetch-items.test.ts`
- Modify: `apps/agents/test/nodes/format-response.test.ts`

**Interfaces:**
- Consumes: `createModel` from `src/llm.ts` (Task 1).
- Produces: `formatResponse(state): Promise<{ response: string }>` — returns text only, no `components`.

- [ ] **Step 1: Update the three node tests to mock Gemini instead of Anthropic**

In EACH of `interpret-intent.test.ts`, `fetch-items.test.ts`, `format-response.test.ts`, replace the mock block:

```ts
vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));
```

with:

```ts
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}));
```

- [ ] **Step 2: Rewrite the `format-response.test.ts` expectations (text-only, no JSON)**

Replace the hoisted mock content and the assertions so the test no longer expects JSON extraction. Full file:

```ts
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
```

- [ ] **Step 3: Run the three node tests — verify they FAIL**

Run: `yarn workspace @babyclothes/agents test nodes/interpret-intent nodes/fetch-items nodes/format-response`
Expected: FAIL (nodes still import `@langchain/anthropic`; format-response still extracts JSON).

- [ ] **Step 4: Update `interpret-intent.ts`**

Replace the import + model block (lines ~12 and ~26-30):

```ts
import { createModel } from '../llm.js';
```

and

```ts
const model = createModel({ temperature: 0, maxOutputTokens: 20 });
```

Delete the `import { ChatAnthropic } from '@langchain/anthropic';` line and the old `new ChatAnthropic({...})` block. Leave the rest of the file unchanged.

- [ ] **Step 5: Update `fetch-items.ts`**

Same swap: delete the `ChatAnthropic` import and `new ChatAnthropic({...})` block; add:

```ts
import { createModel } from '../llm.js';
```

```ts
const model = createModel({ temperature: 0, maxOutputTokens: 100 });
```

- [ ] **Step 6: Rewrite `format-response.ts` (text only, no component extraction)**

Full file:

```ts
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

    const model = createModel({ temperature: 0.7, maxOutputTokens: 500 });
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
```

- [ ] **Step 7: Run the three node tests — verify they PASS**

Run: `yarn workspace @babyclothes/agents test nodes/interpret-intent nodes/fetch-items nodes/format-response`
Expected: PASS. If `fetch-items.test.ts` asserts anything about `@langchain/anthropic`, update those references to `@langchain/google-genai`.

- [ ] **Step 8: Commit**

```bash
git add apps/agents/src/nodes apps/agents/test/nodes
git commit -m "feat(agents): drive chat nodes with Gemini, text-only format-response"
```

---

## Task 3: Deterministic item-cards SSE events (agents)

**Files:**
- Create: `apps/agents/src/chat-events.ts`
- Create: `apps/agents/test/chat-events.test.ts`
- Modify: `apps/agents/src/http-server.ts`

**Interfaces:**
- Consumes: `ChatState` from `src/types.ts`.
- Produces: `buildChatEvents(state: ChatState): Array<{ type: 'text'; content: string } | { type: 'component'; component: 'itemCarousel'; props: { items: CatalogItem[] } }>`.

- [ ] **Step 1: Write the failing test** — `apps/agents/test/chat-events.test.ts`

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @babyclothes/agents test chat-events`
Expected: FAIL — cannot find `../src/chat-events.js`.

- [ ] **Step 3: Create `apps/agents/src/chat-events.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn workspace @babyclothes/agents test chat-events`
Expected: PASS.

- [ ] **Step 5: Use `buildChatEvents` in `http-server.ts`**

In `apps/agents/src/http-server.ts`, add the import at the top with the others:

```ts
import { buildChatEvents } from './chat-events.js';
```

Replace the whole block inside the inner `try { ... }` (the part that starts `// Send text response` and includes the `if (state.response)` and `if (state.components)` loops) with:

```ts
        const state = await chatGraph({
          message,
          child_context: childContext,
        });

        for (const event of buildChatEvents(state)) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
```

(Delete the previous `const state = await chatGraph(...)` line that came before, since it is now inside this block. The `catch`/`res.end()` after it stay unchanged.)

- [ ] **Step 6: Run the full agents test suite**

Run: `yarn workspace @babyclothes/agents test`
Expected: PASS. If `test/integration.test.ts` or `test/graphs/chat.test.ts` assert the old JSON-in-text component behavior, update them to expect text-only `response` and to check items via state, not parsed components.

- [ ] **Step 7: Commit**

```bash
git add apps/agents/src/chat-events.ts apps/agents/test/chat-events.test.ts apps/agents/src/http-server.ts apps/agents/test
git commit -m "feat(agents): deterministic itemCarousel SSE event from state.items"
```

---

## Task 4: Seed item photos (api)

**Files:**
- Modify: `apps/api/priv/repo/seeds.exs`

- [ ] **Step 1: Capture inserted item ids and add photos**

In `apps/api/priv/repo/seeds.exs`, replace the items insertion block:

```elixir
Enum.each(items_data, fn attrs ->
  {:ok, item} =
    %Api.Items.Item{}
    |> Api.Items.Item.changeset(attrs)
    |> Repo.insert()

  IO.puts("  ✓ #{item.title} — R$#{Float.round(item.price_cents / 100, 2)} → id=#{item.id}")
end)
```

with:

```elixir
Enum.each(items_data, fn attrs ->
  {:ok, item} =
    %Api.Items.Item{}
    |> Api.Items.Item.changeset(attrs)
    |> Repo.insert()

  # Two photos per item so cards and the detail gallery have images.
  Enum.each(0..1, fn pos ->
    {:ok, _photo} =
      %Api.Items.Photo{}
      |> Api.Items.Photo.changeset(%{
        item_id: item.id,
        position: pos,
        url: "https://picsum.photos/seed/item-#{item.id}-#{pos}/600/600"
      })
      |> Repo.insert()
  end)

  IO.puts("  ✓ #{item.title} — R$#{Float.round(item.price_cents / 100, 2)} → id=#{item.id} (+2 photos)")
end)
```

- [ ] **Step 2: Re-run the seed and verify photos exist**

Run (containers up):

```bash
yarn dev            # if not already running
# then, in another shell:
docker compose exec api mix run priv/repo/seeds.exs
```

Expected: item lines print `(+2 photos)`. If seeds are not idempotent and error on duplicate users, reset the DB first per the project's usual reset step (e.g. `docker compose exec api mix ecto.reset`), then re-run.

- [ ] **Step 3: Verify the internal search now returns photo_url**

```bash
docker compose exec api sh -c 'curl -s "http://localhost:4000/internal/items/search?size=M&limit=3" -H "x-internal-key: $INTERNAL_API_KEY"'
```

Expected: JSON `items` array where each item has a non-null `photo_url`.

- [ ] **Step 4: Commit**

```bash
git add apps/api/priv/repo/seeds.exs
git commit -m "feat(api): seed item photos for agent recommendations"
```

---

## Task 5: Agent item → domain Item mapper (web)

**Files:**
- Create: `apps/web/src/lib/application/chat/mapAgentItem.ts`
- Create: `apps/web/src/lib/application/chat/mapAgentItem.test.ts`

**Interfaces:**
- Produces: `mapAgentItem(raw: AgentItem): Item` and `type AgentItem`.
- `AgentItem` = `{ id: string; title: string; category: string; clothing_size: string; condition: 'new' | 'like_new' | 'used'; price_cents: number; photo_url?: string | null; gender?: 'male' | 'female' | 'unisex' }`.

- [ ] **Step 1: Write the failing test** — `apps/web/src/lib/application/chat/mapAgentItem.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { mapAgentItem } from './mapAgentItem';

describe('mapAgentItem', () => {
  it('maps snake_case agent item to a domain Item', () => {
    const item = mapAgentItem({
      id: '7',
      title: 'Body Rosa',
      category: 'bodysuit',
      clothing_size: 'M',
      condition: 'like_new',
      price_cents: 4500,
      photo_url: 'https://img/1.jpg',
    });

    expect(item).toEqual({
      id: '7',
      sellerId: '',
      title: 'Body Rosa',
      description: '',
      category: 'bodysuit',
      gender: 'unisex',
      clothingSize: 'M',
      condition: 'like_new',
      priceCents: 4500,
      status: 'active',
      photoUrls: ['https://img/1.jpg'],
    });
  });

  it('uses an empty photo list when photo_url is missing', () => {
    const item = mapAgentItem({
      id: '8',
      title: 'X',
      category: 'set',
      clothing_size: 'P',
      condition: 'new',
      price_cents: 100,
      photo_url: null,
    });
    expect(item.photoUrls).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @babyclothes/web test mapAgentItem`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `apps/web/src/lib/application/chat/mapAgentItem.ts`**

```ts
import type { Item } from '$lib/domain/item/entities/Item';

export type AgentItem = {
  id: string;
  title: string;
  category: string;
  clothing_size: string;
  condition: 'new' | 'like_new' | 'used';
  price_cents: number;
  photo_url?: string | null;
  gender?: 'male' | 'female' | 'unisex';
};

export function mapAgentItem(raw: AgentItem): Item {
  return {
    id: String(raw.id),
    sellerId: '',
    title: raw.title,
    description: '',
    category: raw.category,
    gender: raw.gender ?? 'unisex',
    clothingSize: raw.clothing_size,
    condition: raw.condition,
    priceCents: raw.price_cents,
    status: 'active',
    photoUrls: raw.photo_url ? [raw.photo_url] : [],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn workspace @babyclothes/web test mapAgentItem`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/application/chat/mapAgentItem.ts apps/web/src/lib/application/chat/mapAgentItem.test.ts
git commit -m "feat(web): map agent item payload to domain Item"
```

---

## Task 6: Item detail loader + shared ItemDetailView (web)

**Files:**
- Create: `apps/web/src/lib/infrastructure/http/loadItemDetail.ts`
- Create: `apps/web/src/lib/infrastructure/http/loadItemDetail.test.ts`
- Create: `apps/web/src/lib/presentation/components/ItemDetailView.svelte`
- Modify: `apps/web/src/routes/catalog/[id]/+page.svelte`

**Interfaces:**
- Produces: `loadItemDetail(id: string, fetchFn?: typeof fetch): Promise<{ item: Item; seller: SellerInfo | null }>`.
- `SellerInfo` = `{ name: string; avatarUrl: string; verified: boolean }` (reuse the type exported from `apps/web/src/routes/catalog/[id]/+page.server.ts` by re-declaring it locally to avoid importing from a route).
- `ItemDetailView` props: `{ item: Item; seller: SellerInfo | null }`.

- [ ] **Step 1: Write the failing test** — `apps/web/src/lib/infrastructure/http/loadItemDetail.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest';
import { loadItemDetail } from './loadItemDetail';

describe('loadItemDetail', () => {
  it('fetches, maps item and seller', async () => {
    const dto = {
      id: 7,
      seller_id: 3,
      title: 'Body Rosa',
      description: 'macio',
      category: 'bodysuit',
      gender: 'unisex',
      clothing_size: 'M',
      condition: 'like_new',
      price_cents: 4500,
      status: 'active',
      photos: [{ id: 1, url: 'https://img/1.jpg', position: 0 }],
      seller: { id: 3, name: 'Maria', avatar_url: 'https://a/1.jpg', verified: true },
    };
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(dto) });

    const result = await loadItemDetail('7', fetchFn as unknown as typeof fetch);

    expect(fetchFn).toHaveBeenCalledWith('/api/items/7');
    expect(result.item.id).toBe('7');
    expect(result.item.photoUrls).toEqual(['https://img/1.jpg']);
    expect(result.seller).toEqual({ name: 'Maria', avatarUrl: 'https://a/1.jpg', verified: true });
  });

  it('throws when the response is not ok', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });
    await expect(loadItemDetail('9', fetchFn as unknown as typeof fetch)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @babyclothes/web test loadItemDetail`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `apps/web/src/lib/infrastructure/http/loadItemDetail.ts`**

```ts
import { mapApiItem, type ApiItemDTO } from './apiItemMapper';
import type { Item } from '$lib/domain/item/entities/Item';

export type SellerInfo = {
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type ItemDetail = { item: Item; seller: SellerInfo | null };

export async function loadItemDetail(
  id: string,
  fetchFn: typeof fetch = fetch,
): Promise<ItemDetail> {
  const res = await fetchFn(`/api/items/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to load item ${id}: ${res.status}`);
  }
  const dto = (await res.json()) as ApiItemDTO;
  return { item: mapApiItem(dto), seller: mapSeller(dto) };
}

function mapSeller(dto: ApiItemDTO): SellerInfo | null {
  if (!dto.seller) return null;
  return {
    name: dto.seller.name,
    avatarUrl: dto.seller.avatar_url,
    verified: dto.seller.verified,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn workspace @babyclothes/web test loadItemDetail`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/lib/presentation/components/ItemDetailView.svelte`**

This is the body extracted from `routes/catalog/[id]/+page.svelte`, now taking props.

```svelte
<script lang="ts">
  import { t, get } from '$lib/i18n'
  import { ImageGallery, ProductTray } from '@babyclothes/design-system'
  import type { Item } from '$lib/domain/item/entities/Item'
  import type { SellerInfo } from '$lib/infrastructure/http/loadItemDetail'

  let { item, seller }: { item: Item; seller: SellerInfo | null } = $props()

  const conditionLabel = $derived(get(t)(`item_card.condition_${item.condition}`))
  const conditionVariant = $derived<'new' | 'semi' | 'used'>(
    item.condition === 'like_new' ? 'semi' : item.condition === 'new' ? 'new' : 'used',
  )
  const formattedPrice = $derived(`R$ ${(item.priceCents / 100).toFixed(2).replace('.', ',')}`)
</script>

<div class="item-detail-view">
  <div class="item-detail-view__gallery">
    <ImageGallery images={item.photoUrls} />
  </div>
  <div class="item-detail-view__tray">
    <ProductTray
      title={item.title}
      price={formattedPrice}
      condition={conditionLabel}
      conditionVariant={conditionVariant}
      sizeLabel={item.clothingSize ? `Tam. ${item.clothingSize}` : undefined}
      genderLabel={item.gender ? $t(`item_card.gender_${item.gender}`) : undefined}
      sellerName={seller?.name}
      sellerAvatar={seller?.avatarUrl}
      verified={seller?.verified}
      contactLabel={$t('item_card.contact')}
      buyLabel={$t('item_card.buy')}
    />
  </div>
</div>

<style>
  .item-detail-view__gallery {
    width: 100%;
  }
  .item-detail-view__tray {
    padding: 0 1rem;
    margin-top: -1.6rem;
  }
</style>
```

- [ ] **Step 6: Refactor `routes/catalog/[id]/+page.svelte` to use `ItemDetailView`**

Replace the entire file with:

```svelte
<script lang="ts">
  import { t } from '$lib/i18n'
  import ItemDetailView from '$lib/presentation/components/ItemDetailView.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>{data.item.title} | BabyClothes</title>
</svelte:head>

<div class="item-detail-page">
  <ItemDetailView item={data.item} seller={data.seller} />
</div>

<style>
  .item-detail-page {
    min-height: 100vh;
    background: var(--color-bg);
  }
</style>
```

(The route `+page.server.ts` already returns `{ item, seller }` with a compatible `seller` shape — no change needed there. The removed handlers `handleBack/handleFavorite/...` only logged to console, so dropping them is safe; buy/contact stay as ProductTray defaults with no handler, matching "out of scope" in the spec.)

- [ ] **Step 7: Validate the Svelte files with the Svelte MCP**

Use the `svelte-autofixer` MCP tool on `ItemDetailView.svelte` and the edited `catalog/[id]/+page.svelte`. Fix anything it reports, then re-run it until clean.

- [ ] **Step 8: Run web checks and the item tests**

Run: `yarn workspace @babyclothes/web test loadItemDetail && yarn workspace @babyclothes/web check`
Expected: tests PASS; `check` reports no new type errors in the touched files.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/lib/infrastructure/http/loadItemDetail.ts apps/web/src/lib/infrastructure/http/loadItemDetail.test.ts apps/web/src/lib/presentation/components/ItemDetailView.svelte apps/web/src/routes/catalog/[id]/+page.svelte
git commit -m "feat(web): shared ItemDetailView and client item-detail loader"
```

---

## Task 7: Render item cards + detail modal in the agent page (web)

**Files:**
- Modify: `apps/web/src/routes/agent/+page.svelte`
- Modify: `apps/web/src/lib/i18n/en.json`, `apps/web/src/lib/i18n/pt.json`

**Interfaces:**
- Consumes: `mapAgentItem` (Task 5), `loadItemDetail` + `SellerInfo` + `ItemDetail` (Task 6), `ItemDetailView` (Task 6), `AgentItem` (Task 5).
- Consumes DS: `Card`, `Modal` (already exported from `@babyclothes/design-system`).

- [ ] **Step 1: Add i18n keys**

In `apps/web/src/lib/i18n/en.json`, inside the existing `"agent"` object add a `results` group (place it next to `system`):

```json
    "results": {
      "heading": "Options for you",
      "modal_title": "Item details",
      "load_error": "Could not load this item."
    }
```

In `pt.json`, the same key with:

```json
    "results": {
      "heading": "Opções para você",
      "modal_title": "Detalhes do item",
      "load_error": "Não foi possível carregar este item."
    }
```

- [ ] **Step 2: Add imports and modal state to `agent/+page.svelte`**

In the `<script>` block, add to the design-system import list `Card` and `Modal`:

```ts
  import { ChatInput, ChatBubble, ChoiceChipGroup, AgentFormCard, MonthPicker, ChildInlineForm, Card, Modal } from '@babyclothes/design-system';
```

Add these imports near the other `$lib` imports:

```ts
  import { mapAgentItem, type AgentItem } from '$lib/application/chat/mapAgentItem';
  import { loadItemDetail, type ItemDetail } from '$lib/infrastructure/http/loadItemDetail';
  import ItemDetailView from '$lib/presentation/components/ItemDetailView.svelte';
```

Add modal state near the other `$state` declarations:

```ts
  let modalOpen = $state(false);
  let modalDetail = $state<ItemDetail | null>(null);
  let modalLoading = $state(false);

  function formatPrice(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  }

  async function openItemModal(id: string) {
    modalOpen = true;
    modalLoading = true;
    modalDetail = null;
    try {
      modalDetail = await loadItemDetail(id);
    } catch (e) {
      console.error('Failed to load item detail:', e);
      toast.error(get(t)('agent.results.load_error'));
      modalOpen = false;
    } finally {
      modalLoading = false;
    }
  }
```

- [ ] **Step 3: Handle component chunks in `handleSend`**

In `handleSend`, the streaming loop currently only handles `chunk.type === 'text'`. Replace the `for await` loop body with:

```ts
      for await (const chunk of chatRepo.sendMessage(userId, childId, msg, context)) {
        if (chunk.type === 'text') {
          agentContent += chunk.content;
          messages = messages.map((m) =>
            m.id === agentMsgId
              ? { ...m, content: { type: 'text' as const, content: agentContent } }
              : m,
          );
        } else if (chunk.type === 'component' && chunk.component === 'itemCarousel') {
          const rawItems = (chunk.props.items as AgentItem[]) ?? [];
          const items = rawItems.map(mapAgentItem);
          messages = messages.map((m) =>
            m.id === agentMsgId ? { ...m, components: [{ type: 'carousel' as const, items }] } : m,
          );
        }
      }
```

- [ ] **Step 4: Render the carousel payload with clickable cards**

In the template, find the `{#if message.components}` / `{#each message.components as component}` block. After the existing `{:else if component.type === 'suggestions'}` branch (and before the closing `{/if}` of the component-type chain), add a new branch:

```svelte
          {:else if component.type === 'carousel'}
            <div class="agent-page__row">
              <div class="agent-page__av" class:agent-page__av--hidden={isConsecutiveAgent(messages, index)}>
                {#if !isConsecutiveAgent(messages, index)}
                  <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                    <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
                  </svg>
                {/if}
              </div>
              <div class="agent-page__bwrap agent-page__cards">
                {#each component.items ?? [] as item (item.id)}
                  <Card
                    image={item.photoUrls[0] ?? ''}
                    title={item.title}
                    detail={`Tam. ${item.clothingSize}`}
                    price={formatPrice(item.priceCents)}
                    condition={$t(`item_card.condition_${item.condition}`)}
                    pinkPrice={true}
                    size="sm"
                    onClick={() => openItemModal(item.id)}
                  />
                {/each}
              </div>
            </div>
```

- [ ] **Step 5: Add the modal at the end of the page markup**

Immediately before the final closing `</div>` of `.agent-page` (after the `.agent-page__input` block), add:

```svelte
  <Modal bind:open={modalOpen} title={$t('agent.results.modal_title')} onclose={() => (modalDetail = null)}>
    {#if modalLoading}
      <div class="agent-page__modal-loading">
        <span class="agent-page__typing-dot"></span>
        <span class="agent-page__typing-dot"></span>
        <span class="agent-page__typing-dot"></span>
      </div>
    {:else if modalDetail}
      <ItemDetailView item={modalDetail.item} seller={modalDetail.seller} />
    {/if}
  </Modal>
```

- [ ] **Step 6: Add card layout styles**

In the `<style>` block of `agent/+page.svelte`, add:

```css
  .agent-page__cards {
    flex-direction: row;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.3rem;
    max-width: 100%;
  }

  .agent-page__modal-loading {
    display: flex;
    gap: 0.3rem;
    justify-content: center;
    padding: 2rem 0;
  }
```

- [ ] **Step 7: Validate `agent/+page.svelte` with the Svelte MCP**

Run the `svelte-autofixer` MCP tool on `apps/web/src/routes/agent/+page.svelte`. Fix everything it reports and re-run until clean.

- [ ] **Step 8: Type-check and run the web test suite**

Run: `yarn workspace @babyclothes/web check && yarn workspace @babyclothes/web test`
Expected: no new type errors in touched files; tests PASS.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/routes/agent/+page.svelte apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json
git commit -m "feat(web): render agent item cards and detail modal"
```

---

## Task 8: End-to-end verification

**No new files.** Verify the whole success path against the running stack with a real `GEMINI_API_KEY` in `.env`.

- [ ] **Step 1: Boot the stack and seed**

```bash
yarn dev
docker compose exec api mix run priv/repo/seeds.exs   # if the DB is empty
```

- [ ] **Step 2: Confirm the agents service picked up Gemini**

```bash
docker compose logs agents --tail=20
curl -s http://localhost:50052/health
```

Expected: `{"status":"ok"}` and no startup errors about a missing API key.

- [ ] **Step 3: Drive the flow manually in the browser** (use the `run` skill / real browser)

Register a new user → `/onboarding` → agent → answer "tenho filhos" → choose a count → fill and submit the child form → pick a search suggestion. Confirm:
  1. The agent replies with Gemini-generated text (not the "Desculpe, tive um problema" fallback).
  2. Item cards render below the reply, each with an image.
  3. Clicking a card opens the modal showing the gallery + product tray.

- [ ] **Step 4: If any step fails, debug with `superpowers:systematic-debugging`** — check, in order: `docker compose logs agents` (LLM/key errors), the browser network tab for `/api/agent/chat` (SSE chunks), and `/internal/items/search` output (non-empty, photos present).

- [ ] **Step 5: Final full test run**

```bash
yarn workspace @babyclothes/agents test
yarn workspace @babyclothes/web test
yarn workspace @babyclothes/web check
```

Expected: all green.

- [ ] **Step 6: Reminder — rotate the exposed key**

The `GEMINI_API_KEY` was shared in plaintext during planning. After verifying the flow, regenerate it in Google AI Studio and update the local `.env`.

---

## Self-Review Notes

- **Spec coverage:** provider swap → Tasks 1–2; reliable component contract → Tasks 2–3; web render + modal → Tasks 5–7; item seed → Task 4; verification → Task 8. All spec sections covered.
- **Type consistency:** `AgentItem` (Task 5) matches the agent `CatalogItem` fields and the `props.items` shape emitted by `buildChatEvents` (Task 3). `SellerInfo`/`ItemDetail` defined in Task 6 and consumed in Task 7. `carousel` payload uses the existing `CarouselPayload` (`{ type: 'carousel'; items?: Item[] }`) already in `Message.ts`.
- **Open risk:** exact `GEMINI_MODEL` id and `@langchain/google-genai` version must be confirmed at install time (Task 1, Steps 3 & 7).
