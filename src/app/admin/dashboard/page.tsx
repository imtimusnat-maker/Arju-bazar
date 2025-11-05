'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingBag, Users, Activity, Loader2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/orders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const ordersQuery = useMemo(
        () => (firestore ? collectionGroup(firestore, 'orders') : null),
        [firestore]
    );

    const { data: orders, isLoading: ordersLoading } = useCollection<Order>(ordersQuery);

    const stats = useMemo(() => {
        if (!orders) {
            return {
                totalRevenue: 0,
                totalSales: 0,
                uniqueCustomers: 0,
            };
        }
        const completedOrders = orders.filter(o => o.status === 'completed');
        const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalSales = orders.length;
        const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

        return {
            totalRevenue,
            totalSales,
            uniqueCustomers,
        };
    }, [orders]);

    const recentOrders = useMemo(() => {
        if (!orders) return [];
        return [...orders]
            .sort((a, b) => b.orderDate.toDate().getTime() - a.orderDate.toDate().getTime())
            .slice(0, 5);
    }, [orders]);


  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {ordersLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Tk {stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">From completed sales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.uniqueCustomers}</div>
                        <p className="text-xs text-muted-foreground">Unique users with orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{orders?.filter(o => o.status === 'pending').length}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>The 5 most recent orders from your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                                        </TableCell>
                                        <TableCell>{format(order.orderDate.toDate(), 'PPP')}</TableCell>
                                        <TableCell><Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                                        <TableCell className="text-right">Tk {order.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}
