import type { Timestamp } from 'firebase/firestore';

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  imageUrl?: string;
  imageCdnUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  slug: string;
  imageUrl?: string;
  imageCdnUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
