'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, Phone, User, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, where, limit } from 'firebase/firestore';
import type { Category } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import { useDebounce } from '@/hooks/use-debounce';
import type { Product } from '@/lib/products';
import Image from 'next/image';

function LiveSearchResults({ searchTerm, onResultClick }: { searchTerm: string, onResultClick: () => void }) {
    const firestore = useFirestore();
    const debouncedSearchTerm = useDebounce(searchTerm.toLowerCase(), 300);

    const productsQuery = useMemoFirebase(() => {
        if (!firestore || !debouncedSearchTerm || debouncedSearchTerm.length < 2) return null;
        return query(
            collection(firestore, 'products'),
            where('keywords', 'array-contains', debouncedSearchTerm),
            limit(5)
        );
    }, [firestore, debouncedSearchTerm]);

    const { data: products, isLoading } = useCollection<Product>(productsQuery);

    if (!debouncedSearchTerm) return null;

    return (
        <div className="absolute top-full left-0 w-full bg-background border border-t-0 rounded-b-lg shadow-lg z-10">
            {isLoading && <p className="p-4 text-sm text-muted-foreground">Searching...</p>}
            {!isLoading && products && products.length === 0 && debouncedSearchTerm.length > 1 && (
                <p className="p-4 text-sm text-muted-foreground">No results for "{debouncedSearchTerm}"</p>
            )}
            {products && products.length > 0 && (
                <div className="flex flex-col">
                    {products.map(product => (
                        <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={onResultClick}
                            className="flex items-center gap-4 p-3 hover:bg-accent transition-colors"
                        >
                            <div className="relative h-12 w-12 flex-shrink-0">
                                <Image 
                                    src={product.imageCdnUrl || 'https://placehold.co/400'} 
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium truncate text-sm">{product.name}</p>
                                <p className="text-primary font-semibold text-sm">Tk {product.price}</p>
                            </div>
                        </Link>
                    ))}
                    <Button variant="ghost" asChild onClick={onResultClick} className="w-full justify-center rounded-t-none">
                        <Link href={`/search?q=${debouncedSearchTerm}`}>
                            View all results
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories } = useCollection<Category>(categoriesCollection);

  const settingsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', 'global') : null),
    [firestore]
  );
  const { data: settings } = useDoc<Settings>(settingsDocRef);


  const handleScroll = () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  
  // Close search results when navigating away
  useEffect(() => {
    setIsSearchFocused(false);
    setSearchTerm('');
  }, [pathname]);


  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/search?q=${searchTerm}`);
    setIsSearchFocused(false);
    // Note: don't clear searchTerm here, so user sees what they searched for on the results page.
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  }


  return (
    <>
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background transition-transform duration-300",
      isVisible ? "transform-none" : "-translate-y-full"
    )}>
      {settings && (
        <div className="bg-primary text-primary-foreground py-2 text-xs sm:text-sm">
            <div className="container mx-auto flex max-w-screen-2xl items-center justify-center px-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
                    <div className="flex items-center gap-4">
                    {settings.whatsappNumber && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{settings.whatsappNumber}</span>
                        </div>
                    )}
                    {settings.hotlineNumber && (
                        <>
                        <span className="hidden sm:inline">|</span>
                        <div className="flex items-center gap-2">
                            <span>হট লাইন: {settings.hotlineNumber}</span>
                        </div>
                        </>
                    )}
                    </div>
                </div>
            </div>
        </div>
      )}
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80">
                <nav className="flex flex-col space-y-6 pt-8">
                  {categories?.map((category) => (
                    <Link
                      key={category.id}
                      href={`/collections/${category.slug}`}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden md:block">
               <Logo />
            </div>
        </div>
        
        <div className="flex-1 justify-center hidden md:flex">
             <form onSubmit={handleSearchSubmit} className="w-full max-w-md relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input 
                        placeholder="Search for products..."
                        className="w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} // Delay to allow click on results
                    />
                     {searchTerm && (
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={handleClearSearch}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    )}
                </div>
                 {isSearchFocused && searchTerm.length > 1 && <LiveSearchResults searchTerm={searchTerm} onResultClick={() => setIsSearchFocused(false)} />}
            </form>
        </div>

        <div className="md:hidden">
             <Logo />
        </div>

        <div className="flex items-center justify-end space-x-2 md:space-x-4">
           <Button asChild variant="ghost" size="icon" className="md:hidden">
            <Link href="/search">
              <Search className="h-6 w-6" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
            <span className="sr-only">Account</span>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="sr-only">Cart</span>
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</div>
            </Link>
          </Button>
        </div>
      </div>
    </header>
    </>
  );
}
