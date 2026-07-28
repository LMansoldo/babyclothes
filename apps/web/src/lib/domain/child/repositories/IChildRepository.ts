import type { Child } from '../entities/Child';
import type { GrowthRecord } from '../entities/GrowthRecord';
import type { CreateChildInput, MeasurementInput } from '../schemas';

export type { CreateChildInput, MeasurementInput };

export interface IChildRepository {
  create(data: CreateChildInput): Promise<Child>;
  findAll(userId: string): Promise<Child[]>;
  findById(id: string): Promise<Child>;
  getMeasurements(childId: string): Promise<GrowthRecord[]>;
  addMeasurement(childId: string, data: MeasurementInput): Promise<GrowthRecord>;
}
