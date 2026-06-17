import { describe, it, expect } from 'vitest';
import { CreateChildInputSchema, MeasurementInputSchema } from './schemas';

describe('CreateChildInputSchema', () => {
  const validChild = {
    name: 'Sofia',
    birthDate: '2024-03-15',
    birthWeightG: 3200,
    birthHeightCm: 49,
  };

  it('accepts valid child input', () => {
    const result = CreateChildInputSchema.safeParse(validChild);
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = CreateChildInputSchema.safeParse({ ...validChild, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = CreateChildInputSchema.safeParse({ ...validChild, birthDate: '15/03/2024' });
    expect(result.success).toBe(false);
  });

  it('rejects negative weight', () => {
    const result = CreateChildInputSchema.safeParse({ ...validChild, birthWeightG: -1 });
    expect(result.success).toBe(false);
  });
});

describe('MeasurementInputSchema', () => {
  const validMeasurement = {
    weightG: 7800,
    heightCm: 68,
    clothingSize: 'M',
  };

  it('accepts valid measurement', () => {
    const result = MeasurementInputSchema.safeParse(validMeasurement);
    expect(result.success).toBe(true);
  });

  it('accepts optional recordedAt in ISO format', () => {
    const result = MeasurementInputSchema.safeParse({
      ...validMeasurement,
      recordedAt: '2026-01-15T10:30:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid clothing size', () => {
    const result = MeasurementInputSchema.safeParse({ ...validMeasurement, clothingSize: 'XL' });
    expect(result.success).toBe(false);
  });
});
