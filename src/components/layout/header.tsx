'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCollection, useFirestore, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, doc, query, getDocs, limit, where, type Query, or } from 'firebase/firestore';
import type { Category, Subcategory } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import type { Product } from '@/lib/products';
import { useDebounce } from '@/hooks/use-debounce';
import { useLanguage } from '@/context/language-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { CartSheet } from '@/components/cart-sheet';

type SearchResults = {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.56 4.18 1.63 5.99L0 24l6.21-1.61A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-1.98-.45-3.85-1.48-5.52zM12 21.5c-1.5 0-2.97-.39-4.26-1.14l-.31-.17-3.68.95.98-3.59-.2-.33A9.5 9.5 0 1 1 21.5 12 9.51 9.51 0 0 1 12 21.5z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.03 14.18c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.64.14-.2.28-.75.91-.92 1.1-.17.19-.34.21-.62.07-.28-.14-1.16-.43-2.21-1.36-.82-.72-1.37-1.61-1.53-1.89-.16-.29-.02-.45.12-.59.12-.12.28-.31.42-.47.14-.16.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.37-.01-.57-.01-.19 0-.5.07-.77.36-.28.29-1.06 1.03-1.06 2.51 0 1.47 1.09 2.9 1.24 3.1.14.2 2.14 3.35 5.19 4.69 3.06 1.34 3.06.89 3.62.84.56-.06 1.83-.74 2.09-1.46.26-.72.26-1.34.18-1.46-.08-.12-.29-.19-.57-.33z" />
    </svg>
  );

function SearchResultProductItem({ product, onLinkClick }: { product: Product, onLinkClick: () => void }) {
    const translatedName = useTranslation(product.name);
    return (
        <Link href={`/product/${product.slug}`} passHref onClick={onLinkClick}>
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

function SearchResultCategoryItem({ category, onLinkClick }: { category: Category, onLinkClick: () => void }) {
    const translatedName = useTranslation(category.name);
    return (
        <Link href={`/collections/${category.slug}`} passHref onClick={onLinkClick}>
            <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                <Folder className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium flex-1">{translatedName}</p>
            </div>
        </Link>
    );
}

function SearchResultSubcategoryItem({ subcategory, onLinkClick }: { subcategory: Subcategory, onLinkClick: () => void }) {
    const translatedName = useTranslation(subcategory.name);
    return (
        <Link href={`/collections/${subcategory.categorySlug}/${subcategory.slug}`} passHref onClick={onLinkClick}>
            <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent cursor-pointer">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium flex-1">{translatedName}</p>
            </div>
        </Link>
    );
}

function SearchComponent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults>({ products: [], categories: [], subcategories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const firestore = useFirestore();

  const performSearch = useCallback(async (searchKey: string) => {
    if (!firestore || !searchKey) {
      setResults({ products: [], categories: [], subcategories: [] });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const searchTerms = searchKey.toLowerCase().split(/\s+/).filter(t => t);
    if(searchTerms.length === 0) {
        setIsLoading(false);
        setResults({ products: [], categories: [], subcategories: [] });
        return;
    }


    const productsQuery = query(collection(firestore, 'products'), where('searchKeywords', 'array-contains-any', searchTerms), limit(5)) as Query<Product>;
    const categoriesQuery = query(collection(firestore, 'categories'), where('searchKeywords', 'array-contains-any', searchTerms), limit(3)) as Query<Category>;
    const subcategoriesQuery = query(collection(firestore, 'subcategories'), where('searchKeywords', 'array-contains-any', searchTerms), limit(4)) as Query<Subcategory>;

    try {
      const [productSnap, categorySnap, subcategorySnap] = await Promise.all([
        getDocs(productsQuery),
        getDocs(categoriesQuery),
        getDocs(subcategoriesQuery),
      ]);

      setResults({
        products: productSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })),
        categories: categorySnap.docs.map(doc => ({ ...doc.data(), id: doc.id })),
        subcategories: subcategorySnap.docs.map(doc => ({ ...doc.data(), id: doc.id })),
      });
    } catch (error) {
      console.error('Error performing search:', error);
      setResults({ products: [], categories: [], subcategories: [] });
    } finally {
      setIsLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    performSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, performSearch]);

  const handleLinkClick = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const hasResults = results.products.length > 0 || results.categories.length > 0 || results.subcategories.length > 0;

  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogTrigger asChild>
        <div className="contents">
            {/* Desktop Search Bar */}
            <div className="relative h-10 w-full max-w-sm hidden md:block cursor-text" >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <div className="h-full w-full pl-10 pr-4 rounded-full border bg-background text-muted-foreground flex items-center text-sm">
                Search for products...
                </div>
            </div>
            {/* Mobile Search Icon */}
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <Search className="h-6 w-6" />
            </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 top-16 sm:top-24 translate-y-0 rounded-t-lg sm:rounded-lg shadow-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="sr-only">Search for products</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="h-10 w-full rounded-full border-2 border-primary/50 bg-primary/5 pl-10 pr-4 focus:bg-white focus-visible:ring-2 focus-visible:ring-primary/50"
                autoFocus
              />
            </div>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isLoading && (
              <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            )}
            {!isLoading && !hasResults && debouncedSearchTerm && (
              <p className="text-center text-sm text-muted-foreground py-4">No results found for "{debouncedSearchTerm}"</p>
            )}
            {!isLoading && hasResults && (
              <div className="space-y-4">
                {results.products.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Products</h3>
                    {results.products.map((product) => <SearchResultProductItem key={product.id} product={product} onLinkClick={handleLinkClick} />)}
                  </div>
                )}
                {results.categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Categories</h3>
                    {results.categories.map((category) => <SearchResultCategoryItem key={category.id} category={category} onLinkClick={handleLinkClick} />)}
                  </div>
                )}
                {results.subcategories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1 px-2">Subcategories</h3>
                    {results.subcategories.map((subcategory) => <SearchResultSubcategoryItem key={subcategory.id} subcategory={subcategory} onLinkClick={handleLinkClick} />)}
                  </div>
                )}
              </div>
            )}
          </div>
      </DialogContent>
    </Dialog>
  );
}


