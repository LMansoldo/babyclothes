/**
 * predictSize — Predicts when the child will need the next clothing size.
 *
 * Uses growth velocity and current size thresholds to estimate
 * when the child will outgrow their current size.
 */

import type { GrowthState, SizePrediction } from '../types.js';

const SIZE_ORDER = ['RN', 'P', 'M', 'G', 'GG', '1', '2', '3', '4', '5', '6'];

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

function getNextSize(currentSize: string): string | undefined {
  const idx = SIZE_ORDER.indexOf(currentSize);
  if (idx === -1 || idx === SIZE_ORDER.length - 1) return undefined;
  return SIZE_ORDER[idx + 1];
}

function getLatestMeasurement(measurements: GrowthState['measurements']) {
  if (measurements.length === 0) return null;

  return [...measurements].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  )[0];
}

export async function predictSize(state: GrowthState): Promise<Partial<GrowthState>> {
  try {
    const { trend } = state;

    if (!trend) {
      return {
        prediction: {
          predicted_size: 'P',
          confidence: 0,
          days_until_needed: -1,
        },
      };
    }

    const nextSize = getNextSize(trend.current_size);

    if (!nextSize) {
      return {
        prediction: {
          predicted_size: trend.current_size,
          confidence: 100,
          days_until_needed: -1, // Already at max size
        },
      };
    }

    const nextThresholds = SIZE_THRESHOLDS[nextSize];
    const latest = getLatestMeasurement(state.measurements);

    if (!latest || !nextThresholds) {
      return {
        prediction: {
          predicted_size: nextSize,
          confidence: 50,
          days_until_needed: 30, // Default estimate
        },
      };
    }

    // Calculate days until weight threshold
    let daysByWeight = Infinity;
    if (trend.weight_velocity > 0 && latest.weight_g) {
      const weightRemaining = nextThresholds.maxWeight - latest.weight_g;
      daysByWeight = weightRemaining / trend.weight_velocity;
    }

    // Calculate days until height threshold
    let daysByHeight = Infinity;
    if (trend.height_velocity > 0 && latest.height_cm) {
      const heightRemaining = nextThresholds.maxHeight - latest.height_cm;
      daysByHeight = heightRemaining / trend.height_velocity;
    }

    // Use the minimum (whichever threshold will be reached first)
    const daysUntilNeeded = Math.max(0, Math.min(daysByWeight, daysByHeight));

    // Confidence based on data points
    const dataPoints = state.measurements.length;
    const confidence = Math.min(95, 30 + dataPoints * 15);

    return {
      prediction: {
        predicted_size: nextSize,
        confidence,
        days_until_needed: Math.round(daysUntilNeeded),
      },
    };
  } catch (error) {
    console.error('predictSize error:', error);
    return {
      prediction: {
        predicted_size: 'P',
        confidence: 0,
        days_until_needed: -1,
      },
    };
  }
}
