/**
 * emitNotification — Sends a notification to the API.
 *
 * Uses the internal API client to create a notification
 * that will be broadcast to the user via SSE.
 */

import { apiClient } from '../api-client.js';
import type { GrowthState } from '../types.js';

export async function emitNotification(state: GrowthState): Promise<Partial<GrowthState>> {
  try {
    if (!state.notification) {
      return {};
    }

    await apiClient.createNotification(state.notification);

    console.log(
      `[emitNotification] Sent notification for child ${state.child.child_id}`
    );

    return {};
  } catch (error) {
    console.error('emitNotification error:', error);
    // Don't fail the graph on notification errors
    return {};
  }
}
