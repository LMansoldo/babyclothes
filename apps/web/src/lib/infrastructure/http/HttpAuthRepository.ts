import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository';
import type { Session } from '$lib/domain/auth/entities/Session';

/**
 * @deprecated Login/logout now flows through SvelteKit server actions.
 * This class is kept for backward compatibility with profile page.
 * Prefer using server actions and page data for session management.
 */
export class HttpAuthRepository implements IAuthRepository {
  readonly baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
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

    const { user } = (await res.json()) as {
      token: string;
      user: { id: string; email: string; name: string; avatar_url: string; type: string | null; cpf?: string; cnpj?: string; is_seller: boolean };
    };

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
    // Logout is now handled by server actions
    // Cookies are cleared server-side
  }

  async getSession(): Promise<Session | null> {
    const res = await fetch(`${this.baseUrl}/auth/session`);

    if (!res.ok) {
      return null;
    }

    const { user } = (await res.json()) as {
      user: { id: string; email: string; name: string; avatar_url: string; type: string | null; cpf?: string; cnpj?: string; is_seller: boolean };
    };

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
    const res = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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
