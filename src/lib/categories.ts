import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export type Subcategory = {
  name: string;
  slug: string;
  imageId: string;
  itemCount: number;
};

export type Category = {
  name: string;
  href: string;
  slug: string;
  imageId: string;
  subcategories: Subcategory[];
};

export const categories: Category[] = [
  {
    name: 'Men Collections',
    href: '/collections/men',
    slug: 'men',
    imageId: 'cat-men',
    subcategories: [
      { name: 'Panjabi', slug: 'panjabi', imageId: 'subcat-panjabi', itemCount: 12 },
      { name: 'Shirt', slug: 'shirt', imageId: 'subcat-shirt', itemCount: 25 },
      { name: 'T-shirt', slug: 't-shirt', imageId: 'subcat-t-shirt', itemCount: 40 },
      { name: 'Shoes', slug: 'shoes', imageId: 'subcat-shoes', itemCount: 8 },
    ],
  },
  {
    name: 'Women Collection',
    href: '/collections/women',
    slug: 'women',
    imageId: 'cat-women',
    subcategories: [
        { name: 'Saree', slug: 'saree', imageId: 'subcat-saree', itemCount: 30 },
        { name: 'Kurti', slug: 'kurti', imageId: 'subcat-kurti', itemCount: 22 },
        { name: 'Handbag', slug: 'handbag', imageId: 'subcat-handbag', itemCount: 15 },
    ]
  },
  {
    name: 'Kids Collections',
    href: '/collections/kids',
    slug: 'kids',
    imageId: 'cat-kids',
    subcategories: []
  },
  {
    name: '3D Waterproof Bedsheet',
    href: '/collections/bedsheets',
    slug: 'bedsheets',
    imageId: 'cat-bedsheet',
    subcategories: []
  },
  {
    name: 'Furniture Collection',
    href: '/collections/furniture',
    slug: 'furniture',
    imageId: 'cat-furniture',
    subcategories: []
  },
];
