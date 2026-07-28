import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toastActionResult } from './toastActionResult'

vi.mock('$lib/i18n', () => ({
  t: { subscribe: vi.fn() },
}))
vi.mock('svelte/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('svelte/store')>()
  return {
    ...actual,
    get: vi.fn(() => (key: string) => key),
  }
})

vi.mock('$lib/stores/toast', () => ({
  toast: { error: vi.fn() },
}))

import { toast } from '$lib/stores/toast'
const mockError = vi.mocked(toast.error)

describe('toastActionResult', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows toast on result type error', () => {
    toastActionResult({ type: 'error', status: 500, error: new Error('boom') })
    expect(mockError).toHaveBeenCalledWith('errors.generic')
  })

  it('shows toast on failure with status >= 500', () => {
    toastActionResult({ type: 'failure', status: 500, data: { error: 'internal' } })
    expect(mockError).toHaveBeenCalledWith('errors.generic')
  })

  it('does NOT show toast on validation failure', () => {
    toastActionResult({ type: 'failure', status: 422, data: { error: 'validation_failed' } })
    expect(mockError).not.toHaveBeenCalled()
  })

  it('does NOT show toast on invalid_fields failure', () => {
    toastActionResult({ type: 'failure', status: 422, data: { error: 'invalid_fields' } })
    expect(mockError).not.toHaveBeenCalled()
  })

  it('does NOT show toast on 4xx failure (non-validation)', () => {
    toastActionResult({ type: 'failure', status: 400, data: { error: 'bad_request' } })
    expect(mockError).not.toHaveBeenCalled()
  })

  it('does NOT show toast when silent', () => {
    toastActionResult({ type: 'error', status: 500, error: new Error('boom') }, { silent: true })
    expect(mockError).not.toHaveBeenCalled()
  })

  it('does NOT show toast on success', () => {
    toastActionResult({ type: 'success', status: 200, data: {} })
    expect(mockError).not.toHaveBeenCalled()
  })

  it('does NOT show toast on redirect', () => {
    toastActionResult({ type: 'redirect', status: 303, location: '/login' })
    expect(mockError).not.toHaveBeenCalled()
  })
})
