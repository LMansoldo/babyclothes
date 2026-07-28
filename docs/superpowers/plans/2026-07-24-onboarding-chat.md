# Onboarding Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `/onboarding` hero screen with a simulated, scripted chat that presents the app and registers the user's child(ren) inline (looped, persisted via existing use cases), then redirects to `/agent`; reconcile `/agent` so it stops re-asking intake questions and instead redirects to `/onboarding` when the user has 0 children.

**Architecture:** `apps/web/src/routes/onboarding/+page.svelte` becomes a self-contained scripted chat component with local `$state`, driven by a static array of "presentation beats" played on a timer, followed by a count picker and a looped child-registration form. A tiny pure helper (`childLoop.ts`) holds the loop arithmetic so it's testable without timers. `apps/web/src/routes/agent/+page.svelte` is trimmed so its `onMount` redirects to `/onboarding` when the user has no children, and otherwise skips straight to the `ask_search_intent` step of the existing (untouched) `IntakeMachine`.

**Tech Stack:** SvelteKit 2 + Svelte 5 runes, TypeScript, vitest + `@testing-library/svelte` with fake timers, `@babyclothes/design-system` components (`ChatBubble`, `ChoiceChipGroup`, `AgentFormCard`, `ChildInlineForm`).

## Global Constraints

- No emojis in UI — use `lucide-svelte` if any icon is needed (project rule, `CLAUDE.md`).
- BEM CSS naming: `.block__element--modifier`.
- i18n: every new user-facing string needs both `en-US` (`apps/web/src/lib/i18n/en.json`) and `pt-BR` (`apps/web/src/lib/i18n/pt.json`) entries.
- Every `.svelte` file must be validated with the Svelte MCP (`mcp__svelte__svelte-autofixer`) before being considered done.
- Svelte 5 runes only: `$props()`, `$state()`, `$derived()`, `$effect()`. No Svelte 4 patterns (`export let`, `$:`).
- No backend/API changes. Registration reuses `RegisterChild` / `AddMeasurement` use cases as-is.
- Do not modify `IntakeMachine.ts` or delete `OnboardingHero` — both stay; onboarding just stops rendering `OnboardingHero`.
- Test command: `yarn workspace @babyclothes/web test` (or `yarn test` at repo root, inside Docker per `RULES.md`). Type check: `yarn workspace @babyclothes/web check`.

---

## File Structure

- **Create** `apps/web/src/lib/application/onboarding/childLoop.ts` — pure loop-arithmetic helpers.
- **Create** `apps/web/src/lib/application/onboarding/childLoop.test.ts` — unit tests for the above.
- **Modify** `apps/web/src/lib/i18n/en.json` and `apps/web/src/lib/i18n/pt.json` — add `onboarding.chat.*` namespace.
- **Rewrite** `apps/web/src/routes/onboarding/+page.svelte` — scripted chat (replaces the static hero).
- **Create** `apps/web/src/routes/onboarding/page.svelte.test.ts` — component test with fake timers.
- **Modify** `apps/web/src/routes/agent/+page.svelte` — `onMount` redirect-when-empty + skip-ahead intake init.
- **Modify** `apps/web/src/routes/agent/page.svelte.test.ts` (create if it does not exist) — covers the two `onMount` branches.

`apps/web/src/routes/onboarding/+page.server.ts` is **not modified** — it already requires a session.

---

### Task 1: `childLoop.ts` pure helper

**Files:**
- Create: `apps/web/src/lib/application/onboarding/childLoop.ts`
- Test: `apps/web/src/lib/application/onboarding/childLoop.test.ts`

**Interfaces:**
- Produces: `remainingChildren(count: number | null, filled: number): number`, `isChildLoopDone(count: number | null, filled: number): boolean` — used by Task 3 (onboarding page).

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/application/onboarding/childLoop.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { remainingChildren, isChildLoopDone } from './childLoop';

describe('remainingChildren', () => {
  it('returns 0 when count is null', () => {
    expect(remainingChildren(null, 0)).toBe(0);
  });

  it('computes remaining children for count 1', () => {
    expect(remainingChildren(1, 0)).toBe(1);
    expect(remainingChildren(1, 1)).toBe(0);
  });

  it('computes remaining children for count 3', () => {
    expect(remainingChildren(3, 0)).toBe(3);
    expect(remainingChildren(3, 1)).toBe(2);
    expect(remainingChildren(3, 3)).toBe(0);
  });

  it('never returns a negative number', () => {
    expect(remainingChildren(1, 5)).toBe(0);
  });
});

