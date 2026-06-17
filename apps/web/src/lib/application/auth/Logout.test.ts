import { describe, it, expect, vi } from 'vitest';
import { Logout } from './Logout';
import type { IAuthRepository } from '$lib/domain/auth/repositories/IAuthRepository';

describe('Logout', () => {
  it('calls auth.logout()', async () => {
    const auth: IAuthRepository = {
      loginWithGoogle: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn(),
    };

    const useCase = new Logout(auth);
    await useCase.execute();

    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
