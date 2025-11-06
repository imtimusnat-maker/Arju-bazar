'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/categories';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';


function CategoryCard({ category }: { category: Category }) {
  const displayName = useTranslation(category.name);

  return (
    <Link href={`/collections/${category.slug}`} className="block group">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
        {category.imageCdnUrl && (
          <Image
            src={category.imageCdnUrl}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        )}
      </div>
      <h3 className="font-body text-sm text-center leading-tight mt-2">{displayName}</h3>
    </Link>
  );
}


export default function CollectionsPage() {
  const firestore = useFirestore();
  const { t } = useLanguage();

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading } = useCollection<Category>(categoriesCollection);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
          <h1 className="text-center text-2xl font-headline font-bold mb-6">{t('collections.allCategories')}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                     <div className="relative aspect-square bg-gray-100 rounded-lg"></div>
                     <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
                  </div>
                ))
              ) : (categories?.map((category) => (
                  <CategoryCard key={category.id} category={category} />
              )))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
