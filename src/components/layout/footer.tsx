"use client";

import { Home, LayoutGrid, ShoppingCart, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';

export function Footer() {
  const { cart } = useCart();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="flex justify-around items-center h-16">
          <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <Link href="/">
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1">
             <Link href="/collections">
              <LayoutGrid className="h-6 w-6" />
              <span className="text-xs">Categories</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1 relative">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs">Cart</span>
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center -translate-y-1/2 translate-x-1/2">{cart.length}</div>
            </Link>
          </Button>
           <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <Link href="/search">
              <Search className="h-6 w-6" />
              <span className="text-xs">Search</span>
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
