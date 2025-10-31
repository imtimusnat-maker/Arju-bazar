'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const firestore = useFirestore();

  // Query products where keywords array contains the search query (case-insensitive)
  // Firestore doesn't support case-insensitive 'array-contains' directly,
  // so we store keywords in lowercase.
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !q) return null;
    return query(
      collection(firestore, 'products'),
      where('keywords', 'array-contains', q.toLowerCase())
    );
  }, [firestore, q]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h1 className="mb-6 text-center font-headline text-2xl font-bold">
                Search Results for "{q}"
            </h1>
            {isLoading ? (
                <div className="text-center">Loading products...</div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    No products found matching your search.
                </div>
            )}
        </div>
    </div>
  );
}


export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center py-20">Loading search...</div>}>
            <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
