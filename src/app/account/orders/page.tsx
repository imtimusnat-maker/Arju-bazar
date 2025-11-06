'use client';

import React, { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
    const { toast } = useToast();

    const orderItemsQuery = useMemoFirebase(
        () => {
            if (!firestore || !order) return null;
            return query(collection(firestore, `users/${order.userId}/orders/${order.id}/orderItems`));
        },
        [firestore, order]
    );

    const { data: orderItems, isLoading } = useCollection<OrderItem>(orderItemsQuery);

    const handleCancelOrder = async () => {
        if (!firestore) return;
        const orderRef = doc(firestore, `users/${order.userId}/orders`, order.id);
        try {
            await updateDoc(orderRef, { 
                status: 'cancelled',
                updatedAt: serverTimestamp(),
            });
            toast({
                title: 'Order Cancelled',
                description: 'Your order has been successfully cancelled.',
            });
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast({
                variant: 'destructive',
                title: 'Cancellation Failed',
                description: 'Could not cancel the order. Please try again.',
            });
        }
    };


    if (!order) return null;

    return (
        <div className="bg-gray-50 p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div>
                    <h3 className="font-semibold mb-2">Shipping Details</h3>
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
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                     <div className="text-sm space-y-1 text-muted-foreground">
                         <div className="flex items-center gap-2"><span className="font-medium text-foreground">Status:</span> <OrderStatusBadge status={order.status} /></div>
                         <p><span className="font-medium text-foreground">Total:</span> Tk {order.totalAmount.toFixed(2)}</p>
                    </div>
                    {order.status === 'order placed' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="mt-4">Cancel Order</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. You will not be able to reactivate this order.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Back</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelOrder}>Yes, Cancel Order</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2">Items Ordered</h3>
                {isLoading ? <Loader2 className="animate-spin" /> : (
                     <div className="space-y-2">
                        {orderItems?.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md bg-white">
                                <Image src={item.imageCdnUrl || 'https://placehold.co/100'} alt={item.name} width={48} height={48} className="rounded-md object-contain" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity} @ Tk {item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold text-sm">Tk {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemo(
    () => (firestore && user ? query(collection(firestore, `users/${user.uid}/orders`)) : null),
    [firestore, user]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => {
        const aDate = a.orderDate ? a.orderDate.toDate().getTime() : 0;
        const bDate = b.orderDate ? b.orderDate.toDate().getTime() : 0;
        return bDate - aDate;
    });
  }, [orders]);


  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                 <h1 className="text-2xl font-bold mb-6">My Orders</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>View the status and details of your past orders.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                           {isLoading ? (
                                <div className="text-center py-10">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </div>
                            ) : sortedOrders.length > 0 ? (
                               sortedOrders.map((order) => (
                                <AccordionItem value={order.id} key={order.id}>
                                   <div className="flex items-center">
                                     <AccordionTrigger className="flex-1 hover:no-underline">
                                         <div className="w-full grid grid-cols-2 sm:grid-cols-4 items-center text-sm text-left px-4 gap-2">
                                              <div className="truncate">
                                                <div className="font-medium truncate">Order #{order.id.slice(0,7).toUpperCase()}</div>
                                              </div>
                                              <span className="hidden sm:block">
                                                {order.orderDate ? format(order.orderDate.toDate(), 'PPP') : 'Date N/A'}
                                              </span>
                                              <div><OrderStatusBadge status={order.status} /></div>
                                              <span className="text-right font-semibold">Tk {order.totalAmount.toFixed(2)}</span>
                                         </div>
                                     </AccordionTrigger>
                                   </div>
                                   <AccordionContent>
                                     <OrderDetailsContent order={order} />
                                   </AccordionContent>
                                </AccordionItem>
                               ))
                            ) : (
                               <div className="text-center text-muted-foreground py-16 px-4">
                                   <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                   <h3 className="text-lg font-semibold">You haven't placed any orders yet.</h3>
                                   <p className="text-sm mt-1">When you do, your orders will appear here.</p>
                                   <Button asChild className="mt-6">
                                       <Link href="/">Start Shopping</Link>
                                   </Button>
                               </div>
                            )}
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
