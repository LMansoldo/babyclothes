import { describe, it, expect } from 'vitest';
import { buildInitialMeasurementInput } from './buildInitialMeasurementInput';
import type { CreateChildInput } from '$lib/domain/child/schemas';

describe('buildInitialMeasurementInput', () => {
  const now = new Date('2026-07-21T12:00:00.000Z');

  const baseInput: CreateChildInput = {
    name: 'Sofia',
    birthDate: '2026-01-01',
    birthWeightG: 3200,
    birthHeightCm: 49,
  };

  it('builds a measurement with rounded height and recordedAt when both weight and height are present', () => {
    const result = buildInitialMeasurementInput(
      { ...baseInput, currentWeightG: 7800, currentHeightCm: 68 },
      now,
    );

    expect(result).toEqual({
      weightG: 7800,
      heightCm: 68,
      recordedAt: '2026-07-21T12:00:00.000Z',
    });
  });

  it('rounds a decimal currentHeightCm (68.5) to the nearest integer (69)', () => {
    const result = buildInitialMeasurementInput(
      { ...baseInput, currentWeightG: 7800, currentHeightCm: 68.5 },
      now,
    );

    expect(result?.heightCm).toBe(69);
  });

  it('returns null when both currentWeightG and currentHeightCm are absent', () => {
    const result = buildInitialMeasurementInput(baseInput, now);

    expect(result).toBeNull();
  });

  it('defaults the missing measurement to 0 when only weight is present', () => {
    const result = buildInitialMeasurementInput(
      { ...baseInput, currentWeightG: 7800 },
      now,
    );

    expect(result).toEqual({
      weightG: 7800,
      heightCm: 0,
      recordedAt: '2026-07-21T12:00:00.000Z',
    });
  });

  it('defaults the missing measurement to 0 when only height is present', () => {
    const result = buildInitialMeasurementInput(
      { ...baseInput, currentHeightCm: 68.5 },
      now,
    );

    expect(result).toEqual({
      weightG: 0,
      heightCm: 69,
      recordedAt: '2026-07-21T12:00:00.000Z',
    });
  });

  it('produces a recordedAt accepted by MeasurementInputSchema (ISO datetime with offset)', async () => {
    const { MeasurementInputSchema } = await import('$lib/domain/child/schemas');
    const result = buildInitialMeasurementInput(
      { ...baseInput, currentWeightG: 7800, currentHeightCm: 68 },
      now,
    );

    const parsed = MeasurementInputSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
