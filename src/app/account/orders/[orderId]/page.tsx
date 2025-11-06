
'use client';

import React, { useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/orders';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

const OrderStatusBadge = ({ status }: { status: string }) => {
  const variant = {
    'order placed': 'secondary',
    'order confirmed': 'default',
    'order delivered': 'default',
    'order complete': 'default',
    'cancelled': 'destructive',
  }[status] || 'outline';

  const statusText = status.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return <Badge variant={variant as any}>{statusText}</Badge>;
};

function OrderDetailsContent({ order }: { order: Order }) {
    const firestore = useFirestore();

    const orderItemsQuery = useMemoFirebase(
        () => {
            if (!firestore || !order) return null;
            return query(collection(firestore, `users/${order.userId}/orders/${order.id}/orderItems`));
        },
        [firestore, order]
    );

    const { data: orderItems, isLoading } = useCollection<OrderItem>(orderItemsQuery);

    if (!order) return null;

    return (
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 mb-4 border-b">
                <div>
                    <h3 className="font-semibold mb-2 text-lg">Shipping Details</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                        <p><span className="font-medium text-foreground">Name:</span> {order.customerName}</p>
                        <p><span className="font-medium text-foreground">Phone:</span> {order.customerPhone}</p>
                        <p><span className="font-medium text-foreground">Address:</span> {order.shippingAddress}</p>
                        <p><span className="font-medium text-foreground">Shipping:</span> {order.shippingMethod} (Tk {order.shippingCost.toFixed(2)})</p>
                        {order.orderNote && (
                           <div className="pt-2"><span className="font-medium text-foreground">Note:</span> {order.orderNote}</div>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-lg">Order Summary</h3>
                     <div className="text-sm space-y-2 text-muted-foreground">
                         <div className="flex items-center gap-2"><span className="font-medium text-foreground">Status:</span> <OrderStatusBadge status={order.status} /></div>
                         <p><span className="font-medium text-foreground">Order Date:</span> {order.orderDate ? format(order.orderDate.toDate(), 'PPP') : 'N/A'}</p>
                         <p className="text-base"><span className="font-medium text-foreground">Total:</span> Tk {order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2 text-lg">Items Ordered</h3>
                {isLoading ? <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div> : (
                     <div className="space-y-2">
                        {orderItems?.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md bg-white">
                                <Image src={item.imageCdnUrl || 'https://placehold.co/100'} alt={item.name} width={64} height={64} className="rounded-md object-contain" />
                                <div className="flex-1">
                                    <p className="font-medium text-base">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} @ Tk {item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold text-base">Tk {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
    );
}

export default function OrderInvoicePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const orderId = params.orderId as string;

  const orderDocRef = useMemo(
    () => (firestore && user && orderId ? doc(firestore, `users/${user.uid}/orders`, orderId) : null),
    [firestore, user, orderId]
  );
  const { data: order, isLoading: isOrderLoading } = useDoc<Order>(orderDocRef);

  if (isUserLoading || isOrderLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
          <Header />
          <main className="flex-1 flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin" />
          </main>
          <Footer />
      </div>
    )
  }

  if (!user) {
    // This could redirect to login, but for now we'll just show an error message
    // as guest users might click the link.
     return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1 py-8 px-4">
                 <div className="container mx-auto max-w-lg text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>Please Log In</CardTitle>
                            <CardDescription>You need to log in to view your order details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button asChild>
                                 <Link href={`/login?redirect=/account/orders/${orderId}`}>Login</Link>
                             </Button>
                        </CardContent>
                    </Card>
                 </div>
            </main>
            <Footer />
        </div>
     )
  }
  
  if (!order) {
      notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8 px-4">
            <div className="container mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice</CardTitle>
                        <CardDescription>Order ID: #{order.id.slice(0, 7).toUpperCase()}</CardDescription>
                    </CardHeader>
                    <OrderDetailsContent order={order} />
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
