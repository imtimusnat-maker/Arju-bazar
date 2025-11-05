'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Loader2, PackageSearch, Trash2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collectionGroup, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/orders';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';

const OrderStatusBadge = ({ status }: { status: string }) => {
  const variant = {
    pending: 'secondary',
    shipped: 'default',
    completed: 'default',
    cancelled: 'destructive',
  }[status] || 'outline';

  return <Badge variant={variant as any}>{status}</Badge>;
};


function OrderDetailsDialog({ order, isOpen, onOpenChange }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    const firestore = useFirestore();
    const orderItemsQuery = useMemo(
        () => (firestore && order ? collectionGroup(firestore, 'orderItems').where('orderId', '==', order.id) : null),
        [firestore, order]
    );
    const { data: orderItems, isLoading } = useCollection<OrderItem>(orderItemsQuery);

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order #{order.id.slice(0, 7)}</DialogTitle>
                    <DialogDescription>
                        Details for the order placed by {order.customerName} on {format(order.orderDate.toDate(), 'PPP')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <h3 className="font-semibold mb-2">Customer & Shipping</h3>
                        <div className="text-sm space-y-1 text-muted-foreground">
                            <p><span className="font-medium text-foreground">Name:</span> {order.customerName}</p>
                            <p><span className="font-medium text-foreground">Phone:</span> {order.customerPhone}</p>
                            <p><span className="font-medium text-foreground">Address:</span> {order.shippingAddress}</p>
                            <p><span className="font-medium text-foreground">Shipping:</span> {order.shippingMethod} (Tk {order.shippingCost.toFixed(2)})</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Order Summary</h3>
                        <div className="text-sm space-y-1 text-muted-foreground">
                             <p><span className="font-medium text-foreground">Status:</span> <OrderStatusBadge status={order.status} /></p>
                             <p><span className="font-medium text-foreground">Total:</span> Tk {order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Items Ordered</h3>
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                         <div className="space-y-2">
                            {orderItems?.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md">
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
            </DialogContent>
        </Dialog>
    );
}

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
     // Note: This doesn't delete subcollections. A cloud function would be needed for that.
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <>
        <div>
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>View and manage all customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : sortedOrders.length > 0 ? (
                                    sortedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-xs">#{order.id.slice(0, 7)}</TableCell>
                                            <TableCell>{format(order.orderDate.toDate(), 'PPP')}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.customerName}</div>
                                                <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <OrderStatusBadge status={order.status} />
                                            </TableCell>
                                            <TableCell className="text-right">Tk {order.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                                            <PackageSearch className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
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
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        <OrderDetailsDialog 
            order={selectedOrder}
            isOpen={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
        />
    </>
  );
}
