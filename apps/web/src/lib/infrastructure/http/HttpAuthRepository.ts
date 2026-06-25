import { PUBLIC_API_URL } from '$lib/env';
import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository';
import type { Session } from '$lib/domain/auth/entities/Session';

const JWT_KEY = 'babyclothes_token';
const USER_ID_KEY = 'babyclothes_user_id';

export class HttpAuthRepository implements IAuthRepository {
  readonly baseUrl: string;

  constructor() {
    this.baseUrl = PUBLIC_API_URL;
  }

  async loginWithGoogle(code: string): Promise<Session> {
    const res = await fetch(`${this.baseUrl}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Auth failed: ${res.status}`);
    }

    const { token, user } = (await res.json()) as {
      token: string;
      user: { id: string; email: string; name: string; avatar_url: string; type: string | null; cpf?: string; cnpj?: string; is_seller: boolean };
    };

    localStorage.setItem(JWT_KEY, token);
    localStorage.setItem(USER_ID_KEY, user.id);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      type: user.type as 'pf' | 'pj' | null,
      cpf: user.cpf,
      cnpj: user.cnpj,
      isSeller: user.is_seller,
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }

  async getSession(): Promise<Session | null> {
    const token = localStorage.getItem(JWT_KEY);
    if (!token) return null;

    const res = await fetch(`${this.baseUrl}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem(JWT_KEY);
      return null;
    }

    const { user } = (await res.json()) as {
      user: { id: string; email: string; name: string; avatar_url: string; type: string | null; cpf?: string; cnpj?: string; is_seller: boolean };
    };

    localStorage.setItem(USER_ID_KEY, user.id);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      type: user.type as 'pf' | 'pj' | null,
      cpf: user.cpf,
      cnpj: user.cnpj,
      isSeller: user.is_seller,
    };
  }

  async updateProfile(data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }): Promise<Session> {
    const token = localStorage.getItem(JWT_KEY);
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Update failed: ${res.status}`);
    }

    const { user } = (await res.json()) as {
      user: { id: string; email: string; name: string; avatar_url: string; type: string; cpf?: string; cnpj?: string; is_seller: boolean };
    };

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      type: user.type as 'pf' | 'pj',
      cpf: user.cpf,
      cnpj: user.cnpj,
      isSeller: user.is_seller,
    };
  }
}

// Helpers exportados para uso nos outros repositórios
export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(JWT_KEY);
}

export function getUserId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(USER_ID_KEY);
}
