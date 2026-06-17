import type { Session } from '../entities/Session';

export interface IAuthRepository {
  loginWithGoogle(code: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}
