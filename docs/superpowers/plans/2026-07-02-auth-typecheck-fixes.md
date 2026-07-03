# Auth Type-Check Fixes Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fechar o gate de type-check que ficou aberto após a implementação do plano de auth (`2026-07-02-auth-end-to-end.md`). O `yarn check` acusa 22 erros; **6 são regressões introduzidas pela refatoração de auth** e devem ser corrigidas aqui. Os outros 16 são **pré-existentes** (mocks/design-system incompletos) e ficam fora deste plano.

**Estado verificado:**
- API: `docker compose exec -e MIX_ENV=test api mix test` → **198 tests, 0 failures** ✅
- Web: `yarn vitest run` → **61 tests, 0 failures** ✅
- Web: `yarn check` → **22 erros** ❌ (6 auth + 16 pré-existentes)

**Tech Stack:** SvelteKit 2 / Svelte 5, TypeScript.

## Global Constraints

- Rodar tudo de `apps/web`: `cd apps/web`
- Gate final: `yarn check` não deve ter **nenhum** erro novo de auth (os 16 pré-existentes permanecem até o plano de cleanup separado)
- Não tocar em mocks/design-system neste plano
- Commits semânticos: `fix(web):`

---

## Diagnóstico — Erros de `yarn check`

### Regressões de auth (corrigir aqui — 6)

| # | Arquivo | Erro | Causa |
|---|---------|------|-------|
| R1 | `src/routes/login/+page.server.ts:24` | `Namespace 'App' has no exported member 'Cookies'` | Task 10 usou `App.Cookies` em vez do tipo do `@sveltejs/kit` |
| R2 | `src/lib/infrastructure/http/HttpChildRepository.ts:42` | `findAll(userId)` incompatível com interface `findAll()` | Task 14 mudou a impl mas não a interface |
| R3 | `src/lib/infrastructure/http/HttpNotificationRepository.ts:16` | idem | idem |
| R4 | `src/lib/infrastructure/sse/SseNotificationRepository.ts:16` | idem (delega para o Http) | idem |
| R5 | `src/routes/child/+page.svelte:66` | `findAll()` chamado com 0 args | caller não atualizado |
| R6 | `src/routes/notifications/+page.svelte:22` | `findAll()` chamado com 0 args | caller não atualizado |

R2/R3/R4 são a **mesma causa** (contrato `findAll` desatualizado) e são corrigidos juntos com R5/R6 na Task 2.

### Pré-existentes (fora de escopo — 16)

Confirmado via `git show 1b7f7b7:...` que já existiam antes do trabalho de auth; nenhum desses arquivos foi tocado pelos commits de auth:

- `src/lib/mocks/data.ts:10` — `mockSession` sem `type`/`isSeller`
- `src/lib/application/auth/LoginWithGoogle.test.ts:7,15,29` — mock `IAuthRepository` sem `updateProfile` + `Session` incompleto
- `src/lib/application/auth/Logout.test.ts:7` — mock sem `updateProfile`
- `src/routes/+layout.svelte:20` — `writable(undefined)` recebe `Session | null`
- `src/routes/catalog/+page.svelte:204` — `Size` não aceita `'featured'`
- `src/routes/catalog/[id]/+page.svelte:60` — `MockSeller.listingsCount` inexistente
- `src/routes/chat/+page.svelte:42,204,238` — `Child.userId` faltando no mock, `component.items` possível `undefined`, `SizeEntry.status`
- `src/routes/child/+page.svelte:61` — `Child.userId` faltando no mock (distinto do R5, que é o arg count na linha 66)
- `src/routes/child/[id]/+page.svelte:30` — `Child.userId` faltando no mock
- `packages/design-system/.../Input.svelte:34` — `$state` usado antes da declaração

> Estes serão tratados num plano de cleanup separado. **Não corrigir aqui.**

---

### Task 1: Corrigir tipo de `Cookies` na login server action (R1)

**Files:**
- Modify: `apps/web/src/routes/login/+page.server.ts:24`

**Interfaces:**
- Consumes: `import('@sveltejs/kit').Cookies`

- [ ] **Step 1: Ver o erro atual**

Run: `cd apps/web && yarn check 2>&1 | grep "page.server.ts"`
Expected: `"Namespace 'App' has no exported member 'Cookies'."`

