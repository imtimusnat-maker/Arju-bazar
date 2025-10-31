import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { products } from '@/lib/products';

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
