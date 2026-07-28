import type { ChildInlineFormValues } from '@babyclothes/design-system';
import type { CreateChildInput } from '$lib/domain/child/schemas';

export type ChildFormData = ChildInlineFormValues & {
  birthDate?: string;
};

export function mapChildFormToCreateChildInput(
  data: ChildFormData,
  now: Date = new Date(),
): CreateChildInput {
  const ageMonths = data.ageMonths ? parseInt(data.ageMonths, 10) : undefined;

  return {
    name: data.name,
    ageMonths,
    birthDate: data.birthDate ?? deriveBirthDateFromAgeMonths(ageMonths, now),
    currentHeightCm: data.currentHeightCm ? parseFloat(data.currentHeightCm) : undefined,
    currentWeightG: data.currentWeightKg
      ? Math.round(parseFloat(data.currentWeightKg) * 1000)
      : undefined,
    birthHeightCm: data.birthHeightCm ? Math.round(parseFloat(data.birthHeightCm)) : 0,
    birthWeightG: data.birthWeightG ? parseInt(data.birthWeightG, 10) : 0,
  };
}

function deriveBirthDateFromAgeMonths(
  ageMonths: number | undefined,
  now: Date,
): string | undefined {
  if (ageMonths === undefined) return undefined;

  const firstOfReferenceMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  firstOfReferenceMonth.setMonth(firstOfReferenceMonth.getMonth() - ageMonths);

  const year = firstOfReferenceMonth.getFullYear();
  const month = String(firstOfReferenceMonth.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}
