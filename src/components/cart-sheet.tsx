'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/context/cart-context';
import { Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react';
import { CheckoutSheet } from '@/components/checkout-sheet';
import { Separator } from '@/components/ui/separator';

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleCheckout = () => {
    onOpenChange(false); // Close the cart sheet
    setCheckoutOpen(true); // Open the checkout sheet
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart ({cart.length})
            <SheetClose asChild>
                <Button variant="ghost" size="icon">
                    <X className="h-5 w-5" />
                </Button>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <ShoppingCart className="h-20 w-20 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-muted-foreground text-sm">Add items to see them here.</p>
              <SheetClose asChild>
                 <Button asChild className="mt-6">
                    <Link href="/collections/all">Continue Shopping</Link>
                 </Button>
              </SheetClose>
            </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                      <Image
                        src={item.imageCdnUrl || 'https://placehold.co/400'}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium leading-tight line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">Tk {item.price.toFixed(2)}</p>
                       <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          className="h-6 w-10 text-center px-1"
                          readOnly
                        />
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground px-0 h-auto" onClick={() => removeFromCart(item.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="p-4 border-t bg-background space-y-4">
               <div className="flex justify-between items-center font-semibold">
                    <span>Subtotal</span>
                    <span>Tk {subtotal.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Button onClick={handleCheckout} className="w-full h-auto py-3 px-2 text-lg bg-primary hover:bg-primary/90">
                    ক্যাশ অন ডেলিভারিতে অর্ডার করুন
                  </Button>
                   <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                       <Link href="/cart">View Cart</Link>
                    </Button>
                  </SheetClose>
                </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
    {cart.length > 0 && (
         <CheckoutSheet
            isOpen={isCheckoutOpen}
            onOpenChange={setCheckoutOpen}
            cartItems={cart}
          />
       )}
    </>
  );
}
