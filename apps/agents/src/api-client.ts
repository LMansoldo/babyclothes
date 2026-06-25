/**
 * HTTP client for the Elixir API.
 * Used by agents to fetch data and send notifications.
 */

import type { ChildContext, CatalogItem } from './types.js';

const API_URL = process.env.INTERNAL_API_URL || 'http://localhost:4000';
const API_KEY = process.env.INTERNAL_API_KEY || '';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': API_KEY,
    ...((options?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  /**
   * Get child context with measurements.
   */
  async getChildContext(childId: string): Promise<ChildContext> {
    const data = await fetchJson<{
      child: {
        id: string;
        name: string;
        birth_date: string;
        gender: string;
        user_id: string;
      };
      measurements: Array<{
        recorded_at: string;
        weight_g: number;
        height_cm: number;
        clothing_size: string;
      }>;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>(`/internal/children/${childId}/context`);

    return {
      child_id: data.child.id,
      name: data.child.name,
      birth_date: data.child.birth_date,
      gender: data.child.gender as ChildContext['gender'],
      measurements: data.measurements.map((m) => ({
        recorded_at: m.recorded_at,
        weight_g: m.weight_g,
        height_cm: m.height_cm,
        clothing_size: m.clothing_size,
      })),
    };
  },

  /**
   * Search items in the catalog.
   */
  async searchItems(params: {
    category?: string;
    size?: string;
    gender?: string;
    limit?: number;
  }): Promise<CatalogItem[]> {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.size) searchParams.set('size', params.size);
    if (params.gender) searchParams.set('gender', params.gender);
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const data = await fetchJson<{
      items: CatalogItem[];
    }>(`/internal/items/search?${searchParams.toString()}`);

    return data.items;
  },

  /**
   * Create a notification for a user.
   */
  async createNotification(notification: {
    user_id: string;
    type: string;
    title: string;
    body: string;
    metadata: Record<string, unknown>;
  }): Promise<{ id: string }> {
    return fetchJson<{ id: string }>('/internal/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
};
