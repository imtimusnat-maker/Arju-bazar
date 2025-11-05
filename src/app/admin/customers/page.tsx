'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/lib/users';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AdminCustomersPage() {
    const firestore = useFirestore();

    const customersQuery = useMemo(
        () => (firestore ? query(collection(firestore, 'users'), where('orderCount', '>', 0)) : null),
        [firestore]
    );

    const { data: customers, isLoading } = useCollection<User>(customersQuery);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Customers</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Customers</CardTitle>
                    <CardDescription>View and manage your customer list. Only users who have placed an order are shown here.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : customers && customers.length > 0 ? (
                                customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{customer.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{customer.email}</div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                        </TableCell>
                                        <TableCell>{customer.orderCount || 0}</TableCell>
                                        <TableCell className="text-right">Tk {(customer.totalSpent || 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
