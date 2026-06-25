import { describe, it, expect } from 'vitest';
import { predictSize } from '../../src/nodes/predict-size.js';
import type { GrowthState, GrowthTrend } from '../../src/types.js';

describe('predictSize', () => {
  it('predicts next size based on growth velocity', async () => {
    const trend: GrowthTrend = {
      weight_velocity: 15, // 15g/day
      height_velocity: 0.1, // 0.1cm/day
      current_size: 'P',
      size_fit: 'good',
    };

    const state: GrowthState = {
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
      trend,
      should_notify: false,
    };

    const result = await predictSize(state);

    expect(result.prediction).toBeDefined();
    expect(result.prediction!.predicted_size).toBe('M');
    expect(result.prediction!.days_until_needed).toBeGreaterThan(0);
    expect(result.prediction!.confidence).toBeGreaterThan(0);
  });

  it('increases confidence with more data points', async () => {
    const trend: GrowthTrend = {
      weight_velocity: 15,
      height_velocity: 0.1,
      current_size: 'P',
      size_fit: 'good',
    };

    const state: GrowthState = {
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [
        { recorded_at: '2024-01-15T10:00:00Z', weight_g: 4000, height_cm: 55, clothing_size: 'RN' },
        { recorded_at: '2024-03-15T10:00:00Z', weight_g: 5000, height_cm: 60, clothing_size: 'P' },
        { recorded_at: '2024-05-15T10:00:00Z', weight_g: 6000, height_cm: 63, clothing_size: 'P' },
      ],
      trend,
      should_notify: false,
    };

    const result = await predictSize(state);

    // 30 + 3 * 15 = 75
    expect(result.prediction!.confidence).toBe(75);
  });

  it('handles no trend data', async () => {
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

    const result = await predictSize(state);

    expect(result.prediction!.confidence).toBe(0);
  });

  it('returns -1 days for max size', async () => {
    const trend: GrowthTrend = {
      weight_velocity: 15,
      height_velocity: 0.1,
      current_size: '6',
      size_fit: 'good',
    };

    const state: GrowthState = {
      child: {
        child_id: '1',
        name: 'Sofia',
        birth_date: '2023-01-15',
        gender: 'female',
        measurements: [],
      },
      measurements: [
        { recorded_at: '2024-01-15T10:00:00Z', weight_g: 20000, height_cm: 110, clothing_size: '6' },
      ],
      trend,
      should_notify: false,
    };

    const result = await predictSize(state);

    expect(result.prediction!.predicted_size).toBe('6');
    expect(result.prediction!.days_until_needed).toBe(-1);
  });
});
