## WP2 — Guards de rota e shell

### 2.1 Editar `apps/web/src/hooks.server.ts`

No `handle`, **após** resolver a sessão e **antes** de `resolve(event)`, inserir:

```ts
import { redirect } from '@sveltejs/kit'
import { flags, MARKETPLACE_ROUTES, HOME_ROUTE } from '$lib/feature-flags'

// dentro do handle:
const { pathname } = event.url
if (!flags.marketplace && MARKETPLACE_ROUTES.some((r) => pathname.startsWith(r))) {
  throw redirect(303, HOME_ROUTE)
}
```

Atualizar `hooks.server.test.ts`: caso novo — com `flags.marketplace=false` (mock do módulo `$lib/feature-flags` via `vi.mock`), GET `/catalog` → 303 para `/agent`; com `true`, passa.

### 2.2 Trocar redirects hardcoded `'/catalog'`

Arquivos: `routes/login/+page.server.ts`, `routes/register/+page.server.ts`. Toda ocorrência `redirect(303, '/catalog')` vira `redirect(303, HOME_ROUTE)` com import de `$lib/feature-flags`. **Exceção**: no `register/+page.server.ts`, o redirect de sucesso do modo agent vai para `/onboarding` (ver WP3.6).

### 2.3 Editar `apps/web/src/routes/+layout.svelte`

Mudanças exatas:

1. Import: `import { flags } from '$lib/feature-flags'` e `import AgentTopBar from '$lib/presentation/shell/AgentTopBar.svelte'` (wrapper criado no WP4.5; até lá usar o pattern do DS direto).
2. Rotas sem shell: hoje só `/login`. Passa a: `const bareRoutes = ['/login', '/register', '/onboarding']` — `const isBareRoute = $derived(bareRoutes.some((r) => $page.url.pathname.startsWith(r)))`; o `{#if isLoginRoute}` vira `{#if isBareRoute}`.
3. TopBar:

```svelte
{#if flags.marketplace}
  <TopBar variant={topbarVariant} ... />   <!-- bloco atual, intacto -->
{:else}
  <AgentTopBar
    agentName={$t('agent.topbar.name')}
    status="online"
    unreadCount={$unreadCount}
    userInitials={initials(data.session?.name ?? '')}
    onNotifications={() => goto('/notifications')}
    onProfile={() => goto('/profile')}
  />
{/if}
```

Helper local no script: `function initials(name: string): string { return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') }`.

4. BottomNav: envolver em `{#if flags.marketplaceNav} ... {/if}`. O padding-bottom mobile de `.app-main` (6.4rem) só se aplica com nav — adicionar classe condicional `class:app-main--with-nav={flags.marketplaceNav}` e mover a media query para essa classe.
5. Footer: `{#if flags.marketplace && !isChatRoute}` (modo agent não mostra footer no shell; footer continua nas páginas bare via suas próprias telas se preciso).
6. `isChatRoute` passa a cobrir `/agent`: `$page.url.pathname.startsWith('/chat') || $page.url.pathname.startsWith('/agent')`.

**DoD**: modo full = pixel-idêntico ao atual (nenhum snapshot muda); modo agent = sem BottomNav, sem busca/Publicar, AgentTopBar em todas as rotas autenticadas.
