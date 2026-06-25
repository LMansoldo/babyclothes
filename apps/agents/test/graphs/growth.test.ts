import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/nodes/analyze-curve.js', () => ({
  analyzeCurve: vi.fn().mockResolvedValue({
    trend: {
      weight_velocity: 15,
      height_velocity: 0.1,
      current_size: 'P',
      size_fit: 'tight',
    },
  }),
}));

vi.mock('../../src/nodes/predict-size.js', () => ({
  predictSize: vi.fn().mockResolvedValue({
    prediction: {
      predicted_size: 'M',
      confidence: 85,
      days_until_needed: 30,
    },
  }),
}));

vi.mock('../../src/nodes/check-threshold.js', () => ({
  checkThreshold: vi.fn().mockResolvedValue({
    should_notify: true,
    notification: {
      user_id: '10',
      type: 'growth_prediction',
      title: 'Sofia vai precisar de M!',
      body: 'Em 30 dias, Sofia vai precisar de tamanho M',
      metadata: {},
    },
  }),
}));

vi.mock('../../src/nodes/emit-notification.js', () => ({
  emitNotification: vi.fn().mockResolvedValue({}),
}));

import { growthGraph } from '../../src/graphs/growth.js';

describe('growthGraph', () => {
  it('runs full growth analysis pipeline', async () => {
    const result = await growthGraph({
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [
        {
          recorded_at: '2024-01-15T10:00:00Z',
          weight_g: 5000,
          height_cm: 60,
          clothing_size: 'P',
        },
      ],
    });

    expect(result.trend).toBeDefined();
    expect(result.prediction).toBeDefined();
    expect(result.should_notify).toBe(true);
    expect(result.notification).toBeDefined();
  });
});
