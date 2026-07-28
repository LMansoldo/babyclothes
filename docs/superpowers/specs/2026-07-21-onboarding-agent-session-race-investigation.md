# Investigação — sessão não populada em `/agent` após navegação client-side do `/onboarding`

> Data: 2026-07-21 · Tipo: **systematic-debugging** (investigar root cause ANTES de corrigir). App: `apps/web`.

## 1. Sintoma relatado

Um subagente observou que **`$page.data.session` não estava populado imediatamente** após um `goto('/agent')` client-side vindo do `/onboarding` — precisou de um `page.reload()` no harness de teste para contornar. Isso é o **caminho real do usuário**: no `/onboarding`, o CTA "Conversar com o agente" (`finish()` → `goto('/agent')`, `apps/web/src/routes/onboarding/+page.svelte:20`) é uma navegação client-side.

Se for um bug real, o impacto é sério: `apps/web/src/routes/agent/+page.svelte` no `onMount` faz:
```ts
const userId = session?.userId;      // session = $derived($page.data.session)
if (!userId) throw new Error('Not authenticated');
const loadedChildren = await childRepo.findAll(userId);
```
→ com `session` indefinida, lança "Not authenticated", **não carrega os filhos**, e o cadastro de filho falha (`userId` indefinido → toast `save_error`).

## 2. Fluxo de dados (para instrumentar)

```
hooks.server.ts  → valida cookie → event.locals.session
  → routes/+layout.server.ts  load() → { session: locals.session ?? null }
    → $page.data.session
      → routes/agent/+page.svelte:  session = $derived($page.data.session);  onMount usa session?.userId
```
Navegação: `/onboarding` (finish) → `goto('/agent')` (client-side).

## 3. Tarefa (Phase 1 primeiro — não corrigir sem root cause)

1. **Reproduzir o caminho real** (não usar `page.goto` full-load): registrar usuário → cair no `/onboarding` → clicar o CTA real ("Conversar com o agente"/"Chat with the agent") → `/agent`. Instrumentar (log de `$page.data.session` e `session?.userId` no início do `onMount`, e no `finally`) para **confirmar** se a sessão está ausente no mount e quando (se) ela aparece.
2. **Confirmar se é bug real ou artefato de teste.** Comparar com o caminho full-load (`goto('/agent')` direto = navegação de servidor), que sabidamente funciona. Se só o caminho client-side falha → bug real.
3. **Root cause** — hipóteses a checar (uma de cada vez):
   - O `+layout.server.ts` load **re-roda** na navegação client-side? (loads de servidor normalmente re-rodam ao navegar; confirmar que `session` volta populada.)
   - Ordenação **load × onMount**: em SvelteKit, os `load` resolvem antes do componente montar; então `$page.data.session` deveria estar presente no `onMount`. Verificar se o `onMount` (one-shot) está lendo um `$page` ainda não atualizado.
   - O agente carrega dados em **`onMount`** (imperativo, one-shot) em vez de num **`load`** ou num `$effect` reativo à `session` — se a `session` chegar/mudar depois do mount, o `onMount` não re-roda.
4. **Fix no root cause** (provável, a confirmar): mover o carregamento dependente de sessão para um **`load`** (`+page.ts`/`+page.server.ts`) ou para um **`$effect`** que reaja a `session` (re-executa quando `$page.data.session` chega), em vez do `onMount` one-shot. Escolher a menor mudança que elimine a corrida, sem quebrar o caminho full-load.

## 4. Verificação (evidência)

- Reproduzir o CTA real `/onboarding → /agent` **sem** `page.reload()` e confirmar: `session` presente, filhos carregam, e o **cadastro de filho funciona** (POST `/api/children` 201) por esse caminho.
- Regressão: caminho full-load (`/agent` direto) continua funcionando.
- Testes/`check` verdes.
- Chromium: `/Users/lucasmansoldo/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell`; app `http://127.0.0.1:5173`.

## 5. Se a investigação concluir "não é bug real"

Documentar (o que foi instrumentado, por que o teste precisou de `reload`), e **não** mudar código de produção. 95% dos "sem root cause" são investigação incompleta — só encerrar assim com evidência clara.

## 6. Regras / limites
- Não mexer em `apps/api` nem na lógica de steps do `IntakeMachine`.
- Svelte 5 runes; se mexer em load, seguir os padrões SvelteKit já usados no projeto.
- Validar `.svelte` alterado com Svelte MCP se disponível.
