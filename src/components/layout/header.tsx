'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Menu,
  Phone,
  User,
  Search,
  Folder,
  FolderOpen,
  Loader2,
  X,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, query, getDocs, limit, orderBy, startAt, endAt, type Query } from 'firebase/firestore';
import type { Category, Subcategory } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import type { Product } from '@/lib/products';
import { useDebounce } from '@/hooks/use-debounce';

type SearchResults = {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
};

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { cart } = useCart();
  const pathname = usePathname();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults>({
    products: [],
    categories: [],
    subcategories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchWrapperRef = useRef<HTMLDivElement>(null);


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

  const handleScroll = useCallback(() => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(window.scrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = useCallback(
    async (searchKey: string) => {
      if (!firestore || !searchKey) {
        setResults({ products: [], categories: [], subcategories: [] });
        return;
      }
      setIsLoading(true);

      const endMarker = searchKey + '\uf8ff';

      const productsQuery = query(
        collection(firestore, 'products'),
        orderBy('searchKeywords'),
        startAt(searchKey),
        endAt(endMarker),
        limit(5)
      ) as Query<Product>;

      const categoriesQuery = query(
        collection(firestore, 'categories'),
        orderBy('searchKeywords'),
        startAt(searchKey),
        endAt(endMarker),
        limit(3)
      ) as Query<Category>;

      const subcategoriesQuery = query(
        collection(firestore, 'subcategories'),
        orderBy('searchKeywords'),
        startAt(searchKey),
        endAt(endMarker),
        limit(4)
      ) as Query<Subcategory>;

      try {
        const [productSnap, categorySnap, subcategorySnap] = await Promise.all([
          getDocs(productsQuery),
          getDocs(categoriesQuery),
          getDocs(subcategoriesQuery),
        ]);

        const products = productSnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        const categories = categorySnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        const subcategories = subcategorySnap.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setResults({ products, categories, subcategories });
      } catch (error) {
        console.error('Error performing search:', error);
        setResults({ products: [], categories: [], subcategories: [] });
      } finally {
        setIsLoading(false);
      }
    },
    [firestore]
  );
  
   useEffect(() => {
    const searchKey = debouncedSearchTerm.toLowerCase().replace(/\s+/g, '');
    if (searchKey) {
      performSearch(searchKey);
    } else {
      setResults({ products: [], categories: [], subcategories: [] });
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, performSearch]);
  
  const handleLinkClick = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const hasResults =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.subcategories.length > 0;

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background transition-transform duration-300',
          isVisible ? 'transform-none' : '-translate-y-full'
        )}
      >
        {settings && (
          <div className="bg-primary text-primary-foreground py-2 text-xs sm:text-sm">
            <div className="container mx-auto flex max-w-screen-2xl items-center justify-center px-4">
              <div className="flex flex-col sm:flex-row items-center sm:gap-x-4 gap-y-1 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
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
              <SheetContent side="left" className="w-64 sm:w-80 p-0">
                 <div className="p-4">
                    <Logo />
                 </div>
                 <div className="flex flex-col space-y-2 p-4">
                    {categories?.map((category) => (
                      <SheetClose asChild key={category.id}>
                        <Link
                          href={`/collections/${category.slug}`}
                          className="text-base font-medium text-foreground hover:text-primary transition-colors py-2"
                        >
                          {category.name}
                        </Link>
                      </SheetClose>
                    ))}
                 </div>
              </SheetContent>
            </Sheet>
            <div className="hidden md:block">
              <Logo />
            </div>
          </div>

          {/* Desktop Search */}
           <div ref={searchWrapperRef} className="relative hidden md:block w-full max-w-md">
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchOpen(true)}
                        placeholder="Search for products, categories..."
                        className="h-10 w-full rounded-full border-2 border-primary/50 bg-primary/5 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                {isSearchOpen && searchTerm && (
                    <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50">
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                             {isLoading && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!isLoading && !hasResults && (
                                <p className="text-center text-sm text-muted-foreground py-4">No results found for "{debouncedSearchTerm}"</p>
                            )}
                            {!isLoading && hasResults && (
                                <div className="space-y-4">
                                     {results.products.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Products</h3>
                                             {results.products.map((product) => (
                                                <Link href={`/product/${product.slug}`} key={product.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <Image src={product.imageCdnUrl || 'https://placehold.co/400'} alt={product.name} width={40} height={40} className="rounded-md object-contain border bg-white"/>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{product.name}</p>
                                                            <p className="text-sm text-primary">Tk {product.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                     {results.categories.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Categories</h3>
                                            {results.categories.map((category) => (
                                                <Link href={`/collections/${category.slug}`} key={category.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                                        <p className="text-sm font-medium flex-1">{category.name}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                     {results.subcategories.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Subcategories</h3>
                                            {results.subcategories.map((subcategory) => (
                                                <Link href={`/collections/${subcategory.categorySlug}/${subcategory.slug}`} key={subcategory.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                                        <p className="text-sm font-medium flex-1">{subcategory.name}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
           </div>

          <div className="md:hidden flex-1">
             <div className="relative" ref={searchWrapperRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                 <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Search..."
                    className="h-10 w-full rounded-full border-2 border-primary/50 bg-primary/5 pl-10 pr-4"
                />
                 {isSearchOpen && (
                    <div className="fixed inset-0 top-16 bg-background z-50">
                        <div className="max-h-[80vh] overflow-y-auto p-2">
                             {isLoading && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!isLoading && searchTerm && !hasResults && (
                                <p className="text-center text-sm text-muted-foreground py-4">No results for "{debouncedSearchTerm}"</p>
                            )}
                            {!isLoading && hasResults && (
                                 <div className="space-y-4">
                                     {results.products.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Products</h3>
                                             {results.products.map((product) => (
                                                <Link href={`/product/${product.slug}`} key={product.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <Image src={product.imageCdnUrl || 'https://placehold.co/400'} alt={product.name} width={40} height={40} className="rounded-md object-contain border bg-white"/>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{product.name}</p>
                                                            <p className="text-sm text-primary">Tk {product.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                     {results.categories.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Categories</h3>
                                            {results.categories.map((category) => (
                                                <Link href={`/collections/${category.slug}`} key={category.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                                        <p className="text-sm font-medium flex-1">{category.name}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                     {results.subcategories.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Subcategories</h3>
                                            {results.subcategories.map((subcategory) => (
                                                <Link href={`/collections/${subcategory.categorySlug}/${subcategory.slug}`} key={subcategory.id} passHref onClick={handleLinkClick}>
                                                    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                                                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                                        <p className="text-sm font-medium flex-1">{subcategory.name}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <User className="h-6 w-6" />
              <span className="sr-only">Account</span>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Link href="/cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">Cart</span>
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
