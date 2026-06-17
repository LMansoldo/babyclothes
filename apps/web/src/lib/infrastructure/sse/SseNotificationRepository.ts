import { env } from '$env/dynamic/public';
import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository';
import type { Notification } from '$lib/domain/notification/entities/Notification';
import { createNotification } from '$lib/domain/notification/entities/Notification';
import { HttpNotificationRepository } from '$lib/infrastructure/http/HttpNotificationRepository';
import { getAuthToken } from '$lib/infrastructure/http/HttpAuthRepository';

export class SseNotificationRepository implements INotificationRepository {
  private readonly baseUrl: string;
  private readonly http: HttpNotificationRepository;

  constructor() {
    this.baseUrl = env.PUBLIC_API_URL ?? '';
    this.http = new HttpNotificationRepository();
  }

  // Delega ao HttpNotificationRepository
  findAll(): Promise<Notification[]> {
    return this.http.findAll();
  }

  // Delega ao HttpNotificationRepository
  markAsRead(id: string): Promise<void> {
    return this.http.markAsRead(id);
  }

  /**
   * Abre uma conexão SSE via EventSource e emite Notification via async generator.
   *
   * O EventSource não suporta headers — o JWT é enviado via query string,
   * conforme endpoint GET /sse/notifications?token=<jwt>.
   */
  async *subscribe(): AsyncIterable<Notification> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Cannot subscribe to notifications: user is not authenticated');
    }

    const url = `${this.baseUrl}/sse/notifications?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    try {
      yield* listenEventSource(es);
    } finally {
      es.close();
    }
  }
}

/**
 * Converte um EventSource em AsyncIterable<Notification>.
 * Encerra quando a conexão é fechada ou ocorre erro.
 */
async function* listenEventSource(es: EventSource): AsyncIterable<Notification> {
  type Resolve = (value: IteratorResult<Notification>) => void;

  let resolve: Resolve | null = null;
  const queue: Notification[] = [];
  let error: Error | null = null;
  let closed = false;

  function enqueue(notification: Notification) {
    if (resolve) {
      const r = resolve;
      resolve = null;
      r({ value: notification, done: false });
    } else {
      queue.push(notification);
    }
  }

  es.addEventListener('message', (event: MessageEvent) => {
    try {
      const dto = JSON.parse(event.data as string) as ApiNotificationDTO;
      enqueue(mapNotification(dto));
    } catch {
      // ignorar mensagens malformadas
    }
  });

  es.addEventListener('error', () => {
    error = new Error('SSE connection error');
    closed = true;
    if (resolve) {
      resolve({ value: undefined as unknown as Notification, done: true });
    }
  });

  while (!closed) {
    if (queue.length > 0) {
      yield queue.shift()!;
      continue;
    }

    if (error) throw error;

    yield await new Promise<Notification>((res) => {
      resolve = (result) => {
        if (result.done) {
          // encerrar o generator
          closed = true;
          res(undefined as unknown as Notification);
        } else {
          res(result.value);
        }
      };
    });

    if (closed) break;
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
