'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { useLanguage } from '@/context/language-context';
import { Skeleton } from '@/components/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <div className="space-y-2 border border-gray-200 rounded-lg p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export default function AllProductsPage() {
  const firestore = useFirestore();
  const { t } = useLanguage();

  const productsCollection = useMemo(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsCollection);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="mb-6 text-center font-headline text-2xl font-bold">{t('collections.allProducts')}</h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : (
              products?.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
