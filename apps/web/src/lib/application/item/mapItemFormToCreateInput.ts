import type { CreateItemInput } from '$lib/domain/item/repositories/IItemRepository';

export type ItemFormData = {
  title: string;
  category: string;
  size: string;
  condition: string;
  gender: string;
  photos: File[];
  price: number;
  description: string;
};

export function mapItemFormToCreateInput(data: ItemFormData): CreateItemInput {
  return {
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    gender: data.gender as CreateItemInput['gender'],
    clothingSize: data.size,
    condition: data.condition as CreateItemInput['condition'],
    priceCents: Math.round(data.price * 100),
    photos: data.photos,
  };
}
