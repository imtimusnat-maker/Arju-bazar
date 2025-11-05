"use client";

import { Home, LayoutGrid, ShoppingCart, User, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { useUser } from '@/firebase';

export function Footer() {
  const { cart } = useCart();
  const { user, isUserLoading } = useUser();

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden">
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
            <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1">
               <Link href="/account">
                {(isUserLoading) ? <Loader2 className="h-6 w-6 animate-spin" /> : user && !user.isAnonymous ? <User className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
                <span className="text-xs">Account</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="flex flex-col h-auto items-center gap-1 relative">
              <Link href="/cart">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-xs">Cart</span>
                {cart.length > 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center -translate-y-1/2 translate-x-1/2">{cart.length}</div>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
