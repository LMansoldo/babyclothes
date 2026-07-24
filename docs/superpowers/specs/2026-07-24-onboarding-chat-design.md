# Onboarding Chat — Design

**Date:** 2026-07-24
**Status:** Approved (pending spec review)
**Scope:** `apps/web`

## Problem

The current `/onboarding` route is a static hero screen (`OnboardingHero` + a CTA button)
that redirects to `/agent`. The `/agent` route then runs its *own* scripted intake
(greeting → "do you have children?" → inline child form → due date → "explain platform"
→ search) via `IntakeMachine`. That intake's questions are inconsistent with the forms it
shows, producing a broken first-run journey.

## Goal

Turn `/onboarding` into a **simulated chat** that:

1. Presents the app (warm intro + a 3-areas overview + one line on how the growth AI works).
2. Registers the user's child(ren) inline (multiple children, looped) — persisted to the API.
3. Redirects to `/agent` only after registration is complete.

Reconcile `/agent` so it no longer re-asks the intake questions.

The visual/interaction reference is
`/Users/lucasmansoldo/Projects/jobapply/Redesign onboarding chat mobile/Onboarding Chat.dc.html`
— we copy its *interaction pattern* (scripted beats, typing indicator, input pauses, user
reply bubbles, final spinner + redirect) but render with **BabyClothes' own design system
and tokens**, not the DoJob purple palette.

## Non-goals

- No "no children / just browsing" branch and no "expecting a baby / due date" branch.
  Onboarding assumes the user has ≥1 child and registers at least one.
- Not removing `IntakeMachine.ts` or `OnboardingHero` (both stay; onboarding just stops
  using `OnboardingHero`).
- No backend/API changes. Registration reuses existing use cases.

## Decisions (from brainstorming)

| Decision | Choice |
|----------|--------|
| Onboarding vs agent | Onboarding **owns** intake; `/agent` becomes pure search. |
| What onboarding collects | **Multiple children, looped** (ask count, then one form per child). |
| Presentation depth | **Warm intro + 3-areas overview** + one line on the growth AI. |
| Child form persistence | **Persist for real** via `RegisterChild` + `AddMeasurement`. |
| Agent with 0 children | **Redirect to `/onboarding`**. |

## Architecture

### Component: `apps/web/src/routes/onboarding/+page.svelte` (rewrite)

A self-contained scripted chat. State (`$state`):

- `messages: OnboardingMessage[]` — the rendered chat log.
- `phase: 'presenting' | 'ask_count' | 'fill_form' | 'done'`.
- `isTyping: boolean` — controls the typing-dots indicator.
- `childrenCount: number | null`, `childrenFilled: number`.
- `submitting: boolean` — child-form submit in flight.

`OnboardingMessage` (local type):

```ts
type OnboardingMessage =
  | { id: string; kind: 'bot-text'; content: string }
  | { id: string; kind: 'bot-overview'; cards: { title: string; desc: string }[] }
  | { id: string; kind: 'user'; content: string }
  | { id: string; kind: 'ask-count' }   // renders ChoiceChipGroup 1/2/3+
  | { id: string; kind: 'child-form' }   // renders AgentFormCard + ChildInlineForm
```

Only the **last** `ask-count` / `child-form` message is interactive; once answered it is
replaced by (or followed by) a `user` reply bubble, matching the reference.

### Scripted runner

`componentDidMount` equivalent: `onMount` starts `runPresentation()`.

The presentation beats are a static array; each beat is rendered after a
`MESSAGE_DELAY_MS` (~700ms) typing pause, mirroring the reference:

```
const PRESENTATION_BEATS = [
  { kind: 'bot-text',     key: 'greeting' },       // "Oi{, name}! Bem-vindo à BabyClothes."
  { kind: 'bot-text',     key: 'value_prop' },
  { kind: 'bot-overview', key: 'overview' },        // 3 cards
  { kind: 'bot-text',     key: 'growth_ai' },       // one line on how the AI works
  { kind: 'bot-text',     key: 'ask_children_intro' },
]
```

After the last presentation beat, `phase = 'ask_count'` and an `ask-count` message is
appended (typing pause first). Selecting a count:

- appends a `user` bubble ("Tenho N filho(s)"),
- sets `childrenCount`, `phase = 'fill_form'`,
- after a typing pause, appends the first `child-form` message + a bot intro line.

On child-form submit (`onSubmit`):

- `submitting = true`,
- map values via `mapChildFormToCreateChildInput(values, new Date())`,
- `registerChild.execute(input)` then `addMeasurement.execute(created.id, buildInitialMeasurementInput(input))`
  (wrap the measurement in its own try/catch — a measurement failure must not abort onboarding),
- append a `user` bubble ("{name} cadastrado"),
- `childrenFilled += 1`.
- If `remaining(childrenCount, childrenFilled) > 0` → append another `child-form` (after a
  typing pause). Else → `phase = 'done'`, run `finish()`.

`finish()`: append final bot line ("Perfeito! Tudo pronto."), show the done spinner
("Abrindo o agente…"), `localStorage.setItem('bc_onboarded', '1')`, `goto('/agent')`.

Errors on `registerChild` → `toast.error($t('agent.form.save_error'))`, keep the form
mounted, `submitting = false` (user retries). No advance.

Guard: `session?.userId` required to submit (same as agent). If missing →
`toast.error` and abort submit.

### Pure helper: `apps/web/src/lib/application/onboarding/childLoop.ts` (new)

Small, unit-tested:

