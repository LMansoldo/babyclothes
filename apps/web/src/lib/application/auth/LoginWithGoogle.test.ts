import { describe, it, expect, vi } from 'vitest'
import { LoginWithGoogle } from './LoginWithGoogle'
import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository'
import type { Session } from '$lib/domain/auth/entities/Session'

describe('LoginWithGoogle', () => {
  const mockSession: Session = {
    userId: 'u-1',
    email: 'sofia@example.com',
    name: 'Sofia',
    avatarUrl: 'https://example.com/avatar.jpg',
  }

  it('delegates to auth repository and returns session', async () => {
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn().mockResolvedValue(mockSession),
      logout: vi.fn(),
      getSession: vi.fn(),
    }

    const useCase = new LoginWithGoogle(auth)
    const session = await useCase.execute('google-auth-code-abc')

    expect(auth.loginWithGoogle).toHaveBeenCalledWith('google-auth-code-abc')
    expect(session).toEqual(mockSession)
  })

  it('propagates error from repository', async () => {
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn().mockRejectedValue(new Error('Invalid code')),
      logout: vi.fn(),
      getSession: vi.fn(),
    }

    const useCase = new LoginWithGoogle(auth)
    await expect(useCase.execute('bad-code')).rejects.toThrow('Invalid code')
  })
})
