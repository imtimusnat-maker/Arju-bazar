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
  LogIn,
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCollection, useFirestore, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, doc, query, getDocs, limit, orderBy, startAt, endAt, type Query } from 'firebase/firestore';
import type { Category, Subcategory } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import type { Product } from '@/lib/products';
import { useDebounce } from '@/hooks/use-debounce';
import { useLanguage } from '@/context/language-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type SearchResults = {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
};

function SearchResultProductItem({ product }: { product: Product }) {
    const translatedName = useTranslation(product.name);
    return (
        <Link href={`/product/${product.slug}`} passHref>
            <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                <Image src={product.imageCdnUrl || 'https://placehold.co/400'} alt={product.name} width={40} height={40} className="rounded-md object-contain border bg-white"/>
                <div className="flex-1">
                    <p className="text-sm font-medium">{translatedName}</p>
                    <p className="text-sm text-primary">Tk {product.price.toFixed(2)}</p>
                </div>
            </div>
        </Link>
    );
}

function SearchResultCategoryItem({ category }: { category: Category }) {
    const translatedName = useTranslation(category.name);
    return (
        <Link href={`/collections/${category.slug}`} passHref>
            <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium flex-1">{translatedName}</p>
            </div>
        </Link>
    );
}

function SearchResultSubcategoryItem({ subcategory }: { subcategory: Subcategory }) {
    const translatedName = useTranslation(subcategory.name);
    return (
        <Link href={`/collections/${subcategory.categorySlug}/${subcategory.slug}`} passHref>
            <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium flex-1">{translatedName}</p>
            </div>
        </Link>
    );
}


export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { cart } = useCart();
  const { user, isUserLoading } = useUser();
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();

  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
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
        setIsSearchPopoverOpen(false);
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
      if (!isSearchPopoverOpen) setIsSearchPopoverOpen(true);
      performSearch(searchKey);
    } else {
        if (isSearchPopoverOpen) {
            setResults({ products: [], categories: [], subcategories: [] });
            setIsLoading(false);
        }
    }
  }, [debouncedSearchTerm, performSearch, isSearchPopoverOpen]);
  
  const handleLinkClick = () => {
    setIsSearchPopoverOpen(false);
    setSearchTerm('');
  };

  const hasResults =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.subcategories.length > 0;
  
  const SearchPopover = () => (
    <Popover open={isSearchPopoverOpen} onOpenChange={setIsSearchPopoverOpen}>
        <PopoverTrigger asChild>
            <div className="relative h-10 w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                    onClick={() => setIsSearchPopoverOpen(true)}
                    onFocus={() => setIsSearchPopoverOpen(true)}
                    placeholder="Search for products, categories..."
                    className="
                        h-full w-full pl-10 pr-4
                        rounded-full border-2 border-primary/50 bg-primary/5
                        text-muted-foreground focus:bg-white focus:text-foreground focus:ring-2 focus:ring-primary/50"
                />
            </div>
        </PopoverTrigger>
        <PopoverTrigger asChild>
             <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <Search className="h-6 w-6" />
            </Button>
        </PopoverTrigger>

        <PopoverContent className="w-screen max-w-md p-0" side="bottom" align="end" onOpenAutoFocus={(e) => e.preventDefault()}>
            <div className="relative border-b p-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    className="h-10 w-full rounded-full border-2 border-primary/50 bg-primary/5 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-primary/50"
                    autoFocus
                />
            </div>

            {searchTerm && (
                 <div className="max-h-[60vh] overflow-y-auto p-2" onClick={handleLinkClick}>
                    {isLoading && (
                        <div className="flex justify-center items-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isLoading && !hasResults && debouncedSearchTerm && (
                        <p className="text-center text-sm text-muted-foreground py-4">No results found for "{debouncedSearchTerm}"</p>
                    )}
                    {!isLoading && hasResults && (
                        <div className="space-y-4">
                            {results.products.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Products</h3>
                                    {results.products.map((product) => (
                                        <SearchResultProductItem key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                            {results.categories.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Categories</h3>
                                    {results.categories.map((category) => (
                                       <SearchResultCategoryItem key={category.id} category={category} />
                                    ))}
                                </div>
                            )}
                            {results.subcategories.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Subcategories</h3>
                                    {results.subcategories.map((subcategory) => (
                                        <SearchResultSubcategoryItem key={subcategory.id} subcategory={subcategory} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </PopoverContent>
    </Popover>
  );


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
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2">
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
            <div className="md:hidden">
                <Logo />
            </div>
            <div className="hidden md:block">
              <Logo />
            </div>
          </div>

           <div className="hidden md:flex flex-1 justify-center" ref={searchWrapperRef}>
             <SearchPopover />
           </div>


          <div className="flex items-center justify-end space-x-1 md:space-x-2">
            <div className="md:hidden" ref={searchWrapperRef}>
                <SearchPopover />
            </div>
            <div className="flex items-center space-x-1">
                <Label htmlFor="language-toggle" className={cn('text-xs font-bold', language === 'en' ? 'text-primary' : 'text-muted-foreground')}>EN</Label>
                <Switch
                    id="language-toggle"
                    checked={language === 'bn'}
                    onCheckedChange={(checked) => setLanguage(checked ? 'bn' : 'en')}
                    className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4"
                />
                <Label htmlFor="language-toggle" className={cn('text-xs font-bold', language === 'bn' ? 'text-primary' : 'text-muted-foreground')}>BN</Label>
            </div>
            <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
              <Link href="/account">
                 {(isUserLoading) ? <Loader2 className="h-6 w-6 animate-spin" /> : user && !user.isAnonymous ? <User className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                 <span className="sr-only">Account</span>
              </Link>
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
