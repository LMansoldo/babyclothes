import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository';
import type { Notification } from '$lib/domain/notification/entities/Notification';
import { createNotification } from '$lib/domain/notification/entities/Notification';
import { httpClient, httpRequest } from './httpClient';

export class HttpNotificationRepository implements INotificationRepository {
  async findAll(userId: string): Promise<Notification[]> {
    const { notifications } = await httpClient.get<{ notifications: ApiNotificationDTO[] }>(
      `/users/${userId}/notifications`
    );
    return notifications.map(mapNotification);
  }

  async markAsRead(id: string): Promise<void> {
    await httpRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // subscribe() is implemented by SseNotificationRepository — this method
  // should never be called directly on this class.
  async *subscribe(): AsyncIterable<Notification> {
    throw new Error(
      'HttpNotificationRepository does not support subscribe(). Use SseNotificationRepository.',
    );
  }
}

type ApiNotificationDTO = {
  id: string;
  user_id: string;
  type: 'growth_prediction' | 'new_match' | 'system';
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  read_at?: string;
};

function mapNotification(dto: ApiNotificationDTO): Notification {
  return createNotification({
    id: dto.id,
    userId: dto.user_id,
    type: dto.type,
    title: dto.title,
    body: dto.body,
    metadata: dto.metadata,
    readAt: dto.read_at ? new Date(dto.read_at) : undefined,
  });
}
