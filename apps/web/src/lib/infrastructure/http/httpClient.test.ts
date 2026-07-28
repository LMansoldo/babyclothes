import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { httpRequest, httpClient, HttpError } from './httpClient'

vi.mock('$app/environment', () => ({ browser: true }))
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

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { toast } from '$lib/stores/toast'
const mockToastError = vi.mocked(toast.error)

describe('httpClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('httpRequest', () => {
    it('returns typed body on 2xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Test' }),
      })
      const result = await httpRequest<{ id: number; name: string }>('/items')
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('returns undefined on 204', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })
      const result = await httpRequest<void>('/items/1')
      expect(result).toBeUndefined()
    })

    it('throws HttpError with server category on 500', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'internal' }),
      })
      try {
        await httpRequest('/items')
        expect.fail('Should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError)
        const err = e as HttpError
        expect(err.status).toBe(500)
        expect(err.category).toBe('server')
        expect(err.code).toBe('internal')
      }
    })

    it('throws HttpError with client category on 400', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ error: 'bad_request' }),
      })
      try {
        await httpRequest('/items')
        expect.fail('Should have thrown')
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError)
        const err = e as HttpError
        expect(err.status).toBe(400)
        expect(err.category).toBe('client')
      }
    })

    it('calls toast.error on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      })
      await httpRequest('/items').catch(() => {})
      expect(mockToastError).toHaveBeenCalledWith('errors.server')
    })

    it('calls toast.error on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({}),
      })
      await httpRequest('/items').catch(() => {})
      expect(mockToastError).toHaveBeenCalledWith('errors.generic')
    })

    it('does NOT call toast when silent: true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      })
      await httpRequest('/items', { silent: true }).catch(() => {})
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('does NOT call toast for silentStatuses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({}),
      })
      await httpRequest('/items', { silentStatuses: [422] }).catch(() => {})
      expect(mockToastError).not.toHaveBeenCalled()
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      try {
        await httpRequest('/items')
      } catch (e) {
        const err = e as HttpError
        expect(err.status).toBe(0)
        expect(err.category).toBe('network')
      }
      expect(mockToastError).toHaveBeenCalledWith('errors.network')
    })

    it('extracts code from body.error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable',
        json: () => Promise.resolve({ error: 'email_taken' }),
      })
      try {
        await httpRequest('/items')
      } catch (e) {
        const err = e as HttpError
        expect(err.code).toBe('email_taken')
      }
    })

    it('prefixes path with /api', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
      await httpRequest('/items')
      expect(mockFetch).toHaveBeenCalledWith('/api/items', expect.anything())
    })

    it('does not prefix absolute URLs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
      await httpRequest('https://example.com/data')
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/data', expect.anything())
    })
  })

  describe('httpClient helpers', () => {
    it('get sets method GET', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      })
      await httpClient.get('/items')
      expect(mockFetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({ method: 'GET' }))
    })

    it('post sets method POST and JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 1 }),
      })
      await httpClient.post('/items', { name: 'Test' })
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"name":"Test"}',
        }),
      )
    })

    it('del sets method DELETE', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204 })
      await httpClient.del('/items/1')
      expect(mockFetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({ method: 'DELETE' }))
    })
  })
})
