'use client';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { Timestamp } from 'firebase/firestore';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  stockQuantity: number;
  originalPrice?: number;
  imageUrl: string;
  imageCdnUrl: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
};

export const products: Product[] = [];
