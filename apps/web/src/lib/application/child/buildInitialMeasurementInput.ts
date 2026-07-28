import type { CreateChildInput, MeasurementInput } from '$lib/domain/child/schemas';

export function buildInitialMeasurementInput(
  input: CreateChildInput,
  now: Date = new Date(),
): MeasurementInput | null {
  if (input.currentWeightG === undefined && input.currentHeightCm === undefined) {
    return null;
  }

  return {
    weightG: input.currentWeightG ?? 0,
    heightCm: Math.round(input.currentHeightCm ?? 0),
    recordedAt: now.toISOString(),
  };
}