describe('isChildLoopDone', () => {
  it('is false when count is null', () => {
    expect(isChildLoopDone(null, 0)).toBe(false);
  });

  it('is false while filled is below count', () => {
    expect(isChildLoopDone(2, 0)).toBe(false);
    expect(isChildLoopDone(2, 1)).toBe(false);
  });

  it('is true once filled reaches count', () => {
    expect(isChildLoopDone(2, 2)).toBe(true);
  });

  it('is true if filled exceeds count', () => {
    expect(isChildLoopDone(1, 5)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @babyclothes/web vitest run src/lib/application/onboarding/childLoop.test.ts`
Expected: FAIL — `Cannot find module './childLoop'`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/web/src/lib/application/onboarding/childLoop.ts`:

```ts
export function remainingChildren(count: number | null, filled: number): number {
  if (count === null) return 0;
  return Math.max(0, count - filled);
}

export function isChildLoopDone(count: number | null, filled: number): boolean {
  if (count === null) return false;
  return filled >= count;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn workspace @babyclothes/web vitest run src/lib/application/onboarding/childLoop.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/application/onboarding/childLoop.ts apps/web/src/lib/application/onboarding/childLoop.test.ts
git commit -m "feat(web): add childLoop pure helpers for onboarding chat"
```

---

### Task 2: i18n — `onboarding.chat.*` namespace

**Files:**
- Modify: `apps/web/src/lib/i18n/en.json` (inside the existing `"onboarding"` object, which currently ends at the `"cta"` key, around line 375)
- Modify: `apps/web/src/lib/i18n/pt.json` (same location, around line 375)

**Interfaces:**
- Produces: the translation keys `onboarding.chat.greeting`, `onboarding.chat.value_prop`, `onboarding.chat.overview_catalog_t`, `onboarding.chat.overview_catalog_d`, `onboarding.chat.overview_agent_t`, `onboarding.chat.overview_agent_d`, `onboarding.chat.overview_sell_t`, `onboarding.chat.overview_sell_d`, `onboarding.chat.growth_ai`, `onboarding.chat.ask_children_intro`, `onboarding.chat.how_many`, `onboarding.chat.count_3plus`, `onboarding.chat.child_form_intro`, `onboarding.chat.child_form_title`, `onboarding.chat.child_saved`, `onboarding.chat.user_count_reply`, `onboarding.chat.step_pill`, `onboarding.chat.wrap_up`, `onboarding.chat.opening_agent` — consumed by Task 3.

This task has no test of its own (pure data); it's verified by Task 3's tests actually rendering these strings.

- [ ] **Step 1: Add the `chat` object to `apps/web/src/lib/i18n/en.json`**

Find the existing `"onboarding"` block:

```json
  "onboarding": {
    "skip": "Skip",
    "title": "An agent that",
    "title_accent": "finds",
    "title_rest": "thrift deals for you",
    "description": "AI searches for ideal clothes and items combining size, age, weight and your location.",
    "features": {
      "size": "Size",
      "age": "Age",
      "weight": "Weight",
      "location": "Location"
    },
    "cta": "Chat with the agent"
  },
```

Replace it with (adds a new `"chat"` sub-object, keeps everything else unchanged):

```json
  "onboarding": {
    "skip": "Skip",
    "title": "An agent that",
    "title_accent": "finds",
    "title_rest": "thrift deals for you",
    "description": "AI searches for ideal clothes and items combining size, age, weight and your location.",
    "features": {
      "size": "Size",
      "age": "Age",
      "weight": "Weight",
      "location": "Location"
    },
    "cta": "Chat with the agent",
    "chat": {
      "greeting": "Hi{{name}}! Welcome to BabyClothes.",
      "value_prop": "I'm your AI assistant — I find the ideal thrift clothes for your child based on size, age and growth.",
      "overview_catalog_t": "Catalog",
      "overview_catalog_d": "Browse thrift finds curated for your child's size.",
      "overview_agent_t": "AI Assistant",
      "overview_agent_d": "Chat with me anytime to search for specific pieces.",
      "overview_sell_t": "Sell",
      "overview_sell_d": "List clothes your child has outgrown.",
      "growth_ai": "As your child grows, I track their measurements and predict the next size they'll need.",
      "ask_children_intro": "Before we start, tell me about your children.",
      "how_many": "How many children do you have?",
      "count_3plus": "3+",
      "child_form_intro": "Great! Fill in the details below:",
      "child_form_title": "Child registration",
      "child_saved": "{{name}} registered!",
      "user_count_reply": "I have {{count}} child(ren)",
      "step_pill": "Child {{n}} of {{count}}",
      "wrap_up": "Perfect! You're all set.",
      "opening_agent": "Opening the agent…"
    }
  },
```

- [ ] **Step 2: Add the equivalent `chat` object to `apps/web/src/lib/i18n/pt.json`**

Find the existing `"onboarding"` block:

```json
  "onboarding": {
    "skip": "Pular",
    "title": "Um agente que",
    "title_accent": "garimpa",
    "title_rest": "o brechó por você",
    "description": "A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
    "features": {
      "size": "Tamanho",
      "age": "Idade",
      "weight": "Peso",
      "location": "Localização"
    },
    "cta": "Conversar com o agente"
  },
```

Replace it with:

```json
  "onboarding": {
    "skip": "Pular",
    "title": "Um agente que",
    "title_accent": "garimpa",
    "title_rest": "o brechó por você",
    "description": "A IA procura roupas e itens ideais combinando tamanho, idade, peso e a sua localização.",
    "features": {
      "size": "Tamanho",
      "age": "Idade",
      "weight": "Peso",
      "location": "Localização"
    },
    "cta": "Conversar com o agente",
    "chat": {
      "greeting": "Oi{{name}}! Bem-vindo à BabyClothes.",
      "value_prop": "Sou seu assistente de IA — encontro roupinhas de brechó ideais para o seu filho com base em tamanho, idade e crescimento.",
      "overview_catalog_t": "Catálogo",
      "overview_catalog_d": "Explore achados de brechó com curadoria para o tamanho do seu filho.",
      "overview_agent_t": "Assistente IA",
      "overview_agent_d": "Converse comigo a qualquer momento para buscar peças específicas.",
      "overview_sell_t": "Vender",
      "overview_sell_d": "Anuncie roupas que seu filho já não usa mais.",
      "growth_ai": "Conforme seu filho cresce, eu acompanho as medidas e já prevejo o próximo tamanho que ele vai precisar.",
      "ask_children_intro": "Antes de começar, me conta sobre seus filhos.",
      "how_many": "Quantos filhos você tem?",
      "count_3plus": "3+",
      "child_form_intro": "Perfeito! Preencha os dados abaixo:",
      "child_form_title": "Cadastro da criança",
      "child_saved": "{{name}} cadastrada(o)!",
      "user_count_reply": "Tenho {{count}} filho(s)",
      "step_pill": "Filho {{n}} de {{count}}",
      "wrap_up": "Perfeito! Tudo pronto.",
      "opening_agent": "Abrindo o agente…"
    }
  },
```

Note: `{{name}}` is used as `", {{name}}"` style greeting fallback — Task 3 will pass `name: userName ? \` ${userName}\` : ''` so the string reads naturally either way (see Task 3 Step 3).

- [ ] **Step 3: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('apps/web/src/lib/i18n/en.json','utf8')); JSON.parse(require('fs').readFileSync('apps/web/src/lib/i18n/pt.json','utf8')); console.log('ok')"`
Expected: prints `ok` (no `SyntaxError`).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json
git commit -m "feat(web): add onboarding.chat i18n namespace"
```

---

### Task 3: Rewrite `apps/web/src/routes/onboarding/+page.svelte` as scripted chat

**Files:**
- Modify (full rewrite): `apps/web/src/routes/onboarding/+page.svelte`

**Interfaces:**
- Consumes: `remainingChildren`, `isChildLoopDone` from `$lib/application/onboarding/childLoop` (Task 1); `onboarding.chat.*` i18n keys (Task 2); `RegisterChild`, `AddMeasurement`, `mapChildFormToCreateChildInput`, `buildInitialMeasurementInput`, `HttpChildRepository` (existing, unchanged); `ChatBubble`, `ChoiceChipGroup`, `AgentFormCard`, `ChildInlineForm` from `@babyclothes/design-system` (existing, unchanged, prop shapes below); `toast` from `$lib/stores/toast` (existing).
- Produces: nothing consumed by later tasks directly, but must call `goto('/agent')` and `localStorage.setItem('bc_onboarded', '1')` on completion — Task 6's agent-page test relies on `/agent` being the redirect target, not on this file's internals.

Design-system prop shapes needed here (already exist in `packages/design-system`, do not modify them):

```ts
// ChatBubble
{ role: 'user' | 'agent' | 'system'; content: string; timestamp?: string; surface?: 'light' | 'dark' }

// ChoiceChipGroup
interface ChoiceChipOption { value: string; label: string; primary?: boolean }
interface ChoiceChipGroupProps {
  options: ChoiceChipOption[];
  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  tone?: 'default' | 'soft';
  size?: 'sm' | 'md';
}

// AgentFormCard
interface AgentFormCardProps { title: string; children?: Snippet; maxWidth?: string }

// ChildInlineForm
interface ChildInlineFormValues {
  name: string; ageMonths: string; currentHeightCm: string; currentWeightKg: string;
  birthHeightCm: string; birthWeightG: string;
}
interface ChildInlineFormLabels {
  name: string; ageMonths: string; currentHeight: string; currentWeight: string;
  birthHeight: string; birthWeight: string; submit: string;
}
interface ChildInlineFormUnits { age?: string; height?: string; weight?: string; birthWeight?: string }
interface ChildInlineFormProps {
  initial?: Partial<ChildInlineFormValues>;
  loading?: boolean;
  submitLabel: string;
  labels: ChildInlineFormLabels;
  units?: ChildInlineFormUnits;
  onSubmit?: (values: ChildInlineFormValues) => void;
}
```

- [ ] **Step 1: Read the current file for reference (already read during planning — reproduced here for the record)**

Current `apps/web/src/routes/onboarding/+page.svelte` is a 93-line static hero (`OnboardingHero` + `Button`). It will be fully replaced.

- [ ] **Step 2: Write the new component**

Replace the entire contents of `apps/web/src/routes/onboarding/+page.svelte` with:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { t, get } from '$lib/i18n';
  import { HttpChildRepository } from '$lib/infrastructure/http/HttpChildRepository';
  import { RegisterChild } from '$lib/application/child/RegisterChild';
  import { AddMeasurement } from '$lib/application/child/AddMeasurement';
  import { mapChildFormToCreateChildInput } from '$lib/application/child/mapChildFormToCreateChildInput';
  import { buildInitialMeasurementInput } from '$lib/application/child/buildInitialMeasurementInput';
  import { remainingChildren, isChildLoopDone } from '$lib/application/onboarding/childLoop';
  import { ChatBubble, ChoiceChipGroup, AgentFormCard, ChildInlineForm } from '@babyclothes/design-system';
  import type { ChildInlineFormValues } from '@babyclothes/design-system';
  import { toast } from '$lib/stores/toast';

  type OnboardingMessage =
    | { id: string; kind: 'bot-text'; content: string }
    | { id: string; kind: 'bot-overview'; cards: { title: string; desc: string }[] }
    | { id: string; kind: 'user'; content: string }
    | { id: string; kind: 'ask-count' }
    | { id: string; kind: 'child-form' };

  const MESSAGE_DELAY_MS = 700;
  const STORAGE_KEY = 'bc_onboarded';

  const childRepo = new HttpChildRepository();
  const registerChild = new RegisterChild(childRepo);
  const addMeasurement = new AddMeasurement(childRepo);

  const session = $derived($page.data.session);

  let messages = $state<OnboardingMessage[]>([]);
  let phase = $state<'presenting' | 'ask_count' | 'fill_form' | 'done'>('presenting');
  let isTyping = $state(false);
  let childrenCount = $state<number | null>(null);
  let childrenFilled = $state(0);
  let submitting = $state(false);

  let idCounter = 0;
  function nextId(): string {
    idCounter += 1;
    return `ob-${idCounter}`;
  }

  function pushMessage(message: OnboardingMessage): void {
    messages = [...messages, message];
  }

  function typingPause(): Promise<void> {
    isTyping = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        isTyping = false;
        resolve();
      }, MESSAGE_DELAY_MS);
    });
  }

  async function runPresentation(): Promise<void> {
    const translate = get(t);
    const userName = session?.name?.split(' ')[0];

    await typingPause();
    pushMessage({
      id: nextId(),
      kind: 'bot-text',
      content: translate('onboarding.chat.greeting', { name: userName ? `, ${userName}` : '' }),
    });

    await typingPause();
    pushMessage({ id: nextId(), kind: 'bot-text', content: translate('onboarding.chat.value_prop') });

    await typingPause();
    pushMessage({
      id: nextId(),
      kind: 'bot-overview',
      cards: [
        { title: translate('onboarding.chat.overview_catalog_t'), desc: translate('onboarding.chat.overview_catalog_d') },
        { title: translate('onboarding.chat.overview_agent_t'), desc: translate('onboarding.chat.overview_agent_d') },
        { title: translate('onboarding.chat.overview_sell_t'), desc: translate('onboarding.chat.overview_sell_d') },
      ],
    });

    await typingPause();
    pushMessage({ id: nextId(), kind: 'bot-text', content: translate('onboarding.chat.growth_ai') });

    await typingPause();
    pushMessage({ id: nextId(), kind: 'bot-text', content: translate('onboarding.chat.ask_children_intro') });

    phase = 'ask_count';
    await typingPause();
    pushMessage({ id: nextId(), kind: 'ask-count' });
  }

  function handleCountSelect(value: string): void {
    const translate = get(t);
    const count = parseInt(value, 10);

    messages = messages.filter((m) => m.kind !== 'ask-count');
    pushMessage({
      id: nextId(),
      kind: 'user',
      content: translate('onboarding.chat.user_count_reply', { count }),
    });

    childrenCount = count;
    phase = 'fill_form';
    void startChildForm();
  }

  async function startChildForm(): Promise<void> {
    const translate = get(t);
    await typingPause();
    pushMessage({ id: nextId(), kind: 'bot-text', content: translate('onboarding.chat.child_form_intro') });
    pushMessage({ id: nextId(), kind: 'child-form' });
  }

  async function handleChildSubmit(values: ChildInlineFormValues): Promise<void> {
    const translate = get(t);
    const userId = session?.userId;
    if (!userId) {
      toast.error(translate('agent.form.save_error'));
      return;
    }

    submitting = true;
    try {
      const input = mapChildFormToCreateChildInput(values, new Date());
      const created = await registerChild.execute(input);

      const measurement = buildInitialMeasurementInput(input);
      if (measurement) {
        try {
          await addMeasurement.execute(created.id, measurement);
        } catch (measurementError) {
          console.error('Failed to save initial measurement:', measurementError);
        }
      }

      messages = messages.filter((m) => m.kind !== 'child-form');
      pushMessage({
        id: nextId(),
        kind: 'user',
        content: translate('onboarding.chat.child_saved', { name: created.name }),
      });
      childrenFilled += 1;

      if (isChildLoopDone(childrenCount, childrenFilled)) {
        phase = 'done';
        await finish();
      } else if (remainingChildren(childrenCount, childrenFilled) > 0) {
        await typingPause();
        pushMessage({ id: nextId(), kind: 'child-form' });
      }
    } catch (e) {
      console.error('Failed to register child:', e);
      toast.error(translate('agent.form.save_error'));
    } finally {
      submitting = false;
    }
  }

  async function finish(): Promise<void> {
    const translate = get(t);
    await typingPause();
    pushMessage({ id: nextId(), kind: 'bot-text', content: translate('onboarding.chat.wrap_up') });

    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore storage errors
    }

    await new Promise((resolve) => setTimeout(resolve, MESSAGE_DELAY_MS));
    goto('/agent');
  }

  function isConsecutiveBot(index: number): boolean {
    if (index === 0) return false;
    return messages[index - 1].kind !== 'user';
  }

  onMount(() => {
    void runPresentation();
  });
</script>

<svelte:head>
  <title>{$t('onboarding.title')} {$t('onboarding.title_accent')} | BabyClothes</title>
</svelte:head>

<div class="onboarding-chat">
  <header class="onboarding-chat__header">
    <span class="onboarding-chat__brand">BabyClothes</span>
    {#if phase === 'fill_form' && childrenCount !== null}
      <span class="onboarding-chat__step-pill">
        {$t('onboarding.chat.step_pill', { n: childrenFilled + 1, count: childrenCount })}
      </span>
    {/if}
  </header>

  <div class="onboarding-chat__messages">
    {#each messages as message, index (message.id)}
      {#if message.kind === 'user'}
        <div class="onboarding-chat__row onboarding-chat__row--me">
          <div class="onboarding-chat__bwrap">
            <ChatBubble role="user" surface="light" content={message.content} />
          </div>
        </div>
      {:else}
        <div class="onboarding-chat__row">
          <div class="onboarding-chat__av" class:onboarding-chat__av--hidden={isConsecutiveBot(index)}>
            {#if !isConsecutiveBot(index)}
              <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
                <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
              </svg>
            {/if}
          </div>
          <div class="onboarding-chat__bwrap">
            {#if message.kind === 'bot-text'}
              <ChatBubble role="agent" surface="light" content={message.content} />
            {:else if message.kind === 'bot-overview'}
              <div class="onboarding-chat__overview">
                {#each message.cards as card}
                  <div class="onboarding-chat__overview-card">
                    <span class="onboarding-chat__overview-title">{card.title}</span>
                    <span class="onboarding-chat__overview-desc">{card.desc}</span>
                  </div>
                {/each}
              </div>
            {:else if message.kind === 'ask-count'}
              <ChoiceChipGroup
                options={[
                  { value: '1', label: '1' },
                  { value: '2', label: '2' },
                  { value: '3', label: $t('onboarding.chat.count_3plus') },
                ]}
                onSelect={handleCountSelect}
                ariaLabel={$t('onboarding.chat.how_many')}
              />
            {:else if message.kind === 'child-form'}
              <AgentFormCard title={$t('onboarding.chat.child_form_title')} maxWidth="26rem">
                <ChildInlineForm
                  submitLabel={$t('agent.form.submit')}
                  labels={{
                    name: $t('agent.form.name'),
                    ageMonths: $t('agent.form.age'),
                    currentHeight: $t('agent.form.height'),
                    currentWeight: $t('agent.form.weight'),
                    birthHeight: $t('agent.form.birth_height'),
                    birthWeight: $t('agent.form.birth_weight'),
                    submit: $t('agent.form.submit'),
                  }}
                  units={{ age: 'meses', height: 'cm', weight: 'kg', birthWeight: 'g' }}
                  loading={submitting}
                  onSubmit={handleChildSubmit}
                />
              </AgentFormCard>
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    {#if isTyping}
      <div class="onboarding-chat__row">
        <div class="onboarding-chat__av">
          <svg viewBox="0 0 20 24" width="10" height="12" fill="none">
            <path d="M10 0C10 0 0 10 0 15.5C0 20.75 4.48 24 10 24C15.52 24 20 20.75 20 15.5C20 10 10 0 10 0Z" fill="#FF3CAC"/>
          </svg>
        </div>
        <div class="onboarding-chat__typing">
          <span class="onboarding-chat__typing-dot"></span>
          <span class="onboarding-chat__typing-dot"></span>
          <span class="onboarding-chat__typing-dot"></span>
        </div>
      </div>
    {/if}

    {#if phase === 'done'}
      <div class="onboarding-chat__row">
        <div class="onboarding-chat__spinner" role="status">
          <span class="onboarding-chat__typing-dot"></span>
          <span class="onboarding-chat__typing-dot"></span>
          <span class="onboarding-chat__typing-dot"></span>
          <span>{$t('onboarding.chat.opening_agent')}</span>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .onboarding-chat {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--of);
  }

  .onboarding-chat__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 1.2rem;
    background: var(--wh);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .onboarding-chat__brand {
    font-family: var(--ld);
    font-size: 1rem;
    color: var(--bk);
  }

  .onboarding-chat__step-pill {
    font-family: var(--gr);
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--pk);
    background: var(--of2);
    border-radius: 1rem;
    padding: 0.25rem 0.7rem;
  }

  .onboarding-chat__messages {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 1rem 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .onboarding-chat__row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
    max-width: 85%;
  }

  .onboarding-chat__row--me {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .onboarding-chat__av {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--bk);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .onboarding-chat__av--hidden {
    visibility: hidden;
  }

  .onboarding-chat__bwrap {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .onboarding-chat__overview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .onboarding-chat__overview-card {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    background: var(--wh);
    border-radius: 0.75rem 0.75rem 0.75rem 0.2rem;
    padding: 0.6rem 0.85rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .onboarding-chat__overview-title {
    font-family: var(--gr);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--bk);
  }

  .onboarding-chat__overview-desc {
    font-family: var(--gr);
    font-size: 0.72rem;
    color: #6B7280;
  }

  .onboarding-chat__typing {
    background: var(--wh);
    border-radius: 0.75rem 0.75rem 0.75rem 0.2rem;
    padding: 0.6rem 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.28rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  .onboarding-chat__spinner {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--gr);
    font-size: 0.75rem;
    color: #6B7280;
    padding: 0.6rem 0.2rem;
  }

  .onboarding-chat__typing-dot {
    width: 0.4rem;
    height: 0.4rem;
    background: var(--pk);
    border-radius: 50%;
    animation: onboarding-chat-typing 0.9s ease-in-out infinite;
  }

  .onboarding-chat__typing-dot:nth-child(2) {
    animation-delay: 0.1s;
  }

  .onboarding-chat__typing-dot:nth-child(3) {
    animation-delay: 0.2s;
  }

  @keyframes onboarding-chat-typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-0.4rem);
    }
  }
</style>
```

- [ ] **Step 3: Validate with the Svelte MCP**

Call `mcp__svelte__svelte-autofixer` on the full content of `apps/web/src/routes/onboarding/+page.svelte`. Apply any fixes it suggests, then call it again to confirm no issues remain.

- [ ] **Step 4: Type-check**

Run: `yarn workspace @babyclothes/web check`
Expected: no new errors attributable to `routes/onboarding/+page.svelte`. If `ChildInlineFormValues` is not exported from `@babyclothes/design-system`'s public entry point, check `packages/design-system/src/lib/index.ts` for its actual export path and adjust the import accordingly (do not redefine the type locally — import it).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/onboarding/+page.svelte
git commit -m "feat(web): rewrite onboarding as scripted chat with child registration"
```

---

### Task 4: Component test for the onboarding chat page

**Files:**
- Create: `apps/web/src/routes/onboarding/page.svelte.test.ts`

**Interfaces:**
- Consumes: the onboarding page component from Task 3, mocked `RegisterChild`/`AddMeasurement`/`HttpChildRepository`/`goto`/`$app/stores`/`$lib/i18n`.

- [ ] **Step 1: Write the test file**

Create `apps/web/src/routes/onboarding/page.svelte.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Page from './+page.svelte';

const gotoMock = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...args: unknown[]) => gotoMock(...args) }));

