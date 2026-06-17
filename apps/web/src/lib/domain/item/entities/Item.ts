export type ItemStatus = 'active' | 'sold' | 'paused';
export type ItemGender = 'male' | 'female' | 'unisex';

export type Item = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  gender: ItemGender;
  clothingSize: string;
  condition: 'new' | 'like_new' | 'used';
  priceCents: number;
  status: ItemStatus;
  photoUrls: string[];
};
