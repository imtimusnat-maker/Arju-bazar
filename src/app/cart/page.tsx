'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/cart-context';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CheckoutSheet } from '@/components/checkout-sheet';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-4 text-gray-600">Your cart is empty.</p>
                <Button asChild className="mt-6">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden mr-4">
                        <Image
                          src={item.imageCdnUrl || 'https://placehold.co/400'}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold">{item.name}</h2>
                        <p className="text-sm text-gray-500">Tk {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-14 h-8 text-center"
                          readOnly
                        />
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="w-24 text-right font-semibold">Tk {(item.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="ml-4 text-gray-500 hover:text-red-500" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4">
                      <Button variant="outline" onClick={clearCart}>
                          Clear Cart
                      </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Tk {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <div className="border-t my-2"></div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>Tk {subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-6 text-base h-auto py-3 px-2 bg-primary hover:bg-primary/90" onClick={() => setCheckoutOpen(true)}>
                      ক্যাশ অন ডেলিভারিতে অর্ডার করুন
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
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
