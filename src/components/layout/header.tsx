'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, Phone, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Category } from '@/lib/categories';
import type { Settings } from '@/lib/settings';
import { SearchDialog } from '@/components/search-dialog';

export function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cart } = useCart();

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
  
  // Open search dialog on cmd+k
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])


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
                    <span className="font-semibold hidden sm:inline">আমাদের যে কোন পণ্য অর্ডার করতে কল বা WhatsApp করুন:</span>
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
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
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
               <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-6 w-6" />
                  <span className="sr-only">Search</span>
                </Button>
            </div>
        </div>
        
        <div className="flex-1 flex justify-center">
            <Logo />
        </div>

        <div className="flex items-center justify-end space-x-2 md:space-x-4">
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
    <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
