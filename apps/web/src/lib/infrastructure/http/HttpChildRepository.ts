import { PUBLIC_API_URL } from '$lib/env';
import type {
  IChildRepository,
  CreateChildInput,
  MeasurementInput,
} from '$lib/domain/child/repositories/IChildRepository';
import type { Child } from '$lib/domain/child/entities/Child';
import type { GrowthRecord } from '$lib/domain/child/entities/GrowthRecord';
import { getAuthToken, getUserId } from './HttpAuthRepository';

export class HttpChildRepository implements IChildRepository {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = PUBLIC_API_URL;
  }

  private authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async create(data: CreateChildInput): Promise<Child> {
    const res = await fetch(`${this.baseUrl}/children`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({
        name: data.name,
        birth_date: data.birthDate,
        birth_weight_g: data.birthWeightG,
        birth_height_cm: data.birthHeightCm,
        document: data.document,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Create child failed: ${res.status}`);
    }

    const { child } = (await res.json()) as { child: ApiChildDTO };
    return mapChild(child);
  }

  async findAll(): Promise<Child[]> {
    const userId = getUserId();
    if (!userId) throw new Error('Not authenticated — cannot fetch children');

    const res = await fetch(`${this.baseUrl}/users/${userId}/children`, {
      headers: this.authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Fetch children failed: ${res.status}`);
    }

    const { children } = (await res.json()) as { children: ApiChildDTO[] };
    return children.map(mapChild);
  }

  async findById(id: string): Promise<Child> {
    const res = await fetch(`${this.baseUrl}/children/${id}`, {
      headers: this.authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Child ${id} not found: ${res.status}`);
    }

    const { child } = (await res.json()) as { child: ApiChildDTO };
    return mapChild(child);
  }

  async getMeasurements(childId: string): Promise<GrowthRecord[]> {
    const res = await fetch(`${this.baseUrl}/children/${childId}/measurements`, {
      headers: this.authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Fetch measurements for child ${childId} failed: ${res.status}`);
    }

    const { measurements } = (await res.json()) as { measurements: ApiMeasurementDTO[] };
    return measurements.map(mapMeasurement);
  }

  async addMeasurement(childId: string, data: MeasurementInput): Promise<GrowthRecord> {
    const res = await fetch(`${this.baseUrl}/children/${childId}/measurements`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({
        weight_g: data.weightG,
        height_cm: data.heightCm,
        clothing_size: data.clothingSize,
        recorded_at: data.recordedAt,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? `Add measurement failed: ${res.status}`);
    }

    const { measurement } = (await res.json()) as { measurement: ApiMeasurementDTO };
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
