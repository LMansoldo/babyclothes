import { describe, it, expect } from 'vitest';
import { mapItemFormToCreateInput } from './mapItemFormToCreateInput';

describe('mapItemFormToCreateInput', () => {
  it('converts price in reais to integer cents', () => {
    const input = mapItemFormToCreateInput({
      title: '  Body listrado  ',
      category: 'bodysuit',
      size: 'M',
      condition: 'new',
      gender: 'unisex',
      photos: [],
      price: 19.9,
      description: 'Novo, nunca usado ',
    });

    expect(input.priceCents).toBe(1990);
    expect(input.title).toBe('Body listrado');
    expect(input.description).toBe('Novo, nunca usado');
    expect(input.clothingSize).toBe('M');
    expect(input.gender).toBe('unisex');
    expect(input.condition).toBe('new');
  });

  it('rounds float precision safely', () => {
    const input = mapItemFormToCreateInput({
      title: 'x',
      category: 'dress',
      size: 'G',
      condition: 'used',
      gender: 'female',
      photos: [],
      price: 35.9,
      description: '',
    });

    expect(input.priceCents).toBe(3590);
  });
});
