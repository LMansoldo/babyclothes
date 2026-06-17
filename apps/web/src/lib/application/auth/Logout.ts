import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository';

export class Logout {
  constructor(private readonly auth: IAuthRepository) {}

  async execute(): Promise<void> {
    return this.auth.logout();
  }
}
