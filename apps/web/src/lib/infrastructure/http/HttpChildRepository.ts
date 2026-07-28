import type {
  IChildRepository,
  CreateChildInput,
  MeasurementInput,
} from '$lib/domain/child/repositories/IChildRepository';
import type { Child } from '$lib/domain/child/entities/Child';
import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord';
import { httpClient } from './httpClient';

export class HttpChildRepository implements IChildRepository {
  async create(data: CreateChildInput): Promise<Child> {
    const body: Record<string, unknown> = {
      name: data.name,
      birth_weight_g: data.birthWeightG,
      birth_height_cm: data.birthHeightCm,
      document: data.document,
    };
    if (data.birthDate) body.birth_date = data.birthDate;
    if (data.ageMonths !== undefined) body.age_months = data.ageMonths;
    if (data.currentWeightG !== undefined) body.current_weight_g = data.currentWeightG;
    if (data.currentHeightCm !== undefined) body.current_height_cm = data.currentHeightCm;

    const { child } = await httpClient.post<{ child: ApiChildDTO }>('/children', body);
    return mapChild(child);
  }

  async findAll(userId: string): Promise<Child[]> {
    const { children } = await httpClient.get<{ children: ApiChildDTO[] }>(
      `/users/${userId}/children`
    );
    return children.map(mapChild);
  }

  async findById(id: string): Promise<Child> {
    const { child } = await httpClient.get<{ child: ApiChildDTO }>(`/children/${id}`);
    return mapChild(child);
  }

  async getMeasurements(childId: string): Promise<GrowthRecord[]> {
    const { measurements } = await httpClient.get<{ measurements: ApiMeasurementDTO[] }>(
      `/children/${childId}/measurements`
    );
    return measurements.map(mapMeasurement);
  }

  async addMeasurement(childId: string, data: MeasurementInput): Promise<GrowthRecord> {
    const { measurement } = await httpClient.post<{ measurement: ApiMeasurementDTO }>(
      `/children/${childId}/measurements`,
      {
        weight_g: data.weightG,
        height_cm: data.heightCm,
        clothing_size: data.clothingSize,
        recorded_at: data.recordedAt,
      }
    );
    return mapMeasurement(measurement);
  }
}

type ApiChildDTO = {
  id: string;
  user_id: string;
  name: string;
  document?: string;
  birth_date: string;
  gender: 'male' | 'female';
  birth_weight_g: number;
  birth_height_cm: number;
};

type ApiMeasurementDTO = {
  id: string;
  child_id: string;
  recorded_at: string;
  weight_g: number;
  height_cm: number;
  clothing_size: string;
};

function mapChild(dto: ApiChildDTO): Child {
  return {
    id: dto.id,
    userId: dto.user_id,
    name: dto.name,
    document: dto.document,
    birthDate: new Date(dto.birth_date),
    gender: dto.gender,
    birthWeightG: dto.birth_weight_g,
    birthHeightCm: dto.birth_height_cm,
  };
}

function mapMeasurement(dto: ApiMeasurementDTO): GrowthRecord {
  return {
    id: dto.id,
    childId: dto.child_id,
    recordedAt: new Date(dto.recorded_at),
    weightG: dto.weight_g,
    heightCm: dto.height_cm,
    clothingSize: dto.clothing_size,
  };
}
