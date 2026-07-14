import { PUBLIC_APP_MODE } from '$lib/env'

export type AppMode = 'full' | 'agent'

export interface FeatureFlags {
  marketplace: boolean
  pjRegistration: boolean
  marketplaceNav: boolean
  agentOnboarding: boolean
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

export const MARKETPLACE_ROUTES = ['/catalog', '/sell'] as const
export const HOME_ROUTE: string = flags.marketplace ? '/catalog' : '/agent'