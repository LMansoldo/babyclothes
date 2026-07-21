# Agent Happy Path — Gemini + Selectable Item Cards + Detail Modal

**Date:** 2026-07-21
**Status:** Approved design → ready for implementation plan

## Problem

The primary success path must work end to end:

> Registro → Onboarding → Agente se apresenta → pergunta quantos filhos → usuário
> cadastra os filhos → agente informa que vai procurar itens (por sexo, tamanho,
> peso) → mostra opções selecionáveis de itens na tela → usuário clica num item.

Today the agent is effectively dead. Three breaks:

1. **`ANTHROPIC_API_KEY=your-anthropic-key` placeholder (fatal).** Every graph node
   (`interpret-intent`, `fetch-items`, `format-response`) calls `ChatAnthropic`. With
   the placeholder key all calls 401 → hit `catch` → `format-response` always returns
   *"Desculpe, tive um problema. Pode tentar novamente?"*. The agent always errors.
2. **Broken component contract.** `format-response` emits `ComponentReference` as
   `{ type, data }`, but `http-server.ts` reads `component.component` / `component.props`
   (which don't exist) → the SSE layer drops it (`props !== undefined` guard fails). And
   `/agent/+page.svelte`'s `handleSend` only handles `chunk.type === 'text'`, ignoring
   component chunks entirely. So the "selectable item options" step never renders.
3. **Success path is partly faked.** The intake (greeting → child count → child
   registration) is a reliable client-side state machine (`IntakeMachine`). But the
   moment it hands off to the real agent (item search), it dies from #1 and #2.

## Decisions (from brainstorming)

- **LLM provider: Google Gemini**, not Anthropic. Swap `@langchain/anthropic` →
  `@langchain/google-genai`.
- **Model: Gemini 3.0**, parameterized via `GEMINI_MODEL` env (exact model id confirmed
  against account access; changed in one place). API key: `GEMINI_API_KEY`.
- **Orchestration scope: from search onward.** Keep the client-side `IntakeMachine` for
  greeting → child count → child registration. Gemini drives from "procurar itens":
  interprets the request, searches the API by size/gender, returns selectable cards +
  free chat.
- **Clicking an item opens a modal** that renders the `/catalog/[id]` detail components
  (`ImageGallery` + `ProductTray`) — not a navigation.
- **Item seed is in scope** — the DB must have active items or suggestions come back empty.

## Architecture

Existing plumbing (all present, keep):

```
web /agent  ──POST /api/agent/chat──▶  Elixir AgentController
                                          └─POST http://agents:50052/chat (SSE)
                                              └─ chatGraph (LangGraph)
                                                   interpret_intent → fetch_items
                                                     → rank_items → format_response
```

### 1. Provider swap: Anthropic → Gemini (`apps/agents`)

- Add dependency `@langchain/google-genai` to `apps/agents/package.json`; remove
  `@langchain/anthropic` (and the unused `@anthropic-ai/sdk` if nothing else uses it —
  verify first).
- In `interpret-intent.ts`, `fetch-items.ts`, `format-response.ts`: replace
  `ChatAnthropic` with `ChatGoogleGenerativeAI`, reading:
  - `apiKey: process.env.GEMINI_API_KEY`
  - `model: process.env.GEMINI_MODEL ?? '<gemini-3 default>'`
  - temperature: `0` for the two classifier nodes, `~0.7` for `format-response`.
  - Centralize model construction in one small module (e.g. `src/llm.ts`) so the
    provider/model/key live in one place instead of three copies.
- `.env` / `.env.example`: replace `ANTHROPIC_API_KEY` with `GEMINI_API_KEY` and add
  `GEMINI_MODEL`. Real key value goes ONLY in the gitignored `.env`, never committed and
  never written into this spec. (Key was shared in plaintext during brainstorming →
  rotate it in Google AI Studio once the flow works.)
- `docker-compose.yml`: `agents` service already uses `env_file: .env`; confirm
  `GEMINI_API_KEY`/`GEMINI_MODEL` flow through.

### 2. Reliable component contract (`apps/agents` → SSE → web)

Do **not** rely on the LLM emitting a ```json``` block. Instead:

- `format-response`: LLM generates only the natural-language text. Remove the fragile
  `extractComponents` / `cleanResponse` JSON parsing.
- The graph attaches the item component **deterministically** from `state.items`: when
  `state.items` is non-empty, produce one component
  `{ component: 'itemCarousel', props: { items } }`.
- `http-server.ts` emits, in order:
  1. text chunk: `{ type: 'text', content: state.response }`
  2. component chunk: `{ type: 'component', component: 'itemCarousel', props: { items } }`
     (only when items exist).
- `SseChatRepository` already yields `{ type: 'component', component, props }` — no change
  needed there beyond confirming the shape matches.

Wire item shape (agent → web): agent `CatalogItem` is snake_case
(`{ id, title, category, clothing_size, condition, price_cents, photo_url }`).

### 3. Web rendering + detail modal (`apps/web`)

- **`handleSend`** in `/agent/+page.svelte`: handle `chunk.type === 'component'`. Map the
  agent item payload → domain `Item` (reuse/extend `mapApiItem`), attach as a
  `CarouselPayload` (`{ type: 'carousel', items }`) on the streaming agent message's
  `components`.
- **Template** `/agent/+page.svelte`: render `carousel` / `itemList` payloads (currently
  unrendered) using the DS `Carousel` / `ItemCard`, with each card **clickable**.
- **Detail modal:** clicking a card opens the DS `Modal` composite rendering a new shared
  component **`ItemDetailView`** (extracted from `/catalog/[id]/+page.svelte`:
  `ImageGallery` + `ProductTray`). The view fetches `/api/items/:id` client-side and maps
  with the same `mapApiItem` / seller mapping the route uses.
- **Refactor** `/catalog/[id]/+page.svelte` to render `ItemDetailView` too, so route and
  modal share one implementation (no duplication). The route keeps its server `load`;
  `ItemDetailView` takes `item` + `seller` as props, and a thin client fetch wrapper is
  used by the modal.

### 4. Item seed (`apps/api`)

- Extend `apps/api/priv/repo/seeds.exs` to insert active items (`status: :active`) with
  photos across a spread of sizes/genders/categories so `/internal/items/search`
  (filters `status == :active`) returns results for the happy path.
- Ensure at least a few items match a typical registered child (e.g. size `M`,
  unisex/female/male) so suggestions are non-empty.
- Confirm `yarn api:migrate` + seed path documented in the plan.

## Testing (TDD)

- **agents (vitest):**
  - `interpret-intent` / `fetch-items` / `format-response` with a mocked Gemini model
    (no network) — assert intent parsing, param extraction, and that `format-response`
    returns clean text with no JSON parsing.
  - Graph-level: given `state.items`, `chatGraph` output carries items for the component
    chunk.
  - `http-server` handler: emits a text chunk then an `itemCarousel` component chunk when
    items exist; text-only when not.
- **web (vitest):**
  - `handleSend` component-chunk handling → message gets a `carousel` payload with mapped
    `Item`s.
  - agent item → `Item` mapper.
  - `ItemDetailView` renders `ImageGallery` + `ProductTray` from props.
- **End-to-end manual verification:** registro → onboarding → agente → cadastro filho →
  escolher sugestão → cards aparecem → clicar → modal com detalhe. Run against seeded DB
  with a real `GEMINI_API_KEY`.

## Out of scope (YAGNI)

- Rewriting intake to be LLM-orchestrated (stays client-side).
- Token-by-token streaming from Gemini (full response returned at once; possible later).
- Real buy/contact actions in the modal (buttons stay placeholder, as in the route today).

## Risks / open items

- **Exact Gemini 3.0 model id** must be confirmed against the account's access; isolated
  behind `GEMINI_MODEL`.
- **`@langchain/google-genai` version** compatible with the installed `@langchain/core`
  (`^0.3.0`) — pin during implementation.
- **`/api/items/:id`** must return photos + seller for the modal (route already relies on
  it; confirm shape).
