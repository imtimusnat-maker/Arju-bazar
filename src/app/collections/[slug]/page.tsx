'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { categories } from '@/lib/categories';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="mb-6 text-center font-headline text-2xl font-bold">{category.name}</h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {category.subcategories.map((subcategory) => {
              const subcategoryImage = PlaceHolderImages.find((i) => i.id === subcategory.imageId);
              return (
                <Link key={subcategory.name} href={`/collections/${category.slug}/${subcategory.slug}`} className="group block">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-all duration-300 group-hover:shadow-md">
                    {subcategoryImage && (
                      <Image
                        src={subcategoryImage.imageUrl}
                        alt={subcategoryImage.description}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 20vw"
                        data-ai-hint={subcategoryImage.imageHint}
                      />
                    )}
                  </div>
                  <h3 className="mt-2 text-center font-body text-sm leading-tight">{subcategory.name}</h3>
                  <p className="text-center text-xs text-muted-foreground">{subcategory.itemCount} items</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
