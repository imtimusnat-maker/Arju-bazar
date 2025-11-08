'use client';

import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, and } from 'firebase/firestore';
import type { Subcategory } from '@/lib/categories';
import type { Product } from '@/lib/products';
import { useTranslation } from '@/hooks/use-translation';
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

export default function SubCategoryPage() {
  const params = useParams<{ slug: string; subSlug: string }>();
  const firestore = useFirestore();

  // 1. Fetch Subcategory by slug and categorySlug
  const subcategoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'subcategories'), 
      and(
        where('slug', '==', params.subSlug),
        where('categorySlug', '==', params.slug)
      ),
      limit(1)
    );
  }, [firestore, params.slug, params.subSlug]);
  const { data: subcategoryData, isLoading: subcategoryLoading } = useCollection<Subcategory>(subcategoryQuery);
  const subcategory = subcategoryData?.[0];

  const displaySubcategoryName = useTranslation(subcategory?.name);
  
  // 2. Fetch products for the subcategory
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !subcategory) return null;
    return query(collection(firestore, 'products'), where('subcategoryId', '==', subcategory.id));
  }, [firestore, subcategory]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);


  if (subcategoryLoading) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1 text-center py-20">Loading...</main>
          <Footer />
        </div>
      );
  }

  // Only show 404 if the subcategory itself is not found after loading.
  if (!subcategory) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="mb-6 text-center font-headline text-2xl font-bold">{displaySubcategoryName}</h1>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {productsLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : products && products.length > 0 ? (
              products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
                <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No products found in this subcategory.</p>
                </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
