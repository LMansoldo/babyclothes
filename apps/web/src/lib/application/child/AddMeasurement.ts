import type {
  IChildRepository,
  MeasurementInput,
} from '$lib/domain/child/repositories/IChildRepository';
import { MeasurementInputSchema } from '$lib/domain/child/schemas';
import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord';

export class AddMeasurement {
  constructor(private readonly children: IChildRepository) {}

  async execute(childId: string, data: MeasurementInput): Promise<GrowthRecord> {
    MeasurementInputSchema.parse(data);
    return this.children.addMeasurement(childId, data);
  }
}
