# Type-Check Cleanup Plan (Pré-Existentes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Zerar os **16 erros pré-existentes** de `yarn check` — mocks e design-system incompletos, sem relação com auth. Após este plano, `yarn check` deve reportar **0 erros**.

**Contexto:** Estes erros existiam antes do trabalho de autenticação (confirmado via `git show 1b7f7b7`). Foram listados como fora-de-escopo em `2026-07-02-auth-typecheck-fixes.md`. Este plano os resolve.

**Estado atual:**
- `yarn check` → **16 erros** (todos abaixo)
- `yarn vitest run` → 61 tests, 0 failures
- API: 198 tests, 0 failures

**Tech Stack:** SvelteKit 2 / Svelte 5, TypeScript, design-system (Svelte lib).

## Global Constraints

- Rodar de `apps/web`: `cd apps/web`
- Gate final: `yarn check` → **0 ERRORS**
- Não alterar comportamento em runtime — são correções de tipo/mock
- Não quebrar os 61 testes web existentes
- Commits semânticos: `fix(web):` / `fix(ds):`

---

## Inventário dos 16 erros

| # | Arquivo:linha | Erro | Task |
|---|---------------|------|------|
| 1 | `mocks/data.ts:10` | `mockSession` sem `type`/`isSeller` | T1 |
| 2 | `catalog/[id]/+page.svelte:60:36` | `MockSeller.listingsCount` inexistente | T1 |
| 3 | `catalog/[id]/+page.svelte:60:96` | idem | T1 |
| 4 | `chat/+page.svelte:42` | `Child.userId` faltando no mock | T1 |
| 5 | `child/[id]/+page.svelte:30` | `Child.userId` faltando no mock | T1 |
| 6 | `child/+page.svelte:65` | `Child.userId` faltando no mock | T1 |
| 7 | `LoginWithGoogle.test.ts:7` | `Session` mock sem `type`/`isSeller` | T2 |
| 8 | `LoginWithGoogle.test.ts:15` | `IAuthRepository` mock sem `updateProfile` | T2 |
| 9 | `LoginWithGoogle.test.ts:29` | idem | T2 |
| 10 | `Logout.test.ts:7` | `IAuthRepository` mock sem `updateProfile` | T2 |
| 11 | `chat/+page.svelte:204` | `component.items` possivelmente `undefined` | T3 |
| 12 | `chat/+page.svelte:238` | `SizeEntry.status` tipo `string` largo demais | T3 |
| 13 | `catalog/+page.svelte:204` | `Card` `size` não aceita `'featured'` | T4 |
| 14 | `+layout.svelte:20` | `writable(undefined)` recebe `Session \| null` | T5 |
| 15 | `Input.svelte:34` (DS) | `state` sombreia o rune `$state` | T6 |
| 16 | `Input.svelte:34` (DS) | idem (erro secundário do mesmo shadow) | T6 |

---

### Task 1: Completar tipos dos mocks (`data.ts`)

