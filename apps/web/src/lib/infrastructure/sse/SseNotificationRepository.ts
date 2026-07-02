import type { INotificationRepository } from '$lib/domain/notification/repositories/INotificationRepository';
import type { Notification } from '$lib/domain/notification/entities/Notification';
import { createNotification } from '$lib/domain/notification/entities/Notification';
import { HttpNotificationRepository } from '$lib/infrastructure/http/HttpNotificationRepository';

export class SseNotificationRepository implements INotificationRepository {
  private readonly baseUrl: string;
  private readonly http: HttpNotificationRepository;

  constructor() {
    this.baseUrl = '/api';
    this.http = new HttpNotificationRepository();
  }

  // Delegates to HttpNotificationRepository
  findAll(userId: string): Promise<Notification[]> {
    return this.http.findAll(userId);
  }

  // Delegates to HttpNotificationRepository
  markAsRead(id: string): Promise<void> {
    return this.http.markAsRead(id);
  }

  /**
   * Opens an SSE connection via EventSource and emits Notification via async generator.
   *
   * EventSource does not support headers — the httpOnly cookie is sent automatically
   * since this is a same-origin request to the proxy.
   *
   * TODO: SSE streaming through the proxy is out of scope. The proxy (Task 13) does not
   * stream SSE responses. This will need a direct connection or proxy streaming support.
   */
  async *subscribe(): AsyncIterable<Notification> {
    // TODO: authenticated SSE via cookie — EventSource sends cookies automatically for same-origin
    const url = `${this.baseUrl}/sse/notifications`;
    const es = new EventSource(url);

    try {
      yield* listenEventSource(es);
    } finally {
      es.close();
    }
  }
}

/**
 * Converts an EventSource into AsyncIterable<Notification>.
 * Closes when the connection is closed or an error occurs.
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
      // ignore malformed messages
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
          // close the generator
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
