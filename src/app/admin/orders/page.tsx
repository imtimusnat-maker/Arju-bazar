'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const OrderStatusBadge = ({ status }: { status: string }) => {
  const variant = {
    pending: 'secondary',
    shipped: 'default',
    completed: 'default',
    cancelled: 'destructive',
  }[status] || 'outline';

  return <Badge variant={variant as any}>{status}</Badge>;
};

function OrderDetailsContent({ order }: { order: Order; }) {
    const firestore = useFirestore();

    const orderItemsQuery = useMemoFirebase(
        () => {
            if (!firestore || !order) return null;
            return query(collectionGroup(firestore, 'orderItems'), where('orderId', '==', order.id));
        },
        [firestore, order]
    );

    const { data: orderItems, isLoading } = useCollection<OrderItem>(orderItemsQuery);

    if (!order) return null;

    return (
        <div className="bg-gray-50 p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div>
                    <h3 className="font-semibold mb-2">Customer & Shipping</h3>
                    <div className="text-sm space-y-1 text-muted-foreground">
                        <p><span className="font-medium text-foreground">Name:</span> {order.customerName}</p>
                        <p><span className="font-medium text-foreground">Phone:</span> {order.customerPhone}</p>
                        <p><span className="font-medium text-foreground">Address:</span> {order.shippingAddress}</p>
                        <p><span className="font-medium text-foreground">Shipping:</span> {order.shippingMethod} (Tk {order.shippingCost.toFixed(2)})</p>
                        {order.orderNote && (
                           <p className="pt-2"><span className="font-medium text-foreground">Note:</span> {order.orderNote}</p>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                     <div className="text-sm space-y-1 text-muted-foreground">
                         <div className="flex items-center gap-2"><span className="font-medium text-foreground">Status:</span> <OrderStatusBadge status={order.status} /></div>
                         <p><span className="font-medium text-foreground">Total:</span> Tk {order.totalAmount.toFixed(2)}</p>
                    </div>
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

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const ordersQuery = useMemo(
    () => (firestore ? collectionGroup(firestore, 'orders') : null),
    [firestore]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    return [...orders].sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime());
  }, [orders]);

  const handleStatusChange = async (order: Order, status: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, `users/${order.userId}/orders`, order.id);
    try {
        await updateDoc(orderRef, { status });
        toast({
            title: 'Order Updated',
            description: `Order status changed to ${status}.`
        });
    } catch(error) {
        console.error('Failed to update order status:', error);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the order status.'
        });
    }
  };

  const handleDeleteOrder = async (order: Order) => {
     if (!firestore) return;
     const orderRef = doc(firestore, `users/${order.userId}/orders`, order.id);
     try {
        await deleteDoc(orderRef);
        toast({
            title: 'Order Deleted',
            description: `Order #${order.id.slice(0,7)} has been deleted.`
        })
     } catch (error) {
        console.error('Failed to delete order:', error);
        toast({
            variant: 'destructive',
            title: 'Delete Failed',
            description: 'Could not delete the order.'
        });
     }
  };

  return (
    <>
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>View and manage all customer orders. Click on an order to see details.</CardDescription>
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
                                     <div className="w-full grid grid-cols-5 md:grid-cols-6 items-center text-sm text-left px-4">
                                          <span className="font-mono text-xs truncate">#{order.id.slice(0, 7)}</span>
                                          <span className="hidden md:block">{format(order.orderDate.toDate(), 'PPP')}</span>
                                          <div className="truncate">
                                            <div className="font-medium truncate">{order.customerName}</div>
                                            <div className="text-xs text-muted-foreground truncate">{order.customerPhone}</div>
                                          </div>
                                          <span className="truncate hidden md:block">{order.shippingAddress}</span>
                                          <div><OrderStatusBadge status={order.status} /></div>
                                          <span className="text-right font-semibold">Tk {order.totalAmount.toFixed(2)}</span>
                                     </div>
                                 </AccordionTrigger>
                                 <div className="px-4">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                             <DropdownMenuRadioGroup value={order.status} onValueChange={(value) => handleStatusChange(order, value)}>
                                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="shipped">Shipped</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                            <DropdownMenuSeparator />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Order
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the order.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteOrder(order)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>
                               </div>
                               <AccordionContent>
                                 <OrderDetailsContent order={order} />
                               </AccordionContent>
                            </AccordionItem>
                           ))
                        ) : (
                           <div className="text-center text-muted-foreground py-10">No orders found.</div>
                        )}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    </>
  );
}
