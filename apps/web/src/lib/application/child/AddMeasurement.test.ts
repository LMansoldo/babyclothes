import { describe, it, expect, vi } from 'vitest';
import { AddMeasurement } from './AddMeasurement';
import type { IChildRepository } from '$lib/domain/child/repositories/IChildRepository';
import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord';

describe('AddMeasurement', () => {
  const mockRecord: GrowthRecord = {
    id: 'rec-1',
    childId: 'child-1',
    recordedAt: new Date('2026-01-15T10:00:00Z'),
    weightG: 7800,
    heightCm: 68,
    clothingSize: 'M',
  };

  it('validates and adds measurement', async () => {
    const children: IChildRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      getMeasurements: vi.fn(),
      addMeasurement: vi.fn().mockResolvedValue(mockRecord),
    };

    const useCase = new AddMeasurement(children);
    const result = await useCase.execute('child-1', {
      weightG: 7800,
      heightCm: 68,
      clothingSize: 'M',
    });

    expect(children.addMeasurement).toHaveBeenCalledWith('child-1', {
      weightG: 7800,
      heightCm: 68,
      clothingSize: 'M',
    });
    expect(result.clothingSize).toBe('M');
  });

  it('throws ZodError for invalid clothingSize', async () => {
    const children: IChildRepository = {
      create: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      getMeasurements: vi.fn(),
      addMeasurement: vi.fn(),
    };

    const useCase = new AddMeasurement(children);
    await expect(
      useCase.execute('child-1', { weightG: 7800, heightCm: 68, clothingSize: 'XL' }),
    ).rejects.toThrow();
    expect(children.addMeasurement).not.toHaveBeenCalled();
  });
});