```ts
export function remainingChildren(count: number | null, filled: number): number
export function isChildLoopDone(count: number | null, filled: number): boolean
```

Keeps loop arithmetic out of the component so it can be tested without timers.

### Rendering (reuse existing pieces)

- Chat scroll container + teardrop avatar SVG + typing-dots: copy the markup/CSS pattern
  from `apps/web/src/routes/agent/+page.svelte` (`.agent-page__av`, `.agent-page__typing`,
  `@keyframes typing`) → renamed to `.onboarding-chat__*` (BEM).
- Bot / user bubbles: `ChatBubble` (`role="agent" | "user"`, `surface="light"`).
- Count picker: `ChoiceChipGroup` (options `[{value:'1',label:'1'}, {value:'2',label:'2'},
  {value:'3',label:$t('onboarding.chat.count_3plus')}]`).
- Child form: `AgentFormCard` wrapping `ChildInlineForm`, with the **same** `labels`/`units`
  props the agent page already passes (name/age/height/weight/birth height/birth weight;
  units meses/cm/kg/g).
- Overview cards: rendered inline with BEM + tokens (`--pk`, `--of2`, `--bk`) — no new DS
  component (there is no existing "overview cards" component and one isn't warranted).
- Header: a small sticky top bar showing the app name + a step pill
  ("Filho {n} de {count}") during `fill_form`, echoing the reference's step indicator.

### `apps/web/src/routes/onboarding/+page.server.ts`

Unchanged — already requires a session (`redirect(303, '/login')` otherwise).

### Reconciling `/agent` — `apps/web/src/routes/agent/+page.svelte`

In `onMount`, after `childRepo.findAll(userId)`:

- If `children.length === 0` → `goto('/onboarding')` and return (do not build intake).
- Else → initialize intake **past** the dead early steps:
  `intake = { ...initialIntakeState, step: 'ask_search_intent', hasChildren: 'yes' }`
  and **do not** restore a stale `bc_intake` from sessionStorage for the pre-search steps.
  Then `buildIntakeMessages()` renders the greeting-free search entry
  (`agent.intake.search_intent` + suggestions), exactly as the current
  `case 'ask_search_intent'` does.

`IntakeMachine.ts` is untouched; the agent simply never enters
`ask_has_children`/`ask_children_count`/`fill_child_form`/`ask_due_date`/`explain_platform`
on the normal path. The `SEARCH_INTENT_CHOSEN → free_chat` transition still works.

Edge: preserve `loadIntake()`/`saveIntake()` for `free_chat` continuity, but only trust a
stored state whose `step` is `ask_search_intent` or `free_chat`; otherwise fall back to the
`ask_search_intent` init above. This prevents a stale pre-search intake from resurrecting
the broken flow.

### i18n — `apps/web/src/lib/i18n/{en,pt}.json`

New namespace `onboarding.chat`:

```
greeting              "Hi{, name}! Welcome to BabyClothes." / "Oi{, name}! Bem-vindo à BabyClothes."
value_prop            (one line: AI finds ideal thrift clothes for your child)
overview_title        cards heading (optional)
overview_catalog_t / _d
overview_agent_t   / _d
overview_sell_t    / _d
growth_ai             (one line on how growth prediction works)
ask_children_intro    "Before we start, tell me about your children."
how_many              "How many children do you have?"
count_3plus           "3+"
child_form_intro      "Great! Fill in the details below:"
child_form_title      "Child registration"
child_saved           "{{name}} registered!"
user_count_reply      "I have {{count}} child(ren)"
step_pill             "Child {{n}} of {{count}}"
wrap_up               "Perfect! You're all set."
opening_agent         "Opening the agent…"
```

Reuse existing `agent.form.*` labels for the `ChildInlineForm` fields and
`agent.form.save_error` for the error toast (no duplication).

## Data flow

```
onMount → runPresentation (timed bot beats)
        → ask_count (ChoiceChipGroup) → user bubble
        → loop: child-form → mapChildFormToCreateChildInput
                           → RegisterChild.execute  → AddMeasurement.execute
                           → user bubble → remainingChildren()?  yes: next form / no: finish
        → finish: set bc_onboarded, goto('/agent')

/agent onMount → findAll(userId)
              → 0 children  → goto('/onboarding')
              → ≥1 children → intake=ask_search_intent → search UI
```

## Testing

- **Unit (vitest):** `childLoop.test.ts` — `remainingChildren` / `isChildLoopDone` across
  count = 1/2/3 and null.
- **Unit (vitest):** onboarding page — with fake timers, assert the presentation beats
  render in order, the count picker advances to the form, a successful submit calls
  `RegisterChild` and advances, and completing the last child calls `goto('/agent')` and
  sets `bc_onboarded`. Mock `RegisterChild`/`AddMeasurement`/`goto`/repositories as the
  existing agent tests do.
- **Unit (vitest):** agent page — 0 children redirects to `/onboarding`; ≥1 child renders
  the search-intent step (no "do you have children?" bubble).
- Follow the existing test setup/mocks in `apps/web/test` (see `agent`/`onboarding` tests
  and `setup.ts`).

## Risks / notes

- Scripted timing is timer-based; keep testable logic in `childLoop.ts` + explicit state
  transitions and use vitest fake timers for the component test to avoid flakiness.
- Every `.svelte` file must be validated with the Svelte MCP per project rules.
- No emojis in UI (project rule) — use text and, if any icon is needed, `lucide-svelte`.
- i18n: both en-US and pt-BR required for every new string.
