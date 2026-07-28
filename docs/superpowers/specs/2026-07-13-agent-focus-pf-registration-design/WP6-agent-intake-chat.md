## WP6 — Rota /agent (intake + chat)

### 6.1 Tipos de mensagem — editar `apps/web/src/lib/domain/chat/entities/Message.ts`

Substituir o type `ComponentPayload` por união discriminada, **preservando** os três formatos atuais como interfaces nomeadas (mesmos campos de hoje):

```ts
export interface CarouselPayload { type: 'carousel'; items?: Item[]; label?: string }
export interface ItemListPayload { type: 'itemList'; items?: Item[]; label?: string }
export interface GrowthAlertPayload {
  type: 'growthAlert'
  childName?: string; currentSize?: string; nextSize?: string
  daysUntil?: number; progress?: number; eyebrow?: string; description?: string
  sizes?: { label: string; status: 'past' | 'current' | 'next' | 'future' }[]
  primaryAction?: { label: string; onclick: () => void }
  secondaryAction?: { label: string; onclick: () => void }
}

export interface ChoiceChipsPayload {
  type: 'choiceChips'
  options: { value: string; label: string; primary?: boolean }[]
  onSelect: (value: string) => void
}
export interface ChildFormPayload {
  type: 'childForm'
  title: string
  initial?: Partial<import('$lib/domain/child/schemas').CreateChildInput>
  onSubmit: (input: import('$lib/domain/child/schemas').CreateChildInput) => void
}
export interface DueDatePayload {
  type: 'dueDate'
  title: string
  months: { value: string; label: string }[]
  onConfirm: (month: string) => void
}
export interface SuggestionChipsPayload {
  type: 'suggestions'
  heading?: string
  suggestions: { id: string; label: string; primary?: boolean }[]
  onSelect: (id: string) => void
}

export type ComponentPayload =
  | CarouselPayload | ItemListPayload | GrowthAlertPayload
  | ChoiceChipsPayload | ChildFormPayload | DueDatePayload | SuggestionChipsPayload
```

`Message` inalterado. Verificar chamadores de `ComponentPayload` (chat page) — campos existentes não mudam, só o narrowing por `payload.type`.

### 6.2 Schemas — editar `apps/web/src/lib/domain/child/schemas.ts`

Substituir `CreateChildInputSchema` por:

```ts
export const CreateChildInputSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(80),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional(),
    ageMonths: z.number().int().min(0).max(216).optional(),
    currentWeightG: z.number().int().min(0).optional(),
    currentHeightCm: z.number().int().min(0).optional(),
    birthWeightG: z.number().int().min(0, 'Peso não pode ser negativo'),
    birthHeightCm: z.number().int().min(0, 'Altura não pode ser negativa'),
    document: z.string().optional(),
  })
  .refine((c) => c.birthDate !== undefined || c.ageMonths !== undefined, {
    message: 'Informe data de nascimento ou idade',
    path: ['birthDate'],
  })
```

Atualizar `schemas.test.ts`: os casos atuais que passavam `birthDate` continuam válidos; casos novos — só `ageMonths` (ok), nenhum dos dois (falha), `ageMonths: -1` (falha).

### 6.3 Máquina de intake — arquivo novo `apps/web/src/lib/application/chat/IntakeMachine.ts`

