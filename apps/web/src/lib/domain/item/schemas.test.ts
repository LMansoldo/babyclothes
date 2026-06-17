import { describe, it, expect } from 'vitest';
import { CreateItemInputSchema } from './schemas';

describe('CreateItemInputSchema', () => {
  const validInput = {
    title: 'Macacão manga longa azul',
    description: 'Usado poucas vezes, ótimo estado',
    category: 'macacao',
    gender: 'male',
    clothingSize: 'M',
    condition: 'like_new',
    priceCents: 3500,
  };

  it('accepts valid input', () => {
    const result = CreateItemInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects invalid clothing size', () => {
    const result = CreateItemInputSchema.safeParse({ ...validInput, clothingSize: 'XL' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('clothingSize');
    }
  });

  it('rejects negative price', () => {
    const result = CreateItemInputSchema.safeParse({ ...validInput, priceCents: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid condition', () => {
    const result = CreateItemInputSchema.safeParse({ ...validInput, condition: 'broken' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender', () => {
    const result = CreateItemInputSchema.safeParse({ ...validInput, gender: 'other' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = CreateItemInputSchema.safeParse({ ...validInput, title: '' });
    expect(result.success).toBe(false);
  });
});
