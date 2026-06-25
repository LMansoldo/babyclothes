import { describe, it, expect } from 'vitest';
import { checkThreshold } from '../../src/nodes/check-threshold.js';
import type { GrowthState } from '../../src/types.js';

describe('checkThreshold', () => {
  const baseState: GrowthState = {
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

  it('triggers notification for tight size fit', async () => {
    const state: GrowthState = {
      ...baseState,
      trend: {
        weight_velocity: 15,
        height_velocity: 0.1,
        current_size: 'P',
        size_fit: 'tight',
      },
      prediction: {
        predicted_size: 'M',
        confidence: 85,
        days_until_needed: 30,
      },
    };

    const result = await checkThreshold(state);

    expect(result.should_notify).toBe(true);
    expect(result.notification).toBeDefined();
    expect(result.notification!.title).toContain('M');
  });

  it('triggers notification for soon prediction', async () => {
    const state: GrowthState = {
      ...baseState,
      trend: {
        weight_velocity: 15,
        height_velocity: 0.1,
        current_size: 'P',
        size_fit: 'good',
      },
      prediction: {
        predicted_size: 'M',
        confidence: 85,
        days_until_needed: 20,
      },
    };

    const result = await checkThreshold(state);

    expect(result.should_notify).toBe(true);
  });

  it('skips notification for low confidence', async () => {
    const state: GrowthState = {
      ...baseState,
      trend: {
        weight_velocity: 15,
        height_velocity: 0.1,
        current_size: 'P',
        size_fit: 'good',
      },
      prediction: {
        predicted_size: 'M',
        confidence: 50,
        days_until_needed: 30,
      },
    };

    const result = await checkThreshold(state);

    expect(result.should_notify).toBe(false);
  });

  it('skips notification when no trend', async () => {
    const result = await checkThreshold(baseState);
    expect(result.should_notify).toBe(false);
  });
});
