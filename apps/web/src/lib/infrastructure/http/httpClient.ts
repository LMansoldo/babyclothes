import { browser } from '$app/environment'
import { get } from 'svelte/store'
import { t } from '$lib/i18n'
import { toast } from '$lib/stores/toast'

export type ErrorCategory = 'network' | 'server' | 'client'

export class HttpError extends Error {
  readonly status: number
  readonly category: ErrorCategory
  readonly code?: string
  readonly body?: unknown

  constructor(params: { status: number; category: ErrorCategory; code?: string; body?: unknown; message: string }) {
    super(params.message)
    this.name = 'HttpError'
    this.status = params.status
    this.category = params.category
    this.code = params.code
    this.body = params.body
  }
}

export interface HttpOptions extends RequestInit {
  silent?: boolean
  silentStatuses?: number[]
}

function messageKeyFor(category: ErrorCategory, isTimeout: boolean): string {
  if (isTimeout) return 'errors.timeout'
  if (category === 'network') return 'errors.network'
  if (category === 'server') return 'errors.server'
  return 'errors.generic'
}

export async function httpRequest<T>(path: string, options?: HttpOptions): Promise<T> {
  const { silent, silentStatuses, ...init } = options ?? {}
  const input = path.startsWith('http') ? path : `/api${path}`

  try {
    const res = await fetch(input, init)

    if (res.ok) {
      if (res.status === 204) return undefined as T
      return (await res.json()) as T
    }

    const category: ErrorCategory = res.status >= 500 ? 'server' : 'client'
    let body: unknown = undefined
    let code: string | undefined

    try {
      body = await res.json()
      if (body && typeof body === 'object' && 'error' in body) {
        code = (body as { error: string }).error
      }
    } catch {
      // body not JSON
    }

    const httpError = new HttpError({
      status: res.status,
      category,
      code,
      body,
      message: `HTTP ${res.status}: ${res.statusText}`,
    })

    if (browser && !silent && !silentStatuses?.includes(res.status)) {
      const translate = get(t)
      toast.error(translate(messageKeyFor(category, false)))
    }

    throw httpError
  } catch (error) {
    if (error instanceof HttpError) throw error

    // Network error or timeout
    const isTimeout = error instanceof DOMException && error.name === 'AbortError'
    const httpError = new HttpError({
      status: 0,
      category: 'network',
      message: isTimeout ? 'Request timeout' : 'Network error',
    })

    if (browser && !silent) {
      const translate = get(t)
      toast.error(translate(messageKeyFor('network', isTimeout)))
    }

    throw httpError
  }
}

export const httpClient = {
  async get<T>(path: string, opts?: HttpOptions): Promise<T> {
    return httpRequest<T>(path, { ...opts, method: 'GET' })
  },

  async post<T>(path: string, body?: unknown, opts?: HttpOptions): Promise<T> {
    return httpRequest<T>(path, {
      ...opts,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  async put<T>(path: string, body?: unknown, opts?: HttpOptions): Promise<T> {
    return httpRequest<T>(path, {
      ...opts,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  async del<T>(path: string, opts?: HttpOptions): Promise<T> {
    return httpRequest<T>(path, { ...opts, method: 'DELETE' })
  },

  async patch<T>(path: string, body?: unknown, opts?: HttpOptions): Promise<T> {
    return httpRequest<T>(path, {
      ...opts,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
      body: body ? JSON.stringify(body) : undefined,
    })
  },
}
