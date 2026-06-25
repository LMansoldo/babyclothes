import { describe, it, expect, vi } from 'vitest';
import { RegisterChild } from './RegisterChild';
import type { IChildRepository } from '$lib/domain/child/repositories/IChildRepository';
import type { Child } from '$lib/domain/child/entities/Child';

describe('RegisterChild', () => {
  const mockChild: Child = {
    id: 'child-1',
    userId: 'u-1',
    name: 'Sofia',
    document: undefined,
    birthDate: new Date('2024-03-15'),
    gender: 'female',
    birthWeightG: 3200,
    birthHeightCm: 49,
  };

  it('validates and creates a child', async () => {
    const children: IChildRepository = {
      create: vi.fn().mockResolvedValue(mockChild),
      findAll: vi.fn(),
      findById: vi.fn(),
      getMeasurements: vi.fn(),
      addMeasurement: vi.fn(),
    };

    const useCase = new RegisterChild(children);
    const result = await useCase.execute({
      name: 'Sofia',
      birthDate: '2024-03-15',
      birthWeightG: 3200,
      birthHeightCm: 49,
    });

    expect(children.create).toHaveBeenCalledOnce();
    expect(result.name).toBe('Sofia');
  });

  it('throws ZodError for empty name', async () => {
    const children: IChildRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      getMeasurements: vi.fn(),
      addMeasurement: vi.fn(),
    };

    const useCase = new RegisterChild(children);
    await expect(
      useCase.execute({ name: '', birthDate: '2024-03-15', birthWeightG: 3200, birthHeightCm: 49 }),
    ).rejects.toThrow();
    expect(children.create).not.toHaveBeenCalled();
  });
});
