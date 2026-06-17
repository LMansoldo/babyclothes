export type NotificationType = 'growth_prediction' | 'new_match' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  readAt?: Date;
  isRead(): boolean;
}

type NotificationInput = Omit<Notification, 'isRead'>;

export function createNotification(input: NotificationInput): Notification {
  return {
    ...input,
    isRead(): boolean {
      return this.readAt !== undefined;
    },
  };
}