const mockSession = { userId: 'user-1', name: 'Maria Silva', email: 'maria@test.com' };
vi.mock('$app/stores', () => ({
  page: { subscribe: (fn: (v: unknown) => void) => { fn({ data: { session: mockSession } }); return () => {}; } },
}));

const translations: Record<string, string> = {
  'onboarding.title': 'An agent that',
  'onboarding.title_accent': 'finds',
  'onboarding.chat.greeting': 'Hi{{name}}! Welcome to BabyClothes.',
  'onboarding.chat.value_prop': 'value prop',
  'onboarding.chat.overview_catalog_t': 'Catalog',
  'onboarding.chat.overview_catalog_d': 'catalog desc',
  'onboarding.chat.overview_agent_t': 'AI Assistant',
  'onboarding.chat.overview_agent_d': 'agent desc',
  'onboarding.chat.overview_sell_t': 'Sell',
  'onboarding.chat.overview_sell_d': 'sell desc',
  'onboarding.chat.growth_ai': 'growth ai',
  'onboarding.chat.ask_children_intro': 'tell me about your children',
  'onboarding.chat.how_many': 'How many children do you have?',
  'onboarding.chat.count_3plus': '3+',
  'onboarding.chat.child_form_intro': 'Fill in the details below',
  'onboarding.chat.child_form_title': 'Child registration',
  'onboarding.chat.child_saved': '{{name}} registered!',
  'onboarding.chat.user_count_reply': 'I have {{count}} child(ren)',
  'onboarding.chat.step_pill': 'Child {{n}} of {{count}}',
  'onboarding.chat.wrap_up': 'Perfect! You are all set.',
  'onboarding.chat.opening_agent': 'Opening the agent…',
  'agent.form.name': 'Name',
  'agent.form.age': 'Age',
  'agent.form.height': 'Height',
  'agent.form.weight': 'Weight',
  'agent.form.birth_height': 'Birth height',
  'agent.form.birth_weight': 'Birth weight',
  'agent.form.submit': 'Save child',
  'agent.form.save_error': 'Could not save the child.',
};

