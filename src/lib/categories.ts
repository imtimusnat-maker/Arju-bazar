import type { Timestamp } from 'firebase/firestore';

export type Subcategory = {
  id: string;
  name: string;
  name_bn?: string;
  slug: string;
  categoryId: string;
  categorySlug?: string;
  imageUrl?: string;
  imageCdnUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  searchKeywords?: string;
};

export type Category = {
  id: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  slug: string;
  imageUrl?: string;
  imageCdnUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  searchKeywords?: string;
};

    

    