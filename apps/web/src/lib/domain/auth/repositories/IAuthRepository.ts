import type { Session } from '../entities/Session';

export interface IAuthRepository {
  loginWithGoogle(code: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  updateProfile(data: { type: 'pf' | 'pj'; cpf?: string; cnpj?: string }): Promise<Session>;
}