function translate(key: string, vars?: Record<string, unknown>): string {
  let value = translations[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return value;
}

vi.mock('$lib/i18n', () => ({
  t: { subscribe: (fn: (v: unknown) => void) => { fn(translate); return () => {}; } },
  get: () => translate,
}));

vi.mock('$lib/stores/toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const createMock = vi.fn();
const addMeasurementMock = vi.fn();
vi.mock('$lib/infrastructure/http/HttpChildRepository', () => ({
  HttpChildRepository: class {
    create = (...args: unknown[]) => createMock(...args);
    addMeasurement = (...args: unknown[]) => addMeasurementMock(...args);
    findAll = vi.fn().mockResolvedValue([]);
    findById = vi.fn();
    getMeasurements = vi.fn();
  },
}));

describe('onboarding chat page', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    gotoMock.mockClear();
    createMock.mockReset();
    addMeasurementMock.mockReset();
    createMock.mockResolvedValue({ id: 'child-1', userId: 'user-1', name: 'Joao', birthDate: new Date(), gender: 'male', birthWeightG: 3200, birthHeightCm: 50 });
    addMeasurementMock.mockResolvedValue({ id: 'm-1', childId: 'child-1', recordedAt: new Date(), weightG: 3200, heightCm: 50, clothingSize: 'RN' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('plays the presentation beats in order, then shows the count picker', async () => {
    render(Page);

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText(/welcome to babyclothes/i)).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText('value prop')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText('Catalog')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText('growth ai')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText('tell me about your children')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('advances to the child form after picking a count, registers a child, and finishes after the last one', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(Page);

    // fast-forward through the whole presentation
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(700);
    }

    const oneChip = await screen.findByRole('button', { name: '1' });
    await user.click(oneChip);

    expect(await screen.findByText('I have 1 child(ren)')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700);
    expect(await screen.findByText('Fill in the details below')).toBeInTheDocument();
    expect(await screen.findByText('Child registration')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Joao');
    await user.type(screen.getByLabelText('Age'), '3');
    await user.type(screen.getByLabelText('Birth height'), '50');
    await user.type(screen.getByLabelText('Birth weight'), '3200');
    await user.click(screen.getByRole('button', { name: 'Save child' }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(addMeasurementMock).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Joao registered!')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700); // "wrap up" typing pause
    expect(await screen.findByText('Perfect! You are all set.')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(700); // finish() pause before goto
    await waitFor(() => expect(gotoMock).toHaveBeenCalledWith('/agent'));
  });
});
```

Note: field label matching (`screen.getByLabelText('Name')`, etc.) depends on `ChildInlineForm` associating its inputs with the `labels` text passed in. If the rendered DOM does not expose that association via accessible `<label for>`/`aria-label`, use `screen.getByPlaceholderText` or `container.querySelector` against the actual markup `ChildInlineForm` renders — read `packages/design-system/src/lib/patterns/ChildInlineForm/ChildInlineForm.svelte` first if `getByLabelText` fails, and adjust selectors to match its real markup instead of guessing further.

- [ ] **Step 2: Run the test to see it drive real behavior**

Run: `yarn workspace @babyclothes/web vitest run src/routes/onboarding/page.svelte.test.ts`
Expected: PASS once selectors match the real `ChildInlineForm` markup (fix selectors per the note above if the first run fails on `getByLabelText`/`getByRole` — do not change the component to fit the test).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/routes/onboarding/page.svelte.test.ts
git commit -m "test(web): cover onboarding chat presentation, count picker, and child loop"
```

---

### Task 5: Reconcile `apps/web/src/routes/agent/+page.svelte`

**Files:**
- Modify: `apps/web/src/routes/agent/+page.svelte` (imports around lines 1–35, `loadIntake`/`STORAGE_KEY` around lines 73–97, `onMount` around lines 295–307)

**Interfaces:**
- Consumes: `initialIntakeState`, `IntakeState` from `$lib/application/chat/IntakeMachine` (unchanged).
- Produces: nothing new consumed elsewhere; this task only changes control flow inside the existing component.

- [ ] **Step 1: Restrict what `loadIntake()` trusts from `sessionStorage`**

In `apps/web/src/routes/agent/+page.svelte`, find:

```ts
  function loadIntake(): IntakeState {
    if (typeof window === 'undefined') return initialIntakeState;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as IntakeState;
        return { ...initialIntakeState, ...parsed };
      }
    } catch {
      // ignore parse errors
    }
    return initialIntakeState;
  }
```

Replace it with:

```ts
  function loadIntake(): IntakeState {
    if (typeof window === 'undefined') return initialIntakeState;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as IntakeState;
        if (parsed.step === 'ask_search_intent' || parsed.step === 'free_chat') {
          return { ...initialIntakeState, ...parsed };
        }
      }
    } catch {
      // ignore parse errors
    }
    return initialIntakeState;
  }
```

- [ ] **Step 2: Replace `onMount` with the redirect-when-empty / skip-ahead logic**

Find:

```ts
  onMount(async () => {
    try {
      const userId = session?.userId;
      if (!userId) throw new Error('Not authenticated');
      const loadedChildren = await childRepo.findAll(userId);
      children = loadedChildren;
    } catch (e) {
      console.error('Failed to load agent data:', e);
    } finally {
      loading = false;
      buildIntakeMessages();
    }
  });
```

Replace it with:

```ts
  onMount(async () => {
    try {
      const userId = session?.userId;
      if (!userId) throw new Error('Not authenticated');
      const loadedChildren = await childRepo.findAll(userId);
      children = loadedChildren;

      if (loadedChildren.length === 0) {
        await goto('/onboarding');
        return;
      }

      if (intake.step !== 'ask_search_intent' && intake.step !== 'free_chat') {
        intake = { ...initialIntakeState, step: 'ask_search_intent', hasChildren: 'yes' };
        saveIntake(intake);
      }
    } catch (e) {
      console.error('Failed to load agent data:', e);
    } finally {
      loading = false;
      buildIntakeMessages();
    }
  });
```

- [ ] **Step 3: Validate with the Svelte MCP**

Call `mcp__svelte__svelte-autofixer` on the full content of `apps/web/src/routes/agent/+page.svelte`. Apply any fixes, re-run to confirm clean.

- [ ] **Step 4: Type-check**

Run: `yarn workspace @babyclothes/web check`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/agent/+page.svelte
git commit -m "fix(web): agent redirects to onboarding with 0 children, skips dead intake steps"
```

---

### Task 6: Test the two `onMount` branches on `/agent`

**Files:**
- Create: `apps/web/src/routes/agent/page.svelte.test.ts` (create the file if it does not already exist; if it exists, add these two `describe` blocks to it instead of replacing existing content)

**Interfaces:**
- Consumes: the agent page component from Task 5, mocked `HttpChildRepository`, `SseChatRepository`, `goto`, `$app/stores`.

- [ ] **Step 1: Check whether the test file already exists**

Run: `ls apps/web/src/routes/agent/*.test.ts 2>/dev/null || echo "none"`

If a file exists, read it fully first and add the two new `describe` blocks below alongside its existing content (reusing its existing mocks where the mock shapes match). If none exists, create it fresh with the content below.

- [ ] **Step 2: Write/add the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import Page from './+page.svelte';

const gotoMock = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...args: unknown[]) => gotoMock(...args) }));

const mockSession = { userId: 'user-1', name: 'Maria Silva', email: 'maria@test.com', city: 'São Paulo' };
vi.mock('$app/stores', () => ({
  page: { subscribe: (fn: (v: unknown) => void) => { fn({ data: { session: mockSession } }); return () => {}; } },
}));

function translate(key: string, vars?: Record<string, unknown>): string {
  let value = key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return value;
}

vi.mock('$lib/i18n', () => ({
  t: { subscribe: (fn: (v: unknown) => void) => { fn(translate); return () => {}; } },
  get: () => translate,
}));

vi.mock('$lib/stores/toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const findAllMock = vi.fn();
vi.mock('$lib/infrastructure/http/HttpChildRepository', () => ({
  HttpChildRepository: class {
    findAll = (...args: unknown[]) => findAllMock(...args);
    create = vi.fn();
    findById = vi.fn();
    getMeasurements = vi.fn();
    addMeasurement = vi.fn();
  },
}));

vi.mock('$lib/infrastructure/sse/SseChatRepository', () => ({
  SseChatRepository: class {
    sendMessage = vi.fn();
  },
}));

beforeEach(() => {
  gotoMock.mockClear();
  findAllMock.mockReset();
  sessionStorage.clear();
});

describe('agent page onMount — 0 children', () => {
  it('redirects to /onboarding and does not render the search-intent step', async () => {
    findAllMock.mockResolvedValue([]);
    render(Page);

    await waitFor(() => expect(gotoMock).toHaveBeenCalledWith('/onboarding'));
    expect(screen.queryByText('agent.intake.has_children')).not.toBeInTheDocument();
  });
});

describe('agent page onMount — >=1 children', () => {
  it('initializes intake at ask_search_intent and does not ask about children', async () => {
    findAllMock.mockResolvedValue([
      { id: 'child-1', userId: 'user-1', name: 'Joao', birthDate: new Date('2025-01-01'), gender: 'male', birthWeightG: 3200, birthHeightCm: 50 },
    ]);
    render(Page);

    await waitFor(() => expect(findAllMock).toHaveBeenCalledWith('user-1'));
    expect(gotoMock).not.toHaveBeenCalledWith('/onboarding');
    expect(await screen.findByText('agent.intake.search_intent')).toBeInTheDocument();
    expect(screen.queryByText('agent.intake.has_children')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `yarn workspace @babyclothes/web vitest run src/routes/agent/page.svelte.test.ts`
Expected: PASS. If `SseChatRepository`'s real import path differs from `$lib/infrastructure/sse/SseChatRepository`, check the actual import line at the top of `apps/web/src/routes/agent/+page.svelte` and match the mock path to it exactly.

- [ ] **Step 4: Run the full web test suite**

Run: `yarn workspace @babyclothes/web test`
Expected: PASS, no regressions in other suites.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/agent/page.svelte.test.ts
git commit -m "test(web): cover agent onMount redirect-to-onboarding and skip-ahead-intake branches"
```

---

## Final Verification

- [ ] Run `yarn workspace @babyclothes/web check` — no new type errors.
- [ ] Run `yarn workspace @babyclothes/web test` — full suite green.
- [ ] Manually smoke-test (per the `verify`/`run` skill or `yarn dev`): log in with 0 children → land on `/onboarding` → chat plays through → register 1 child → redirected to `/agent` showing the search-intent step (no "do you have children?" bubble). Then visit `/agent` directly with a session that already has children → confirm no `/onboarding` redirect and no re-asked intake questions.
