import { describe, it, expect, vi } from 'vitest'
import { MarkNotificationAsRead } from './MarkNotificationAsRead'
import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository'

describe('MarkNotificationAsRead', () => {
  it('calls notifications.markAsRead with the correct id', async () => {
    const notifications: INotificationRepository = {
      findAll: vi.fn(),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
    }

    const useCase = new MarkNotificationAsRead(notifications)
    await useCase.execute('notif-99')

    expect(notifications.markAsRead).toHaveBeenCalledWith('notif-99')
  })
})
