'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import type { Category } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import { collection, doc } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';

export default function Home() {
  const defaultHeroImage = PlaceHolderImages.find(i => i.id === 'hero-4');
  const { language, t } = useLanguage();
  const firestore = useFirestore();

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesCollection);

  const settingsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'global') : null),
    [firestore]
  );
  const { data: settings, isLoading: settingsLoading } = useDoc<Settings>(settingsDocRef);

  const heroImage = settings?.heroImageCdnUrl ? {
    imageUrl: settings.heroImageCdnUrl,
    description: 'Homepage hero banner',
    imageHint: 'hero banner'
  } : defaultHeroImage;


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {(settingsLoading || heroImage) && (
          <div className="container mx-auto max-w-screen-xl px-4 py-4">
              <div className="relative w-full aspect-[2/1] md:aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                  {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                        priority
                    />
                  )}
              </div>
          </div>
        )}
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h2 className="text-center text-2xl font-headline font-bold mb-6">{t('home.allCategories')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {categoriesLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                     <div className="relative aspect-square bg-gray-100 rounded-lg"></div>
                     <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
                  </div>
                ))
              ) : (
                categories?.map((category) => {
                  const displayName = language === 'bn' && category.name_bn ? category.name_bn : category.name;
                  return (
                    <Link key={category.id} href={`/collections/${category.slug}`} className="block group">
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
                  )
                })
              )}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