- [ ] **Step 2: Importar o tipo correto**

No topo de `apps/web/src/routes/login/+page.server.ts`, adicionar ao bloco de imports:

```ts
import type { Cookies } from '@sveltejs/kit';
```

- [ ] **Step 3: Trocar a anotação de tipo**

Na assinatura de `setAuthCookies`, trocar `App.Cookies` por `Cookies`:

```ts
function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
```

- [ ] **Step 4: Verificar que o erro sumiu**

Run: `cd apps/web && yarn check 2>&1 | grep "page.server.ts" || echo "OK - no page.server.ts errors"`
Expected: `OK - no page.server.ts errors`

- [ ] **Step 5: Rodar os testes da action (não devem quebrar)**

Run: `cd apps/web && yarn vitest run src/routes/login/page.server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/login/+page.server.ts
git commit -m "fix(web): use @sveltejs/kit Cookies type in login server action"
```

---

### Task 2: Alinhar `findAll(userId)` no contrato e nos callers (R2-R6)

**Files:**
- Modify: `apps/web/src/lib/domain/child/repositories/IChildRepository.ts:21`
- Modify: `apps/web/src/lib/domain/notification/repositories/INotificationRepository.ts:4`
- Modify: `apps/web/src/routes/child/+page.svelte` (bloco `<script>`, chamada de `findAll`)
- Modify: `apps/web/src/routes/notifications/+page.svelte` (bloco `<script>`, chamada de `findAll`)

**Interfaces:**
- Produces: `IChildRepository.findAll(userId: string): Promise<Child[]>` e `INotificationRepository.findAll(userId: string): Promise<Notification[]>`
- As implementações (`HttpChildRepository`, `HttpNotificationRepository`, `SseNotificationRepository`) **já** têm a assinatura `findAll(userId)`. Só o contrato e os callers estão desatualizados.
- Os callers obtêm `userId` do `session` store publicado no layout via `setContext('session', ...)`.

- [ ] **Step 1: Ver os erros atuais**

Run: `cd apps/web && yarn check 2>&1 | grep -E "findAll|Expected 1 arguments"`
Expected: erros em `HttpChildRepository.ts:42`, `HttpNotificationRepository.ts:16`, `SseNotificationRepository.ts:16`, `child/+page.svelte:66`, `notifications/+page.svelte:22`.

- [ ] **Step 2: Atualizar `IChildRepository.findAll`**

Em `apps/web/src/lib/domain/child/repositories/IChildRepository.ts`, trocar a linha da interface:

```ts
  findAll(userId: string): Promise<Child[]>;
```

- [ ] **Step 3: Atualizar `INotificationRepository.findAll`**

Em `apps/web/src/lib/domain/notification/repositories/INotificationRepository.ts`, trocar:

```ts
  findAll(userId: string): Promise<Notification[]>;
```

- [ ] **Step 4: Verificar que os erros de contrato sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep -E "HttpChildRepository|HttpNotificationRepository|SseNotificationRepository" || echo "OK - repos alinhados"`
Expected: `OK - repos alinhados` (as três impls agora batem com o contrato).

- [ ] **Step 5: Atualizar o caller em `child/+page.svelte`**

No bloco `<script>` de `apps/web/src/routes/child/+page.svelte`:

1. Importar `getContext` e o tipo `Writable`/`Session`. Adicionar aos imports:

```ts
  import { getContext } from 'svelte'
  import type { Writable } from 'svelte/store'
  import type { Session } from '$lib/domain/auth/entities/Session'
```

2. Logo após `const childRepo = new HttpChildRepository()`, adicionar:

```ts
  const session = getContext<Writable<Session | undefined>>('session')
```

3. Trocar a chamada `await childRepo.findAll()` (linha ~66) por:

```ts
        const userId = get(session)?.userId
        if (!userId) throw new Error('Not authenticated')
        const loadedChildren = await childRepo.findAll(userId)