```ts
import type { CreateChildInput } from '$lib/domain/child/schemas'

export type IntakeStep =
  | 'ask_has_children' | 'ask_children_count' | 'fill_child_form'
  | 'ask_due_date' | 'explain_platform' | 'ask_search_intent' | 'free_chat'

export type HasChildrenAnswer = 'yes' | 'no' | 'expecting'

export interface IntakeState {
  step: IntakeStep
  hasChildren: HasChildrenAnswer | null
  childrenCount: number | null
  childrenFilled: number
  children: CreateChildInput[]
  dueDate: string | null // YYYY-MM
}

export const initialIntakeState: IntakeState = {
  step: 'ask_has_children',
  hasChildren: null,
  childrenCount: null,
  childrenFilled: 0,
  children: [],
  dueDate: null,
}

export type IntakeEvent =
  | { type: 'ANSWER_HAS_CHILDREN'; answer: HasChildrenAnswer }
  | { type: 'ANSWER_COUNT'; count: number }
  | { type: 'CHILD_SUBMITTED'; child: CreateChildInput }
  | { type: 'DUE_DATE_CONFIRMED'; month: string }
  | { type: 'EXPLANATION_DONE' }
  | { type: 'SEARCH_INTENT_CHOSEN' }

export function reduceIntake(state: IntakeState, event: IntakeEvent): IntakeState {
  switch (event.type) {
    case 'ANSWER_HAS_CHILDREN':
      if (state.step !== 'ask_has_children') return state
      if (event.answer === 'yes') return { ...state, hasChildren: 'yes', step: 'ask_children_count' }
      if (event.answer === 'expecting') return { ...state, hasChildren: 'expecting', step: 'ask_due_date' }
      return { ...state, hasChildren: 'no', step: 'explain_platform' }
    case 'ANSWER_COUNT':
      if (state.step !== 'ask_children_count' || event.count < 1) return state
      return { ...state, childrenCount: event.count, step: 'fill_child_form' }
    case 'CHILD_SUBMITTED': {
      if (state.step !== 'fill_child_form') return state
      const filled = state.childrenFilled + 1
      const children = [...state.children, event.child]
      const done = state.childrenCount !== null && filled >= state.childrenCount
      return { ...state, childrenFilled: filled, children, step: done ? 'explain_platform' : 'fill_child_form' }
    }
    case 'DUE_DATE_CONFIRMED':
      if (state.step !== 'ask_due_date') return state
      return { ...state, dueDate: event.month, step: 'explain_platform' }
    case 'EXPLANATION_DONE':
      if (state.step !== 'explain_platform') return state
      return { ...state, step: 'ask_search_intent' }
    case 'SEARCH_INTENT_CHOSEN':
      if (state.step !== 'ask_search_intent') return state
      return { ...state, step: 'free_chat' }
  }
}
```

Teste novo `IntakeMachine.test.ts`: os 3 ramos completos (yes com count=2 exige 2 CHILD_SUBMITTED; no vai direto a explain; expecting exige DUE_DATE), eventos fora de ordem são no-ops, count<1 é no-op.

### 6.4 Rota — arquivos novos `apps/web/src/routes/agent/+page.server.ts` e `+page.svelte`

`+page.server.ts`: exige sessão (`redirect /login`); se `flags.marketplace` (modo full), `redirect(303, '/chat')`.

`+page.svelte`: fork de `routes/chat/+page.svelte` (ler antes de escrever) com:
- Mesmo transporte SSE/`IChatRepository` e store de mensagens.
- Estado `let intake = $state(initialIntakeState)`; helper `dispatch(event)` que aplica `reduceIntake` e enfileira as mensagens/payloads do próximo passo (textos das chaves `agent.intake.*`).
- Render de `ComponentPayload` por `payload.type`:
  - `choiceChips` → `<ChoiceChipGroup>` (tone outline)
  - `childForm` → `<AgentFormCard title>` com `<ChildInlineForm>`; no submit: `CreateChildInputSchema.parse` → `CreateChild` use case (`IChildRepository`) → `dispatch({ type: 'CHILD_SUBMITTED', child })`
  - `dueDate` → `<AgentFormCard>` com `<MonthPicker>` + confirmar
  - `suggestions` → `<ChoiceChipGroup tone="soft" size="sm">` com heading
- `explain_platform`: mensagem do agente `agent.intake.explain` + auto `EXPLANATION_DONE` após render.
- `ask_search_intent`: sugestões fixas v1 = `bodies_m | winter | party | pajamas | next_size` (labels i18n); escolha envia o texto como mensagem do usuário para o agente e entra em `free_chat`.
- Persistir intake em `sessionStorage bc_intake` (JSON) para sobreviver a reload; hidratar no início.

`routes/chat/+page.server.ts` (criar se não existir): em modo agent, `throw redirect(308, '/agent')`.

**DoD**: fluxo 04→07 do mock reproduzido ponta a ponta em `PUBLIC_APP_MODE=agent`, com crianças persistidas e chat livre funcionando após o intake.
