'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import type { Category } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { X, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';


function WelcomeBanner({ message }: { message: string }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenBanner = localStorage.getItem('hasSeenWelcomeBanner');
        if (!hasSeenBanner) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('hasSeenWelcomeBanner', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-primary text-primary-foreground relative">
            <div className="container mx-auto max-w-screen-xl px-4 py-2 text-center text-sm">
                <Megaphone className="inline-block h-4 w-4 mr-2" />
                {message}
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 hover:bg-primary/20"
                onClick={handleDismiss}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
            </Button>
        </div>
    );
}

function CategoryCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="relative aspect-square bg-gray-100 rounded-lg" />
      <Skeleton className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto" />
    </div>
  );
}


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
  )
}

export default function Home() {
  const defaultHeroImage = PlaceHolderImages.find(i => i.id === 'hero-4');
  const { t } = useLanguage();
  const firestore = useFirestore();

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'categories'), orderBy('displayOrder', 'asc')) : null),
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
      {settings?.welcomeMessage && <WelcomeBanner message={settings.welcomeMessage} />}
      <main className="flex-1 pb-20 md:pb-0">
        {(settingsLoading || heroImage) && (
          <div className="container mx-auto max-w-screen-xl px-4 py-4">
              <div className="relative w-full aspect-[2/1] md:aspect-[3/1] rounded-lg overflow-hidden bg-gray-100">
                  {heroImage ? (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                        priority
                    />
                  ) : <Skeleton className="w-full h-full" />}
              </div>
          </div>
        )}
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h2 className="text-center text-2xl font-headline font-bold mb-6">{t('home.allCategories')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {categoriesLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <CategoryCardSkeleton key={index} />
                ))
              ) : (
                categories?.map((category) => <CategoryCard key={category.id} category={category} />)
              )}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
