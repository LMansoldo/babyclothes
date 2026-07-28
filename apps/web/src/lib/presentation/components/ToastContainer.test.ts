import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from '$lib/stores/toast'

vi.mock('$lib/stores/toast', () => ({
  toast: {
    subscribe: vi.fn((fn: (items: unknown[]) => void) => {
      fn([])
      return () => {}
    }),
    dismiss: vi.fn(),
  },
}))

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports toast store for container use', () => {
    expect(toast.subscribe).toBeDefined()
    expect(toast.dismiss).toBeDefined()
  })

  it('subscribe receives items array', () => {
    const callback = vi.fn()
    toast.subscribe(callback)
    expect(callback).toHaveBeenCalledWith([])
  })
})
