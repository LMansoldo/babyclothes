import type { Notification } from '../entities/Notification';

export interface INotificationRepository {
  findAll(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  subscribe(): AsyncIterable<Notification>;
}
