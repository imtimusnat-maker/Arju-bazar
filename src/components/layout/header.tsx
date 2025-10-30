"use client";

import Link from 'next/link';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const categories = [
  { name: 'Men Collections', href: '/collections/men' },
  { name: 'Women Collection', href: '/collections/women' },
  { name: 'Kids Collections', href: '/collections/kids' },
  { name: '3D Waterproof Bedsheet', href: '/collections/bedsheets' },
  { name: 'Furniture Collection', href: '/collections/furniture' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
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
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="hidden md:block">
               <Link href="/" className="flex items-center space-x-2">
                 <Menu className="h-6 w-6" />
               </Link>
            </div>
        </div>
        
        <div className="flex-1 flex justify-center">
            <Logo />
        </div>

        <div className="flex items-center justify-end space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Cart</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
