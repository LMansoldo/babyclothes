import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const tokensDir = resolve(import.meta.dirname)

function extractTokens(css: string): Set<string> {
  const tokens = new Set<string>()
  const regex = /--([\w-]+)\s*:/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(css)) !== null) {
    tokens.add(match[1])
  }
  return tokens
}

function extractScopedTokens(css: string, scope: string): Set<string> {
  const scopeRegex = new RegExp(
    `${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`,
    'g'
  )
  const tokens = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = scopeRegex.exec(css)) !== null) {
    const block = match[1]
    const tokenRegex = /--([\w-]+)\s*:/g
    let tokenMatch: RegExpExecArray | null
    while ((tokenMatch = tokenRegex.exec(block)) !== null) {
      tokens.add(tokenMatch[1])
    }
  }
  return tokens
}

describe('token architecture', () => {
  const primitives = readFileSync(resolve(tokensDir, 'primitives.css'), 'utf-8')
  const semantic = readFileSync(resolve(tokensDir, 'semantic.css'), 'utf-8')
  const themes = readFileSync(resolve(tokensDir, 'themes.css'), 'utf-8')

  it('primitives.css contains all tokens from the original tokens.css snapshot', () => {
    const expectedTokens = [
      'color-bg', 'color-bg-2', 'color-bg-3', 'color-white', 'color-black',
      'color-black-2', 'color-black-3', 'color-pink', 'color-pink-light',
      'color-pink-soft', 'color-pk-soft', 'color-pk-mid', 'color-pk-purple',
      'color-gray', 'color-gray-2', 'color-success', 'color-error',
      'color-warning', 'color-info', 'color-glass', 'color-glass-hi',
      'font-cormorant', 'font-lato',
      'space-1', 'space-2', 'space-3', 'space-4', 'space-5', 'space-6',
      'space-7', 'space-8', 'space-9', 'space-10', 'space-11', 'space-12',
      'space-13', 'space-14', 'space-15', 'space-16',
      'radius-sm', 'radius-md', 'radius-lg', 'radius-xl', 'radius-pill',
      'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-pk',
      'transition-fast', 'transition-base',
      'bk', 'wh', 'of', 'of2', 'of3', 'pk', 'pk2', 'pk3', 'gr', 'gr2',
      'color-purple', 'ld', 'sr', 'vd', 'font-ui', 'font-body',
      'r', 'r-sm', 'r-xs',
      'glass', 'glass-hi', 'glass-brd', 'glass-line', 'glass-blur', 'glass-shadow'
    ]
    const tokens = extractTokens(primitives)
    for (const name of expectedTokens) {
      expect(tokens.has(name), `primitives.css missing --${name}`).toBe(true)
    }
  })

  it('every semantic token in :root has a dark counterpart', () => {
    const rootTokens = extractScopedTokens(semantic, ':root')
    const darkTokens = extractScopedTokens(themes, '[data-theme="dark"]')

    for (const token of rootTokens) {
      expect(
        darkTokens.has(token),
        `semantic --${token} is in :root but missing in [data-theme="dark"]`
      ).toBe(true)
    }
  })

  it('every dark token has a light counterpart (no orphan dark tokens)', () => {
    const rootTokens = extractScopedTokens(semantic, ':root')
    const darkTokens = extractScopedTokens(themes, '[data-theme="dark"]')

    for (const token of darkTokens) {
      expect(
        rootTokens.has(token),
        `dark --${token} is in [data-theme="dark"] but missing in :root`
      ).toBe(true)
    }
  })
})
