/**
 * Integration test for the agents service.
 *
 * Tests the gRPC server handlers with mocked external dependencies.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

// Mock external dependencies before imports
vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        category: 'body',
        size: null,
        gender: 'female',
        keywords: ['rosa'],
      }),
    }),
  })),
}));

vi.mock('../src/api-client.js', () => ({
  apiClient: {
    getChildContext: vi.fn().mockResolvedValue({
      child_id: '1',
      name: 'Sofia',
      birth_date: '2023-01-15',
      gender: 'female',
      measurements: [
        {
          recorded_at: '2024-01-15T10:00:00Z',
          weight_g: 5000,
          height_cm: 60,
          clothing_size: 'P',
        },
      ],
    }),
    searchItems: vi.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Body Rosa',
        category: 'body',
        clothing_size: 'P',
        condition: 'like_new',
        price_cents: 3500,
      },
    ]),
    createNotification: vi.fn().mockResolvedValue({ id: '123' }),
  },
}));

// Override format-response mock to return components
vi.mock('../src/nodes/format-response.js', () => ({
  formatResponse: vi.fn().mockResolvedValue({
    response: 'Encontrei um body rosa para Sofia!',
    components: [
      {
        type: 'carousel',
        data: { items: [{ id: '1', title: 'Body Rosa', price_cents: 3500 }] },
      },
    ],
  }),
}));

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from '../src/server.js';
import { apiClient } from '../src/api-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(__dirname, '../proto/agent.proto');
const PORT = 50052; // Use different port for tests

describe('Agents gRPC Server', () => {
  let server: grpc.Server;
  let client: any;

  beforeAll(async () => {
    // Start server
    server = startServer(PORT);

    // Create client
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    client = new proto.agent.AgentService(
      `localhost:${PORT}`,
      grpc.credentials.createInsecure()
    );

    // Wait for server to be ready
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
  });

  afterAll(() => {
    server.tryShutdown(() => {});
  });

  it('handles Chat RPC with streaming response', async () => {
    const request = {
      user_id: '10',
      child_id: '1',
      message: 'Quero um body rosa para a Sofia',
      context: {
        name: 'Sofia',
        birth_date: '2023-01-15',
        current_size: 'P',
        last_measurement: {
          recorded_at: '2024-01-15T10:00:00Z',
          weight_g: 5000,
          height_cm: 60,
          clothing_size: 'P',
        },
        history: [],
      },
    };

    const chunks: any[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = client.Chat(request);

      stream.on('data', (chunk: any) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve();
      });

      stream.on('error', (error: Error) => {
        reject(error);
      });
    });

    // Should have text response + component (stream ends by EOF)
    expect(chunks.length).toBeGreaterThanOrEqual(2);

    // Find text chunk
    const textChunk = chunks.find((c: any) => c.type === 'text');
    expect(textChunk).toBeDefined();
    expect(textChunk.content).toContain('body rosa');

    // Find component chunk
    const componentChunk = chunks.find((c: any) => c.type === 'component');
    expect(componentChunk).toBeDefined();
    const componentData = JSON.parse(componentChunk.content);
    expect(componentData.type).toBe('carousel');
  });

  it('handles PredictGrowth RPC', async () => {
    const request = {
      user_id: '10',
      child_id: '1',
      birth_weight: 3200,
      birth_height: 49,
      measurements: [
        {
          recorded_at: '2024-01-15T10:00:00Z',
          weight_g: 5000,
          height_cm: 60,
          clothing_size: 'P',
        },
        {
          recorded_at: '2024-07-15T10:00:00Z',
          weight_g: 8000,
          height_cm: 70,
          clothing_size: 'M',
        },
      ],
    };

    const result = await new Promise<any>((resolve, reject) => {
      client.PredictGrowth(request, (error: Error | null, response: any) => {
        if (error) reject(error);
        else resolve(response);
      });
    });

    expect(result.next_size).toBeDefined();
    expect(typeof result.next_size).toBe('string');
    expect(result.days_until).toBeDefined();
    expect(typeof result.days_until).toBe('number');
  });
});
