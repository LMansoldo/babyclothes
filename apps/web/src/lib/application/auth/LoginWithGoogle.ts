import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository'
import type { Session } from '$lib/domain/auth/entities/Session'

export class LoginWithGoogle {
  constructor(private readonly auth: IAuthRepository) {}

  async execute(code: string): Promise<Session> {
    return this.auth.loginWithGoogle(code)
  }
}
