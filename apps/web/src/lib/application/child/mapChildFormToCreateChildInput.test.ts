import { describe, it, expect } from 'vitest';
import { mapChildFormToCreateChildInput } from './mapChildFormToCreateChildInput';

describe('mapChildFormToCreateChildInput', () => {
  it('derives birth_date from age in months, anchored to the first of the reference month', () => {
    const now = new Date('2026-07-20T12:00:00Z');

    const input = mapChildFormToCreateChildInput(
      {
        name: 'Sofia',
        ageMonths: '6',
        currentHeightCm: '',
        currentWeightKg: '',
        birthHeightCm: '',
        birthWeightG: '',
      },
      now,
    );

    expect(input.birthDate).toBe('2026-01-01');
    expect(input.ageMonths).toBe(6);
  });

  it('passes through the remaining fields with the expected unit conversions', () => {
    const now = new Date('2026-07-20T12:00:00Z');

    const input = mapChildFormToCreateChildInput(
      {
        name: 'Sofia',
        ageMonths: '6',
        currentHeightCm: '68.5',
        currentWeightKg: '7.8',
        birthHeightCm: '49',
        birthWeightG: '3200',
      },
      now,
    );

    expect(input.name).toBe('Sofia');
    expect(input.currentHeightCm).toBe(68.5);
    expect(input.currentWeightG).toBe(7800);
    expect(input.birthHeightCm).toBe(49);
    expect(input.birthWeightG).toBe(3200);
  });

  it('rounds a decimal birth height to an integer (API birth_height_cm is integer)', () => {
    const now = new Date('2026-07-20T12:00:00Z');

    const input = mapChildFormToCreateChildInput(
      {
        name: 'Sofia',
        ageMonths: '6',
        currentHeightCm: '',
        currentWeightKg: '',
        birthHeightCm: '50.5',
        birthWeightG: '',
      },
      now,
    );

    expect(input.birthHeightCm).toBe(51);
    expect(Number.isInteger(input.birthHeightCm)).toBe(true);
  });

  it('uses an explicit birth date as-is instead of deriving one from age in months', () => {
    const now = new Date('2026-07-20T12:00:00Z');

    const input = mapChildFormToCreateChildInput(
      {
        name: 'Sofia',
        ageMonths: '6',
        currentHeightCm: '',
        currentWeightKg: '',
        birthHeightCm: '',
        birthWeightG: '',
        birthDate: '2025-12-15',
      },
      now,
    );

    expect(input.birthDate).toBe('2025-12-15');
  });

  it('defaults birth weight and height to 0 when left blank', () => {
    const now = new Date('2026-07-20T12:00:00Z');

    const input = mapChildFormToCreateChildInput(
      {
        name: 'Sofia',
        ageMonths: '6',
        currentHeightCm: '',
        currentWeightKg: '',
        birthHeightCm: '',
        birthWeightG: '',
      },
      now,
    );

    expect(input.birthHeightCm).toBe(0);
    expect(input.birthWeightG).toBe(0);
  });
});
