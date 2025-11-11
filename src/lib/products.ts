
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  name_bn?: string;
  price: number;
  description: string;
  description_bn?: string;
  stockQuantity: number;
  originalPrice?: number;
  size?: string;
  age?: string;
  imageUrl: string;
  imageCdnUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  slug: string;
  categoryId: string;
  categorySlug: string;
  subcategoryId?: string;
  searchKeywords?: string[];
};

    