Corrige 6 erros (#1-#6). A raiz de #4-#6 é o `MockChild` sem `userId`; #1 é `mockSession` incompleto; #2-#3 é `MockSeller` sem `listingsCount`.

**Files:**
- Modify: `apps/web/src/lib/mocks/data.ts`

**Interfaces:**
- `mockSession` passa a satisfazer `Session` (com `type`, `isSeller`)
- `MockChild` ganha `userId: string`; cada entrada de `mockChildren` recebe `userId`
- `MockSeller` ganha `listingsCount?: number`

- [ ] **Step 1: Ver os erros atuais**

Run: `cd apps/web && yarn check 2>&1 | grep -E "mocks/data.ts|MockSeller|Child.userId|userId' is missing"`
Expected: erros em `data.ts:10`, `catalog/[id]:60`, `chat:42`, `child/[id]:30`, `child/+page:65`.

- [ ] **Step 2: Completar `mockSession`**

Em `apps/web/src/lib/mocks/data.ts`, trocar o bloco `mockSession`:

```ts
export const mockSession: Session = {
  userId: 'user-1',
  email: 'ana@example.com',
  name: 'Ana Silva',
  avatarUrl: '',
  type: 'pf',
  isSeller: false,
};
```

- [ ] **Step 3: Adicionar `userId` ao tipo `MockChild`**

Trocar a definição de `MockChild`:

```ts
export type MockChild = {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  birthWeightG: number;
  birthHeightCm: number;
  document?: string;
};
```

- [ ] **Step 4: Adicionar `userId` a cada entrada de `mockChildren`**

Em cada um dos três objetos de `mockChildren`, adicionar `userId: 'user-1',` logo após `id`:

```ts
export const mockChildren: MockChild[] = [
  {
    id: 'child-1',
    userId: 'user-1',
    name: 'Sofia',
    birthDate: '2024-03-15',
    gender: 'female',
    birthWeightG: 3200,
    birthHeightCm: 49,
    document: '123.456.789-00',
  },
  {
    id: 'child-2',
    userId: 'user-1',
    name: 'Miguel',
    birthDate: '2023-08-22',
    gender: 'male',
    birthWeightG: 3500,
    birthHeightCm: 51,
    document: undefined,
  },
  {
    id: 'child-3',
    userId: 'user-1',
    name: 'Laura',
    birthDate: '2025-01-10',
    gender: 'female',
    birthWeightG: 2900,
    birthHeightCm: 47,
    document: undefined,
  },
];
```

- [ ] **Step 5: Adicionar `listingsCount` opcional ao `MockSeller`**

Trocar a definição de `MockSeller`:

```ts
export type MockSeller = {
  id: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
  listingsCount?: number;
};
```

> Não é necessário preencher `listingsCount` nas entradas de `mockSellers` — o uso em `catalog/[id]/+page.svelte:60` é `data.seller?.listingsCount ? ... : undefined`, que tolera `undefined`.

- [ ] **Step 6: Verificar que os 6 erros sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep -E "mocks/data.ts|MockSeller|listingsCount|chat/\+page.svelte:42|child/\[id\]/\+page.svelte:30|child/\+page.svelte:65" || echo "OK - mocks completos"`
Expected: `OK - mocks completos`

- [ ] **Step 7: Rodar a suíte web**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests)

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/mocks/data.ts
git commit -m "fix(web): complete mock types with userId, session fields, seller listingsCount"
```

---

### Task 2: Completar mocks de `IAuthRepository` nos testes de use-case

Corrige 4 erros (#7-#10).

**Files:**
- Modify: `apps/web/src/lib/application/auth/LoginWithGoogle.test.ts`
- Modify: `apps/web/src/lib/application/auth/Logout.test.ts`

**Interfaces:**
- Os mocks passam a implementar `IAuthRepository` completo (com `updateProfile`) e o `Session` de teste ganha `type`/`isSeller`.

- [ ] **Step 1: Ver os erros atuais**

Run: `cd apps/web && yarn check 2>&1 | grep -E "LoginWithGoogle.test|Logout.test"`
Expected: erros de `updateProfile` faltando e `Session` incompleto.

- [ ] **Step 2: Corrigir `LoginWithGoogle.test.ts`**

No `mockSession` do teste (linha ~7), adicionar `type` e `isSeller`:

```ts
  const mockSession: Session = {
    userId: 'u-1',
    email: 'sofia@example.com',
    name: 'Sofia',
    avatarUrl: 'https://example.com/avatar.jpg',
    type: 'pf',
    isSeller: false,
  };
```

Nos **dois** objetos `auth: IAuthRepository = { ... }` (linhas ~15 e ~29), adicionar `updateProfile: vi.fn(),`:

```ts
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn().mockResolvedValue(mockSession),
      logout: vi.fn(),
      getSession: vi.fn(),
      updateProfile: vi.fn(),
    };
```

e no segundo:

```ts
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn().mockRejectedValue(new Error('Invalid code')),
      logout: vi.fn(),
      getSession: vi.fn(),
      updateProfile: vi.fn(),
    };
```

- [ ] **Step 3: Corrigir `Logout.test.ts`**

No objeto `auth: IAuthRepository` (linha ~7), adicionar `updateProfile: vi.fn(),`:

```ts
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn(),
      updateProfile: vi.fn(),
    };
```

- [ ] **Step 4: Verificar que os erros sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep -E "LoginWithGoogle.test|Logout.test" || echo "OK - auth tests completos"`
Expected: `OK - auth tests completos`

- [ ] **Step 5: Rodar os testes afetados**

Run: `cd apps/web && yarn vitest run src/lib/application/auth`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/application/auth/LoginWithGoogle.test.ts apps/web/src/lib/application/auth/Logout.test.ts
git commit -m "fix(web): complete IAuthRepository mocks with updateProfile and session fields"
```

---

### Task 3: Corrigir tipos de componentes do chat

Corrige 2 erros (#11, #12).

**Files:**
- Modify: `apps/web/src/lib/domain/chat/entities/Message.ts` (tipo `ComponentPayload.sizes`)
- Modify: `apps/web/src/routes/chat/+page.svelte:204` (guard de `component.items`)

**Interfaces:**
- `ComponentPayload.sizes` passa a usar o union estrito `'past' | 'current' | 'next' | 'future'` (compatível com `SizeEntry` do `GrowthChart`).

- [ ] **Step 1: Ver os erros atuais**

Run: `cd apps/web && yarn check 2>&1 | grep -E "chat/\+page.svelte:(204|238)"`
Expected: `component.items' is possibly 'undefined'` (204) e `SizeEntry` incompatível (238).

- [ ] **Step 2: Estreitar o tipo `sizes` em `Message.ts`**

Em `apps/web/src/lib/domain/chat/entities/Message.ts`, trocar a linha de `sizes`:

```ts
  sizes?: { label: string; status: 'past' | 'current' | 'next' | 'future' }[];
```

- [ ] **Step 3: Proteger `component.items` na linha 204**

Em `apps/web/src/routes/chat/+page.svelte`, trocar `component.items.length` por acesso seguro:

```svelte
                  content={component.label ?? $t('chat.filter_result', { count: component.items?.length ?? 0 })}
```

- [ ] **Step 4: Verificar que os erros sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep -E "chat/\+page.svelte:(204|238)" || echo "OK - chat tipado"`
Expected: `OK - chat tipado`

> Se surgir novo erro em `chat:238` porque o mock que alimenta `sizes` usa `status: string`, ajuste o mock correspondente (em `mocks/data.ts` ou onde os `components` de chat são construídos) para usar os literais do union. Rode `yarn check` e corrija a origem apontada.

- [ ] **Step 5: Rodar a suíte web**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/domain/chat/entities/Message.ts apps/web/src/routes/chat/+page.svelte
git commit -m "fix(web): narrow chat SizeEntry status union and guard optional items"
```

---

### Task 4: Corrigir `size` inválido no Card do catálogo

Corrige 1 erro (#13). O `Card` aceita `Size = 'sm' | 'md' | 'lg'`; o catálogo passa `'featured'`, que nunca foi válido.

**Files:**
- Modify: `apps/web/src/routes/catalog/+page.svelte:204`

**Interfaces:**
- O card em destaque (índice 0) usa `'lg'` (maior variante válida) em vez de `'featured'`.

- [ ] **Step 1: Ver o erro atual**

Run: `cd apps/web && yarn check 2>&1 | grep "catalog/\+page.svelte:204"`
Expected: `Type '"md" | "featured"' is not assignable to type 'Size | undefined'.`

- [ ] **Step 2: Trocar `'featured'` por `'lg'`**

Em `apps/web/src/routes/catalog/+page.svelte`, na prop `size` do Card:

```svelte
            size={index === 0 ? 'lg' : 'md'}
```

- [ ] **Step 3: Verificar que o erro sumiu**

Run: `cd apps/web && yarn check 2>&1 | grep "catalog/\+page.svelte:204" || echo "OK - card size valido"`
Expected: `OK - card size valido`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/routes/catalog/+page.svelte
git commit -m "fix(web): use valid 'lg' Card size for featured catalog item"
```

---

### Task 5: Tipar o session store no layout

Corrige 1 erro (#14). `writable(undefined)` infere `Writable<undefined>` e rejeita `Session | null`.

**Files:**
- Modify: `apps/web/src/routes/+layout.svelte`

**Interfaces:**
- O store de sessão passa a ser `Writable<Session | null>`, consistente com `data.session` (`Session | null`).

- [ ] **Step 1: Ver o erro atual**

Run: `cd apps/web && yarn check 2>&1 | grep "+layout.svelte:20"`
Expected: `Type 'null' is not assignable to type 'undefined'.`

- [ ] **Step 2: Importar `Session` e tipar o store**

No bloco `<script>` de `apps/web/src/routes/+layout.svelte`, adicionar o import de tipo:

```ts
  import type { Session } from '$lib/domain/auth/entities/Session'
```

Trocar a criação do store:

```ts
  const sessionStore = writable<Session | null>(null)
```

> **Consistência:** os consumidores em Task 2 do plano de fixes (`child/+page.svelte`, `notifications/+page.svelte`) tipam o context como `Writable<Session | undefined>`. Alinhe-os para `Writable<Session | null>` se `yarn check` acusar incompatibilidade após esta mudança (rode o check e ajuste a anotação `getContext<Writable<Session | null>>('session')` nesses arquivos).

- [ ] **Step 3: Verificar que o erro sumiu**

Run: `cd apps/web && yarn check 2>&1 | grep "+layout.svelte:20" || echo "OK - session store tipado"`
Expected: `OK - session store tipado`

- [ ] **Step 4: Rodar a suíte web**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/+layout.svelte
git commit -m "fix(web): type session store as Writable<Session | null>"
```

---

### Task 6: Renomear `state` que sombreia o rune `$state` no Input (DS)

Corrige 2 erros (#15, #16). Em `Input.svelte`, `const state = $derived(...)` colide com o rune `$state`, gerando os dois erros na mesma linha.

**Files:**
- Modify: `packages/design-system/src/primitives/Input/Input.svelte`

**Interfaces:**
- A variável derivada `state` é renomeada para `inputState`; todas as referências no template/estilos são atualizadas.

- [ ] **Step 1: Ver os erros atuais**

Run: `cd apps/web && yarn check 2>&1 | grep "Input.svelte:34"`
Expected: dois erros — `Block-scoped variable '$state' used before its declaration` e `Cannot use 'state' as a store`.

- [ ] **Step 2: Localizar todas as referências a `state`**

Run: `grep -n "\bstate\b" packages/design-system/src/primitives/Input/Input.svelte`
Anote as linhas (a declaração `const state = $derived(...)` e cada uso, tipicamente numa classe BEM tipo `class:input--{state}` ou `input--{state}`).

- [ ] **Step 3: Renomear a declaração**

Em `packages/design-system/src/primitives/Input/Input.svelte`, trocar:

```svelte
  const inputState = $derived(error ? 'error' : success ? 'success' : 'default')
```

- [ ] **Step 4: Atualizar os usos no markup**

Substituir cada referência `{state}` / `--{state}` por `inputState`. Por exemplo, se houver `class="input input--{state}"`, passa a `class="input input--{inputState}"`. Use o resultado do Step 2 para atualizar todas as ocorrências (não deixar nenhuma `\bstate\b` remanescente que se refira à derivada).

- [ ] **Step 5: Verificar que os erros sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep "Input.svelte:34" || echo "OK - Input sem shadow"`
Expected: `OK - Input sem shadow`

- [ ] **Step 6: Rodar os testes do design-system (se houver)**

Run: `cd packages/design-system && yarn test 2>&1 | tail -5`
Expected: PASS (ou "no tests" — sem regressão)

- [ ] **Step 7: Commit**

```bash
git add packages/design-system/src/primitives/Input/Input.svelte
git commit -m "fix(ds): rename Input derived state to avoid shadowing \$state rune"
```

---

## Verificação Final

- [ ] **Zero erros de type-check**

Run: `cd apps/web && yarn check 2>&1 | grep -c "ERROR"`
Expected: `0`

- [ ] **Suíte web verde**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests)

- [ ] **Suíte API verde (sanidade)**

Run: `docker compose exec -e MIX_ENV=test api mix test`
Expected: PASS (198 tests)