```

> **Nota:** `child/+page.svelte` já importa `get` de `$lib/i18n` — isso é o `get` de tradução, **não** o `get` de store. Use `import { get as getStore } from 'svelte/store'` e chame `getStore(session)?.userId` para não colidir. Ajuste as três linhas acima para `getStore`.

Versão final correta do trecho (usando `getStore` para evitar colisão com o `get` do i18n):

```ts
  import { getContext } from 'svelte'
  import { get as getStore } from 'svelte/store'
  import type { Writable } from 'svelte/store'
  import type { Session } from '$lib/domain/auth/entities/Session'
```

```ts
  const session = getContext<Writable<Session | undefined>>('session')
```

```ts
        const userId = getStore(session)?.userId
        if (!userId) throw new Error('Not authenticated')
        const loadedChildren = await childRepo.findAll(userId)
```

- [ ] **Step 6: Atualizar o caller em `notifications/+page.svelte`**

No bloco `<script>` de `apps/web/src/routes/notifications/+page.svelte`:

1. Adicionar imports:

```ts
  import { getContext } from 'svelte'
  import { get as getStore } from 'svelte/store'
  import type { Writable } from 'svelte/store'
  import type { Session } from '$lib/domain/auth/entities/Session'
```

2. Após `const notifRepo = new HttpNotificationRepository()`, adicionar:

```ts
  const session = getContext<Writable<Session | undefined>>('session')
```

3. Trocar `notifications = await notifRepo.findAll()` (linha ~22) por:

```ts
        const userId = getStore(session)?.userId
        if (!userId) throw new Error('Not authenticated')
        notifications = await notifRepo.findAll(userId)
```

- [ ] **Step 7: Verificar que os erros de arg-count sumiram**

Run: `cd apps/web && yarn check 2>&1 | grep -E "child/\+page.svelte:66|notifications/\+page.svelte:22|Expected 1 arguments" || echo "OK - callers atualizados"`
Expected: `OK - callers atualizados`.

- [ ] **Step 8: Rodar a suíte web completa**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests) — nenhuma regressão.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/lib/domain/child/repositories/IChildRepository.ts \
        apps/web/src/lib/domain/notification/repositories/INotificationRepository.ts \
        apps/web/src/routes/child/+page.svelte \
        apps/web/src/routes/notifications/+page.svelte
git commit -m "fix(web): pass userId to findAll and align repository contracts"
```

---

## Verificação Final

- [ ] **Confirmar que os 6 erros de auth foram resolvidos**

Run:
```bash
cd apps/web && yarn check 2>&1 | grep -E "page.server.ts|findAll|Expected 1 arguments|HttpChildRepository|HttpNotificationRepository|SseNotificationRepository" || echo "OK - zero erros de auth"
```
Expected: `OK - zero erros de auth`

- [ ] **Confirmar que só restam os 16 pré-existentes**

Run: `cd apps/web && yarn check 2>&1 | grep -c "ERROR"`
Expected: `16` (os pré-existentes de mocks/design-system, tratados em plano separado).

- [ ] **Suítes de teste continuam verdes**

Run: `cd apps/web && yarn vitest run`
Expected: PASS (61 tests)

Run: `docker compose exec -e MIX_ENV=test api mix test`
Expected: PASS (198 tests)

---

## Fora de Escopo — Cleanup Pré-Existente (plano futuro)

Os 16 erros abaixo **não** são regressões de auth e devem entrar num plano `docs/superpowers/plans/YYYY-MM-DD-typecheck-cleanup.md` separado:

1. `mocks/data.ts` — completar `mockSession` com `type: 'pf'` e `isSeller: boolean`; completar `mockChildren` com `userId`.
2. `LoginWithGoogle.test.ts` / `Logout.test.ts` — adicionar `updateProfile` ao mock de `IAuthRepository` e `type`/`isSeller` ao `Session` mockado.
3. `+layout.svelte:20` — tipar o store como `writable<Session | null>(null)` em vez de `writable(undefined)`.
4. `catalog/+page.svelte:204` — `Size` não aceita `'featured'`; ajustar o tipo ou o valor.
5. `catalog/[id]/+page.svelte:60` — `MockSeller` sem `listingsCount`.
6. `chat/+page.svelte` — `Child.userId`, `component.items` possivelmente `undefined`, `SizeEntry.status`.
7. `child/[id]/+page.svelte:30` — `Child.userId` no mock.
8. `packages/design-system/.../Input.svelte:34` — `$state` usado antes da declaração.
