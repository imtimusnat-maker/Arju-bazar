'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { useLanguage } from '@/context/language-context';

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
          {isLoading ? (
             <div className="text-center">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
              {products?.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
