export type Child = {
  id: string;
  userId: string;
  document: string | undefined;
  name: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  birthWeightG: number;
  birthHeightCm: number;
};
