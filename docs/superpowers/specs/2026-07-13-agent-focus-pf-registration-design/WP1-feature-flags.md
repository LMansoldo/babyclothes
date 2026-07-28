## WP1 — Feature flags

### 1.1 Editar `apps/web/src/lib/env.ts` — acrescentar ao final:

```ts
export const PUBLIC_APP_MODE = get('PUBLIC_APP_MODE', 'full')
```

### 1.2 Arquivo novo `apps/web/src/lib/feature-flags.ts` (código completo):

```ts
import { PUBLIC_APP_MODE } from '$lib/env'

export type AppMode = 'full' | 'agent'

export interface FeatureFlags {
  /** Catálogo, detalhe de item, venda, ProductTray, busca no TopBar */
  marketplace: boolean
  /** Registro PJ (CNPJ). false = somente PF */
  pjRegistration: boolean
  /** BottomNav com abas de marketplace */
  marketplaceNav: boolean
  /** Tela /onboarding antes do primeiro acesso ao agente */
  agentOnboarding: boolean
  /** Formulário de login por e-mail/senha na tela /login (WP11) */
  emailLogin: boolean
}

export function parseAppMode(raw: string): AppMode {
  return raw === 'agent' ? 'agent' : 'full'
}

export function deriveFlags(mode: AppMode): FeatureFlags {
  const isAgent = mode === 'agent'
  return {
    marketplace: !isAgent,
    pjRegistration: !isAgent,
    marketplaceNav: !isAgent,
    agentOnboarding: isAgent,
    emailLogin: isAgent,
  }
}

export const appMode: AppMode = parseAppMode(PUBLIC_APP_MODE)
export const flags: FeatureFlags = deriveFlags(appMode)

/** Prefixos de rota bloqueados quando marketplace=false */
export const MARKETPLACE_ROUTES = ['/catalog', '/sell'] as const

/** Home autenticada conforme o modo */
export const HOME_ROUTE: string = flags.marketplace ? '/catalog' : '/agent'
```

### 1.3 Arquivo novo `apps/web/src/lib/feature-flags.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { deriveFlags, parseAppMode } from './feature-flags'

describe('parseAppMode', () => {
  it('retorna agent apenas para "agent"', () => {
    expect(parseAppMode('agent')).toBe('agent')
    expect(parseAppMode('full')).toBe('full')
    expect(parseAppMode('')).toBe('full')
    expect(parseAppMode('banana')).toBe('full')
  })
})

describe('deriveFlags', () => {
  it('modo full liga tudo de marketplace', () => {
    expect(deriveFlags('full')).toEqual({
      marketplace: true,
      pjRegistration: true,
      marketplaceNav: true,
      agentOnboarding: false,
      emailLogin: false,
    })
  })
  it('modo agent desliga marketplace e PJ', () => {
    expect(deriveFlags('agent')).toEqual({
      marketplace: false,
      pjRegistration: false,
      marketplaceNav: false,
      agentOnboarding: true,
      emailLogin: true,
    })
  })
})
```

**DoD**: testes acima passam; nenhum outro arquivo importa `PUBLIC_APP_MODE` diretamente (grep).
