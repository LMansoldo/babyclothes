import type { Notification } from '../entities/Notification';

export interface INotificationRepository {
  findAll(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  subscribe(): AsyncIterable<Notification>;
}
