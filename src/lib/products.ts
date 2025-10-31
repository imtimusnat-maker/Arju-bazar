import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: ImagePlaceholder;
  slug: string;
};

export const products: Product[] = [
  { id: '1', name: "Ashwagandha Powder", price: 1200.00, image: PlaceHolderImages.find(i => i.id === 'product-1')!, slug: 'ashwagandha-powder' },
  { id: '2', name: 'Glarvest Himalaya...', price: 750.00, image: PlaceHolderImages.find(i => i.id === 'product-2')!, slug: 'glarvest-himalayan' },
  { id: '3', name: 'Glarvest Organic Ex...', price: 2500.00, image: PlaceHolderImages.find(i => i.id === 'product-3')!, slug: 'glarvest-organic-ex' },
  { id: '4', name: 'African Organic Wil...', price: 2500.00, image: PlaceHolderImages.find(i => i.id === 'product-4')!, slug: 'african-organic-wild' },
  { id: '5', name: "New Product", price: 1500.00, image: PlaceHolderImages.find(i => i.id === 'product-1')!, slug: 'new-product' },
];
