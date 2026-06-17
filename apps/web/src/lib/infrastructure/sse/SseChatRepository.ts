import { env } from '$env/dynamic/public';
import type { IChatRepository } from '$lib/domain/chat/repositories/IChatRepository';
import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse';
import { getAuthToken } from '$lib/infrastructure/http/HttpAuthRepository';

export class SseChatRepository implements IChatRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = env.PUBLIC_API_URL ?? '';
  }

  async *sendMessage(
    userId: string,
    childId: string,
    message: string,
  ): AsyncIterable<AgentResponse> {
    const token = getAuthToken();

    const res = await fetch(`${this.baseUrl}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ user_id: userId, child_id: childId, message }),
    });

    if (!res.ok) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    if (!res.body) {
      throw new Error('Response body is null — SSE stream unavailable');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Processar linhas completas do SSE (formato: "data: {json}\n\n")
        const lines = buffer.split('\n');
        // Manter a última linha incompleta no buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const jsonStr = trimmed.slice('data:'.length).trim();
          if (!jsonStr) continue;

          let parsed: unknown;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            // linha malformada — ignorar
            continue;
          }

          const chunk = parsed as {
            type: string;
            content?: string;
            component?: string;
            props?: Record<string, unknown>;
          };

          // O stream encerra por EOF — não há chunk 'done'
          if (chunk.type === 'text' && typeof chunk.content === 'string') {
            yield { type: 'text', content: chunk.content };
          } else if (
            chunk.type === 'component' &&
            typeof chunk.component === 'string' &&
            chunk.props !== undefined
          ) {
            yield { type: 'component', component: chunk.component, props: chunk.props };
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
