import type { IChatRepository } from '$lib/domain/chat/repositories/IChatRepository';
import type { AgentResponse } from '$lib/domain/chat/value-objects/AgentResponse';

export class SseChatRepository implements IChatRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  async *sendMessage(
    userId: string,
    childId: string,
    message: string,
  ): AsyncIterable<AgentResponse> {
    const res = await fetch(`${this.baseUrl}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

        // Process complete SSE lines (format: "data: {json}\n\n")
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
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
            // malformed line — ignore
            continue;
          }

          const chunk = parsed as {
            type: string;
            content?: string;
            component?: string;
            props?: Record<string, unknown>;
          };

          // The stream ends by EOF — no 'done' chunk
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
