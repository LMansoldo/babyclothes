## WP5 — Rota /onboarding

**Arquivos novos**: `apps/web/src/routes/onboarding/+page.svelte` e `+page.server.ts`.

`+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit'
import { flags, HOME_ROUTE } from '$lib/feature-flags'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login')
  if (!flags.agentOnboarding) throw redirect(303, HOME_ROUTE)
  return {}
}
```

`+page.svelte`: página bare (sem shell — WP2.2 item 2). Fundo `linear-gradient(160deg,#0F0F0F 0%,#1A0814 60%,#0A0A1A 100%)`, min-height 100vh, conteúdo centrado max-width 40rem. Topo: link "Pular" (`.72rem 700; rgba(255,255,255,.4)`) → `finish()`. Corpo: `<OnboardingHero>` com chaves i18n. Rodapé: `Button variant="pk" size="lg"` full-width `onboarding.cta` + `ArrowRight` → `finish()`.

```ts
const KEY = 'bc_onboarded'
function finish() {
  try { localStorage.setItem(KEY, '1') } catch {}
  goto('/agent')
}
```

Guard client-side no `onMount`/`$effect`: se `localStorage.getItem(KEY) === '1'` → `goto('/agent')` (replaceState).

**DoD**: registro em modo agent cai no onboarding uma única vez; "Pular" e CTA levam a `/agent`; recarregar `/onboarding` depois de visto redireciona.
