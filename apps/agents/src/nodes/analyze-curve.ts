/**
 * analyzeCurve — Analyzes child's growth measurements to determine trend.
 *
 * Calculates:
 * - Weight velocity (g/day)
 * - Height velocity (cm/day)
 * - Current size fit
 * - WHO percentile reference
 */

import type { GrowthState, GrowthTrend, Measurement } from '../types.js';

const SIZE_THRESHOLDS: Record<string, { maxWeight: number; maxHeight: number }> = {
  RN: { maxWeight: 3500, maxHeight: 50 },
  P: { maxWeight: 6000, maxHeight: 65 },
  M: { maxWeight: 8000, maxHeight: 72 },
  G: { maxWeight: 10000, maxHeight: 80 },
  GG: { maxWeight: 12000, maxHeight: 86 },
  '1': { maxWeight: 14000, maxHeight: 92 },
  '2': { maxWeight: 16000, maxHeight: 98 },
  '3': { maxWeight: 18000, maxHeight: 104 },
  '4': { maxWeight: 20000, maxHeight: 110 },
  '5': { maxWeight: 22000, maxHeight: 116 },
  '6': { maxWeight: 24000, maxHeight: 122 },
};

function calculateVelocity(measurements: Measurement[], field: 'weight_g' | 'height_cm'): number {
  if (measurements.length < 2) return 0;

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const valueDiff = (last[field] || 0) - (first[field] || 0);
  const timeDiff =
    (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime()) /
    (1000 * 60 * 60 * 24); // days

  if (timeDiff === 0) return 0;
  return valueDiff / timeDiff;
}

function getCurrentSize(measurements: Measurement[]): string {
  if (measurements.length === 0) return 'RN';

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );

  return sorted[0].clothing_size || 'RN';
}

function assessFit(measurements: Measurement[]): 'tight' | 'good' | 'loose' {
  if (measurements.length === 0) return 'good';

  const sorted = [...measurements].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );

  const latest = sorted[0];
  const currentSize = latest.clothing_size || 'RN';
  const thresholds = SIZE_THRESHOLDS[currentSize];

  if (!thresholds) return 'good';

  const weightRatio = (latest.weight_g || 0) / thresholds.maxWeight;
  const heightRatio = (latest.height_cm || 0) / thresholds.maxHeight;
  const avgRatio = (weightRatio + heightRatio) / 2;

  if (avgRatio > 0.9) return 'tight';
  if (avgRatio < 0.6) return 'loose';
  return 'good';
}

export async function analyzeCurve(state: GrowthState): Promise<Partial<GrowthState>> {
  try {
    const measurements = state.measurements;

    if (measurements.length === 0) {
      return {
        trend: {
          weight_velocity: 0,
          height_velocity: 0,
          current_size: 'RN',
          size_fit: 'good',
        },
      };
    }

    const trend: GrowthTrend = {
      weight_velocity: calculateVelocity(measurements, 'weight_g'),
      height_velocity: calculateVelocity(measurements, 'height_cm'),
      current_size: getCurrentSize(measurements),
      size_fit: assessFit(measurements),
    };

    return { trend };
  } catch (error) {
    console.error('analyzeCurve error:', error);
    return {
      trend: {
        weight_velocity: 0,
        height_velocity: 0,
        current_size: 'RN',
        size_fit: 'good',
      },
    };
  }
}
