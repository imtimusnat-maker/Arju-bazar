'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const firestore = useFirestore();

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
                {q ? `Search Results for "${q}"` : 'Search for a product'}
            </h1>
            
            {isLoading ? (
                <div className="text-center">Loading products...</div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            ) : q && !isLoading ? (
                <div className="text-center text-muted-foreground py-10">
                    <p>No products found matching your search.</p>
                </div>
            ) : null}
        </div>
    </div>
  );
}

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${searchTerm.trim()}`);
  };

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <div className="container mx-auto max-w-xl px-4 pt-6">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full h-12 text-base pl-10"
          />
           <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10">
              <SearchIcon className="h-6 w-6 text-muted-foreground" />
           </Button>
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
      </form>
    </div>
  );
}


export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <Suspense fallback={<div className="text-center py-20">Loading search...</div>}>
            <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
