import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const featuredProducts = [
  { id: '1', name: "Ashwagandha Powder", price: 1200.00, image: PlaceHolderImages.find(i => i.id === 'product-1')!, slug: 'ashwagandha-powder' },
  { id: '2', name: 'Glarvest Himalaya...', price: 750.00, image: PlaceHolderImages.find(i => i.id === 'product-2')!, slug: 'glarvest-himalayan' },
  { id: '3', name: 'Glarvest Organic Ex...', price: 2500.00, image: PlaceHolderImages.find(i => i.id === 'product-3')!, slug: 'glarvest-organic-ex' },
  { id: '4', name: 'African Organic Wil...', price: 2500.00, image: PlaceHolderImages.find(i => i.id === 'product-4')!, slug: 'african-organic-wild' },
  { id: '5', name: "Elegant Men's Watch", price: 120.00, image: PlaceHolderImages.find(i => i.id === 'hero-3')!, slug: 'elegant-mens-watch' },
  { id: '6', name: 'Summer Floral Dress', price: 75.50, image: PlaceHolderImages.find(i => i.id === 'hero-1')!, slug: 'summer-floral-dress' },
];


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
