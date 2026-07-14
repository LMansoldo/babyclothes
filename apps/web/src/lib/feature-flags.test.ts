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