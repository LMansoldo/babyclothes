import { env } from '$env/dynamic/public'
import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository'
import type { Session } from '$lib/domain/auth/entities/Session'

const JWT_KEY = 'babyclothes_token'

export class HttpAuthRepository implements IAuthRepository {
  private readonly baseUrl: string

  constructor() {
    this.baseUrl = env.PUBLIC_API_URL ?? ''
  }

  async loginWithGoogle(code: string): Promise<Session> {
    const res = await fetch(`${this.baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? `Auth failed: ${res.status}`)
    }

    const { token, user } = await res.json() as {
      token: string
      user: { id: string; email: string; name: string; avatar_url: string }
    }

    localStorage.setItem(JWT_KEY, token)

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(JWT_KEY)
  }

  async getSession(): Promise<Session | null> {
    const token = localStorage.getItem(JWT_KEY)
    if (!token) return null

    const res = await fetch(`${this.baseUrl}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      localStorage.removeItem(JWT_KEY)
      return null
    }

    const { user } = await res.json() as {
      user: { id: string; email: string; name: string; avatar_url: string }
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
    }
  }
}

// Helper exportado para uso nos outros repositórios
export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(JWT_KEY)
}
