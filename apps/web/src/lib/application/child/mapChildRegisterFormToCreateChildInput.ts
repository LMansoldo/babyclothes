import type { CreateChildInput } from '$lib/domain/child/schemas';

export interface ChildRegisterFormFields {
  name: string;
  document: string;
  birthDate: string; // from <input type="date"> → YYYY-MM-DD
  weight: string; // birth weight in grams
  height: string; // birth height in cm
}

/**
 * Maps the `/child/register` form fields to a `CreateChildInput`.
 * The form's weight/height are birth values; height is rounded to an
 * integer because the API `birth_height_cm` field is an integer.
 */
export function mapChildRegisterFormToCreateChildInput(
  fields: ChildRegisterFormFields,
): CreateChildInput {
  return {
    name: fields.name,
    birthDate: fields.birthDate,
    document: fields.document ? fields.document : undefined,
    birthWeightG: fields.weight ? parseInt(fields.weight, 10) : 0,
    birthHeightCm: fields.height ? Math.round(parseFloat(fields.height)) : 0,
  };
}
