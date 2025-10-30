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
];


export default function Home() {
  const heroImage = PlaceHolderImages.find(i => i.id === 'hero-4');
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {heroImage && (
          <div className="container mx-auto max-w-screen-xl px-4 py-4">
              <div className="relative w-full aspect-[2/1] md:aspect-[3/1] rounded-lg overflow-hidden">
                  <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      fill
                      className="object-cover"
                      data-ai-hint={heroImage.imageHint}
                  />
              </div>
          </div>
        )}
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h2 className="text-center text-2xl font-headline font-bold mb-6">ALL PRODUCT</h2>
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
