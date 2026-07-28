import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_MODEL = 'gemini-test';
  process.env.INTERNAL_API_URL = 'http://localhost:4000';
  process.env.INTERNAL_API_KEY = 'test-internal-key';
});

// Clean up after tests
afterAll(() => {
  vi.restoreAllMocks();
});
