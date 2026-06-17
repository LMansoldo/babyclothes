import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord';

export type GrowthCurvePoint = {
  date: Date;
  clothingSize: string;
};

export class ComputeGrowthCurve {
  execute(records: GrowthRecord[]): GrowthCurvePoint[] {
    return [...records]
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      .map((r) => ({
        date: r.recordedAt,
        clothingSize: r.clothingSize,
      }));
  }
}
