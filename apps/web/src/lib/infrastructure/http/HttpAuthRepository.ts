import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository';
import type { Session } from '$lib/domain/auth/entities/Session';
import { httpClient } from './httpClient';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    type: string | null;
    cpf?: string;
    cnpj?: string;
    is_seller: boolean;
  };
};

/**
 * @deprecated Login/logout now flows through SvelteKit server actions.
 * This class is kept for backward compatibility with profile page.
 * Prefer using server actions and page data for session management.
 */
export class HttpAuthRepository implements IAuthRepository {
  async loginWithGoogle(code: string): Promise<Session> {
    const { user } = await httpClient.post<AuthResponse>('/auth/google', { code });
    return mapSession(user);
  }

  async logout(): Promise<void> {
    // Logout is now handled by server actions
    // Cookies are cleared server-side
  }

  async getSession(): Promise<Session | null> {
    try {
      const { user } = await httpClient.get<AuthResponse>('/auth/session');
      return mapSession(user);
    } catch {
      return null;
    }
  }

  async updateProfile(data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }): Promise<Session> {
    const { user } = await httpClient.patch<AuthResponse>('/auth/me', data);
    return mapSession(user);
  }
}

function mapSession(user: AuthResponse['user']): Session {
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
