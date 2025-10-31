'use client';

import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Category, Subcategory } from '@/lib/categories';
import type { Product } from '@/lib/products';

export default function SubCategoryPage() {
  const params = useParams<{ slug: string; subSlug: string }>();
  const firestore = useFirestore();

  // 1. Fetch Category by slug
  const categoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), where('slug', '==', params.slug), limit(1));
  }, [firestore, params.slug]);
  const { data: categoryData, isLoading: categoryLoading } = useCollection<Category>(categoryQuery);
  const category = categoryData?.[0];

  // 2. Fetch Subcategory by slug
  const subcategoryQuery = useMemoFirebase(() => {
    if (!firestore || !category) return null;
    return query(collection(firestore, `categories/${category.id}/subcategories`), where('slug', '==', params.subSlug), limit(1));
  }, [firestore, category, params.subSlug]);
  const { data: subcategoryData, isLoading: subcategoryLoading } = useCollection<Subcategory>(subcategoryQuery);
  const subcategory = subcategoryData?.[0];
  
  // 3. Fetch products for the subcategory
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !subcategory) return null;
    return query(collection(firestore, 'products'), where('subcategoryId', '==', subcategory.id));
  }, [firestore, subcategory]);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);


  if (categoryLoading || subcategoryLoading) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          <main className="flex-1 text-center py-20">Loading...</main>
          <Footer />
        </div>
      );
  }

  if (!category || !subcategory) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="mb-6 text-center font-headline text-2xl font-bold">{subcategory.name}</h1>
          {productsLoading ? (
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
