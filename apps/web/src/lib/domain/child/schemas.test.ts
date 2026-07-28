import { describe, it, expect } from 'vitest';
import { CreateChildInputSchema, MeasurementInputSchema } from './schemas';

describe('CreateChildInputSchema', () => {
  const validChild = {
    name: 'Sofia',
    birthDate: '2024-03-15',
    birthWeightG: 3200,
    birthHeightCm: 49,
  };

  it('accepts valid child input with birthDate', () => {
    const result = CreateChildInputSchema.safeParse(validChild);
    expect(result.success).toBe(true);
  });

  it('accepts valid child input with ageMonths only', () => {
    const result = CreateChildInputSchema.safeParse({
      name: 'Pedro',
      ageMonths: 12,
      birthWeightG: 3200,
      birthHeightCm: 49,
    });
    expect(result.success).toBe(true);
  });

  it('rejects when neither birthDate nor ageMonths is provided', () => {
    const result = CreateChildInputSchema.safeParse({
      name: 'Ana',
      birthWeightG: 3200,
      birthHeightCm: 49,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('birthDate');
    }
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

  it('rejects negative ageMonths', () => {
    const result = CreateChildInputSchema.safeParse({
      name: 'Lucas',
      ageMonths: -1,
      birthWeightG: 3200,
      birthHeightCm: 49,
    });
    expect(result.success).toBe(false);
  });

  it('rejects ageMonths over 216', () => {
    const result = CreateChildInputSchema.safeParse({
      name: 'Lucas',
      ageMonths: 217,
      birthWeightG: 3200,
      birthHeightCm: 49,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a decimal currentHeightCm, matching the 0.1cm precision the form allows', () => {
    const result = CreateChildInputSchema.safeParse({
      ...validChild,
      currentHeightCm: 68.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a decimal birthHeightCm, since the API birth_height_cm field is an integer', () => {
    const result = CreateChildInputSchema.safeParse({ ...validChild, birthHeightCm: 49.5 });
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

  it('accepts a measurement without clothingSize', () => {
    const { clothingSize: _clothingSize, ...withoutClothingSize } = validMeasurement;
    const result = MeasurementInputSchema.safeParse(withoutClothingSize);
    expect(result.success).toBe(true);
  });
});
