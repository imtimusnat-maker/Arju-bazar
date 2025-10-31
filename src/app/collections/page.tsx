import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const categories = [
    { name: 'Men Collections', href: '/collections/men', imageId: 'cat-men' },
    { name: 'Women Collection', href: '/collections/women', imageId: 'cat-women' },
    { name: 'Kids Collections', href: '/collections/kids', imageId: 'cat-kids' },
    { name: '3D Waterproof Bedsheet', href: '/collections/bedsheets', imageId: 'cat-bedsheet' },
    { name: 'Furniture Collection', href: '/collections/furniture', imageId: 'cat-furniture' },
];

export default function CollectionsPage() {
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container mx-auto max-w-screen-xl px-4 py-8">
            <h1 className="text-center text-2xl font-headline font-bold mb-6">All Categories</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {categories.map((category) => {
                const categoryImage = PlaceHolderImages.find(i => i.id === category.imageId);
                return (
                    <Link key={category.name} href={category.href} className="block group">
                        <div className="relative aspect-square bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-md">
                           {categoryImage && (
                             <Image
                                src={categoryImage.imageUrl}
                                alt={categoryImage.description}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 20vw"
                                data-ai-hint={categoryImage.imageHint}
                            />
                           )}
                        </div>
                        <h3 className="font-body text-sm text-center leading-tight mt-2">{category.name}</h3>
                    </Link>
                );
              })}
            </div>
          </div>
      </main>
      <Footer />
    </div>
  );
}
