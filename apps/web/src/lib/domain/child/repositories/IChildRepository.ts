import type { Child } from '../entities/Child';
import type { GrowthRecord } from '../entities/GrowthRecord';

export type CreateChildInput = {
  name: string;
  birthDate: string; // ISO 8601 date string (YYYY-MM-DD)
  birthWeightG: number;
  birthHeightCm: number;
};

export type MeasurementInput = {
  weightG: number;
  heightCm: number;
  clothingSize: string;
  recordedAt?: string; // ISO 8601, optional — default: now
};

export interface IChildRepository {
  create(data: CreateChildInput): Promise<Child>;
  findAll(): Promise<Child[]>;
  findById(id: string): Promise<Child>;
  addMeasurement(childId: string, data: MeasurementInput): Promise<GrowthRecord>;
}
