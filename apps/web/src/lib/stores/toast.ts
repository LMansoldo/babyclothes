import { writable } from 'svelte/store'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'pk'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
  duration: number
}

export interface ToastOptions {
  title?: string
  duration?: number
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  error: 6000,
  warning: 6000,
  success: 3000,
  info: 3000,
  pk: 3000,
}

const MAX_VISIBLE = 3

function createToastStore() {
  const { subscribe, update } = writable<ToastItem[]>([])
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

  function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  function dismiss(id: string): void {
    const timeout = timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.delete(id)
    }
    update((items) => items.filter((item) => item.id !== id))
  }

  function scheduleAutoDismiss(item: ToastItem): void {
    if (item.duration <= 0) return
    const timeout = setTimeout(() => dismiss(item.id), item.duration)
    timeouts.set(item.id, timeout)
  }

  function show(raw: Omit<ToastItem, 'id'>): string {
    let itemId = ''

    update((items) => {
      // Dedupe: same type + message → restart timer
      const existing = items.find((i) => i.type === raw.type && i.message === raw.message)
      if (existing) {
        const timeout = timeouts.get(existing.id)
        if (timeout) clearTimeout(timeout)
        scheduleAutoDismiss(existing)
        itemId = existing.id
        return items
      }

      const item: ToastItem = {
        ...raw,
        id: generateId(),
        duration: raw.duration ?? DEFAULT_DURATIONS[raw.type],
      }
      itemId = item.id

      const next = [...items, item]
      // FIFO: remove oldest if exceeding MAX_VISIBLE
      const trimmed = next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next

      scheduleAutoDismiss(item)
      return trimmed
    })

    return itemId
  }

  function error(message: string, opts?: ToastOptions): string {
    return show({ type: 'error', message, title: opts?.title, duration: opts?.duration ?? DEFAULT_DURATIONS.error })
  }

  function success(message: string, opts?: ToastOptions): string {
    return show({ type: 'success', message, title: opts?.title, duration: opts?.duration ?? DEFAULT_DURATIONS.success })
  }

  function info(message: string, opts?: ToastOptions): string {
    return show({ type: 'info', message, title: opts?.title, duration: opts?.duration ?? DEFAULT_DURATIONS.info })
  }

  function warning(message: string, opts?: ToastOptions): string {
    return show({ type: 'warning', message, title: opts?.title, duration: opts?.duration ?? DEFAULT_DURATIONS.warning })
  }

  function clear(): void {
    for (const timeout of timeouts.values()) {
      clearTimeout(timeout)
    }
    timeouts.clear()
    update(() => [])
  }

  return {
    subscribe,
    show,
    error,
    success,
    info,
    warning,
    dismiss,
    clear,
  }
}

export const toast = createToastStore()
