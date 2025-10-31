'use client';

import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/products';
import { categories } from '@/lib/categories';

export default function SubCategoryPage({ params }: { params: { slug: string, subSlug: string } }) {
  const category = categories.find((c) => c.slug === params.slug);
  const subcategory = category?.subcategories.find((sc) => sc.slug === params.subSlug);

  if (!subcategory) {
    notFound();
  }

  // TODO: Filter products by subcategory once data is available
  const subcategoryProducts = products;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="mb-6 text-center font-headline text-2xl font-bold">{subcategory.name}</h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {subcategoryProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