export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, isCartReady } = useCart();
  const { user, isUserLoading } = useUser();
  const { language, setLanguage } = useLanguage();

  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const { data: categories } = useCollection<Category>(categoriesCollection);

  const settingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'settings', 'global') : null), [firestore]);
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const whatsAppUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}` : '#';

  return (
    <>
      <header className={cn('sticky top-0 z-50 w-full border-b bg-background transition-transform duration-300', isVisible ? 'transform-none' : '-translate-y-full')}>
        {settings && (
          <div className="bg-primary text-primary-foreground py-2 text-xs sm:text-sm">
            <div className="container mx-auto flex max-w-screen-2xl items-center justify-center px-4">
              <div className="flex flex-col sm:flex-row items-center sm:gap-x-4 gap-y-1 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                  {settings.whatsappNumber && (
                    <a href={`tel:${settings.whatsappNumber.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:underline">
                      <Phone className="h-4 w-4" />
                      <span>{settings.whatsappNumber}</span>
                    </a>
                  )}
                  {settings.hotlineNumber && (
                    <>
                      <span className="hidden sm:inline">|</span>
                       <a href={`tel:${settings.hotlineNumber.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:underline">
                        <span>হট লাইন: {settings.hotlineNumber}</span>
                      </a>
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
                <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-6 w-6" /><span className="sr-only">Toggle Menu</span></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80 p-0">
                <div className="p-4"><Logo /></div>
                <div className="flex flex-col space-y-2 p-4">
                  {categories?.map((category) => (
                    <SheetClose asChild key={category.id}>
                      <Link href={`/collections/${category.slug}`} className="text-base font-medium text-foreground hover:text-primary transition-colors py-2">{category.name}</Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <div className="hidden md:block"><Logo /></div>
          </div>

          <div className="flex-1 justify-center hidden md:flex">
             <div className="w-full max-w-sm">
                <SearchComponent />
             </div>
          </div>
          <div className="md:hidden"><Logo /></div>

          <div className="flex items-center justify-end space-x-1 md:space-x-2">
            <div className="md:hidden"><SearchComponent /></div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="language-toggle" className={cn('text-xs font-bold', language === 'en' ? 'text-primary' : 'text-muted-foreground')}>EN</Label>
              <Switch id="language-toggle" checked={language === 'bn'} onCheckedChange={(checked) => setLanguage(checked ? 'bn' : 'en')} className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4" />
              <Label htmlFor="language-toggle" className={cn('text-xs font-bold', language === 'bn' ? 'text-primary' : 'text-muted-foreground')}>BN</Label>
            </div>
            {settings?.whatsappNumber && (
              <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex text-green-500 hover:text-green-600">
                <Link href={whatsAppUrl} target="_blank">
                  <WhatsAppIcon className="h-6 w-6" />
                  <span className="sr-only">WhatsApp</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
              <Link href="/account">
                {(isUserLoading) ? <Loader2 className="h-6 w-6 animate-spin" /> : user && !user.isAnonymous ? <User className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                <span className="sr-only">Account</span>
              </Link>
            </Button>
             <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart className="h-6 w-6" />
                <span className="sr-only">Cart</span>
                {isCartReady && cart.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</div>
                )}
              </Button>
          </div>
        </div>
      </header>
       <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
