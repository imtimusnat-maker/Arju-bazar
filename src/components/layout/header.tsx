"use client";

import Link from 'next/link';
import { Search, ShoppingCart, Menu, Phone, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const topCategories = [
    { name: 'OFFER ZONE', href: '/collections/offer-zone' },
    { name: 'Best Seller', href: '/collections/best-seller' },
    { name: 'Oil', href: '/collections/oil' },
    { name: 'Ghee (ঘি)', href: '/collections/ghee' },
    { name: 'Dates (খেজুর)', href: '/collections/dates' },
    { name: ' খেজুর গুড়', href: '/collections/jaggery' },
    { name: 'Honey', href: '/collections/honey' },
    { name: 'Masala', href: '/collections/masala' },
    { name: 'Nuts & Seeds', href: '/collections/nuts-seeds' },
    { name: 'Tea/Coffee', href: '/collections/tea-coffee' },
    { name: 'Honeycomb', href: '/collections/honeycomb' },
    { name: 'Organic Zone', href: '/collections/organic-zone' },
    { name: 'Pickle', href: '/collections/pickle' },
];

const mobileCategories = [
  { name: 'Men Collections', href: '/collections/men' },
  { name: 'Women Collection', href: '/collections/women' },
  { name: 'Kids Collections', href: '/collections/kids' },
  { name: '3D Waterproof Bedsheet', href: '/collections/bedsheets' },
  { name: 'Furniture Collection', href: '/collections/furniture' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="bg-primary text-primary-foreground py-2 text-sm">
        <div className="container mx-auto flex max-w-screen-2xl items-center justify-center px-4">
            <div className="flex items-center gap-4 text-center">
                <span>আমাদের যে কোন পণ্য অর্ডার করতে কল বা WhatsApp করুন:</span>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+8801321208940</span>
                </div>
                 <span>|</span>
                 <div className="flex items-center gap-2">
                    <span>হট লাইন: 09642-922922</span>
                </div>
            </div>
        </div>
      </div>
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
                  {mobileCategories.map((category) => (
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
               <Button variant="ghost" size="icon">
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
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="sr-only">Cart</span>
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">0</div>
          </Button>
        </div>
      </div>
       <div className="hidden md:block border-t bg-background">
        <div className="container mx-auto max-w-screen-2xl px-4">
          <nav className="flex items-center justify-center space-x-6 overflow-x-auto py-2">
            {topCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
