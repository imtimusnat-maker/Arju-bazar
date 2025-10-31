'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Category, Subcategory } from '@/lib/categories';

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const firestore = useFirestore();

  const categoryQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'categories'), where('slug', '==', params.slug), limit(1));
  }, [firestore, params.slug]);

  const { data: categoryData, isLoading: isCategoryLoading } = useCollection<Category>(categoryQuery);
  const category = categoryData?.[0];

  const subcategoriesQuery = useMemoFirebase(() => {
    if (!firestore || !category) return null;
    return query(collection(firestore, 'subcategories'), where('categoryId', '==', category.id));
  }, [firestore, category]);

  const { data: subcategories, isLoading: areSubcategoriesLoading } = useCollection<Subcategory>(subcategoriesQuery);

  if (isCategoryLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 text-center py-20">Loading...</main>
        <Footer />
      </div>
    );
  }

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
            {areSubcategoriesLoading ? (
               Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                   <div className="relative aspect-square bg-gray-100 rounded-lg"></div>
                   <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
                </div>
              ))
            ) : (
              subcategories?.map((subcategory) => (
                <Link key={subcategory.id} href={`/collections/${category.slug}/${subcategory.slug}`} className="group block">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-all duration-300 group-hover:shadow-md">
                    {subcategory.imageCdnUrl ? (
                        <Image
                            src={subcategory.imageCdnUrl}
                            alt={subcategory.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 20vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100"></div>
                    )}
                  </div>
                  <h3 className="mt-2 text-center font-body text-sm leading-tight">{subcategory.name}</h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
