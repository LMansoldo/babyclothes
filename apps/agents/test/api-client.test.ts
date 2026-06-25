import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../src/api-client.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChildContext', () => {
    it('fetches child context from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            child: {
              id: '1',
              name: 'Sofia',
              birth_date: '2023-01-15',
              gender: 'female',
              user_id: '10',
            },
            measurements: [
              {
                recorded_at: '2024-01-15T10:00:00Z',
                weight_g: 5000,
                height_cm: 60,
                clothing_size: 'P',
              },
            ],
            user: { id: '10', name: 'Maria', email: 'maria@test.com' },
          }),
      });

      const result = await apiClient.getChildContext('1');

      expect(result.child_id).toBe('1');
      expect(result.name).toBe('Sofia');
      expect(result.birth_date).toBe('2023-01-15');
      expect(result.gender).toBe('female');
      expect(result.measurements).toHaveLength(1);
      expect(result.measurements[0].weight_g).toBe(5000);
    });

    it('sends correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            child: { id: '1', name: 'Test', birth_date: '2023-01-01', gender: 'male', user_id: '10' },
            measurements: [],
            user: { id: '10', name: 'User', email: 'u@test.com' },
          }),
      });

      await apiClient.getChildContext('1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/internal/children/1/context'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-internal-key': expect.any(String),
          }),
        })
      );
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not found'),
      });

      await expect(apiClient.getChildContext('999')).rejects.toThrow('API error 404');
    });
  });

  describe('searchItems', () => {
    it('searches items with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            items: [
              {
                id: '1',
                title: 'Body Rosa',
                category: 'body',
                clothing_size: 'M',
                condition: 'like_new',
                price_cents: 3500,
              },
            ],
          }),
      });

      const result = await apiClient.searchItems({
        category: 'body',
        size: 'M',
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Body Rosa');
      expect(result[0].price_cents).toBe(3500);
    });

    it('builds query params correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await apiClient.searchItems({ category: 'macacao', gender: 'unisex', limit: 5 });

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('category=macacao');
      expect(calledUrl).toContain('gender=unisex');
      expect(calledUrl).toContain('limit=5');
    });

    it('omits undefined params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [] }),
      });

      await apiClient.searchItems({});

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain('category');
      expect(calledUrl).not.toContain('size');
    });
  });

  describe('createNotification', () => {
    it('creates a notification via POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'notif-1' }),
      });

      const result = await apiClient.createNotification({
        user_id: '10',
        type: 'growth_prediction',
        title: 'Size Change',
        body: 'Sofia needs size M',
        metadata: { child_id: '1' },
      });

      expect(result.id).toBe('notif-1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/internal/notifications'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            user_id: '10',
            type: 'growth_prediction',
            title: 'Size Change',
            body: 'Sofia needs size M',
            metadata: { child_id: '1' },
          }),
        })
      );
    });
  });
});
