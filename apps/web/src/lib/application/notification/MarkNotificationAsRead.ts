import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository';

export class MarkNotificationAsRead {
  constructor(private readonly notifications: INotificationRepository) {}

  async execute(id: string): Promise<void> {
    return this.notifications.markAsRead(id);
  }
}
