import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreateNotification } = vi.hoisted(() => {
  const mockCreateNotification = vi.fn().mockResolvedValue({ id: '123' });
  return { mockCreateNotification };
});

vi.mock('../../src/api-client.js', () => ({
  apiClient: {
    createNotification: mockCreateNotification,
  },
}));

const { emitNotification } = await import('../../src/nodes/emit-notification.js');
import type { GrowthState } from '../../src/types.js';

describe('emitNotification', () => {
  beforeEach(() => {
    mockCreateNotification.mockReset();
    mockCreateNotification.mockResolvedValue({ id: '123' });
  });

  it('sends notification to API', async () => {
    const state: GrowthState = {
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [],
      should_notify: true,
      notification: {
        user_id: '10',
        type: 'growth_prediction',
        title: 'Test',
        body: 'Test body',
        metadata: {},
      },
    };

    await emitNotification(state);

    expect(mockCreateNotification).toHaveBeenCalledWith(state.notification);
  });

  it('handles missing notification gracefully', async () => {
    const state: GrowthState = {
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [],
      should_notify: false,
    };

    const result = await emitNotification(state);

    expect(mockCreateNotification).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('handles API errors gracefully', async () => {
    mockCreateNotification.mockRejectedValueOnce(new Error('API error'));

    const state: GrowthState = {
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [],
      should_notify: true,
      notification: {
        user_id: '10',
        type: 'growth_prediction',
        title: 'Test',
        body: 'Test body',
        metadata: {},
      },
    };

    const result = await emitNotification(state);

    // Should not throw
    expect(result).toEqual({});
  });
});
