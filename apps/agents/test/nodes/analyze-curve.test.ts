import { describe, it, expect } from 'vitest';
import { analyzeCurve } from '../../src/nodes/analyze-curve.js';
import type { GrowthState } from '../../src/types.js';

describe('analyzeCurve', () => {
  it('calculates growth velocity', async () => {
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
          weight_g: 4000,
          height_cm: 55,
          clothing_size: 'RN',
        },
        {
          recorded_at: '2024-07-15T10:00:00Z',
          weight_g: 7000,
          height_cm: 67,
          clothing_size: 'M',
        },
      ],
      should_notify: false,
    };

    const result = await analyzeCurve(state);

    expect(result.trend).toBeDefined();
    expect(result.trend!.weight_velocity).toBeGreaterThan(0);
    expect(result.trend!.height_velocity).toBeGreaterThan(0);
    expect(result.trend!.current_size).toBe('M');
  });

  it('assesses tight fit correctly', async () => {
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
          weight_g: 7500,
          height_cm: 70,
          clothing_size: 'M',
        },
      ],
      should_notify: false,
    };

    const result = await analyzeCurve(state);

    expect(result.trend!.size_fit).toBe('tight'); // 7500/8000 = 0.9375 > 0.9
  });

  it('assesses loose fit correctly', async () => {
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
          weight_g: 3000,
          height_cm: 40,
          clothing_size: 'M',
        },
      ],
      should_notify: false,
    };

    const result = await analyzeCurve(state);

    expect(result.trend!.size_fit).toBe('loose'); // 3000/8000 = 0.375 < 0.6
  });

  it('handles empty measurements', async () => {
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

    const result = await analyzeCurve(state);

    expect(result.trend!.current_size).toBe('RN');
    expect(result.trend!.size_fit).toBe('good');
  });
});
