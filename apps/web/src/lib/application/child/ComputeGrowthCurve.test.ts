import { describe, it, expect } from 'vitest'
import { ComputeGrowthCurve } from './ComputeGrowthCurve'
import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord'

describe('ComputeGrowthCurve', () => {
  const records: GrowthRecord[] = [
    {
      id: 'r-3',
      childId: 'c-1',
      recordedAt: new Date('2026-03-01'),
      weightG: 9000,
      heightCm: 74,
      clothingSize: 'G',
    },
    {
      id: 'r-1',
      childId: 'c-1',
      recordedAt: new Date('2026-01-01'),
      weightG: 6500,
      heightCm: 64,
      clothingSize: 'P',
    },
    {
      id: 'r-2',
      childId: 'c-1',
      recordedAt: new Date('2026-02-01'),
      weightG: 7800,
      heightCm: 68,
      clothingSize: 'M',
    },
  ]

  it('returns points ordered by date ascending', () => {
    const useCase = new ComputeGrowthCurve()
    const curve = useCase.execute(records)

    expect(curve).toHaveLength(3)
    expect(curve[0].clothingSize).toBe('P')
    expect(curve[1].clothingSize).toBe('M')
    expect(curve[2].clothingSize).toBe('G')
  })

  it('maps each record to { date, clothingSize }', () => {
    const useCase = new ComputeGrowthCurve()
    const curve = useCase.execute(records)

    expect(curve[0]).toEqual({
      date: new Date('2026-01-01'),
      clothingSize: 'P',
    })
  })

  it('returns empty array for empty input', () => {
    const useCase = new ComputeGrowthCurve()
    expect(useCase.execute([])).toEqual([])
  })

  it('handles single record', () => {
    const useCase = new ComputeGrowthCurve()
    const curve = useCase.execute([records[0]])
    expect(curve).toHaveLength(1)
  })
})
