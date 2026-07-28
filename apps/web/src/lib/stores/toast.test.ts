import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { get } from 'svelte/store'
import { toast } from './toast'

describe('toast store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    toast.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('error() adds 1 item with correct type/message/duration', () => {
    toast.error('Something broke')
    const items = get(toast)
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('error')
    expect(items[0].message).toBe('Something broke')
    expect(items[0].duration).toBe(6000)
  })

  it('auto-dismiss removes after duration', () => {
    toast.error('Boom')
    expect(get(toast)).toHaveLength(1)
    vi.advanceTimersByTime(6000)
    expect(get(toast)).toHaveLength(0)
  })

  it('duration: 0 does not expire', () => {
    toast.show({ type: 'info', message: 'Sticky', duration: 0 })
    expect(get(toast)).toHaveLength(1)
    vi.advanceTimersByTime(99999)
    expect(get(toast)).toHaveLength(1)
  })

  it('MAX_VISIBLE: 4th toast removes the oldest', () => {
    toast.error('1')
    toast.error('2')
    toast.error('3')
    expect(get(toast)).toHaveLength(3)
    toast.error('4')
    const items = get(toast)
    expect(items).toHaveLength(3)
    expect(items[0].message).toBe('2')
    expect(items[2].message).toBe('4')
  })

  it('dedupe: same type+message restarts timer instead of adding', () => {
    toast.error('Dup')
    toast.error('Dup')
    expect(get(toast)).toHaveLength(1)
    // Timer was restarted — advance 5s (not yet expired)
    vi.advanceTimersByTime(5000)
    expect(get(toast)).toHaveLength(1)
    // Original would have expired at 6s, but restart means 6s from second call
    vi.advanceTimersByTime(1000)
    expect(get(toast)).toHaveLength(0)
  })

  it('dismiss(id) removes and cancels timeout', () => {
    const id = toast.error('Bye')
    expect(get(toast)).toHaveLength(1)
    toast.dismiss(id)
    expect(get(toast)).toHaveLength(0)
    vi.advanceTimersByTime(99999)
    expect(get(toast)).toHaveLength(0)
  })

  it('clear() empties all', () => {
    toast.error('1')
    toast.success('2')
    toast.clear()
    expect(get(toast)).toHaveLength(0)
  })

  it('success/info/warning have correct defaults', () => {
    toast.success('S')
    toast.info('I')
    toast.warning('W')
    const items = get(toast)
    expect(items[0].duration).toBe(3000)
    expect(items[1].duration).toBe(3000)
    expect(items[2].duration).toBe(6000)
  })
})
