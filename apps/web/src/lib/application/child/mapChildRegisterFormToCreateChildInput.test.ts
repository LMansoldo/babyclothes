import { describe, it, expect } from 'vitest';
import { mapChildRegisterFormToCreateChildInput } from './mapChildRegisterFormToCreateChildInput';

describe('mapChildRegisterFormToCreateChildInput', () => {
  const base = { name: 'Sofia', document: '', birthDate: '2025-01-10', weight: '3200', height: '49' };

  it('passes name and birthDate through and parses birth weight/height', () => {
    const input = mapChildRegisterFormToCreateChildInput(base);
    expect(input.name).toBe('Sofia');
    expect(input.birthDate).toBe('2025-01-10');
    expect(input.birthWeightG).toBe(3200);
    expect(input.birthHeightCm).toBe(49);
  });

  it('rounds a decimal birth height to an integer (API birth_height_cm is integer)', () => {
    const input = mapChildRegisterFormToCreateChildInput({ ...base, height: '49.6' });
    expect(input.birthHeightCm).toBe(50);
    expect(Number.isInteger(input.birthHeightCm)).toBe(true);
  });

  it('omits document when blank, keeps it when provided', () => {
    expect(mapChildRegisterFormToCreateChildInput(base).document).toBeUndefined();
    expect(
      mapChildRegisterFormToCreateChildInput({ ...base, document: '12345678909' }).document,
    ).toBe('12345678909');
  });

  it('defaults birth weight/height to 0 when blank', () => {
    const input = mapChildRegisterFormToCreateChildInput({ ...base, weight: '', height: '' });
    expect(input.birthWeightG).toBe(0);
    expect(input.birthHeightCm).toBe(0);
  });
});
