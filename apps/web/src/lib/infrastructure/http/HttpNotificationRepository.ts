import { PUBLIC_API_URL } from '$lib/env';
import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository';
import type { Notification } from '$lib/domain/notification/entities/Notification';
import { createNotification } from '$lib/domain/notification/entities/Notification';
import { getAuthToken, getUserId } from './HttpAuthRepository';

export class HttpNotificationRepository implements INotificationRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = PUBLIC_API_URL;
  }

  private authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async findAll(): Promise<Notification[]> {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated — cannot fetch notifications');

    const res = await fetch(`${this.baseUrl}/users/${userId}/notifications`, {
      headers: this.authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Fetch notifications failed: ${res.status}`);
    }

    const { notifications } = (await res.json()) as { notifications: ApiNotificationDTO[] };
    return notifications.map(mapNotification);
  }

  async markAsRead(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: this.authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Mark notification read failed: ${res.status}`);
    }
  }

  // subscribe() é implementado pelo SseNotificationRepository — este método
  // nunca deveria ser chamado diretamente nesta classe.
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
